// lib/rewards-data.ts

export type Reward = {
  id: string;
  title: string;
  description: string;
  image: string;
  requirement: string;
};

export const REWARDS: Reward[] = [
  { 
    id: 'footprint', 
    title: 'گام نخست', 
    description: 'انگیزه و شروع مسیر', 
    image: '/images/rewards/badge-footprint.png', 
    requirement: 'تکمیل ۳ روز پیاپی چک‌لیست' 
  },
  { 
    id: 'eyes', 
    title: 'نگهبان بینایی', 
    description: 'قانون ۲۰-۲۰-۲۰', 
    image: '/images/rewards/badge-eyes.png', 
    requirement: 'انجام 10 روز متوالی قانون ۲۰-۲۰-۲۰' 
  },
  { 
    id: 'stretch', 
    title: 'قهرمان کشش', 
    description: 'انجام حرکات اصلاحی', 
    image: '/images/rewards/badge-stretch.png', 
    requirement: '10 روز متوالی همه ی حرکت های اصلاحی رو انجام بده.' 
  },
  { 
    id: 'desk', 
    title: 'استاد ایستگاه کار', 
    description: 'ارزیابی محیط کار', 
    image: '/images/rewards/badge-desk.png', 
    requirement: '۷ روز متوالی همه ی اصول ارگونومی رو انجام بده.' 
  },
  { 
    id: 'streak', 
    title: 'نشان آتش', 
    description: 'استمرار بی‌وقفه', 
    image: '/images/rewards/badge-streak.png', 
    requirement: '۱۴ روز فعالیت پیاپی چک لیست رو کامل کن.' 
  },
  { 
    id: 'trophy', 
    title: 'کاپ قهرمان', 
    description: 'تسلط کامل', 
    image: '/images/rewards/badge-trophy.png', 
    requirement: '۲۱ روز چک لیست رو کامل کن و تمرینات اصلاحی رو انجام بده. ' 
  },
];
