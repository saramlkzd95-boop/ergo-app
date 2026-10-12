"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Award, ArrowRight, Lock, CheckCircle2, Trophy, Flame, X, Sparkles, Loader2 } from "lucide-react";
import { REWARDS, HEALTH_LEVELS, Reward, HealthLevel } from "@/lib/rewards-data";
import { supabase } from "@/lib/supabaseClient";
import { evaluateAndSyncUserRewards } from "@/lib/rewards-calculator";

export default function RewardsPage() {
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [celebratingReward, setCelebratingReward] = useState<Reward | null>(null);
  
  // نگهداری آیدی کارتی که موس روی آن است برای اعمال افکت تار شدن و پیام انگیزشی
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // افکت صوتی پیروزی و اهدای نشان با Web Audio API
  const playRewardCelebrationSound = () => {
    try {
      if (typeof window === "undefined") return;

      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // توالی نوت‌های صعودی و دلنشین پیروزی (C5, E5, G5, C6)
      const notes = [
        { freq: 523.25, time: 0, duration: 0.15 },
        { freq: 659.25, time: 0.12, duration: 0.15 },
        { freq: 783.99, time: 0.24, duration: 0.2 },
        { freq: 1046.5, time: 0.4, duration: 0.55 },
      ];

      notes.forEach(({ freq, time, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0.001, now + time);
        gain.gain.exponentialRampToValueAtTime(0.28, now + time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + duration);
      });
    } catch (err) {
      console.warn("Audio playback not supported or blocked:", err);
    }
  };

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

        // ۳. اگر نشان جدیدی همین لحظه باز شده، مودال تبریک نمایش داده شده و صدا پخش شود
        if (newlyUnlockedIds.length > 0) {
          const newBadge = REWARDS.find(r => r.id === newlyUnlockedIds[0]);
          if (newBadge) {
            setCelebratingReward(newBadge);
            playRewardCelebrationSound();
          }
        }

        // ۴. تعیین سطح بر اساس تعداد نشان‌ها (هر ۲ نشان ۱ لول بالا می‌رود)
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

  const handleBadgeClick = (reward: Reward) => {
    setCelebratingReward(reward);
    playRewardCelebrationSound();
  };

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
              سطح {currentLevel}: {HEALTH_LEVELS[currentLevel - 1]?.title}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-1">
            {HEALTH_LEVELS.map((item: HealthLevel) => {
              const isCurrent = item.levelNumber === currentLevel;
              const isPassed = item.levelNumber < currentLevel;
              const isHovered = hoveredCardId === `level-${item.id}`;

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredCardId(`level-${item.id}`)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className={`relative overflow-hidden flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer min-h-[260px] justify-between ${
                    isCurrent ? "border-amber-400 bg-amber-50/40 ring-2 ring-amber-400/70" : 
                    isPassed ? "border-teal-300 bg-[#eef7f6]" : "border-slate-200 bg-slate-50/60 opacity-90"
                  }`}
                >
                  {/* محتوای اصلی کارت که در حالت هاور تار و کم‌رنگ می‌شود */}
                  <div className={`flex flex-col items-center w-full transition-all duration-300 ${isHovered ? 'blur-xs opacity-15' : 'opacity-100'}`}>
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3">
                      <Image src={item.image} alt={item.title} fill className="object-contain" />
                    </div>
                    <h3 className="font-bold text-[#113a53] text-sm sm:text-base">{item.title}</h3>
                    <p className="text-slate-600 text-[10px] sm:text-xs mt-1 mb-2.5">{item.subtitle}</p>
                    
                    {/* کادر شرایط باز شدن سطح */}
                    <div className="w-full bg-white/90 border border-slate-200 text-slate-700 text-[10px] sm:text-[11px] py-1.5 px-2 rounded-lg font-medium leading-relaxed">
                      <span className="font-bold text-[#113a53]">شرط: </span>{item.requirement}
                    </div>

                    {isCurrent && <span className="mt-3 text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-lg">سطح فعلی</span>}
                    {isPassed && <span className="mt-3 text-[10px] text-teal-700 font-bold inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> تکمیل شده</span>}
                  </div>

                  {/* لایه پیام انگیزشی هنگام Hover */}
                  {isHovered && (
                    <div className="absolute inset-0 flex items-center justify-center p-4 bg-[#113a53]/95 text-white rounded-2xl text-center transition-all duration-300">
                      <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                        {item.motivationalMessage}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* بخش نشان‌ها */}
        <section className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
          <h2 className="font-black text-[#113a53] text-base sm:text-xl">نشان‌های پاداش</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {REWARDS.map((reward: Reward) => {
              const isUnlocked = unlockedBadges.includes(reward.id);
              const isHovered = hoveredCardId === `reward-${reward.id}`;

              return (
                <div
                  key={reward.id}
                  onMouseEnter={() => setHoveredCardId(`reward-${reward.id}`)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  onClick={() => isUnlocked && handleBadgeClick(reward)}
                  className={`relative overflow-hidden flex items-start gap-3.5 p-4 rounded-2xl border transition-all duration-300 cursor-pointer min-h-[110px] ${
                    isUnlocked ? "bg-[#eef7f6] border-teal-300 shadow-xs hover:shadow-md" : "bg-white border-slate-200"
                  }`}
                >
                  {/* محتوای اصلی کارت که هنگام هاور تار می‌شود */}
                  <div className={`flex items-start gap-3.5 w-full transition-all duration-300 ${isHovered ? 'blur-xs opacity-15' : 'opacity-100'}`}>
                    <div className={`relative w-14 h-14 shrink-0 rounded-xl bg-white p-1 border ${isUnlocked ? "border-teal-200" : "grayscale opacity-75"}`}>
                      <Image src={reward.image} alt={reward.title} fill className="object-contain p-1" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-bold text-sm truncate ${isUnlocked ? "text-teal-950" : "text-[#113a53]"}`}>{reward.title}</h3>
                        {isUnlocked ? <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" /> : <Lock className="w-4 h-4 text-slate-400 shrink-0" />}
                      </div>
                      <p className="text-slate-600 text-[11px] leading-tight mb-2">{reward.description}</p>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100/90 border border-slate-200/60 px-2 py-0.5 rounded inline-block">
                        شرط: {reward.requirement}
                      </span>
                    </div>
                  </div>

                  {/* لایه پیام انگیزشی هنگام Hover */}
                  {isHovered && (
                    <div className="absolute inset-0 flex items-center justify-center p-3.5 bg-[#113a53]/95 text-white rounded-2xl text-center transition-all duration-300">
                      <p className="text-xs sm:text-sm font-medium leading-relaxed">
                        {reward.motivationalMessage}
                      </p>
                    </div>
                  )}
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
