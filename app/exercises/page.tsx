"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { EXERCISES_DATA, type Exercise } from "@/data/exercises";

const DEFAULT_SIDE_DURATION = 15;
const SINGLE_CLIP_EXERCISE_ID = "neck-rotation";
const SINGLE_CLIP_DURATION = 20;
const PROGRESS_KEY = "ergono-corrective-exercises-progress";

type ExerciseProgress = Record<string, string[]>;

type WeekDay = {
  key: string;
  label: string;
  isToday: boolean;
  isFuture: boolean;
};

const getPersianDayName = (date: Date): string => {
  // اندیس‌ها مطابق Date.getDay هستند: یکشنبه = ۰، شنبه = ۶
  const days = [
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنجشنبه",
    "جمعه",
    "شنبه",
  ];

  return days[date.getDay()];
};

const getLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const createSeededRandom = (seed: string): (() => number) => {
  let state = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index);
    state = Math.imul(state, 16777619);
  }

  return () => {
    state += 0x6d2b79f5;

    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffleExercisesForDay = (dateKey: string): Exercise[] => {
  const shuffled = [...EXERCISES_DATA];
  const random = createSeededRandom(dateKey);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
};

const isExerciseBilateral = (exercise?: Exercise): boolean =>
  Boolean(
    exercise &&
      exercise.id !== SINGLE_CLIP_EXERCISE_ID &&
      exercise.isBilateral &&
      exercise.sides &&
      exercise.sides.length > 1
  );

const getExerciseDuration = (
  exercise?: Exercise,
  sideIndex = 0
): number => {
  if (!exercise) return DEFAULT_SIDE_DURATION;

  if (exercise.id === SINGLE_CLIP_EXERCISE_ID) {
    return SINGLE_CLIP_DURATION;
  }

  if (isExerciseBilateral(exercise)) {
    return exercise.sides?.[sideIndex]?.duration ?? DEFAULT_SIDE_DURATION;
  }

  return DEFAULT_SIDE_DURATION;
};

// شناسه‌های جدید حفظ می‌شوند؛ اندیس‌های ذخیره‌شده در نسخهٔ قدیمی
// با استفاده از ترتیب اصلی EXERCISES_DATA به شناسه تبدیل می‌شوند.
const normalizeCompletedExercises = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  const validIds = new Set(
    EXERCISES_DATA.map((exercise) => exercise.id)
  );
  const normalized = new Set<string>();

  for (const item of value) {
    if (typeof item === "string" && validIds.has(item)) {
      normalized.add(item);
      continue;
    }

    if (
      typeof item === "number" &&
      Number.isInteger(item) &&
      item >= 0 &&
      item < EXERCISES_DATA.length
    ) {
      normalized.add(EXERCISES_DATA[item].id);
    }
  }

  return [...normalized];
};

const loadExerciseProgress = (): ExerciseProgress => {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    const progress: ExerciseProgress = {};

    for (const [dateKey, completed] of Object.entries(parsed)) {
      progress[dateKey] = normalizeCompletedExercises(completed);
    }

    return progress;
  } catch {
    return {};
  }
};

const saveExerciseProgress = (progress: ExerciseProgress): void => {
  try {
    window.localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify(progress)
    );
  } catch {
    // در صورت غیرفعال بودن ذخیره‌سازی مرورگر، صفحه همچنان کار می‌کند.
  }
};

const buildWeekDays = (currentDate: Date): WeekDay[] => {
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);
  const daysSinceSaturday = (today.getDay() + 1) % 7;
  startOfWeek.setDate(today.getDate() - daysSinceSaturday);

  return Array.from({ length: 7 }, (_, dayIndex) => {
    const targetDate = new Date(startOfWeek);
    targetDate.setDate(startOfWeek.getDate() + dayIndex);

    const isToday = targetDate.getTime() === today.getTime();
    const dayName = getPersianDayName(targetDate);

    return {
      key: getLocalDateKey(targetDate),
      label: isToday ? `${dayName} (امروز)` : dayName,
      isToday,
      isFuture: targetDate.getTime() > today.getTime(),
    };
  });
};

