"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Armchair, Monitor, Keyboard, UserCheck, Eye, Footprints, 
  Laptop, Sun, FileText, RefreshCw, Heart, AlertTriangle, 
  X, Check, HelpCircle, ArrowLeft, Sparkles, Bot, RotateCcw
} from "lucide-react";

type ResponseStatus = "yes" | "unsure" | "no";
type FeedbackType = "yes" | "unsure" | "no";

interface PrincipleItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: string[];
  image: string;
  incorrectImage?: string;
  encouragementMessage: string;  // پیام تشویقی «انجام دادم»
  motivationalMessage: string;   // پیام انگیزشی روان و کوتاه «انجام ندادم»
  assistantTip: string;          // پیشنهاد دستیار ارگونو برای «مطمئن نیستم»
}

const STORAGE_KEY = "ergono-assessment-answers";
const EXPIRY_MS = 24 * 60 * 60 * 1000;

function loadStoredAnswers(): Record<string, { status: ResponseStatus; ts: number }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data: Record<string, { status: ResponseStatus; ts: number }> = JSON.parse(raw);
    const now = Date.now();
    const valid: typeof data = {};
    Object.entries(data).forEach(([k, v]) => {
      if (now - v.ts < EXPIRY_MS) valid[k] = v;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    return valid;
  } catch {
    return {};
  }
}

// تابع پخش افکت‌های صوتی اختصاصی با Web Audio API
function playFeedbackAudio(type: FeedbackType) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === "yes") {
      // صدای موفقیت (شاد و صعودی)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now); // C5
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, now + 0.1); // E5
      gain2.gain.setValueAtTime(0.2, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.5);

    } else if (type === "unsure") {
      // صدای تفکر و بررسی (تن دوگانه ملایم)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(523.25, now + 0.12); // C5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);

    } else if (type === "no") {
      // صدای غیرفعال/انگیزشی (تن نزولی ملایم)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(392, now); // G4
      osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.25); // C4
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (err) {
    console.error("Audio error:", err);
  }
}

