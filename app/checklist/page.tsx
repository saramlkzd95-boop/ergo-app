"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  Calendar,
  Flame,
  TrendingUp,
  Check,
  Activity,
  Lock,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  subtitle: string;
}

// لیست آیتم‌های محاسباتی ارگونومی
const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "setup_workstation",
    title: "تنظیم ارگونومیک ایستگاه کار در شروع روز",
    subtitle: "ارتفاع صندلی، فاصله و ارتفاع مانیتور، موقعیت کیبورد و ماوس را بررسی کنید.",
  },
  {
    id: "rule_20_20_20",
    title: "اجرای قانون ۲۰-۲۰-۲۰",
    subtitle: "هر ۲۰ دقیقه، ۲۰ ثانیه به فاصله ۲۰ فوتی (۶ متر) نگاه کنید.",
  },
  {
    id: "hourly_break",
    title: "استراحت کوتاه هر یک ساعت",
    subtitle: "حداقل ۲ تا ۵ دقیقه از صندلی بلند شوید و راه بروید.",
  },
  {
    id: "chin_tuck",
    title: "انجام تمرینات اصلاحی",
    subtitle: "انجام روزانه تمرینات (حداقل ۵ تمرین در روز).",
  },
  {
    id: "shoulder_squeeze",
    title: "تغییر وضعیت نشستن",
    subtitle: "بعد از 1 ساعت کار با رایانه، وضعیت نشستن خود را تغییر دهید.",
  },
  {
    id: "posture_check",
    title: "بررسی وضعیت بدنی (Posture Check)",
    subtitle: "۳ بار در طول روز وضعیت سر، شانه و کمر را چک کنید.",
  },
  {
    id: "water_intake",
    title: "نوشیدن آب کافی",
    subtitle: "حداقل ۶ تا ۸ لیوان آب در طول روز.",
  },
];

const DISCOMFORT_OPTIONS = [
  { id: "comfortable", label: "احساس راحتی", color: "text-emerald-700 bg-emerald-50 border-emerald-300" },
  { id: "mild_pain", label: "درد خفیف", color: "text-amber-700 bg-amber-50 border-amber-300" },
  { id: "fatigue_cramp", label: "خستگی یا گرفتگی", color: "text-rose-700 bg-rose-50 border-rose-300" },
];

const JS_DAY_TO_IRAN_DAY_INDEX: Record<number, number> = {
  6: 0, // شنبه
  0: 1, // یکشنبه
  1: 2, // دوشنبه
  2: 3, // سه‌شنبه
  3: 4, // چهارشنبه
  4: 5, // پنج‌شنبه
  5: 6, // جمعه
};

const WEEK_DAYS_FA = [
  { key: "sat", label: "ش", fullName: "شنبه" },
  { key: "sun", label: "ی", fullName: "یکشنبه" },
  { key: "mon", label: "د", fullName: "دوشنبه" },
  { key: "tue", label: "س", fullName: "سه‌شنبه" },
  { key: "wed", label: "چ", fullName: "چهارشنبه" },
  { key: "thu", label: "پ", fullName: "پنج‌شنبه" },
  { key: "fri", label: "ج", fullName: "جمعه" },
];

