"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Sparkles, 
  BookOpen, 
  Target, 
  ArrowLeft, 
  Check, 
  Lock, 
  CheckCircle2, 
  Award,
  ChevronLeft,
  RotateCcw
} from "lucide-react";

interface Module {
  id: number;
  constructFa: string;
  constructEn: string;
  title: string;
  description: string;
  example: string;
  exercise: string;
}

const modules: Module[] = [
  {
    id: 1,
    constructFa: "خودکارآمدی",
    constructEn: "Self-Efficacy",
    title: "باور به توانایی خود برای تغییر",
    description:
      "خودکارآمدی یعنی باور داشته باشید که می‌توانید یک رفتار جدید را انجام دهید؛ حتی اگر در ابتدا برایتان دشوار باشد. شروع با گام‌های کوچک به تقویت این باور کمک می‌کند.",
    example:
      "خانم مرادی، کارمند حسابداری، ابتدا تنظیم ارتفاع مانیتور را تمرین کرد. پس از چند روز، توانست سایر بخش‌های میز کارش را هم به‌درستی تنظیم کند.",
    exercise:
      "امروز فقط یک تغییر ارگونومیک در محیط کارتان ایجاد کنید و انجام آن را در چک‌لیست ثبت کنید.",
  },
  {
    id: 2,
    constructFa: "انتظارات پیامد",
    constructEn: "Outcome Expectations",
    title: "چرا این رفتارها مهم‌اند؟",
    description:
      "وقتی بدانید یک رفتار چه پیامدهایی دارد، انگیزه بیشتری برای انجام آن پیدا می‌کنید. برای مثال، تغییر وضعیت بدن و استراحت‌های حرکتی می‌توانند به کاهش خستگی ناشی از نشستن طولانی کمک کنند.",
    example:
      "آقای رضایی در طول روز چند بار از پشت میز بلند می‌شود و کمی راه می‌رود تا مدت نشستن مداوم خود را کاهش دهد.",
    exercise:
      "یک فایده‌ای را که از رعایت اصول ارگونومی انتظار دارید، بنویسید و در طول هفته به آن توجه کنید.",
  },
  {
    id: 3,
    constructFa: "خودتنظیمی",
    constructEn: "Self-Regulation",
    title: "هدف‌گذاری و بررسی پیشرفت",
    description:
      "خودتنظیمی یعنی برای رفتار خود هدف تعیین کنید، عملکردتان را بررسی کنید و در صورت نیاز، برنامه را تغییر دهید.",
    example:
      "هدف هفته اول: «هر روز سه بار از پشت میز بلند شوم و چند دقیقه حرکت کنم.» آقای رضایی با استفاده از چک‌لیست، پیشرفت خود را ثبت می‌کند.",
    exercise:
      "یک هدف ارگونومیک ساده برای این هفته انتخاب کنید و هر روز انجام آن را در چک‌لیست علامت بزنید.",
  },
  {
    id: 4,
    constructFa: "یادگیری مشاهده‌ای",
    constructEn: "Observational Learning",
    title: "یادگیری از طریق مشاهده دیگران",
    description:
      "با مشاهده رفتار دیگران و تمرین آن، می‌توانید روش‌های جدید انجام رفتارهای ارگونومیک را یاد بگیرید.",
    example:
      "همکارتان را می‌بینید که مانیتور خود را در ارتفاع مناسب تنظیم می‌کند و در طول روز برای حرکت از پشت میز بلند می‌شود. با مشاهده روش او، می‌توانید این رفتارها را یاد بگیرید.",
    exercise:
      "یکی از آموزش‌های تصویری یا ویدئویی سایت را مشاهده کنید و همان رفتار را در محیط کار خود تمرین کنید.",
  },
  {
    id: 5,
    constructFa: "ظرفیت رفتاری",
    constructEn: "Behavioral Capability",
    title: "یادگیری دانش و مهارت‌های لازم",
    description:
      "برای انجام درست یک رفتار، فقط دانستن اهمیت آن کافی نیست؛ باید روش صحیح انجام آن را هم یاد بگیرید و تمرین کنید.",
    example:
      "خانم مرادی با مشاهده آموزش تنظیم صندلی یاد می‌گیرد ارتفاع آن را متناسب با قد خود تنظیم کند و وضعیت راحت‌تری هنگام کار داشته باشد.",
    exercise:
      "یکی از آموزش‌های ارگونومی سایت را انتخاب کنید، مراحل آن را یاد بگیرید و در محیط کار اجرا کنید.",
  },
];