export default function ExercisesPage() {
  const [todayKey, setTodayKey] = useState("");
  const [orderedExercises, setOrderedExercises] = useState<Exercise[]>([]);
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [pastProgress, setPastProgress] = useState<ExerciseProgress>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSideIndex, setCurrentSideIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SIDE_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const todayKeyRef = useRef("");
  const autoNextTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const currentExercise = orderedExercises[currentIndex];
  const totalExercises = EXERCISES_DATA.length;

  const completedExercises = pastProgress[todayKey] ?? [];
  const completedCount = completedExercises.length;

  const isBilateral = isExerciseBilateral(currentExercise);
  const totalSides = isBilateral
    ? currentExercise?.sides?.length ?? 1
    : 1;

  const currentSide = isBilateral
    ? currentExercise?.sides?.[currentSideIndex]
    : undefined;

  // این حرکت یک کلیپ واحد دارد، حتی اگر sides در داده‌ها تعریف شده باشد.
  const currentAnimationUrl =
    currentExercise?.id === SINGLE_CLIP_EXERCISE_ID
      ? currentExercise.animationUrl ??
        currentExercise.sides?.[0]?.animationUrl
      : currentSide?.animationUrl ??
        currentExercise?.animationUrl;

  const currentDuration = getExerciseDuration(
    currentExercise,
    currentSideIndex
  );

  const completionPercent =
    totalExercises > 0
      ? Math.round((completedCount / totalExercises) * 100)
      : 0;

  const clearAutoNextTimeout = useCallback(() => {
    if (autoNextTimeoutRef.current !== null) {
      clearTimeout(autoNextTimeoutRef.current);
      autoNextTimeoutRef.current = null;
    }
  }, []);

  const playNotes = useCallback(
    (
      notes: number[],
      spacing: number,
      noteDuration: number
    ) => {
      if (isMuted) return;

      try {
        const audioWindow = window as Window & {
          webkitAudioContext?: typeof AudioContext;
        };

        const AudioContextClass =
          window.AudioContext ?? audioWindow.webkitAudioContext;

        if (!AudioContextClass) return;

        const context = new AudioContextClass();

        notes.forEach((frequency, index) => {
          const start = context.currentTime + index * spacing;
          const oscillator = context.createOscillator();
          const gain = context.createGain();

          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(frequency, start);

          gain.gain.setValueAtTime(0.001, start);
          gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            start + noteDuration
          );

          oscillator.connect(gain);
          gain.connect(context.destination);

          oscillator.start(start);
          oscillator.stop(start + noteDuration + 0.01);
        });

        window.setTimeout(() => {
          void context.close().catch(() => {});
        }, Math.ceil((notes.length * spacing + noteDuration + 0.5) * 1000));
      } catch {
        // پشتیبانی‌نشدن صدا مانع انجام تمرین نمی‌شود.
      }
    },
    [isMuted]
  );

  const playSideSwitchSound = useCallback(() => {
    playNotes([440, 659.25], 0.12, 0.25);
  }, [playNotes]);

  const playCelebrationSound = useCallback(() => {
    playNotes([523.25, 659.25, 783.99, 1046.5], 0.1, 0.3);
  }, [playNotes]);

  // تاریخ، ترتیب تمرین‌ها و پیشرفت فقط پس از اجرای صفحه در مرورگر خوانده می‌شوند.
  useEffect(() => {
    const updateDay = () => {
      const now = new Date();
      const newKey = getLocalDateKey(now);

      if (todayKeyRef.current === newKey) return;

      todayKeyRef.current = newKey;
      clearAutoNextTimeout();

      const exercises = shuffleExercisesForDay(newKey);

      setTodayKey(newKey);
      setOrderedExercises(exercises);
      setWeekDays(buildWeekDays(now));

      setCurrentIndex(0);
      setCurrentSideIndex(0);
      setTimeLeft(getExerciseDuration(exercises[0]));
      setIsRunning(false);
      setShowEncouragement(false);
    };

    setPastProgress(loadExerciseProgress());
    updateDay();
    setIsLoaded(true);

    const interval = window.setInterval(updateDay, 30_000);

    const checkOnVisibility = () => {
      if (document.visibilityState === "visible") {
        updateDay();
      }
    };

    document.addEventListener(
      "visibilitychange",
      checkOnVisibility
    );
    window.addEventListener("focus", updateDay);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener(
        "visibilitychange",
        checkOnVisibility
      );
      window.removeEventListener("focus", updateDay);
      clearAutoNextTimeout();
    };
  }, [clearAutoNextTimeout]);

  // پس از تبدیل داده‌های قدیمی، نسخهٔ مبتنی بر شناسه ذخیره می‌شود.
  useEffect(() => {
    if (!isLoaded) return;

    saveExerciseProgress(pastProgress);
  }, [pastProgress, isLoaded]);

  const weeklyChartData = useMemo(
    () =>
      weekDays.map((day) => {
        const completed = pastProgress[day.key] ?? [];
        const percent =
          day.isFuture || totalExercises === 0
            ? 0
            : Math.round(
                (completed.length / totalExercises) * 100
              );

        return {
          key: day.key,
          label: day.label,
          isToday: day.isToday,
          percent: Math.min(100, Math.max(0, percent)),
        };
      }),
    [weekDays, pastProgress, totalExercises]
  );

  const markExerciseCompleted = useCallback(
    (exerciseId: string) => {
      if (
        !todayKey ||
        completedExercises.includes(exerciseId)
      ) {
        return;
      }

      setPastProgress((previous) => {
        const previousIds = previous[todayKey] ?? [];

        if (previousIds.includes(exerciseId)) {
          return previous;
        }

        return {
          ...previous,
          [todayKey]: [...previousIds, exerciseId],
        };
      });

      if (
        totalExercises > 0 &&
        completedCount === totalExercises - 1
      ) {
        setShowEncouragement(true);
        playCelebrationSound();
      }
    },
    [
      todayKey,
      completedExercises,
      completedCount,
      totalExercises,
      playCelebrationSound,
    ]
  );

  const toggleExerciseCompleted = (exerciseId: string) => {
    if (!todayKey) return;

    const wasCompleted =
      completedExercises.includes(exerciseId);

    setPastProgress((previous) => {
      const previousIds = previous[todayKey] ?? [];

      return {
        ...previous,
        [todayKey]: wasCompleted
          ? previousIds.filter((id) => id !== exerciseId)
          : previousIds.includes(exerciseId)
          ? previousIds
          : [...previousIds, exerciseId],
      };
    });

    if (wasCompleted) {
      setShowEncouragement(false);
    } else if (
      totalExercises > 0 &&
      completedCount === totalExercises - 1
    ) {
      setShowEncouragement(true);
      playCelebrationSound();
    }
  };

  const goToExercise = useCallback(
    (nextIndex: number) => {
      const nextExercise = orderedExercises[nextIndex];
      if (!nextExercise) return;

      clearAutoNextTimeout();
      setIsRunning(false);
      setCurrentIndex(nextIndex);
      setCurrentSideIndex(0);
      setTimeLeft(getExerciseDuration(nextExercise));
    },
    [orderedExercises, clearAutoNextTimeout]
  );

  // هنگام تغییر ویدئو یا سمت تمرین، کلیپ جدید از ابتدا پخش می‌شود.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentAnimationUrl) return;

    try {
      video.pause();
      video.currentTime = 0;

      const playPromise = video.play();

      if (playPromise !== undefined) {
        void playPromise.catch(() => {
          // برخی مرورگرها پخش خودکار را محدود می‌کنند.
        });
      }
    } catch {
      // خطای رسانه نباید مانع استفاده از صفحه شود.
    }
  }, [currentAnimationUrl]);

  useEffect(() => {
    if (!isRunning || !currentExercise) return;

    if (timeLeft <= 0) {
      if (
        isBilateral &&
        currentSideIndex < totalSides - 1
      ) {
        playSideSwitchSound();

        const nextSideIndex = currentSideIndex + 1;

        setCurrentSideIndex(nextSideIndex);
        setTimeLeft(
          getExerciseDuration(
            currentExercise,
            nextSideIndex
          )
        );

        return;
      }

      setIsRunning(false);
      markExerciseCompleted(currentExercise.id);

      if (currentIndex < totalExercises - 1) {
        clearAutoNextTimeout();

        autoNextTimeoutRef.current = setTimeout(() => {
          goToExercise(currentIndex + 1);
        }, 1200);
      }

      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((previous) =>
        Math.max(0, previous - 1)
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    isRunning,
    timeLeft,
    currentExercise,
    isBilateral,
    currentSideIndex,
    totalSides,
    currentIndex,
    totalExercises,
    playSideSwitchSound,
    markExerciseCompleted,
    clearAutoNextTimeout,
    goToExercise,
  ]);

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

  const toggleTimer = () => {
    clearAutoNextTimeout();

    if (timeLeft === 0) {
      setCurrentSideIndex(0);
      setTimeLeft(
        getExerciseDuration(currentExercise)
      );
      setIsRunning(true);
      return;
    }

    setIsRunning((previous) => !previous);
  };

  const resetTimer = () => {
    clearAutoNextTimeout();
    setIsRunning(false);
    setCurrentSideIndex(0);
    setTimeLeft(
      getExerciseDuration(currentExercise)
    );
  };

  const progressPercent =
    currentDuration > 0
      ? Math.min(
          100,
          Math.max(
            0,
            ((currentDuration - timeLeft) /
              currentDuration) *
              100
          )
        )
      : 0;

  // رندر اولیهٔ سرور و مرورگر یکسان باقی می‌ماند.
  if (!isLoaded || !todayKey) {
    return (
      <main
        className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-slate-800"
        dir="rtl"
      >
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          در حال بارگذاری تمرین‌ها...
        </div>
      </main>
    );
  }

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

  const isCurrentExerciseCompleted =
    completedExercises.includes(currentExercise.id);

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans"
      dir="rtl"
    >
      <audio
        ref={audioRef}
        src="/exercise-bgm.m4a"
        loop
        preload="none"
      />

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
            onClick={() =>
              setIsMuted((previous) => !previous)
            }
            aria-pressed={isMuted}
            className={`p-2 rounded-xl border text-sm transition flex items-center gap-1.5 ${
              isMuted
                ? "bg-slate-100 border-slate-300 text-slate-500"
                : "bg-teal-50 border-teal-200 text-teal-700"
            }`}
          >
            {isMuted ? "🔇 بدون صدا" : "🎵 موزیک ملایم"}
          </button>
        </div>
      </header>

      {/* بدنهٔ اصلی */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* رسانه و کنترل‌ها */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 overflow-hidden">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center shadow-inner">
              {currentAnimationUrl ? (
                <video
                  ref={videoRef}
                  key={currentAnimationUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover rounded-2xl"
                >
                  <source
                    src={currentAnimationUrl}
                    type="video/mp4"
                  />
                  مرورگر شما از پخش ویدئو پشتیبانی نمی‌کند.
                </video>
              ) : (
                <p className="px-4 text-center text-sm text-white">
                  برای این تمرین فایل ویدئویی ثبت نشده است.
                </p>
              )}

              {isBilateral && currentSide && (
                <div className="absolute top-4 left-4 bg-teal-600/90 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-sm animate-pulse flex items-center gap-1.5">
                  <span>🔄</span>
                  <span>{currentSide.label}</span>
                </div>
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

            {isBilateral && currentExercise.sides && (
              <div className="mt-3 flex items-center justify-center gap-2">
                {currentExercise.sides.map((side, index) => (
                  <span
                    key={side.side}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                      index === currentSideIndex
                        ? "bg-teal-600 text-white shadow-sm scale-105"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    مرحله {index + 1}: {side.label} (
                    {side.duration} ثانیه)
                  </span>
                ))}
              </div>
            )}

            {/* نوار پیشرفت تایمر */}
            <div className="mt-4 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-teal-600 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* کنترل‌های تایمر */}
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
                    : isBilateral
                    ? `▶ شروع تمرین (${
                        currentSide?.label ?? "مرحله اول"
                      })`
                    : `▶ شروع تمرین (${currentDuration} ثانیه)`}
                </button>

                <button
                  type="button"
                  onClick={resetTimer}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-sm transition"
                >
                  🔄 بازنشانی
                </button>
              </div>

              <div className="flex items-baseline gap-1 text-slate-700 font-mono">
                <span className="text-3xl font-black text-teal-700">
                  {timeLeft}
                </span>
                <span className="text-xs text-slate-500">
                  ثانیه
                </span>
              </div>
            </div>

            {/* ثبت انجام تمرین */}
            <button
              type="button"
              onClick={() =>
                toggleExerciseCompleted(currentExercise.id)
              }
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

            {/* ناوبری تمرین‌ها */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  goToExercise(currentIndex - 1)
                }
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← تمرین قبلی
              </button>

              <span className="text-xs text-slate-500 text-center flex-1 font-semibold">
                {currentExercise.title}
              </span>

              <button
                type="button"
                onClick={() =>
                  goToExercise(currentIndex + 1)
                }
                disabled={
                  currentIndex === totalExercises - 1
                }
                className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                تمرین بعدی →
              </button>
            </div>
          </div>
        </section>

        {/* توضیحات و پیشرفت */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-bold text-slate-800">
                  پیشرفت تمرین‌ها
                </h2>
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
                <span>
                  وضعیت: {currentExercise.position}
                </span>
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

        {/* نمودار پیشرفت هفتهٔ جاری */}
        <section className="lg:col-span-12">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-teal-800">
                پیشرفت هفته جاری
              </h2>

              <span className="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-full border border-teal-200 font-medium">
                ستون امروز: {completionPercent}٪
              </span>
            </div>

            <div className="w-full h-64" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyChartData}
                  margin={{
                    top: 12,
                    right: 16,
                    left: 0,
                    bottom: 8,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />

                  <XAxis
                    dataKey="label"
                    tick={{
                      fill: "#64748b",
                      fontSize: 13,
                      fontFamily: "inherit",
                    }}
                    axisLine={{
                      stroke: "#cbd5e1",
                    }}
                    tickLine={false}
                  />

                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={(value: number) =>
                      `${value}%`
                    }
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 12,
                      fontFamily: "inherit",
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={45}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `${String(value ?? 0)}٪`,
                      "میزان انجام‌شده",
                    ]}
                    cursor={{
                      fill: "rgba(15, 118, 110, 0.04)",
                    }}
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
                        fill={
                          day.isToday
                            ? "#0f766e"
                            : "#94a3b8"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </main>

      {/* پنجرهٔ تشویقی */}
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
              شما تمام تمرین‌های امروز را انجام دادید. این استمرار
              به سلامت بدن و کاهش خستگی‌های روزانه کمک می‌کند.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowEncouragement(false)
              }
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
