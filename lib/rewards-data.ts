// lib/rewards-data.ts

export type HealthLevel = {
  id: string;
  levelNumber: number;
  title: string;
  subtitle: string;
  image: string;
  requirement: string;         // شرط باز شدن سطح
  motivationalMessage: string; // پیام انگیزشی هنگام هاور
};

export type Reward = {
  id: string;
  title: string;
  description: string;
  image: string;
  requirement: string;         // شرط دریافت مدال
  motivationalMessage: string; // پیام انگیزشی هنگام هاور
};

/* =========================================
   سطوح سلامت (Health Levels)
========================================= */
export const HEALTH_LEVELS: HealthLevel[] = [
  {
    id: 'sprout',
    levelNumber: 1,
    title: 'نوپا در ارگونومی',
    subtitle: 'آغاز مسیر سلامت جسمانی',
    image: '/images/rewards/level-1-sprout.png',
    requirement: 'ورود به برنامه و ثبت اولین چک‌لیست',
    motivationalMessage: '🌱 اولین قدم همیشه مهم‌ترینه! با ثبت چک‌لیست امروز، بذر تندرستیت رو تنومند کن.'
  },
  {
    id: 'shield',
    levelNumber: 2,
    title: 'نگهبان راست قامتی',
    subtitle: 'حفاظت مداوم از ارگونومی فردی',
    image: '/images/rewards/level-2-shield.png',
    requirement: 'کسب حداقل ۲ نشان پاداش و ثبت ۷ روز چک‌لیست',
    motivationalMessage: '🛡️ فاصله‌ای با سپر ایمنی بدنت نداری! استمرار داشته باش تا بدنت در برابر دردها بیمه بشه.'
  },
  {
    id: 'spine',
    levelNumber: 3,
    title: 'ستون استوار',
    subtitle: 'تثبیت عادت‌های نشستن صحیح',
    image: '/images/rewards/level-3-spine.png',
    requirement: 'کسب حداقل ۴ نشان پاداش و ثبت ۱۴ روز مداوم',
    motivationalMessage: '🧘‍♂️ ستون فقراتت تکیه‌گاه توئه! با چند روز تمرین بیشتر، به آرامش و ثبات واقعی برس.'
  },
  {
    id: 'crown',
    levelNumber: 4,
    title: 'استاد ارگونومی',
    subtitle: 'تسلط کامل و الهام‌بخش دیگران',
    image: '/images/rewards/level-4-crown.png',
    requirement: 'کسب تمام ۶ نشان پاداش و ثبت ۲۱ روز فعالیت',
    motivationalMessage: '👑 تاج قهرمانی منتظرته! فقط یک گام تا تبدیل شدن به الگوی تندرستی و سلامت فاصله داری.'
  }
];

/* =========================================
   نشان‌های پاداش (Reward Badges)
========================================= */
export const REWARDS: Reward[] = [
  { 
    id: 'footprint', 
    title: 'گام نخست', 
    description: 'انگیزه و شروع مسیر', 
    image: '/images/rewards/badge-footprint.png', 
    requirement: 'تکمیل ۳ روز پیاپی چک‌لیست',
    motivationalMessage: '👣 فقط ۳ روز تا ثبت اولین پیروزیت مونده؛ همین امروز ادامه‌ش بده!'
  },
  { 
    id: 'eyes', 
    title: 'نگهبان بینایی', 
    description: 'قانون ۲۰-۲۰-۲۰', 
    image: '/images/rewards/badge-eyes.png', 
    requirement: 'انجام ۱۰ روز متوالی قانون ۲۰-۲۰-۲۰',
    motivationalMessage: '👀 چشم‌هات باارزش‌ترین دارایی توان؛ با چند ثانیه استراحت، روشنایی نگاهت رو بیمه کن!'
  },
  { 
    id: 'stretch', 
    title: 'قهرمان کشش', 
    description: 'انجام حرکات اصلاحی', 
    image: '/images/rewards/badge-stretch.png', 
    requirement: '۱۰ روز متوالی همهٔ حرکت‌های اصلاحی رو انجام بده.',
    motivationalMessage: '🤸‍♂️ عضلاتت تشنهٔ این انعطافن! خستگی کار رو با چند کشش ساده از تنت بیرون کن.'
  },
  { 
    id: 'desk', 
    title: 'استاد ایستگاه کار', 
    description: 'ارزیابی محیط کار', 
    image: '/images/rewards/badge-desk.png', 
    requirement: '۷ روز متوالی همهٔ اصول ارگونومی رو انجام بده.',
    motivationalMessage: '🪑 محیط کارت رو به بهشت بدنت تبدیل کن؛ درستی وضعیت نشستنت مساوی با آرامشه.'
  },
  { 
    id: 'streak', 
    title: 'نشان آتش', 
    description: 'استمرار بی‌وقفه', 
    image: '/images/rewards/badge-streak.png', 
    requirement: '۱۴ روز فعالیت پیاپی چک‌لیست رو کامل کن.',
    motivationalMessage: '🔥 شعلهٔ انگیزه‌ت رو روشن نگه دار! زنجیره رو قطع نکن و رکوردت رو جاودانه کن.'
  },
  { 
    id: 'trophy', 
    title: 'کاپ قهرمان', 
    description: 'تسلط کامل', 
    image: '/images/rewards/badge-trophy.png', 
    requirement: '۲۱ روز چک‌لیست رو کامل کن و تمرینات اصلاحی رو انجام بده.',
    motivationalMessage: '🏆 اوج افتخار و سلامت همین‌جاست! تا فتح نهایی و تثبیت این عادت سالم چیزی نمونده.'
  },
];
