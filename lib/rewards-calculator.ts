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
 * بررسی می‌کند آیا تاریخ‌های موجود، شامل تعداد روزهای پیاپی
 * تا امروز یا دیروز هستند یا نه.
 *
 * اجازه‌دادن به «دیروز» باعث می‌شود اگر کاربر هنوز امروز
 * چک‌لیست را ثبت نکرده، استریک فوراً صفر نشود.
 */
function getCurrentStreak(
  dates: string[],
  today = new Date()
): number {
  const completedDates = new Set(dates);

  const todayKey = toDateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toDateKey(yesterday);

  let cursor: Date;

  if (completedDates.has(todayKey)) {
    cursor = new Date(`${todayKey}T12:00:00`);
  } else if (completedDates.has(yesterdayKey)) {
    cursor = new Date(`${yesterdayKey}T12:00:00`);
  } else {
    return 0;
  }

  let streak = 0;

  while (completedDates.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/**
 * تاریخ را با قالب YYYY-MM-DD تولید می‌کند.
 * این روش از مشکلات مقایسهٔ مستقیم تاریخ و ساعت جلوگیری می‌کند.
 */
function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * این تابع فعلاً false برمی‌گرداند، چون در اطلاعات موجود
 * نام جدول و ستون ثبت انجام تمرین‌های اصلاحی مشخص نشده است.
 *
 * وقتی ساختار جدول تمرین‌ها مشخص شد، این تابع باید بررسی کند
 * که کاربر در ۲۱ روز پیاپی تمرین‌های اصلاحی را انجام داده باشد.
 */
async function hasCompletedCorrectiveExercisesFor21Days(
  _userId: string,
  _completedChecklistDates: string[]
): Promise<boolean> {
  // TODO:
  // این بخش را پس از مشخص‌شدن جدول و ستون‌های ثبت تمرین‌ها تکمیل کنید.
  return false;
}

/**
 * محاسبه و ثبت نشان‌های قابل‌بررسی برای کاربر.
 *
 * شرایطی که با داده‌های فعلی قابل‌محاسبه‌اند:
 * - footprint: سه روز پیاپی چک‌لیست کامل
 * - streak: چهارده روز پیاپی چک‌لیست کامل
 *
 * شرایطی که به داده‌های جداگانه نیاز دارند:
 * - eyes: انجام قانون ۲۰-۲۰-۲۰ برای ۱۰ روز متوالی
 * - stretch: انجام همهٔ حرکات اصلاحی برای ۱۰ روز متوالی
 * - desk: انجام همهٔ اصول ارگونومی برای ۷ روز متوالی
 * - trophy: ۲۱ روز چک‌لیست کامل به‌علاوهٔ انجام تمرین‌های اصلاحی
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

  // فقط روزهایی در محاسبه لحاظ می‌شوند که چک‌لیست کامل بوده باشد.
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

  // گام نخست: ۳ روز پیاپی چک‌لیست کامل
  if (streak >= 3) {
    eligibleIds.push("footprint");
  }

  // نشان آتش: ۱۴ روز پیاپی چک‌لیست کامل
  if (streak >= 14) {
    eligibleIds.push("streak");
  }

  // کاپ قهرمان: ۲۱ روز چک‌لیست کامل و انجام تمرین‌های اصلاحی
  if (
    streak >= 21 &&
    (await hasCompletedCorrectiveExercisesFor21Days(
      userId,
      completedDates
    ))
  ) {
    eligibleIds.push("trophy");
  }

  /*
   * این سه نشان عمداً بر اساس استریک چک‌لیست باز نمی‌شوند؛
   * برای آن‌ها باید لاگ‌های مربوط به همان فعالیت‌ها بررسی شوند:
   * eyes: قانون ۲۰-۲۰-۲۰
   * stretch: همهٔ حرکات اصلاحی
   * desk: همهٔ اصول ارگونومی
   */

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
