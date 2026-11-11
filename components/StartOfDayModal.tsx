"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Armchair, Monitor, Keyboard, Check, ArrowLeft, X, Sparkles } from "lucide-react";
import { autoCheckWorkstationSetup } from "@/lib/checklistAuto"; // <-- اضافه شد

interface SetupStep {
  id: string;
  title: string;
  icon: React.ReactNode;
  image: string;
  items: string[];
}

const SETUP_STEPS: SetupStep[] = [
  {
    id: "chair-depth",
    title: "تنظیم صندلی",
    icon: <Armchair className="w-6 h-6 text-[#0f4c5c]" />,
    image: "/images/assessment/chair-seat-pan-depth-correct.png",
    items: [
      "ارتفاع صندلی را طوری تنظیم کنید که پاها کاملاً روی زمین یا زیرپایی قرار بگیرند.",
      "کمرتان را به پشتی صندلی تکیه دهید تا قوس طبیعی کمر حمایت شود.",
      "بهترین زاویه برای پشتی صندلی 100 الی 110 درجه می باشد."
    ]
  },
  {
    id: "monitor-height",
    title: "تنظیم صفحه‌نمایش",
    icon: <Monitor className="w-6 h-6 text-[#0f4c5c]" />,
    image: "/images/assessment/monitor-height-correct.png",
    items: [
      "صفحه نمایش را مستقیم روبه‌روی خود قرار دهید بطوری که لبه بالای آن هم راستای چشم شما باشد.",
      "فاصله صفحه نمایش تا چشم را حدود یک دست باز شده (۵۰ تا ۷۰ سانتی‌متر) تنظیم کنید."
    ]
  },
  {
    id: "elbow-angle",
    title: "کیبورد و ماوس",
    icon: <Keyboard className="w-6 h-6 text-[#0f4c5c]" />,
    image: "/images/assessment/posture-elbow-angle-90-degree-correct.png",
    items: [
      "کیبورد و ماوس را نزدیک بدن و در دسترس قرار دهید.",
      "آرنج‌ها حدود ۹۰ درجه و نزدیک بدن بمانند.",
      "مچ دست را تا حد امکان در راستای ساعد نگه دارید."
    ]
  }
];

interface StartOfDayModalProps {
  onComplete: () => void;
}

const STORAGE_CHECK_KEY = "ergono-start-of-day-completed";

// دریافت تاریخ امروز برای نمایش یک‌بار در روز
function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export default function StartOfDayModal({ onComplete }: StartOfDayModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // بررسی اینکه آیا امروز این مراحل انجام شده یا خیر
    const lastCompleted = localStorage.getItem(STORAGE_CHECK_KEY);
    const today = getTodayKey();
    if (lastCompleted !== today) {
      setIsOpen(true);
    }
  }, []);

  const handleNextStep = () => {
    if (currentStepIndex < SETUP_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // اتمام هر ۳ مرحله
      localStorage.setItem(STORAGE_CHECK_KEY, getTodayKey());
      setShowSuccessMessage(true);
    }
  };

  const handleCloseSuccess = () => {
    setIsOpen(false);
    autoCheckWorkstationSetup(); // <-- تیک خودکار آیتم تنظیم ایستگاه کار در چک‌لیست
    onComplete(); // به والد اعلام می‌کنیم که چک‌لیست را تیک بزند
  };

  if (!isOpen) return null;

  const step = SETUP_STEPS[currentStepIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300" dir="rtl">
      <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative flex flex-col my-auto">
        
        {!showSuccessMessage ? (
          <>
            {/* هدر و نشانگر مراحل */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 bg-[#17b890]/20 text-[#0f4c5c] rounded-full">
                  شروع روز {currentStepIndex + 1} از {SETUP_STEPS.length}
                </span>
                <h3 className="text-lg font-black text-[#0f4c5c]">تنظیم ارگونومیک میز کار</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* محتوای اصل فعلی */}
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-[#eaf4f4] rounded-2xl">{step.icon}</div>
              <h4 className="text-xl font-extrabold text-[#0f4c5c]">{step.title}</h4>
            </div>

            <div className="w-full h-48 sm:h-56 bg-[#f8fafc] rounded-2xl overflow-hidden relative mb-4 border border-slate-100 flex items-center justify-center">
              <Image
                src={step.image}
                alt={step.title}
                fill
                className="object-contain p-2"
                priority
              />
            </div>

            <ul className="space-y-2 mb-6">
              {step.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-slate-700 text-xs sm:text-sm font-medium bg-[#f8fafc] p-2.5 rounded-xl border border-slate-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#17b890] mt-2 shrink-0"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* دکمه اقدام */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                هر روز صبح با این ۳ قدم بدنت رو بیمه کن
              </span>
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-2 bg-[#0f4c5c] hover:bg-[#0b3844] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 text-sm"
              >
                <span>{currentStepIndex < SETUP_STEPS.length - 1 ? "انجام شد، برو بعدی" : "تکمیل و ثبت در چک‌لیست"}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          /* صفحه تبریک پایانی */
          <div className="text-center py-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-[#17b890] rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-[#0f4c5c] mb-2">عالی بود!</h3>
            <p className="text-base text-slate-700 font-medium mb-6">
              اولین قدم برای محافظت از بدنت رو انجام دادی، روز خوبی داشته باشی!
            </p>
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-bold mb-6 border border-emerald-200">
              ✓ آیتم «تنظیم ارگونومیک ایستگاه کار در شروع روز» در چک‌لیست روزانه شما ثبت و تیک خورد.
            </div>
            <button
              type="button"
              onClick={handleCloseSuccess}
              className="w-full bg-[#0f4c5c] hover:bg-[#0b3844] text-white font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-lg text-base"
            >
              ورود به صفحه اصلی ارگونو
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
