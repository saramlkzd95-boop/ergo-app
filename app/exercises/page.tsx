"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { EXERCISES_DATA, Exercise } from "@/data/exercises";

const EXERCISE_DURATION = 15;
const PROGRESS_KEY = "ergono-corrective-exercises-progress";
const DAY_MS = 24 * 60 * 60 * 1000;

// دریافت نام روز هفته به فارسی
const getPersianDayName = (date: Date) => {
  const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const days = [
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنجشنبه",
    "جمعه",
    "شنبه",
  ];
  return days[dayIndex];
};

const getLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

type ExerciseProgress = Record<string, number[]>;

const loadExerciseProgress = (): ExerciseProgress => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ExerciseProgress;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const saveExerciseProgress = (progress: ExerciseProgress) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // نادیده گرفتن خطا
  }
};

export default function ExercisesPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXERCISE_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // تمرین‌های تکمیل‌شده امروز
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);

  // کل تاریخچه پیشرفت روزها
  const [pastProgress, setPastProgress] = useState<ExerciseProgress>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // نمایش پنجره تشویقی
  const [showEncouragement, setShowEncouragement] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const autoNextTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentExercise: Exercise | undefined = EXERCISES_DATA[currentIndex];
  const totalExercises = EXERCISES_DATA.length;
  const completedCount = completedExercises.length;

  // تابع پخش صدای موفقیت و تشویق (ترکیب فایل صوتی و Web Audio API برای تضمین ۱۰۰٪ پخش)
  const playCelebrationSound = useCallback(() => {
    if (isMuted) return;

    try {
      const audio = new Audio("/success.mp3");
      audio.volume = 0.8;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // در صورت عدم دسترسی به فایل صوتی، ایجاد ملودی زنگ موفقیت با Web Audio API
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext;
          if (!AudioContextClass) return;

          const ctx = new AudioContextClass();
          const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (ملودی پیروزی)

          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

            gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.1);
            gain.gain.linearRampToValueAtTime(
              0.2,
              ctx.currentTime + idx * 0.1 + 0.02
            );
            gain.gain.exponentialRampToValueAtTime(
              0.001,
              ctx.currentTime + idx * 0.1 + 0.3
            );

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime + idx * 0.1);
            osc.stop(ctx.currentTime + idx * 0.1 + 0.35);
          });
        });
      }
    } catch {
      // نادیده گرفتن خطا
    }
  }, [isMuted]);

  // درصد دقیق پیشرفت امروز
  const completionPercent = useMemo(() => {
    if (!totalExercises) return 0;
    return Math.round((completedCount / totalExercises) * 100);
  }, [completedCount, totalExercises]);

  // بارگذاری اولیه پیشرفت از localStorage
  useEffect(() => {
    const progress = loadExerciseProgress();
    const todayKey = getLocalDateKey(new Date());

    setPastProgress(progress);
    if (Array.isArray(progress[todayKey])) {
      setCompletedExercises(progress[todayKey]);
    }
    setIsLoaded(true);
  }, []);

  // ذخیره پیشرفت امروز در localStorage و همگام‌سازی لحظه‌ای pastProgress
  useEffect(() => {
    if (!isLoaded) return;

    const todayKey = getLocalDateKey(new Date());
    const progress = loadExerciseProgress();

    progress[todayKey] = completedExercises;

    // حذف داده‌های بسیار قدیمی (بیش از ۱۴ روز)
    const cutoff = Date.now() - 14 * DAY_MS;
    Object.keys(progress).forEach((key) => {
      const keyDate = new Date(`${key}T00:00:00`).getTime();
      if (!Number.isNaN(keyDate) && keyDate < cutoff) {
        delete progress[key];
      }
    });

    saveExerciseProgress(progress);
    setPastProgress({ ...progress });
  }, [completedExercises, isLoaded]);

  // ساخت داده‌های ۷ روز اخیر برای نمودار
  const weeklyChartData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data = [];

    // ۶ روز گذشته تا امروز
    for (let offset = 6; offset >= 0; offset -= 1) {
      const targetDate = new Date(today.getTime() - offset * DAY_MS);
      const key = getLocalDateKey(targetDate);
      const isToday = offset === 0;

      let percent = 0;
      if (isToday) {
        percent = completionPercent;
      } else {
        const pastList = Array.isArray(pastProgress[key])
          ? pastProgress[key]
          : [];
        percent =
          totalExercises > 0
            ? Math.round((pastList.length / totalExercises) * 100)
            : 0;
      }

      data.push({
        key,
        label: isToday ? "امروز" : getPersianDayName(targetDate),
        percent: Math.min(100, Math.max(0, percent)),
        isToday,
      });
    }

    return data;
  }, [completionPercent, pastProgress, totalExercises]);

  // پاک‌سازی انتقال خودکار
  const clearAutoNextTimeout = () => {
    if (autoNextTimeoutRef.current) {
      clearTimeout(autoNextTimeoutRef.current);
      autoNextTimeoutRef.current = null;
    }
  };

  // ثبت یا لغو ثبت انجام تمرین همراه با بررسی تکمیل و پخش صدا
  const toggleExerciseCompleted = (exerciseIndex: number) => {
    setCompletedExercises((prev) => {
      let updated: number[];
      if (prev.includes(exerciseIndex)) {
        updated = prev.filter((idx) => idx !== exerciseIndex);
      } else {
        updated = [...prev, exerciseIndex];
        // اگر با این کلیک تمام تمرین‌ها تکمیل شدند، بلافاصله صدا را اجرا کن
        if (updated.length === totalExercises && totalExercises > 0) {
          setShowEncouragement(true);
          playCelebrationSound();
        }
      }
      return updated;
    });
  };

  // بارگذاری ویدیو
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentExercise?.animationUrl) return;

    video.pause();
    video.load();
    void video.play().catch(() => {});
  }, [currentExercise?.animationUrl]);

  // تایمر تمرین
  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft <= 0) {
      setIsRunning(false);

      // ثبت خودکار تمرین بعد از پایان زمان
      setCompletedExercises((prev) => {
        if (prev.includes(currentIndex)) return prev;
        const updated = [...prev, currentIndex];
        if (updated.length === totalExercises && totalExercises > 0) {
          setShowEncouragement(true);
          playCelebrationSound();
        }
        return updated;
      });

      // رفتن خودکار به تمرین بعدی
      if (currentIndex < EXERCISES_DATA.length - 1) {
        clearAutoNextTimeout();
        autoNextTimeoutRef.current = setTimeout(() => {
          setCurrentIndex((prev) =>
            prev < EXERCISES_DATA.length - 1 ? prev + 1 : prev
          );
          setTimeLeft(EXERCISE_DURATION);
          autoNextTimeoutRef.current = null;
        }, 1200);
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [isRunning, timeLeft, currentIndex, totalExercises, playCelebrationSound]);

  // پخش موزیک پس‌زمینه
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = isMuted;

    if (isRunning && !isMuted) {
      void audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isRunning, isMuted]);

  useEffect(() => {
    return () => clearAutoNextTimeout();
  }, []);

  const toggleTimer = () => {
    clearAutoNextTimeout();
    if (timeLeft === 0) {
      setTimeLeft(EXERCISE_DURATION);
      setIsRunning(true);
      return;
    }
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    clearAutoNextTimeout();
    setIsRunning(false);
    setTimeLeft(EXERCISE_DURATION);
  };

  const goToExercise = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= EXERCISES_DATA.length) return;
    clearAutoNextTimeout();
    setIsRunning(false);
    setTimeLeft(EXERCISE_DURATION);
    setCurrentIndex(nextIndex);
  };

  const handleNext = () => goToExercise(currentIndex + 1);
  const handlePrev = () => goToExercise(currentIndex - 1);
  const toggleSound = () => setIsMuted((prev) => !prev);

  const progressPercent =
    ((EXERCISE_DURATION - timeLeft) / EXERCISE_DURATION) * 100;

  if (!currentExercise) {
    return (
      <main
        className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-slate-800"
        dir="rtl"
      >
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          تمرینی برای نمایش وجود ندارد.
        </div>
      </main>
    );
  }

  const isCurrentExerciseCompleted = completedExercises.includes(currentIndex);

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans"
      dir="rtl"
    >
      {/* فایل صوتی پس‌زمینه */}
      <audio ref={audioRef} src="/exercise-bgm.m4a" loop preload="none" />

      {/* هدر صفحه */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition"
            >
              ← بازگشت به خانه
            </Link>
            <h1 className="text-lg font-bold text-teal-800">
              تمرینات کششی و اصلاحی ارگونو
            </h1>
          </div>

          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={isMuted}
            className={`p-2 rounded-xl border text-sm transition flex items-center gap-1.5 ${
              isMuted
                ? "bg-slate-100 border-slate-300 text-slate-500"
                : "bg-teal-50 border-teal-200 text-teal-700"
            }`}
            title="قطع یا وصل موزیک پس‌زمینه"
          >
            {isMuted ? "🔇 بدون صدا" : "🎵 موزیک ملایم"}
          </button>
        </div>
      </header>

      {/* بدنه اصلی */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ستون ویدیو و کنترل‌ها */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 overflow-hidden">
            {/* قاب ویدیو */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center shadow-inner">
              {currentExercise.animationUrl ? (
                <video
                  ref={videoRef}
                  key={currentExercise.animationUrl}
                  src={currentExercise.animationUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover"
                >
                  مرورگر شما از پخش این ویدیو پشتیبانی نمی‌کند.
                </video>
              ) : (
                <p className="px-4 text-center text-sm text-white">
                  برای این تمرین ویدیویی ثبت نشده است.
                </p>
              )}

              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
                تمرین {currentIndex + 1} از {totalExercises}
              </div>

              {isCurrentExerciseCompleted && (
                <div className="absolute bottom-4 right-4 bg-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                  ✓ انجام شد
                </div>
              )}
            </div>

            {/* نوار پیشرفت تایمر */}
            <div
              className="mt-4 bg-slate-100 h-2 rounded-full overflow-hidden"
              role="progressbar"
              aria-label="پیشرفت زمان تمرین"
              aria-valuemin={0}
              aria-valuemax={EXERCISE_DURATION}
              aria-valuenow={EXERCISE_DURATION - timeLeft}
            >
              <div
                className="bg-teal-600 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* کنترل‌های تمرین و تایمر */}
            <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-md transition flex items-center gap-2 ${
                    isRunning
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-teal-600 hover:bg-teal-700"
                  }`}
                >
                  {isRunning
                    ? "⏸ توقف تمرین"
                    : timeLeft === 0
                      ? "▶ شروع دوباره"
                      : "▶ شروع تمرین (۱۵ ثانیه)"}
                </button>

                <button
                  type="button"
                  onClick={resetTimer}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-sm transition"
                >
                  🔄 بازنشانی
                </button>
              </div>

              <div
                className="flex items-baseline gap-1 text-slate-700 font-mono"
                aria-live="polite"
              >
                <span className="text-3xl font-black text-teal-700">
                  {timeLeft}
                </span>
                <span className="text-xs text-slate-500">ثانیه</span>
              </div>
            </div>

            {/* دکمه ثبت انجام تمرین */}
            <button
              type="button"
              onClick={() => toggleExerciseCompleted(currentIndex)}
              className={`mt-5 w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                isCurrentExerciseCompleted
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                  : "bg-slate-100 hover:bg-teal-50 text-slate-700 border border-slate-200 hover:border-teal-300"
              }`}
            >
              {isCurrentExerciseCompleted
                ? "✓ این تمرین انجام شد (برای لغو کلیک کنید)"
                : "ثبت انجام این تمرین"}
            </button>

            {/* جابه‌جایی بین تمرین‌ها */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← تمرین قبلی
              </button>

              <span className="text-xs text-slate-400 text-center">
                {currentExercise.title}
              </span>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex === totalExercises - 1}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                تمرین بعدی →
              </button>
            </div>
          </div>
        </section>

        {/* ستون توضیحات تمرین */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          {/* نوار کوچک پیشرفت بالای صفحه */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-bold text-slate-800">پیشرفت تمرین‌ها</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {completedCount} از {totalExercises} تمرین انجام شده
                </p>
              </div>

              <span className="text-2xl font-black text-teal-700">
                {completionPercent}٪
              </span>
            </div>

            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2 text-teal-700 font-semibold text-xs mb-1">
                <span>وضعیت: {currentExercise.position}</span>
              </div>

              <h2 className="text-2xl font-black text-slate-800">
                {currentExercise.title}
              </h2>

              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {currentExercise.titleEn}
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100">
                <h3 className="font-bold text-teal-900 mb-1.5 flex items-center gap-1.5">
                  <span>📌</span> نحوه اجرای حرکت
                </h3>
                <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                  {currentExercise.instruction}
                </p>
              </div>

              <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
                <h3 className="font-bold text-sky-900 mb-1.5 flex items-center gap-1.5">
                  <span>🫁</span> الگوی تنفس
                </h3>
                <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                  {currentExercise.breathing}
                </p>
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <h3 className="font-bold text-emerald-900 mb-1.5 flex items-center gap-1.5">
                  <span>🎯</span> اثر و عضلات هدف
                </h3>
                <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                  {currentExercise.result}
                </p>
              </div>

              {currentExercise.caution && (
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
                  <h3 className="font-bold text-amber-900 mb-1.5 flex items-center gap-1.5">
                    <span>⚠️</span> احتیاط و هشدار ایمنی
                  </h3>
                  <p className="text-amber-800 leading-relaxed text-xs">
                    {currentExercise.caution}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* نمودار پیشرفت ۷ روز اخیر */}
        <section className="lg:col-span-12">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-teal-800">
                پیشرفت ۷ روز اخیر
              </h2>
              <span className="text-xs text-slate-500 bg-teal-50 text-teal-700 px-3 py-1 rounded-full border border-teal-200 font-medium">
                ستون امروز: {completionPercent}٪
              </span>
            </div>

            <div className="w-full h-64" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyChartData}
                  margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#64748b", fontSize: 13, fontFamily: "inherit" }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={(val: number) => `${val}%`}
                    tick={{ fill: "#94a3b8", fontSize: 12, fontFamily: "inherit" }}
                    axisLine={false}
                    tickLine={false}
                    width={45}
                  />
                  <Tooltip
                    formatter={(val) => [`${val}٪`, "میزان انجام‌شده"]}
                    cursor={{ fill: "rgba(15, 118, 110, 0.04)" }}
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "1px solid #e2e8f0",
                      direction: "rtl",
                      fontFamily: "inherit",
                    }}
                  />
                  <Bar
                    dataKey="percent"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={44}
                    isAnimationActive={false}
                  >
                    {weeklyChartData.map((day) => (
                      <Cell
                        key={`cell-${day.key}`}
                        fill={day.isToday ? "#0f766e" : "#94a3b8"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </main>

      {/* پنجره تشویقی */}
      {showEncouragement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div className="text-6xl mb-4">🎉</div>

            <h2 className="text-2xl font-black text-teal-800 mb-3">
              آفرین! فوق‌العاده بود
            </h2>

            <p className="text-slate-600 leading-relaxed text-sm mb-6">
              شما تمام تمرین‌های امروز را انجام دادید. این استمرار به سلامت بدن
              و کاهش خستگی‌های روزانه کمک می‌کند.
            </p>

            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                ✓ پشتکار عالی
              </span>
              <span className="rounded-xl bg-teal-50 px-4 py-2 text-sm font-bold text-teal-700">
                💪 ادامه بده
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowEncouragement(false)}
              className="w-full rounded-xl bg-teal-600 px-5 py-3 font-bold text-white transition hover:bg-teal-700"
            >
              خیلی خوب! ادامه می‌دهم
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
