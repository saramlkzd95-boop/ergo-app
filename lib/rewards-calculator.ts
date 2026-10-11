// lib/rewards-calculator.ts
import { supabase } from "@/lib/supabaseClient";

type ChecklistRow = {
  date: string;
  percentage: number | null;
};

type UserRewardRow = {
  reward_id: string;
};

type EvaluateResult = {
  unlockedIds: string[];
  newlyUnlockedIds: string[];
};

/**
 * تاریخ را به قالب YYYY-MM-DD تولید می‌کند.
 */
function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * بررسی روز کاری در محیط اداری ایران:
 * شنبه تا چهارشنبه روز کاری است.
 * پنج‌شنبه (کد 4 در JS) و جمعه (کد 5 در JS) روز تعطیل هستند.
 */
function isWorkingDay(date: Date): boolean {
  const day = date.getDay();
  return day !== 4 && day !== 5;
}

/**
 * بازگرداندن نزدیک‌ترین روز کاری قبلی (رد کردن پنج‌شنبه و جمعه).
 */
function getPreviousWorkingDay(date: Date): Date {
  const prev = new Date(date);
  do {
    prev.setDate(prev.getDate() - 1);
  } while (!isWorkingDay(prev));
  return prev;
}

/**
 * محاسبه تعداد روزهای کاری متوالی (استریک کاری).
 * - پنج‌شنبه و جمعه‌ها مانع یا قطع‌کننده استریک نیستند.
 * - اگر کاربر امروز ثبت نکرده باشد، از آخرین روز کاریِ سپری‌شده چک می‌شود.
 */
function getCurrentStreak(
  dates: string[],
  today = new Date()
): number {
  const completedDates = new Set(dates);

  // مشخص کردن آخرین روز کاری جاری یا گذشته
  let lastWorkDay = new Date(today);
  if (!isWorkingDay(lastWorkDay)) {
    lastWorkDay = getPreviousWorkingDay(lastWorkDay);
  }

  const todayKey = toDateKey(today);
  const lastWorkKey = toDateKey(lastWorkDay);
  const prevWorkDay = getPreviousWorkingDay(lastWorkDay);
  const prevWorkKey = toDateKey(prevWorkDay);

  let cursor: Date;

  if (isWorkingDay(today) && completedDates.has(todayKey)) {
    cursor = new Date(`${todayKey}T12:00:00`);
  } else if (completedDates.has(lastWorkKey)) {
    cursor = new Date(`${lastWorkKey}T12:00:00`);
  } else if (isWorkingDay(today) && completedDates.has(prevWorkKey)) {
    cursor = new Date(`${prevWorkKey}T12:00:00`);
  } else {
    return 0;
  }

  let streak = 0;

  // شمارش زنجیره فقط در روزهای کاری
  while (completedDates.has(toDateKey(cursor))) {
    streak += 1;
    cursor = getPreviousWorkingDay(cursor);
  }

  return streak;
}

/**
 * بررسی موقت تمرین‌های اصلاحی تا زمان اتصال به جدول اختصاصی
 */
async function hasCompletedCorrectiveExercisesFor21Days(
  _userId: string,
  _completedChecklistDates: string[]
): Promise<boolean> {
  return true;
}

/**
 * محاسبه و ثبت نشان‌ها با احتساب روزهای کاری
 */
export async function evaluateAndSyncUserRewards(
  userId: string
): Promise<EvaluateResult> {
  if (!userId) {
    throw new Error("شناسهٔ کاربر وارد نشده است.");
  }

  const { data: checklistRows, error: checklistError } = await supabase
    .from("checklist_progress")
    .select("date, percentage")
    .eq("user_id", userId);

  if (checklistError) {
    console.error("خطا در دریافت سابقهٔ چک‌لیست:", checklistError);
    throw checklistError;
  }

  const rows = (checklistRows ?? []) as ChecklistRow[];

  // ثبت روزهایی که چک‌لیست ۱۰۰٪ کامل بوده است
  const completedDates = Array.from(
    new Set(
      rows
        .filter((row) => Number(row.percentage) === 100 && row.date)
        .map((row) => row.date.slice(0, 10))
    )
  ).sort();

  const streak = getCurrentStreak(completedDates);

  const { data: savedRewards, error: rewardsError } = await supabase
    .from("user_rewards")
    .select("reward_id")
    .eq("user_id", userId);

  if (rewardsError) {
    console.error("خطا در دریافت نشان‌های قبلی:", rewardsError);
    throw rewardsError;
  }

  const existingIds = new Set(
    ((savedRewards ?? []) as UserRewardRow[]).map((row) => row.reward_id)
  );

  const eligibleIds: string[] = [];

  // ۱. گام نخست: ۳ روز کاری پیاپی
  if (streak >= 3) {
    eligibleIds.push("footprint");
  }

  // ۲. اصول ارگونومی: ۷ روز کاری پیاپی
  if (streak >= 7) {
    eligibleIds.push("desk");
  }

  // ۳. تمرینات ۱۰ روزه (قانون ۲۰-۲۰-۲۰ و کشش‌ها)
  if (streak >= 10) {
    eligibleIds.push("eyes");
    eligibleIds.push("stretch");
  }

  // ۴. نشان استمرار: ۱۴ روز کاری پیاپی
  if (streak >= 14) {
    eligibleIds.push("streak");
  }

  // ۵. کاپ قهرمان: ۲۱ روز کاری پیاپی
  if (
    streak >= 21 &&
    (await hasCompletedCorrectiveExercisesFor21Days(
      userId,
      completedDates
    ))
  ) {
    eligibleIds.push("trophy");
  }

  const newlyUnlockedIds = eligibleIds.filter(
    (rewardId) => !existingIds.has(rewardId)
  );

  if (newlyUnlockedIds.length > 0) {
    const rowsToInsert = newlyUnlockedIds.map((reward_id) => ({
      user_id: userId,
      reward_id,
    }));

    const { error: insertError } = await supabase
      .from("user_rewards")
      .upsert(rowsToInsert, {
        onConflict: "user_id,reward_id",
        ignoreDuplicates: true,
      });

    if (insertError) {
      console.error("خطا در ذخیرهٔ نشان‌های جدید:", insertError);
      throw insertError;
    }
  }

  const unlockedIds = Array.from(
    new Set([...existingIds, ...eligibleIds])
  );

  return {
    unlockedIds,
    newlyUnlockedIds,
  };
}
