"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  Calendar,
  Flame,
  TrendingUp,
  Check,
  Bot,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  subtitle: string;
}

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
    title: "تمرین Chin Tuck",
    subtitle: "۱۰ تکرار در ۳ نوبت طی روز.",
  },
  {
    id: "shoulder_squeeze",
    title: "تمرین فشردن کتف‌ها",
    subtitle: "۱۵ تکرار در ۲ نوبت.",
  },
  {
    id: "neck_stretch",
    title: "کشش گردن",
    subtitle: "هر طرف ۳۰ ثانیه، ۲ ست.",
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

// نگاشت روزهای هفته
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
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

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

  const currentPercentage = useMemo(() => {
    return Math.round((completedItems.length / CHECKLIST_ITEMS.length) * 100);
  }, [completedItems]);

  // ۱. بارگذاری داده‌ها از دیتابیس
  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          const localData = localStorage.getItem(`checklist_${todayStr}`);
          if (localData) {
            const parsed: string[] = JSON.parse(localData);
            setCompletedItems(parsed);
            const pct = Math.round((parsed.length / CHECKLIST_ITEMS.length) * 100);
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

        // دریافت وضعیت امروز
        const { data: todayRecord } = await supabase
          .from("checklist_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", todayStr)
          .maybeSingle();

        let todayPct = 0;
        if (todayRecord) {
          const items = Array.isArray(todayRecord.completed_items) ? todayRecord.completed_items : [];
          setCompletedItems(items);
          todayPct =
            todayRecord.progress_percentage ??
            todayRecord.percentage ??
            Math.round((items.length / CHECKLIST_ITEMS.length) * 100);
        } else {
          const localData = localStorage.getItem(`checklist_${todayStr}`);
          if (localData) {
            const parsed: string[] = JSON.parse(localData);
            setCompletedItems(parsed);
            todayPct = Math.round((parsed.length / CHECKLIST_ITEMS.length) * 100);
          }
        }

        // دریافت تاریخچه ۳۰ روز گذشته
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

          // محاسبه زنجیره روزهای متوالی
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
  }, [todayStr, currentIranDayIndex]);

  // ۲. ذخیره وضعیت جدید بدون فیلدهای اضافه
  const toggleItem = async (itemId: string) => {
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
        const { error } = await supabase.from("checklist_progress").upsert(
          {
            user_id: userId,
            date: todayStr,
            completed_items: updated,
            progress_percentage: percentage,
            percentage: percentage,
          },
          { onConflict: "user_id,date" }
        );

        if (error) {
          console.error("خطا در ذخیره وضعیت چک‌لیست:", error.message);
        }
      } catch (err) {
        console.error("خطا در ذخیره وضعیت چک‌لیست:", err);
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
    <div className="min-h-screen bg-[#eaf4f4] py-8 px-4 sm:px-6 lg:px-8 font-[Vazirmatn] text-slate-900 dir-rtl" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* هدر */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-[#113a53]">
            چک‌لیست روزانه من
          </h1>
          <p className="text-slate-800 text-sm font-semibold">
            امروز: {todayPersianDate}
          </p>
        </div>

        {/* کارت‌های آمار */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#113a53] text-white rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="flex justify-end">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className="text-4xl sm:text-5xl font-black block tracking-tight">
                {currentPercentage}%
              </span>
              <span className="text-xs sm:text-sm font-bold text-teal-100 mt-1 block">
                پیشرفت امروز
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 flex flex-col justify-between shadow-sm border border-slate-200/80">
            <div className="flex justify-end">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-teal-700" />
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className="text-4xl sm:text-5xl font-black text-[#113a53] block tracking-tight">
                {weeklyAvg}%
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 mt-1 block">
                میانگین هفته
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 flex flex-col justify-between shadow-sm border border-slate-200/80">
            <div className="flex justify-end">
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 flex items-center justify-center">
                <Flame className="w-5 h-5 text-cyan-700" />
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className="text-4xl sm:text-5xl font-black text-[#113a53] block tracking-tight">
                {streakDays} روز
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 mt-1 block">
                رکورد پیوسته
              </span>
            </div>
          </div>
        </div>

        {/* نوار پیشرفت */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-3">
          <div className="flex justify-between items-center text-sm font-bold text-[#113a53]">
            <span>پیشرفت امروز</span>
            <span>
              {completedItems.length} از {CHECKLIST_ITEMS.length}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
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
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item.id)}
                className={`w-full text-right p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                  isChecked
                    ? "bg-[#eef7f6] border-teal-300 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div className="space-y-1">
                  <h3
                    className={`font-bold text-base sm:text-lg ${
                      isChecked ? "text-teal-900 line-through decoration-teal-500/50" : "text-[#113a53]"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-slate-800 text-xs sm:text-sm font-medium leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>

                <div className="shrink-0">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isChecked
                        ? "bg-teal-700 border-teal-700 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isChecked && <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* نمودار هفتگی */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-[#113a53] text-lg sm:text-xl">
              نگاهی به ۷ روز اخیر
            </h2>
            <Link
              href="/progress"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-teal-800 hover:text-teal-900 transition"
            >
              <span>مشاهده جزئیات صفحه پیشرفت من</span>
              <TrendingUp className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4 pb-2 items-end h-48">
            {WEEK_DAYS_FA.map((day, idx) => {
              const dayPct = weekDaysProgress[idx] || 0;
              const isToday = idx === currentIranDayIndex;

              return (
                <div key={day.key} className="flex flex-col items-center h-full justify-end group">
                  <span
                    className={`text-[10px] sm:text-xs font-bold mb-1 transition-opacity ${
                      dayPct > 0 || isToday ? "text-[#113a53] opacity-100" : "opacity-0 group-hover:opacity-100 text-slate-400"
                    }`}
                  >
                    {dayPct}%
                  </span>

                  <div className="w-full max-w-[36px] sm:max-w-[44px] h-32 bg-[#eaf4f4] rounded-xl relative overflow-hidden flex items-end p-1 border border-slate-200/60">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ease-out ${
                        isToday ? "bg-[#113a53]" : "bg-teal-700"
                      }`}
                      style={{ height: `${dayPct}%` }}
                    />
                  </div>

                  <div className="mt-2.5 flex flex-col items-center">
                    <span
                      className={`font-bold text-xs sm:text-sm ${
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

        {/* دکمه شناور */}
        <div className="fixed bottom-5 left-5 z-40">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#113a53] text-white shadow-lg hover:bg-[#163857] transition text-sm font-bold"
          >
            <Bot className="w-5 h-5 text-teal-300" />
            <span>کوچ ارگونومیک</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
