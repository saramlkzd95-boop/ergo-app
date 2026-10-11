"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Award, ArrowRight, Lock, CheckCircle2, Trophy, Flame, X, Sparkles, Loader2 } from "lucide-react";
import { REWARDS, Reward } from "@/lib/rewards-data";
import { supabase } from "@/lib/supabaseClient";
import { evaluateAndSyncUserRewards } from "@/lib/rewards-calculator";

// سطوح ارگونومی بر اساس پیشرفت
const LEVELS = [
  { level: 1, title: "نوپا در ارگونومی", image: "/images/rewards/level-1-sprout.png", desc: "آغاز مسیر سلامت جسمانی" },
  { level: 2, title: "نگهبان راست‌ قامتی", image: "/images/rewards/level-2-shield.png", desc: "حفاظت مداوم از ارگونومی فردی" },
  { level: 3, title: "ستون استوار", image: "/images/rewards/level-3-spine.png", desc: "تثبیت عادت‌های نشستن صحیح" },
  { level: 4, title: "استاد ارگونومی", image: "/images/rewards/level-4-crown.png", desc: "تسلط کامل و الهام‌بخش دیگران" },
];

export default function RewardsPage() {
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [celebratingReward, setCelebratingReward] = useState<Reward | null>(null);

  useEffect(() => {
    async function syncRewards() {
      try {
        setLoading(true);
        // ۱. دریافت اطلاعات کاربر
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        // ۲. محاسبه نشان‌ها و بروزرسانی دیتابیس
        const { unlockedIds, newlyUnlockedIds } = await evaluateAndSyncUserRewards(user.id);
        setUnlockedBadges(unlockedIds);

        // ۳. اگر نشان جدیدی همین لحظه باز شده، مودال تبریک نمایش داده شود
        if (newlyUnlockedIds.length > 0) {
          const newBadge = REWARDS.find(r => r.id === newlyUnlockedIds[0]);
          if (newBadge) setCelebratingReward(newBadge);
        }

        // ۴. تعیین سطح بر اساس تعداد نشان‌ها (منطق: هر ۲ نشان ۱ لول بالا می‌رود)
        const count = unlockedIds.length;
        if (count >= 6) setCurrentLevel(4);
        else if (count >= 4) setCurrentLevel(3);
        else if (count >= 2) setCurrentLevel(2);
        else setCurrentLevel(1);

      } catch (error) {
        console.error("Error syncing rewards:", error);
      } finally {
        setLoading(false);
      }
    }

    syncRewards();
  }, []);

  return (
    <div
      className="min-h-screen bg-[#eaf4f4] py-6 sm:py-8 px-3 sm:px-6 lg:px-8 font-[Vazirmatn] text-slate-900 dir-rtl overflow-x-hidden"
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6">

        {/* هدر صفحه */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-teal-900/10">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#113a53] flex items-center gap-2.5">
              <span className="p-2 bg-amber-100 text-amber-600 rounded-2xl inline-flex items-center justify-center">
                <Award className="w-6 h-6 sm:w-7 sm:h-7" />
              </span>
              باشگاه افتخارات و نشان‌ها
            </h1>
            <p className="text-slate-800 text-xs sm:text-sm font-semibold mt-1.5">
              مسیر پیشرفت سلامت شغلی، ارتقای سطح و بازگشایی نشان‌های ارگونومی
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-teal-800 bg-white border border-slate-200/90 px-4 py-2.5 rounded-xl shadow-xs hover:bg-teal-50/60 transition-colors self-start sm:self-auto"
          >
            <span>بازگشت به خانه</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Link>
        </div>

        {/* کارت آمار و سطح کلی */}
        <div className="bg-[#113a53] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-200 border border-teal-400/20">
              <Flame className="w-3.5 h-3.5" /> وضعیت جاری شما
            </span>
            <h2 className="text-xl sm:text-2xl font-black pt-1">
              سطح {currentLevel}: {LEVELS[currentLevel - 1]?.title}
            </h2>
            <p className="text-teal-100/90 text-xs sm:text-sm font-medium max-w-xl">
              با تکمیل منظم تمرینات و چک‌لیست روزانه، قفل نشان‌های جدید را باز کنید!
            </p>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/10">
            <Trophy className="w-8 h-8 text-amber-300 shrink-0" />
            <div className="text-left">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-teal-200" />
              ) : (
                <>
                  <span className="block text-2xl font-black text-white">{unlockedBadges.length} / {REWARDS.length}</span>
                  <span className="text-[11px] font-bold text-teal-100">نشان‌های کسب‌شده</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* بخش سطوح سلامت */}
        <section className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-[#113a53] text-base sm:text-xl">سطوح سلامت</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-1">
            {LEVELS.map((item) => {
              const isCurrent = item.level === currentLevel;
              const isPassed = item.level < currentLevel;

              return (
                <div
                  key={item.level}
                  className={`relative flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl border transition-all ${
                    isCurrent ? "border-amber-400 bg-amber-50/40 ring-2 ring-amber-400/70" : 
                    isPassed ? "border-teal-300 bg-[#eef7f6]" : "border-slate-200 bg-slate-50/60 opacity-60"
                  }`}
                >
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3">
                    <Image src={item.image} alt={item.title} fill className="object-contain" />
                  </div>
                  <h3 className="font-bold text-[#113a53] text-sm sm:text-base">{item.title}</h3>
                  <p className="text-slate-700 text-[10px] sm:text-xs mt-1">{item.desc}</p>
                  {isCurrent && <span className="mt-3 text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-lg">سطح فعلی</span>}
                  {isPassed && <span className="mt-3 text-[10px] text-teal-700 font-bold inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> تکمیل شده</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* بخش نشان‌ها */}
        <section className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
          <h2 className="font-black text-[#113a53] text-base sm:text-xl">نشان‌های پاداش</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {REWARDS.map((reward) => {
              const isUnlocked = unlockedBadges.includes(reward.id);
              return (
                <div
                  key={reward.id}
                  onClick={() => isUnlocked && setCelebratingReward(reward)}
                  className={`group relative flex items-start gap-3.5 p-4 rounded-2xl border transition-all ${
                    isUnlocked ? "bg-[#eef7f6] border-teal-300 cursor-pointer shadow-sm hover:shadow-md" : "bg-white border-slate-200 opacity-75"
                  }`}
                >
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute -top-10 right-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-[#113a53] text-white text-[10px] px-3 py-1.5 rounded-xl z-30 whitespace-nowrap border border-white/10">
                    شرط: {reward.requirement}
                    <div className="absolute top-full right-1/2 translate-x-1/2 border-4 border-transparent border-t-[#113a53]" />
                  </div>

                  <div className={`relative w-14 h-14 shrink-0 rounded-xl bg-white p-1 border ${isUnlocked ? "border-teal-200" : "grayscale opacity-75"}`}>
                    <Image src={reward.image} alt={reward.title} fill className="object-contain p-1" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-bold text-sm truncate ${isUnlocked ? "text-teal-950" : "text-[#113a53]"}`}>{reward.title}</h3>
                      {isUnlocked ? <CheckCircle2 className="w-4 h-4 text-teal-700" /> : <Lock className="w-4 h-4 text-slate-400" />}
                    </div>
                    <p className="text-slate-600 text-[11px] leading-tight mb-2">{reward.description}</p>
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {reward.requirement}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* مودال تبریک */}
      {celebratingReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setCelebratingReward(null)} className="absolute top-4 left-4 p-1 text-slate-400 hover:text-slate-600"><X /></button>
            <div className="inline-flex p-3 bg-amber-100 text-amber-600 rounded-full mb-4 animate-bounce"><Sparkles /></div>
            <h3 className="text-2xl font-black text-[#113a53]">🎉 نشان جدید!</h3>
            <div className="my-6 flex flex-col items-center">
              <div className="relative w-24 h-24 p-2 bg-teal-50 rounded-2xl border-2 border-teal-200">
                <Image src={celebratingReward.image} alt={celebratingReward.title} fill className="object-contain p-2" />
              </div>
              <h4 className="mt-4 text-xl font-black text-teal-900">{celebratingReward.title}</h4>
            </div>
            <button onClick={() => setCelebratingReward(null)} className="w-full bg-[#113a53] text-white font-bold py-3 rounded-xl">ادامه مسیر سلامت</button>
          </div>
        </div>
      )}
    </div>
  );
}