const STORAGE_KEY = "ergono_education_completed_steps";

export default function TrainingProgramPage() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStepId, setCurrentStepId] = useState<number>(1);
  const [showRewardToast, setShowRewardToast] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // بارگذاری داده‌ها از localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCompletedSteps(parsed);
          // پیدا کردن اولین مرحله باز که هنوز تمام نشده
          const firstIncomplete = modules.find((m) => !parsed.includes(m.id));
          if (firstIncomplete) {
            setCurrentStepId(firstIncomplete.id);
          } else {
            setCurrentStepId(modules[modules.length - 1].id);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);
  }, []);

  // ذخیره‌سازی پیشرفت در حافظه محلی
  const saveProgress = (newCompleted: number[]) => {
    setCompletedSteps(newCompleted);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCompleted));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteCurrent = (id: number) => {
    if (!completedSteps.includes(id)) {
      const nextCompleted = [...completedSteps, id];
      saveProgress(nextCompleted);
      
      // نمایش پیام پاداش
      setShowRewardToast(true);
      setTimeout(() => setShowRewardToast(false), 2800);

      // رفتن به مرحله بعدی اگر موجود باشد
      if (id < modules.length) {
        setCurrentStepId(id + 1);
      }
    } else {
      // اگر قبلاً ثبت شده بود، فقط به بعدی هدایت شود
      if (id < modules.length) {
        setCurrentStepId(id + 1);
      }
    }
  };

  const handleResetProgress = () => {
    if (confirm("آیا مایلید مسیر یادگیری بازنشانی شود؟")) {
      saveProgress([]);
      setCurrentStepId(1);
    }
  };

  const currentModule = modules.find((m) => m.id === currentStepId) ?? modules[0];
  const progressPercent = Math.round((completedSteps.length / modules.length) * 100);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#eaf4f4] py-8 sm:py-10 px-4 sm:px-6 lg:px-8 font-[Vazirmatn] text-slate-900">
      <div className="max-w-4xl mx-auto">
        
        {/* هدر صفحه */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#113a53] mb-3">
            برنامه آموزشی من
          </h1>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-800 text-sm font-semibold mb-3 shadow-sm">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>مسیر تعاملی نظریه شناختی اجتماعی (SCT)</span>
          </div>

          <p className="text-slate-800 font-medium text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            گام‌به‌گام با ۵ سازه اصلی مسیر همراه شوید، تمرین‌های کوچک هر ایستگاه را ثبت کنید و نشان‌های پیشرفت خود را کامل نمایید.
          </p>
        </div>

        {/* کادر نوار پیشرفت زنده */}
        <div className="bg-white rounded-2xl p-5 mb-8 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3 text-xs sm:text-sm font-bold text-[#113a53]">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              پیشرفت در مسیر یادگیری: {progressPercent}٪
            </span>
            <span className="text-slate-500 font-medium">
              {completedSteps.length} از {modules.length} ایستگاه تکمیل شده
            </span>
          </div>
          
          {/* نوار اصلی */}
          <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 overflow-hidden border border-slate-200">
            <div
              className="bg-gradient-to-l from-emerald-500 to-[#1f4e79] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ایستگاه‌های مسیر (Journey Stepper) */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 mb-8 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
            {modules.map((m, index) => {
              const isCompleted = completedSteps.includes(m.id);
              const isCurrent = currentStepId === m.id;
              // مرحله باز است اگر مرحله جاری باشد، قبلاً کامل شده باشد، یا مرحله بلافاصله بعد از کامل‌شده‌ها باشد
              const isUnlocked = isCompleted || isCurrent || m.id === 1 || completedSteps.includes(m.id - 1);

              return (
                <div key={m.id} className="flex items-center flex-1 min-w-[110px] last:flex-none">
                  {/* دکمه ایستگاه */}
                  <button
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => setCurrentStepId(m.id)}
                    className={`flex flex-col items-center gap-2 text-center transition-all w-full group ${
                      !isUnlocked ? "opacity-45 cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                        isCurrent
                          ? "bg-[#113a53] text-white ring-4 ring-teal-200 scale-105"
                          : isCompleted
                          ? "bg-emerald-600 text-white"
                          : isUnlocked
                          ? "bg-slate-100 text-[#113a53] hover:bg-slate-200"
                          : "bg-slate-100 text-slate-400 border border-dashed border-slate-300"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      ) : !isUnlocked ? (
                        <Lock className="w-4 h-4 text-slate-400" />
                      ) : (
                        <span>{m.id}</span>
                      )}
                    </div>

                    <span
                      className={`text-xs font-bold transition-colors line-clamp-1 ${
                        isCurrent
                          ? "text-[#113a53]"
                          : isCompleted
                          ? "text-emerald-700"
                          : "text-slate-600"
                      }`}
                    >
                      {m.constructFa}
                    </span>
                  </button>

                  {/* خط متصل‌کننده ایستگاه‌ها */}
                  {index < modules.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-colors ${
                        completedSteps.includes(m.id) ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* کارت تعاملی ایستگاه فعال (Active Journey Station Card) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md relative overflow-hidden text-right transition-all">
          {/* نشان وضعیت در بالای کارت */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#113a53] text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
                {currentModule.id}
              </div>
              <span className="px-3 py-1 rounded-full bg-[#c8e6e8] text-[#113a53] text-xs font-bold">
                {currentModule.constructFa} — {currentModule.constructEn}
              </span>
            </div>

            {completedSteps.includes(currentModule.id) ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                تکمیل شده
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                ایستگاه در حال اجرا
              </span>
            )}
          </div>

          {/* عنوان سازه */}
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#113a53] mb-4">
            {currentModule.title}
          </h2>

          {/* محتوا و بخش‌های آموزشی */}
          <div className="space-y-4 mb-6">
            {/* توضیح */}
            <div className="rounded-2xl bg-[#eaf4f4] border border-slate-200/60 p-4 sm:p-5">
              <h3 className="font-extrabold text-slate-900 text-sm mb-1.5">مفهوم کلیدی</h3>
              <p className="text-slate-800 text-sm sm:text-base leading-7 font-medium">
                {currentModule.description}
              </p>
            </div>

            {/* مثال عملی */}
            <div className="rounded-2xl bg-[#f0f7fc] border border-blue-100 p-4 sm:p-5">
              <div className="flex items-center gap-2 text-[#1f4e79] font-extrabold text-sm mb-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>نمونه کاربردی</span>
              </div>
              <p className="text-slate-800 text-xs sm:text-sm leading-6 font-medium">
                {currentModule.example}
              </p>
            </div>

            {/* تمرین تعاملی */}
            <div className="rounded-2xl bg-[#effaf6] border border-emerald-200 p-4 sm:p-5">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm mb-1.5">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>تمرین کوچک برای قفل‌شکنی مرحله بعد</span>
              </div>
              <p className="text-slate-800 text-xs sm:text-sm leading-6 font-medium">
                {currentModule.exercise}
              </p>
            </div>
          </div>

          {/* دکمه اقدام و ثبت مرحله */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleCompleteCurrent(currentModule.id)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm text-sm cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>
                {completedSteps.includes(currentModule.id)
                  ? currentModule.id < modules.length
                    ? "برو به گام بعدی"
                    : "پایان مسیر یادگیری"
                  : "انجام دادم و ثبت گام بعدی (+۱۰ امتیاز)"}
              </span>
              <ChevronLeft className="w-4 h-4" />
            </button>

            {completedSteps.length > 0 && (
              <button
                type="button"
                onClick={handleResetProgress}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 font-medium cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                شروع مجدد مسیر
              </button>
            )}
          </div>
        </div>

        {/* دکمه‌های ناوبری عمومی پایین صفحه */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/checklist"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[#1f4e79] text-white font-bold hover:bg-[#163857] transition shadow-sm text-sm"
          >
            <span>ورود به چک‌لیست روزانه</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Link
            href="/principles"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition text-sm"
          >
            مشاهده اصول ۱۳ گانه
          </Link>
        </div>
      </div>

      {/* پیام پاپ‌آپ پاداش (Toast Notification) */}
      {showRewardToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#113a53] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-teal-500/30 animate-bounce">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-teal-300">آفرین!</p>
            <p className="text-xs font-semibold">ایستگاه تکمیل شد (+۱۰ امتیاز ارگونو)</p>
          </div>
        </div>
      )}
    </div>
  );
}
