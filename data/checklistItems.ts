export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: "posture" | "breaks" | "setup";
}

export const dailyChecklistQuestions: ChecklistItem[] = [
  {
    id: "rule_20_20_20",
    title: "رعایت قانون ۲۰-۲۰-۲۰",
    description: "آیا در طول روز هر ۲۰ دقیقه، استراحت کوتاه ۲۰ ثانیه‌ای به چشمان خود دادید؟",
    category: "breaks",
  },
  {
    id: "micro_stretches",
    title: "انجام حرکات کششی اداری",
    description: "آیا تمرینات ساده کشش گردن و شانه‌ها (حرکات آموزش‌داده‌شده) را حداقل ۲ بار انجام دادید؟",
    category: "breaks",
  },
  {
    id: "back_support",
    title: "پشتیبانی کامل گودی کمر",
    description: "آیا صندلی خود را طوری تنظیم کردید که گودی کمر کاملاً توسط تکیه‌گاه حمایت شود؟",
    category: "setup",
  },
  {
    id: "monitor_distance",
    title: "تنظیم فاصله و زاویه مانیتور",
    description: "آیا صفحه نمایش در فاصله حدود ۵۰ تا ۷۰ سانتی‌متری و هم‌سطح خط دید قرار داشت؟",
    category: "setup",
  },
  {
    id: "feet_flat",
    title: "قرارگیری صحیح پاها",
    description: "آیا کف پاها بدون انداختن پا روی پا، روی زمین یا زیرپایی قرار داشت؟",
    category: "posture",
  },
];
