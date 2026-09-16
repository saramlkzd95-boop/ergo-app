import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-16 pb-12" dir="rtl">
      {/* بخش Hero با پس‌زمینه سبز برگی و تصویر کامل */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#bef264] via-[#a3e635] to-[#84cc16] border border-emerald-100 shadow-sm p-8 md:p-12 lg:p-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          {/* ستون متن و دکمه‌ها */}
          <div className="space-y-6 text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium">
              <span>🌿</span>
              <span>سامانه ارگونومی محیط کار و سلامت اداری</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-[#1e3a5f] leading-tight">
              سلامت و بهره‌وری شما در محیط کار، با{" "}
              <span className="text-emerald-600">ارگونو</span>
            </h1>

            <p className="text-slate-600 text-base md:text-lg leading-relaxed">
              آموزش‌های کاربردی، حرکات کششی متناسب با میز کار، و ابزارهای سنجش وضعیت بدنی برای پیشگیری از خستگی و دردهای اسکلتی-عضلانی بر پایه نظریه شناختی اجتماعی.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/modules"
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm hover:shadow"
              >
                شروع برنامه آموزشی
              </Link>
              <Link
                href="/checklist"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 transition shadow-sm"
              >
                چک‌لیست ارگونومی میز کار
              </Link>
            </div>
          </div>

          {/* ستون تصویر — نمایش کامل بدون کراپ */}
          <div className="flex justify-center items-center">
            <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-sm border border-emerald-100/70 bg-white/70 backdrop-blur-xs p-3 flex items-center justify-center">
              <img
                src="/ergonomics-hero.png"
                alt="ارگونومی محیط کار"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>
          </div>

        </div>
      </section>

      {/* بخش کارت‌های ۶‌گانه امکانات */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">
            امکانات و بخش‌های سامانه
          </h2>
          <p className="text-slate-500 text-sm md:text-base">
            ابزارهایی جامع برای حفظ سلامتی و ارتقای استاندارد وضعیت بدنی شما
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-4">
              📚
            </div>
            <h3 className="font-bold text-lg text-[#1e3a5f] mb-2">ماژول‌های آموزشی</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              آموزش تنظیم استاندارد صندلی، مانیتور، کیبورد و نور مناسب محیط کار.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-4">
              🧘
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">تمرینات کششی روزانه</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              حرکات ورزشی کوتاه و موثر پشت میز برای رفع اسپاسم گردن، شانه و مچ دست.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-4">
              📋
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">چک‌لیست خودارزیابی</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              بررسی سریع ایستگاه کاری و دریافت نمره وضعیت ارگونومی به همراه پیشنهادات اصلاحی.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-4">
              ⏰
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">قانون ۲۰-۲۰-۲۰</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              یادآور و تکنیک‌های مراقبت از سلامت چشم و کاهش خستگی بینایی ناشی از صفحه نمایش.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-4">
              🎯
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">تغییر رفتار پایدار</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              طراحی شده بر مبنای مدل‌های تغییر رفتار و افزایش خودکارآمدی ارگونومیک.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-4">
              📊
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">پایش مستمر</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              مشاهده روند بهبود وضعیت بدنی و ارزیابی منظم محیط کار در طول زمان.
            </p>
          </div>
        </div>
      </section>

      {/* بخش آمار پایین صفحه */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#bef264] via-[#a3e635] to-[#84cc16] border border-emerald-100 shadow-sm p-8 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          
          <div className="space-y-2">
            <div className="text-3xl lg:text-4xl font-black text-emerald-900 font-sans tracking-tight">
              ۸۰٪+
            </div>
            <div className="text-xs md:text-sm text-emerald-800/80 font-medium">
              از کارمندان اداری حداقل یک‌بار درد گردن را تجربه می‌کنند
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-3xl lg:text-4xl font-black text-emerald-900 font-sans tracking-tight">
              ۲۰ ثانیه
            </div>
            <div className="text-xs md:text-sm text-emerald-800/80 font-medium">
              هر ۲۰ دقیقه، به فاصله ۶ متری نگاه کنید
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-3xl lg:text-4xl font-black text-emerald-900 font-sans tracking-tight">
              ۵ سازه
            </div>
            <div className="text-xs md:text-sm text-emerald-800/80 font-medium">
              نظریه شناختی اجتماعی، پایه برنامه آموزشی ارگونو
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