export default function Home() {
  const [selectedPrinciple, setSelectedPrinciple] = useState<PrincipleItem | null>(null);
  const [storedAnswers, setStoredAnswers] = useState<Record<string, { status: ResponseStatus; ts: number }>>({});
  const [activeFeedback, setActiveFeedback] = useState<FeedbackType | null>(null);

  useEffect(() => {
    setStoredAnswers(loadStoredAnswers());
  }, []);

  useEffect(() => {
    setActiveFeedback(null);
  }, [selectedPrinciple]);

  const ergonomicsPrinciples: PrincipleItem[] = [
    {
      id: "chair-depth",
      title: "تنظیم صندلی",
      icon: <Armchair className="w-6 h-6 text-[#0f4c5c]" />,
      image: "/images/assessment/chair-seat-pan-depth-correct.png",
      encouragementMessage: "عالیه! ستون فقرات و عضلات کمرت بابت این تنظیم راحت شدن.",
      motivationalMessage: "فقط ۱ دقیقه تنظیم ارتفاع صندلی، کمردرد کل روزت رو برطرف می‌کنه!",
      assistantTip: "اگر ارتفاع دقیق صندلی مناسب قدت رو نمی‌دونی، از دستیار ارگونو بپرس.",
      items: [
        "ارتفاع صندلی را طوری تنظیم کنید که پاها کاملاً روی زمین یا زیرپایی قرار بگیرند.",
        "کمرتان را به پشتی صندلی تکیه دهید تا قوس طبیعی کمر حمایت شود.",
        "عمق تخت صندلی باید طوری باشد که چند انگشت بین لبه صندلی و زانو فضای کافی وجود داشته باشد."
      ]
    },
    {
      id: "monitor-height",
      title: "تنظیم صفحه‌نمایش",
      icon: <Monitor className="w-6 h-6 text-[#0f4c5c]" />,
      image: "/images/assessment/monitor-height-correct.png",
      encouragementMessage: "آفرین! حالا گردنت در زاویه طبیعی قرار گرفته و فشاری روش نیست.",
      motivationalMessage: "با گذاشتن یک کتاب زیر مانیتور، همین الان گردنت رو از فشار نجات بده.",
      assistantTip: "نمی‌دونی بالای مانیتور باید کجای چشمت باشه؟ از دستیار ارگونو راهنمایی بگیر.",
      items: [
        "مانیتور را مستقیم روبه‌روی خود و کمی پایین‌تر از سطح چشم قرار دهید.",
        "صفحه را در فاصله‌ای بگذارید که متن را بدون خم‌شدن به جلو به‌راحتی ببینید.",
        "مراقب باشید نور پنجره یا چراغ مستقیماً روی صفحه بازتاب نداشته باشد."
      ]
    },
    {
      id: "monitor-distance",
      title: "فاصله مانیتور",
      icon: <Monitor className="w-6 h-6 text-[#0f4c5c]" />,
      image: "/images/assessment/monitor-distance-correct.png",
      encouragementMessage: "فوق‌العاده است! رعایت فاصله یک بازو، خستگی چشم رو خیلی کم می‌کنه.",
      motivationalMessage: "مانیتور رو به اندازه طول دستت عقب ببر تا چشمهات کمتر خسته بشن.",
      assistantTip: "برای محاسبه دقیق فاصله مانیتور بر اساس سایز صفحه‌نمایشت، با دستیار ارگونو مشورت کن.",
      items: [
        "فاصله مانیتور تا چشم حدود فاصله یک بازو باشد (۵۰ تا ۷۰ سانتی‌متر).",
        "اگر به صفحه نزدیک می‌شوید یا سر را جلو می‌دهید، فاصله را بیشتر کنید.",
        "اندازه متن را طوری تنظیم کنید که در همین فاصله به‌راحتی خوانده شود."
      ]
    },
    {
      id: "elbow-angle",
      title: "کیبورد و ماوس",
      icon: <Keyboard className="w-6 h-6 text-[#0f4c5c]" />,
      image: "/images/assessment/posture-elbow-angle-90-degree-correct.png",
      encouragementMessage: "احسنت! زاویه ۹۰ درجه آرنج، سلامت مچ دستت رو تضمین می‌کنه.",
      motivationalMessage: "کیبورد رو کمی نزدیک‌تر بیار تا مچ دستت صاف بمونه و درد نگیره.",
      assistantTip: "اگر مچت موقع تایپ گزگز می‌کنه، وضعیتت رو به دستیار ارگونو بگو تا راهنماییت کنه.",
      items: [
        "کیبورد و ماوس را نزدیک بدن و در دسترس قرار دهید.",
        "آرنج‌ها حدود ۹۰ درجه و نزدیک بدن بمانند.",
        "مچ دست را تا حد امکان در راستای ساعد نگه دارید."
      ]
    },
    {
      id: "knee-angle",
      title: "وضعیت نشستن",
      icon: <UserCheck className="w-6 h-6 text-[#0f4c5c]" />,
      image: "/images/assessment/posture-knee-angle-90-degree-correct.png",
      encouragementMessage: "بسیار عالی! زاویه مناسب زانو، خون‌رسانی پاها رو عالی نگه می‌داره.",
      motivationalMessage: "کمی صاف‌تر بشین و پاهات رو کاملاً روی زمین بگذار؛ تفاوتش رو حس می‌کنی.",
      assistantTip: "می‌تونی چک‌لیست سریع وضعیت صحیح نشستن رو از دستیار ارگونو بگیری.",
      items: [
        "سر و گردن را در راستای تنه نگه دارید.",
        "زانو حدود ۹۰ درجه و هم‌سطح یا کمی پایین‌تر از لگن قرار بگیرد.",
        "یادتان باشد: بهترین وضعیت، وضعیتی است که مرتب تغییر کند."
      ]
    },
    {
      id: "eye-care",
      title: "مراقبت از چشم",
      icon: <Eye className="w-6 h-6 text-[#0f4c5c]" />,
      image: "/images/assessment/eye-care-20-20-20.png",
      encouragementMessage: "ماشاالله! قانون ۲۰-۲۰-۲۰ شادابی چشمانت رو در طول روز حفظ می‌کنه.",
      motivationalMessage: "همین الان ۲۰ ثانیه به دوردست نگاه کن تا چشمهات استراحت کنن.",
      assistantTip: "دستیار ارگونو می‌تونه روش‌های جلوگیری از خشکی چشم پشت مانیتور رو بهت بگه.",
      items: [
        "هر ۲۰ دقیقه، ۲۰ ثانیه به نقطه‌ای در فاصله حدود ۶ متری نگاه کنید.",
        "هنگام کار با صفحه‌نمایش، مرتب پلک بزنید تا خشکی چشم کمتر شود.",
        "اندازه نوشته‌ها را طوری تنظیم کنید که چشمانتان تحت فشار نباشد."
      ]
    },
    {
      id: "work-relief",
      title: "فضای کافی زیر میز برای پاها",
      icon: <Footprints className="w-6 h-6 text-[#0f4c5c]" />,
      image: "/images/assessment/work-relief-stretches.png",
      encouragementMessage: "خیلی خوبه! با خلوت کردن زیر میز، پاهایت آزادانه حرکت می‌کنند.",
      motivationalMessage: "وسایل اضافه زیر میز رو بردار تا پاهات جا برای دراز شدن داشته باشن.",
      assistantTip: "برای انتخاب زیرپایی ارگونومیک مناسب، از دستیار ارگونو سوال کن.",
      items: [
        "آیا فضای کافی زیر میز برای دراز کردن یا حرکت دادن پاهایتان دارید؟",
        "زیر میز کار نباید به عنوان انبار وسایل یا جعبه‌ها استفاده شود.",
        "حداقل عمق ۴۵ تا ۶۰ سانتی‌متر برای حرکت آزاد زانو و پا فراهم کنید.",
        "در صورت آویزان ماندن پاها، از زیرپایی ارگونومیک استفاده کنید."
      ]
    },
    {
      id: "laptop",
      title: "کار با لپ‌تاپ",
      icon: <Laptop className="w-6 h-6 text-[#0f4c5c]" />,
      image: "/images/assessment/laptop-ergonomics-setup.png",
      incorrectImage: "/images/assessment/ergonomic-warning-signs.png",
      encouragementMessage: "کارت حرف نداره! با بالا آوردن لپ‌تاپ، گردنت دیگر قوز نمی‌کنه.",
      motivationalMessage: "لپ‌تاپ رو روی چند تا کتاب بگذار تا مجبور نباشی گردنت رو خم کنی.",
      assistantTip: "طریقه ست کردن کیبورد و پایه لپ‌تاپ رو از دستیار ارگونو بپرس.",
      items: [
        "برای کار طولانی، صفحه لپ‌تاپ را بالاتر و روبه‌روی چشم قرار دهید.",
        "اگر لپ‌تاپ را بالا می‌برید، از کیبورد و ماوس جداگانه استفاده کنید.",
        "لپ‌تاپ را طوری قرار ندهید که گردن مجبور به خم‌شدن باشد."
      ]
    },
    {
      id: "lighting",
      title: "نور و محیط کار",
      icon: <Sun className="w-6 h-6 text-[#0f4c5c]" />,
      image: "/images/assessment/lighting-environment-correct.png",
      encouragementMessage: "درود! تنظیم درست نور مانع بازتاب چشم‌نواز و سردرد می‌شه.",
      motivationalMessage: "زاویه مانیتور رو طوری بچرخون که نور پنجره یا چراغ روی صفحه نیفته.",
      assistantTip: "چگونگی تنظیم نور محیط کار برای کاهش خستگی چشم رو از ارگونو بپرس.",
      items: [
        "بهتر است مانیتور را موازی با پنجره قرار دهید.",
        "نور محیط باید کافی باشد، اما خیرگی و بازتاب مستقیم ایجاد نکند.",
        "اگر نور روی صفحه می‌افتد، محل مانیتور یا منبع نور را تغییر دهید."
      ]
    },
    {
      id: "desk-layout",
      title: "چیدمان میز و اسناد",
      icon: <FileText className="w-6 h-6 text-[#0f4c5c]" />,
      image: "/images/assessment/documents-holder-side-correct.png",
      incorrectImage: "/images/assessment/documents-holder-side-incorrect.png",
      encouragementMessage: "عالی چیدی! وسایل پرکاربرد در دسترست هستن و چرخش گردن کم شده.",
      motivationalMessage: "وسایل پرکاربردت رو نزدیک‌تر بگذار تا مدام مجبور به چرخش نشی.",
      assistantTip: "بهترین چیدمان ارگونومیک وسایل روی میز رو از دستیار ارگونو بخواه.",
      items: [
        "وسایلی که بیشتر استفاده می‌کنید را نزدیک و در دسترس بگذارید.",
        "اسناد را در ارتفاعی نزدیک به صفحه‌نمایش قرار دهید.",
        "برای کار طولانی با اسناد، از پایه نگهدارنده سند استفاده کنید."
      ]
    },
    {
      id: "micro-breaks",
      title: "حرکات کوتاه",
      icon: <Heart className="w-6 h-6 text-[#0f4c5c]" />,
      image: "/images/assessment/micro-break-movement.png",
      encouragementMessage: "ایول! همین کشش‌های چندثانیه‌ای، خستگی چندساعته رو درمی‌آره.",
      motivationalMessage: "همین حالا دستات رو بالای سر ببر و یک کشش ساده ۱۰ ثانیه‌ای بده.",
      assistantTip: "روتین تمرینات کششی ۲ دقیقه‌ای پشت میز رو از دستیار ارگونو بگیر.",
      items: [
        "در وقفه‌های کوتاه، گردن، شانه‌ها، دست‌ها و پاها را حرکت دهید.",
        "چند حرکت کششی ساده را آرام و بدون ایجاد درد انجام دهید.",
        "هدف، ورزش سنگین نیست؛ کمی حرکت در طول روز هم بسیار مؤثر است."
      ]
    },
    {
      id: "telephone",
      title: "تلفن و هدست",
      icon: <FileText className="w-6 h-6 text-[#0f4c5c]" />,
      image: "/images/assessment/telephone-handset-correct.png",
      incorrectImage: "/images/assessment/telephone-posture-incorrect.png",
      encouragementMessage: "آفرین! با کج نکردن گردن موقع مکالمه، از گرفتگی عضلات جلوگیری کردی.",
      motivationalMessage: "گوشی تلفن رو بین گردن و شونه کج نکن؛ با دست بگیریدش یا هندزفری بزن.",
      assistantTip: "اگر مکالمات تلفنی طولانی داری، راهکارهای دستیار ارگونو رو ببین.",
      items: [
        "گوشی را بین سر و شانه قرار ندهید؛ این کار به گردن شما آسیب می‌زند.",
        "گوشی تلفن را با دست نگه داشته و بعد از چند دقیقه جای دست‌ها را عوض کنید.",
        "در صورت طولانی شدن تماس از هدست استفاده کنید."
      ]
    },
    {
      id: "posture-change",
      title: "تغییر وضعیت بدن",
      icon: <RefreshCw className="w-6 h-6 text-[#0f4c5c]" />,
      image: "/images/assessment/ergonomic-posture-overview.png",
      encouragementMessage: "دقیقاً! بهترین پوزیشن بدن، تغییر دادن مداوم حالت نشستنه.",
      motivationalMessage: "یک لحظه از جات بلند شو، چند قدم راه برو و دوباره بنشین.",
      assistantTip: "زمان‌بندی استاندارد نشستن و ایستادن رو از دستیار ارگونو بپرس.",
      items: [
        "حتی در یک وضعیت مناسب، ساعت‌ها ثابت نمانید.",
        "هر چند وقت یک‌بار وضعیت نشستن، ایستادن یا محل فعالیت خود را تغییر دهید.",
        "میز و صندلی قابل تنظیم را با توجه به بدن و نوع کار خودتان تنظیم کنید."
      ]
    },
    {
      id: "warning-signs",
      title: "علائم هشدار",
      icon: <AlertTriangle className="w-6 h-6 text-[#0f4c5c]" />,
      image: "/images/assessment/ergonomic-warning-signs.png",
      encouragementMessage: "تبریک بابت هوشیاری بدنت! توجه به‌موقع به درد، بهترین پیشگیریه.",
      motivationalMessage: "اگر گردن یا مچت درد می‌کنه، نادیده‌اش نگیر؛ ۵ دقیقه به خودت استراحت بده.",
      assistantTip: "علائم گرفتگی عضلاتت رو به دستیار ارگونو بگو تا تحلیلش کنه.",
      items: [
        "درد مداوم در گردن، شانه، کمر، مچ یا دست‌ها را نادیده نگیرید.",
        "بی‌حسی، گزگز یا ضعف دست‌ها نیاز به توجه و استراحت دارد.",
        "اگر علائم ادامه‌دار یا شدید شدند، برای ارزیابی تخصصی اقدام کنید."
      ]
    }
  ];

  const handleSelectAnswer = (principleId: string, status: ResponseStatus) => {
    const newEntry = { [principleId]: { status, ts: Date.now() } };
    setStoredAnswers((prev) => {
      const updated = { ...prev, ...newEntry };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    // پخش صدای مخصوص همان دکمه
    playFeedbackAudio(status);
    setActiveFeedback(status as FeedbackType);
  };

  const currentIndex = selectedPrinciple
    ? ergonomicsPrinciples.findIndex((item) => item.id === selectedPrinciple.id)
    : -1;

  const hasNextPrinciple = currentIndex >= 0 && currentIndex < ergonomicsPrinciples.length - 1;

  const handleGoToNextPrinciple = () => {
    if (hasNextPrinciple) {
      setSelectedPrinciple(ergonomicsPrinciples[currentIndex + 1]);
    } else {
      setSelectedPrinciple(null);
    }
  };

  const userAnswers: Record<string, ResponseStatus> = Object.fromEntries(
    Object.entries(storedAnswers).map(([k, v]) => [k, v.status])
  );

  return (
    <div className="min-h-screen bg-[#eaf4f4] font-[Vazirmatn] text-[#1e293b]" dir="rtl">

      <section id="principles" className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f4c5c] mb-4">
            اصول ارگونومی محیط کار
          </h2>
          <p className="text-lg text-slate-600">
            روی هر اصل کلیک کنید تا تصویر و توضیحات آن را ببینید و وضعیت میز کار خود را ارزیابی کنید.
          </p>
        </div>

        {/* گرید ۲ ستونه */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ergonomicsPrinciples.map((principle) => (
            <div
              key={principle.id}
              onClick={() => setSelectedPrinciple(principle)}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 cursor-pointer group flex items-center gap-5"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-[#eaf4f4] border border-slate-100">
                <Image
                  src={principle.image}
                  alt={principle.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="120px"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#eaf4f4] group-hover:bg-[#d8e2dc] transition-colors rounded-lg">
                      {principle.icon}
                    </div>
                    <h3 className="text-lg font-bold text-[#0f4c5c]">{principle.title}</h3>
                  </div>

                  {userAnswers[principle.id] === "yes" && (
                    <span className="text-xs bg-[#17b890]/20 text-[#0f4c5c] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-[#17b890]" /> انجام شد
                    </span>
                  )}
                  {userAnswers[principle.id] === "unsure" && (
                    <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> بررسی
                    </span>
                  )}
                  {userAnswers[principle.id] === "no" && (
                    <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <X className="w-3.5 h-3.5 text-rose-600" /> انجام نشده
                    </span>
                  )}
                </div>

                <ul className="space-y-1.5">
                  {principle.items.slice(0, 2).map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2 text-slate-700 text-sm leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#17b890] mt-2 shrink-0"></span>
                      <span className="line-clamp-1">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex items-center justify-between text-xs text-[#0f4c5c] font-semibold opacity-70 group-hover:opacity-100 transition-opacity">
                  <span>مشاهده کامل و ارزیابی</span>
                  <span>←</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* مودال */}
      {selectedPrinciple && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md"
          onClick={() => setSelectedPrinciple(null)}
        >
          <div
            className="bg-white w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60 relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPrinciple(null)}
              className="absolute top-6 left-6 p-2 rounded-full bg-[#eaf4f4] hover:bg-[#d8e2dc] text-[#0f4c5c] transition-colors z-10"
              title="بستن"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[#eaf4f4] rounded-2xl">{selectedPrinciple.icon}</div>
              <h3 className="text-2xl font-black text-[#0f4c5c]">{selectedPrinciple.title}</h3>
            </div>

            {/* تصاویر مقایسه‌ای یا تک‌تصویر */}
            {selectedPrinciple.incorrectImage ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                <div className="bg-[#f8fafc] rounded-2xl border border-emerald-200/80 p-3 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      ✓ وضعیت درست
                    </span>
                  </div>
                  <div className="w-full h-56 sm:h-64 relative">
                    <Image
                      src={selectedPrinciple.image}
                      alt={`${selectedPrinciple.title} - درست`}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 640px) 100vw, 380px"
                      priority
                    />
                  </div>
                </div>

                <div className="bg-rose-50/40 rounded-2xl border border-rose-200/80 p-3 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      ✕ وضعیت نادرست / پرخطر
                    </span>
                  </div>
                  <div className="w-full h-56 sm:h-64 relative">
                    <Image
                      src={selectedPrinciple.incorrectImage}
                      alt={`${selectedPrinciple.title} - نادرست`}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 640px) 100vw, 380px"
                      priority
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="my-4 w-full h-72 sm:h-80 bg-[#f8fafc] rounded-2xl overflow-hidden relative border border-slate-100 flex items-center justify-center">
                <Image
                  src={selectedPrinciple.image}
                  alt={selectedPrinciple.title}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 760px"
                  priority
                />
              </div>
            )}

            <ul className="space-y-3 my-2">
              {selectedPrinciple.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-3 text-slate-800 font-semibold text-sm sm:text-base leading-relaxed bg-[#f8fafc] p-3 rounded-xl border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-[#17b890] mt-2 shrink-0"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* بخش پاسخ‌ها */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-sm font-bold text-center text-[#0f4c5c] mb-4">
                وضعیت این اصل در میز کار شما چگونه است؟
              </p>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectAnswer(selectedPrinciple.id, "yes")}
                  className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    userAnswers[selectedPrinciple.id] === "yes"
                      ? "bg-[#17b890] text-white shadow-lg shadow-[#17b890]/30 scale-[1.02]"
                      : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>انجام دادم</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectAnswer(selectedPrinciple.id, "unsure")}
                  className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    userAnswers[selectedPrinciple.id] === "unsure"
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-[1.02]"
                      : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>مطمئن نیستم</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectAnswer(selectedPrinciple.id, "no")}
                  className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    userAnswers[selectedPrinciple.id] === "no"
                      ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-[1.02]"
                      : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
                  }`}
                >
                  <X className="w-4 h-4" />
                  <span>انجام ندادم</span>
                </button>
              </div>

              {/* حالت تشویق: «انجام دادم» */}
              {activeFeedback === "yes" && (
                <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-[#eaf4f4] to-emerald-50 border border-[#17b890]/40 text-center animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-center gap-2 text-[#0f4c5c] font-black text-base sm:text-lg mb-1">
                    <Sparkles className="w-5 h-5 text-[#17b890] shrink-0" />
                    <span>{selectedPrinciple.encouragementMessage}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-4">
                    ثبت شد! آماده‌ای وضعیت اصل بعدی را هم چک کنی؟
                  </p>

                  <button
                    type="button"
                    onClick={handleGoToNextPrinciple}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0f4c5c] hover:bg-[#0b3844] text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 text-sm"
                  >
                    <span>{hasNextPrinciple ? "رفتن به اصل بعدی" : "پایان اصول و بستن"}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* حالت انگیزشی: «انجام ندادم» */}
              {activeFeedback === "no" && (
                <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-[#eaf4f4] to-rose-50 border border-rose-200/60 text-center animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-center gap-2 text-[#0f4c5c] font-black text-base sm:text-lg mb-1">
                    <RotateCcw className="w-5 h-5 text-rose-500 shrink-0" />
                    <span>{selectedPrinciple.motivationalMessage}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-4">
                    ثبت شد. هروقت اصلاحش کردی می‌تونی بیای و تغییرش بدی!
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedPrinciple(null)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-bold transition-colors"
                    >
                      الان اصلاح می‌کنم و می‌بندم
                    </button>
                    <button
                      type="button"
                      onClick={handleGoToNextPrinciple}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0f4c5c] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-opacity-90 shadow-md transition-all"
                    >
                      <span>{hasNextPrinciple ? "رفتن به اصل بعدی" : "پایان اصول و بستن"}</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* حالت راهنمایی: «مطمئن نیستم» */}
              {activeFeedback === "unsure" && (
                <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-[#eaf4f4] to-amber-50 border border-amber-200/60 text-center animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-center gap-2 text-[#0f4c5c] font-black text-base sm:text-lg mb-1">
                    <Bot className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>{selectedPrinciple.assistantTip}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-4">
                    می‌تونی جزئیات محیط کارت رو با دستیار هوشمند ارگونو چک کنی.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedPrinciple(null)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-bold transition-colors"
                    >
                      بستن
                    </button>
                    <button
                      type="button"
                      onClick={handleGoToNextPrinciple}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0f4c5c] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-opacity-90 shadow-md transition-all"
                    >
                      <span>{hasNextPrinciple ? "رفتن به اصل بعدی" : "پایان اصول"}</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
