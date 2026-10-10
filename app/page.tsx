import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles, CheckCircle, ShieldCheck, Activity, Award, BookOpen, Target } from "lucide-react";
import NotificationManager from "@/components/NotificationManager";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#eaf4f4] font-[Vazirmatn]">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero Content */}
          <div className="space-y-6 text-right">
            
            {/* نشان بالای تیتر */}
            <div className="inline-flex items-center gap-2 bg-[#d8f3dc] text-[#1b4332] px-3.5 py-1.5 rounded-full text-xs font-semibold">
              <Sparkles size={14} className="text-[#2d6a4f]" />
              <span>برنامه آموزشی مبتنی بر نظریه شناختی اجتماعی</span>
            </div>

            {/* تیتر اصلی */}
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
              با ارگونو، بدون <span className="text-[#2d6a4f]">گردن‌درد و کمردرد</span> پشت میز کارت بمون
            </h1>

            {/* توضیحات تکمیلی */}
            <p className="text-slate-900 text-base md:text-lg leading-relaxed font-normal">
              ارگونو مربی شخصی شماست برای پیشگیری از دردهای گردن، شانه و کمر ناشی از کار طولانی با رایانه. آموزش‌های علمی، تمرینات روزانه و چک‌لیست تعاملی – همه در یک‌جا.
            </p>

            {/* دکمه‌های اقدام (CTA) */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/dashboard"
                className="bg-[#1b4332] hover:bg-[#2d6a4f] text-white px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
              >
                <span>شروع برنامه شخصی</span>
                <ArrowLeft size={16} />
              </Link>
              
              <Link
                href="#features"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm"
              >
                آشنایی با امکانات ارگونو
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative flex justify-center">
            <div className="bg-white p-4 md:p-6 rounded-3xl shadow-xl border border-slate-100 max-w-xl w-full">
              <Image
                src="/ergonomics-hero.png"
                alt="ارگونومی محیط کار"
                width={700}
                height={500}
                className="w-full h-auto object-contain rounded-2xl"
                priority
              />
            </div>
          </div>

        </div>
      </section>

      {/* بخش یادآور هوشمند ارگونومی (حالت درون‌صفحه‌ای inline) */}
      <section className="max-w-6xl mx-auto px-6 mb-12">
        <NotificationManager variant="inline" />
      </section>

      {/* 6 Features Grid */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            امکانات سامانه ارگونو
          </h2>
          <p className="text-slate-900 text-sm md:text-base">
            ابزارهای کامل برای حفظ سلامت بدنی و اصلاح عادت‌های حرکتی در محیط کار
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-[#1b4332] rounded-xl flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">چک‌لیست روزانه</h3>
            <p className="text-slate-900 text-sm leading-relaxed">
              ارزیابی تعاملی وضعیت نشستن، تنظیم مانیتور و صندلی به صورت روزانه.
            </p>
          </div>

          {/* کارت تمرینات کششی */}
          <Link
            href="/exercises"
            className="block bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 bg-emerald-50 text-[#1b4332] rounded-xl flex items-center justify-center group-hover:bg-[#1b4332] group-hover:text-white transition-colors">
              <Activity size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1b4332] transition-colors">
              تمرینات کششی
            </h3>
            <p className="text-slate-900 text-sm leading-relaxed">
              حرکات اصلاحی و کششی کوتاه برای اجرا در حین فواصل کاری.
            </p>
          </Link>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-[#1b4332] rounded-xl flex items-center justify-center">
              <BookOpen size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">آموزش‌های گام‌به‌گام</h3>
            <p className="text-slate-900 text-sm leading-relaxed">
              محتوای کاربردی مبتنی بر شواهد علمی برای پیشگیری از آسیب‌های اسکلتی.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-[#1b4332] rounded-xl flex items-center justify-center">
              <Target size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">پیگیری پیشرفت</h3>
            <p className="text-slate-900 text-sm leading-relaxed">
              مشاهده نمودار بهبود وضعیت بدنی و میزان رعایت اصول ارگونومی.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-[#1b4332] rounded-xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">خودکارآمدی شغلی</h3>
            <p className="text-slate-900 text-sm leading-relaxed">
              افزایش انگیزه و توانمندی فردی برای مدیریت سلامت در محیط کار.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-[#1b4332] rounded-xl flex items-center justify-center">
              <Award size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">پاداش و نشان‌ها</h3>
            <p className="text-slate-900 text-sm leading-relaxed">
              کسب امتیاز و دریافت مدال‌های سلامتی با انجام منظم تمرینات.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#f0f7f7] py-12 md:py-16 border-y border-[#d8e8e8]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-extrabold text-[#1b4332] dir-ltr">
                +۸۰٪
              </div>
              <p className="text-slate-600 text-xs md:text-sm font-medium">
                از کارمندان اداری حداقل یک‌بار درد گردن را تجربه می‌کنند
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-extrabold text-[#1b4332]">
                ۲۰ ثانیه
              </div>
              <p className="text-slate-600 text-xs md:text-sm font-medium">
                هر ۲۰ دقیقه، به فاصله ۶ متری نگاه کنید
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-extrabold text-[#1b4332]">
                ۵ سازه
              </div>
              <p className="text-slate-600 text-xs md:text-sm font-medium">
                نظریه شناختی اجتماعی، پایه برنامه آموزشی ارگونو
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center space-y-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          همین امروز شروع کنید
        </h2>
        <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          با چک‌لیست تعاملی، پیشرفت روزانه و هفتگی خود را ببینید و عادت‌های سالم را در محیط کار بسازید.
        </p>
        <div className="pt-2">
          <Link
            href="/checklist"
            className="inline-flex items-center gap-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg"
          >
            <ArrowLeft size={16} />
            <span>ورود به چک‌لیست روزانه</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
