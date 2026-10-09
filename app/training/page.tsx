"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles, BookOpen, Target, ArrowLeft, X } from "lucide-react";

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

export default function TrainingProgramPage() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const active = modules.find((m) => m.id === activeId) ?? null;

  return (
    <div className="min-h-screen bg-[#eaf4f4] py-10 px-4 sm:px-6 lg:px-8 font-[Vazirmatn] text-slate-900">
      <div className="max-w-5xl mx-auto">
        {/* هدر صفحه */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-800 text-sm font-semibold mb-3 shadow-sm">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>مبتنی بر نظریه شناختی اجتماعی (SCT)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#113a53] mb-3">
            برنامه آموزشی من
          </h1>

          <p className="text-slate-800 font-medium text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            این برنامه آموزشی بر اساس پنج سازه از نظریه شناختی اجتماعی Bandura طراحی شده تا به شما کمک کند عادت‌های ارگونومیک سالم را به رفتار پایدار تبدیل کنید.
          </p>
        </div>

        {/* لیست کارت‌های ۵ گانه به صورت ۲ تایی در هر ردیف و وسط‌چین شدن مورد پنجم */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modules.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              className="w-full text-right bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-700/30 cursor-pointer flex flex-col justify-between md:last:col-span-2 md:last:max-w-xl md:last:mx-auto"
            >
              <div>
                {/* بخش بالا: شمارنده و تگ سازه (راست‌چین) */}
                <div className="flex items-center justify-start gap-2.5 mb-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#113a53] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {item.id}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#c8e6e8] text-[#113a53] text-xs font-bold">
                    {item.constructFa}
                  </span>
                </div>

                {/* عنوان و توضیح */}
                <h2 className="text-base sm:text-lg font-bold text-[#113a53] mb-1.5 text-right">
                  {item.title}
                </h2>

                <p className="text-slate-800 font-medium text-xs sm:text-sm leading-relaxed text-right mb-3">
                  {item.description}
                </p>
              </div>

              <div className="space-y-2 mt-auto w-full">
                {/* کادر مثال عملی */}
                <div className="bg-[#f0f7fc] border border-blue-100 rounded-xl p-3 text-right">
                  <div className="flex items-center justify-start gap-1.5 text-[#1f4e79] font-bold text-xs mb-1">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>مثال عملی</span>
                  </div>
                  <p className="text-slate-800 font-medium text-xs leading-relaxed">
                    {item.example}
                  </p>
                </div>

                {/* کادر تمرین کوچک */}
                <div className="bg-[#effaf6] border border-emerald-100 rounded-xl p-3 text-right">
                  <div className="flex items-center justify-start gap-1.5 text-emerald-800 font-bold text-xs mb-1">
                    <Target className="w-4 h-4 text-emerald-600" />
                    <span>تمرین کوچک</span>
                  </div>
                  <p className="text-slate-800 font-medium text-xs leading-relaxed">
                    {item.exercise}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* دکمه‌های پایین صفحه */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
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
            مشاهده اصول 14 گانه
          </Link>
        </div>
      </div>

      {/* مودال تعاملی: بزرگ‌تر شدن اندازه کادر پیش‌رو */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:py-10"
          role="dialog"
          aria-modal="true"
          aria-label="جزئیات سازه آموزشی"
          onClick={() => setActiveId(null)}
        >
          {/* پس‌زمینه تار */}
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-md" />

          {/* کادر بزرگ‌شده مودال */}
          <div
            className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-200/80 p-6 sm:p-8 text-right z-10 transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveId(null)}
              className="absolute left-4 sm:left-6 top-4 sm:top-6 inline-flex items-center justify-center h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              aria-label="بستن"
            >
              <X className="h-5 w-5 text-slate-700" />
            </button>

            {/* هدر مودال */}
            <div className="flex items-center justify-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#113a53] text-white flex items-center justify-center font-black text-sm shadow-sm">
                {active.id}
              </div>
              <div className="px-3.5 py-1 rounded-full bg-[#c8e6e8] text-[#113a53] text-sm font-bold">
                {active.constructFa} — {active.constructEn}
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#113a53] mb-4 text-right">
              {active.title}
            </h2>

            <div className="space-y-4">
              <section className="rounded-2xl bg-[#eaf4f4] border border-slate-200/60 p-4 sm:p-5">
                <h3 className="font-extrabold text-slate-900 text-base mb-1.5">توضیحات سازه</h3>
                <p className="text-slate-800 text-sm sm:text-base leading-7 sm:leading-8 font-medium">
                  {active.description}
                </p>
              </section>

              <section className="rounded-2xl bg-[#f0f7fc] border border-blue-100 p-4 sm:p-5">
                <h3 className="font-extrabold text-[#1f4e79] text-base mb-1.5 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>مثال عملی</span>
                </h3>
                <p className="text-slate-800 text-sm sm:text-base leading-7 sm:leading-8 font-medium">
                  {active.example}
                </p>
              </section>

              <section className="rounded-2xl bg-[#effaf6] border border-emerald-100 p-4 sm:p-5">
                <h3 className="font-extrabold text-emerald-800 text-base mb-1.5 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  <span>تمرین کوچک</span>
                </h3>
                <p className="text-slate-800 text-sm sm:text-base leading-7 sm:leading-8 font-medium">
                  {active.exercise}
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