export default function ChecklistPage() {
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [discomfortLevel, setDiscomfortLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [exerciseCount, setExerciseCount] = useState<number>(0);

  const [weekDaysProgress, setWeekDaysProgress] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [streakDays, setStreakDays] = useState<number>(0);

  const todayPersianDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("fa-IR", { dateStyle: "full" }).format(new Date());
    } catch {
      return "امروز";
    }
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const currentIranDayIndex = useMemo(() => {
    const jsDay = new Date().getDay();
    return JS_DAY_TO_IRAN_DAY_INDEX[jsDay] ?? 0;
  }, []);

  // بررسی وضعیت تکمیل تمرین‌های اصلاحی از localStorage
  useEffect(() => {
    try {
      const storedProgress = localStorage.getItem("ergono-corrective-exercises-progress");
      if (storedProgress) {
        const parsed = JSON.parse(storedProgress);
        // فرض بر این است که پروگرس ذخیره‌شده شامل آرایه‌ای برای امروز یا لیستی از انجام‌شده‌هاست
        // ساختار رایج: آرایه ایندکس‌ها یا تاریخ‌دار
        let count = 0;
        if (Array.isArray(parsed)) {
          count = parsed.length;
        } else if (typeof parsed === "object" && parsed !== null) {
          // اگر بر اساس تاریخ ذخیره شده باشد
          const todayExercises = parsed[todayStr] || [];
          count = Array.isArray(todayExercises) ? todayExercises.length : 0;
        }
        setExerciseCount(count);

        // اگر تعداد تمرین‌ها ۵ یا بیشتر بود، آیتم chin_tuck را به‌طور خودکار فعال کن
        if (count >= 5) {
          setCompletedItems((prev) => {
            if (!prev.includes("chin_tuck")) {
              return [...prev, "chin_tuck"];
            }
            return prev;
          });
        }
      }
    } catch (e) {
      console.error("خطا در خواندن پیشرفت تمرین‌ها:", e);
    }
  }, [todayStr]);

  const currentPercentage = useMemo(() => {
    return Math.round((completedItems.length / CHECKLIST_ITEMS.length) * 100);
  }, [completedItems]);

  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          const localData = localStorage.getItem(`checklist_${todayStr}`);
          const localDiscomfort = localStorage.getItem(`discomfort_${todayStr}`);
          if (localDiscomfort) setDiscomfortLevel(localDiscomfort);

          if (localData) {
            const parsed: string[] = JSON.parse(localData);
            // اطمینان از لحاظ شدن شرط تمرین‌ها
            const finalCompleted = Array.from(new Set([...parsed, ...(exerciseCount >= 5 ? ["chin_tuck"] : [])]));
            setCompletedItems(finalCompleted);

            const pct = Math.round((finalCompleted.length / CHECKLIST_ITEMS.length) * 100);
            setWeekDaysProgress((prev) => {
              const copy = [...prev];
              copy[currentIranDayIndex] = pct;
              return copy;
            });
          }
          setLoading(false);
          return;
        }

        setUserId(user.id);

        const { data: todayRecord } = await supabase
          .from("checklist_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", todayStr)
          .maybeSingle();

        let todayPct = 0;
        let items: string[] = [];

        if (todayRecord) {
          items = Array.isArray(todayRecord.completed_items) ? todayRecord.completed_items : [];
          if (exerciseCount >= 5 && !items.includes("chin_tuck")) {
            items.push("chin_tuck");
          }
          setCompletedItems(items);

          if (todayRecord.discomfort_level) {
            setDiscomfortLevel(todayRecord.discomfort_level);
          }
          todayPct =
            todayRecord.progress_percentage ??
            todayRecord.percentage ??
            Math.round((items.length / CHECKLIST_ITEMS.length) * 100);
        } else {
          const localData = localStorage.getItem(`checklist_${todayStr}`);
          const localDiscomfort = localStorage.getItem(`discomfort_${todayStr}`);
          if (localDiscomfort) setDiscomfortLevel(localDiscomfort);
          if (localData) {
            items = JSON.parse(localData);
          }
          if (exerciseCount >= 5 && !items.includes("chin_tuck")) {
            items.push("chin_tuck");
          }
          setCompletedItems(items);
          todayPct = Math.round((items.length / CHECKLIST_ITEMS.length) * 100);
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const startStr = startDate.toISOString().split("T")[0];

        const { data: historyData } = await supabase
          .from("checklist_progress")
          .select("date, progress_percentage, percentage")
          .eq("user_id", user.id)
          .gte("date", startStr)
          .lte("date", todayStr)
          .order("date", { ascending: false });

        const newWeekProgress = [0, 0, 0, 0, 0, 0, 0];

        if (historyData) {
          historyData.forEach((row) => {
            const rowDate = new Date(row.date);
            const diffDays = Math.floor((new Date().getTime() - rowDate.getTime()) / (1000 * 3600 * 24));
            if (diffDays <= 7) {
              const iranDayIdx = JS_DAY_TO_IRAN_DAY_INDEX[rowDate.getDay()];
              if (iranDayIdx !== undefined) {
                newWeekProgress[iranDayIdx] = row.progress_percentage ?? row.percentage ?? 0;
              }
            }
          });

          let streak = 0;
          const checkDate = new Date();
          while (true) {
            const dateIso = checkDate.toISOString().split("T")[0];
            const found = historyData.find((r) => r.date === dateIso);
            const val = found ? (found.progress_percentage ?? found.percentage ?? 0) : 0;
            if (val > 0) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
          setStreakDays(streak);
        }

        newWeekProgress[currentIranDayIndex] = todayPct;
        setWeekDaysProgress(newWeekProgress);
      } catch (err) {
        console.error("خطا در بازیابی داده‌ها:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [todayStr, currentIranDayIndex, exerciseCount]);

  const toggleItem = async (itemId: string) => {
    // اگر آیتم مربوط به تمرینات اصلاحی بود و شرط ۵ تمرین برقرار بود، اجازه تغییر دستی ندهیم
    if (itemId === "chin_tuck" && exerciseCount >= 5) {
      return; 
    }

    const updated = completedItems.includes(itemId)
      ? completedItems.filter((id) => id !== itemId)
      : [...completedItems, itemId];

    setCompletedItems(updated);
    const percentage = Math.round((updated.length / CHECKLIST_ITEMS.length) * 100);

    setWeekDaysProgress((prev) => {
      const copy = [...prev];
      copy[currentIranDayIndex] = percentage;
      return copy;
    });

    localStorage.setItem(`checklist_${todayStr}`, JSON.stringify(updated));

    if (userId) {
      try {
        await supabase.from("checklist_progress").upsert(
          {
            user_id: userId,
            date: todayStr,
            completed_items: updated,
            progress_percentage: percentage,
            percentage: percentage,
            discomfort_level: discomfortLevel,
          },
          { onConflict: "user_id,date" }
        );
      } catch (err) {
        console.error("خطا در ذخیره وضعیت چک‌لیست:", err);
      }
    }
  };

  const handleDiscomfortSelect = async (selectedLevel: string) => {
    const newLevel = discomfortLevel === selectedLevel ? null : selectedLevel;
    setDiscomfortLevel(newLevel);

    if (newLevel) {
      localStorage.setItem(`discomfort_${todayStr}`, newLevel);
    } else {
      localStorage.removeItem(`discomfort_${todayStr}`);
    }

    if (userId) {
      try {
        await supabase.from("checklist_progress").upsert(
          {
            user_id: userId,
            date: todayStr,
            completed_items: completedItems,
            progress_percentage: currentPercentage,
            percentage: currentPercentage,
            discomfort_level: newLevel,
          },
          { onConflict: "user_id,date" }
        );
      } catch (err) {
        console.error("خطا در ثبت وضعیت خستگی/درد:", err);
      }
    }
  };

  const weeklyAvg = useMemo(() => {
    const filledDays = weekDaysProgress.filter((p) => p > 0);
    if (filledDays.length === 0) return 0;
    const sum = filledDays.reduce((acc, curr) => acc + curr, 0);
    return Math.round(sum / filledDays.length);
  }, [weekDaysProgress]);

  return (
    <div className="min-h-screen bg-[#eaf4f4] py-6 sm:py-8 px-3 sm:px-6 lg:px-8 font-[Vazirmatn] text-slate-900 dir-rtl overflow-x-hidden" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">

        {/* هدر */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#113a53]">
            چک‌لیست روزانه من
          </h1>
          <p className="text-slate-800 text-xs sm:text-sm font-semibold">
            امروز: {todayPersianDate} ({exerciseCount} تمرین اصلاحی انجام شده)
          </p>
        </div>

        {/* کارت‌های آمار */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          <div className="bg-[#113a53] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="flex justify-end">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4 text-center">
              <span className="text-3xl sm:text-5xl font-black block tracking-tight">
                {currentPercentage}%
              </span>
              <span className="text-xs sm:text-sm font-bold text-teal-100 mt-1 block">
                پیشرفت امروز
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-sm border border-slate-200/80">
            <div className="flex justify-end">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-teal-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-teal-700" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4 text-center">
              <span className="text-3xl sm:text-5xl font-black text-[#113a53] block tracking-tight">
                {weeklyAvg}%
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 mt-1 block">
                میانگین هفته
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-sm border border-slate-200/80">
            <div className="flex justify-end">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-cyan-50 flex items-center justify-center">
                <Flame className="w-5 h-5 text-cyan-700" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4 text-center">
              <span className="text-3xl sm:text-5xl font-black text-[#113a53] block tracking-tight">
                {streakDays} روز
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 mt-1 block">
                رکورد پیوسته
              </span>
            </div>
          </div>
        </div>

        {/* نوار پیشرفت */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-2.5 sm:space-y-3">
          <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-[#113a53]">
            <span>پیشرفت امروز</span>
            <span>
              {completedItems.length} از {CHECKLIST_ITEMS.length}
            </span>
          </div>
          <div className="w-full h-2.5 sm:h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#113a53] transition-all duration-500 rounded-full"
              style={{ width: `${currentPercentage}%` }}
            />
          </div>
        </div>

        {/* آیتم‌های چک‌لیست */}
        <div className="space-y-3">
          {CHECKLIST_ITEMS.map((item) => {
            const isChecked = completedItems.includes(item.id);
            const isAutoCompletedExercise = item.id === "chin_tuck" && exerciseCount >= 5;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item.id)}
                disabled={isAutoCompletedExercise}
                className={`w-full text-right p-3.5 sm:p-5 rounded-2xl border transition-all flex items-start sm:items-center justify-between gap-3 sm:gap-4 ${
                  isAutoCompletedExercise ? "cursor-not-allowed bg-teal-50/60 border-teal-300" : "cursor-pointer"
                } ${
                  isChecked
                    ? "bg-[#eef7f6] border-teal-300 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`font-bold text-sm sm:text-base md:text-lg leading-snug ${
                        isChecked ? "text-teal-900 line-through decoration-teal-500/50" : "text-[#113a53]"
                      }`}
                    >
                      {item.title}
                    </h3>
                    {isAutoCompletedExercise && (
                      <span className="inline-flex items-center gap-1 bg-teal-200 text-teal-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" /> خودکار (تکمیل ۵ تمرین)
                      </span>
                    )}
                  </div>
                  <p className="text-slate-800 text-xs sm:text-sm font-medium leading-relaxed">
                    {item.subtitle}
                    {item.id === "chin_tuck" && ` (امروز: ${exerciseCount} از ۵ تمرین)`}
                  </p>
                </div>

                <div className="shrink-0 pt-0.5 sm:pt-0">
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isChecked
                        ? "bg-teal-700 border-teal-700 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[3]" />}
                  </div>
                </div>
              </button>
            );
          })}

          {/* سوال ویژه: ثبت سطح خستگی یا درد عضلانی پایان روز */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-4 mt-6">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm sm:text-base md:text-lg text-[#113a53] leading-snug">
                  ثبت سطح خستگی یا درد عضلانی پایان روز
                </h3>
                <p className="text-slate-700 text-xs sm:text-sm font-medium mt-1 leading-relaxed">
                  بررسی و ثبت سریع وضعیت گردن، شانه و کمر در پایان شیفت کاری:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-1">
              {DISCOMFORT_OPTIONS.map((option) => {
                const isSelected = discomfortLevel === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleDiscomfortSelect(option.id)}
                    className={`py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer w-full ${
                      isSelected
                        ? `${option.color} ring-2 ring-[#113a53] shadow-xs`
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                        isSelected ? "border-current bg-current text-white" : "border-slate-400"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-600 text-left">
              * این پایش برای ارزیابی اثر ارگونومیک بوده و اثری بر درصد پیشرفت روزانه ندارد.
            </p>
          </div>
        </div>

        {/* نمودار هفتگی */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200/80 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="font-black text-[#113a53] text-base sm:text-xl">
              نگاهی به ۷ روز اخیر
            </h2>
            <Link
              href="/progress"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-teal-800 hover:text-teal-900 transition self-end sm:self-auto"
            >
              <span>مشاهده جزئیات صفحه پیشرفت من</span>
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-3 md:gap-4 pt-3 pb-2 items-end h-44 sm:h-48">
            {WEEK_DAYS_FA.map((day, idx) => {
              const dayPct = weekDaysProgress[idx] || 0;
              const isToday = idx === currentIranDayIndex;

              return (
                <div key={day.key} className="flex flex-col items-center h-full justify-end group min-w-0">
                  <span
                    className={`text-[9px] sm:text-xs font-bold mb-1 transition-opacity ${
                      dayPct > 0 || isToday ? "text-[#113a53] opacity-100" : "opacity-0 group-hover:opacity-100 text-slate-400"
                    }`}
                  >
                    {dayPct}%
                  </span>

                  <div className="w-full max-w-[28px] sm:max-w-[40px] md:max-w-[44px] h-28 sm:h-32 bg-[#eaf4f4] rounded-lg sm:rounded-xl relative overflow-hidden flex items-end p-0.5 sm:p-1 border border-slate-200/60">
                    <div
                      className={`w-full rounded-md sm:rounded-lg transition-all duration-500 ease-out ${
                        isToday ? "bg-[#113a53]" : "bg-teal-700"
                      }`}
                      style={{ height: `${dayPct}%` }}
                    />
                  </div>

                  <div className="mt-2 sm:mt-2.5 flex flex-col items-center">
                    <span
                      className={`font-bold text-[11px] sm:text-sm ${
                        isToday ? "text-[#113a53] font-black underline underline-offset-4 decoration-2 decoration-teal-600" : "text-slate-800"
                      }`}
                    >
                      {day.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
