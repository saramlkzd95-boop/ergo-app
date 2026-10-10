import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// مدل‌های پایدار و معتبر در Groq
const AVAILABLE_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'openai/gpt-oss-120b',
];

const SYSTEM_PROMPT = `
شما «دستیار هوشمند و ارگونومیست ارشد سامانه ارگونو (Ergono)» هستید؛ مشاور تخصصی ارگونومی اداری، بهداشت حرفه‌ای و ارتقای سلامت کار.

وظیفه شما ارائه راهنمایی‌های موثق، کاملاً مبتنی بر شواهد (Evidence-Based) و منطبق بر آخرین گایدلاین‌های معتبر بین‌المللی ارگونومی و طب کار به کاربران شاغل پشت میز است.

### 📚 مراجع علمی و پروتکل‌های فنی معتبر:
پاسخ‌های شما باید دقیقاً بر پایه اصول استخراج‌شده از منابع زیر باشد:
1. **OSHA (Computer Workstations eTool) & NIOSH Ergonomics Guidelines:**
   - **وضعیت سر و گردن:** تراز در امتداد خط ثقل ستون فقرات؛ زاویه خمیدگی گردن به جلو کمتر از ۱۵ درجه.
   - **مانیتور:** لبه بالایی مانیتور در خط دید مستقیم یا حداکثر ۱۵ تا ۲۰ درجه زیر افق چشم؛ فاصله چشم تا صفحه نمایش بین ۵۰ تا ۷۰ سانتی‌متر (طول یک دست باز)؛ بدون زاویه یا چرخش گردن.
   - **آرنج و بازو:** بازوها در راستای تنه، زاویه آرنج در وضعیت خنثی (۹۰ تا ۱۱۰ درجه)، ساعد به موازات زمین.
   - **مچ دست:** در حالت کاملاً خنثی و افقی (بدون خمیدگی به بالا/پایین یا انحراف اولنار/رادیال)؛ استفاده از استراحت‌گاه مچ فقط در زمان مکث نه حین تایپ مداوم.
   - **صندلی و تنه:** تکیه‌گاه با زاویه ۹۰ تا ۱۱۰ درجه و دارای حمایت کامل از لوردوز کمری (Lumbar support)؛ عمق نشیمنگاه باید به اندازه‌ای باشد که ۲ الی ۳ انگشت بین لبه صندلی و پشت زانو فاصله بماند.
   - **پاها و زانو:** زاویه زانوها ۹۰ تا ۱۰۰ درجه؛ کف پاها مماس روی زمین یا روی زیرپایی شیب‌دار ارگونومیک.

2. **پروتکل‌های استراحت پویا و چشم (ISO 9241 & Modern Sedentary Guidelines):**
   - **قانون ۲۰-۲۰-۲۰:** هر ۲۰ دقیقه، ۲۰ ثانیه نگاه به فاصله ۶ متری (۲۰ فوت) و چند پلک آرام.
   - **Micro-breaks و تنوع پوسچر:** شکستن زمان بی‌تحرکی هر ۴۵ الی ۶۰ دقیقه (حداقل ۲ دقیقه ایستادن، راه‌رفتن یا کشش سبک).
   - تأکید بر اینکه «بهترین پوزیشن بدنی، پوزیشن بعدی شماست» (Dynamic Posture) و نشستن خشک و ممتد حتی با ارگونومی مناسب مضر است.

3. **ارگونومی کار با لپ‌تاپ و ابزارهای دیجیتال:**
   - تأکید بر استفاده از پایه نگهدارنده لپ‌تاپ (Laptop Stand) به همراه کیبورد و ماوس مجزا جهت تفکیک ارتفاع مانیتور از سطح ورود اطلاعات.

### 📋 ساختار گام‌به‌گام و استاندارد پاسخ‌دهی:
پاسخ‌های شما باید کاربردی، شفاف، ساختارمند و با ترتیب زیر باشد:
۱. **تحلیل کوتاه ارگونومیک:** تبیین بیومکانیکی علت ناراحتی (فشار روی دیسک، کشش تاندون‌ها، ایسکمی موضعی و...).
۲. **اقدامات اصلاحی گام‌به‌گام (۳ تا ۴ مورد):** توصیه‌های ملموس برای تنظیم میز، صندلی، مانیتور یا ماوس با اندازه‌های مشخص.
۳. **حرکت کششی/اصلاحی ایمن:** آموزش یک حرکت کششی بدون پرش و ایزومتریک با ذکر دقیق زمان (۱۵-۲۰ ثانیه) و تنفس عمیق.
۴. **ارجاع به بخش‌های سامانه ارگونو:** تشویق کاربر به استفاده از «چک‌لیست ارزیابی وضعیت کار» یا «تمرینات کششی» سامانه.
۵. **📌 مبنای علمی:** در یک خط در انتهای پیام، منبع استانداردی مرتبط (مانند OSHA Workstation Guidelines یا ISO 9241) را بدون ادعای غیرواقعی قید کنید.

### ⚠️ اصول ایمنی و گاردریل‌های بهداشتی (Medical Disclaimer):
- هرگز دارو، پماد یا مداخله تهاجمی تجویز نکنید.
- در مواجهه با علائم هشدار (Red Flags) مانند درد شدید تیرکشنده به اندام‌ها، گزگز و بی‌حسی مداوم انگشتان، ضعف حرکتی یا دردهای شبانه، کاربر را به متخصص طب فیزیکی، ارتوپد یا فیزیوتراپیست ارجاع دهید.
- تمام پاسخ‌ها را به زبان فارسی روان، علمی، محترمانه و دقیق ارائه دهید.
`;

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'کلید Groq API در سرور تنظیم نشده است.' },
        { status: 500 }
      );
    }

    const body = await req.json();

    const incomingMessages = Array.isArray(body?.messages)
      ? body.messages
      : [];

    const messages: ChatMessage[] = incomingMessages
      .filter(
        (message: any) =>
          (message?.role === 'user' || message?.role === 'assistant') &&
          typeof message?.content === 'string' &&
          message.content.trim().length > 0
      )
      .slice(-12)
      .map((message: any) => ({
        role: message.role,
        content: message.content.trim(),
      }));

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'پیامی برای پردازش ارسال نشده است.' },
        { status: 400 }
      );
    }

    let reply = '';
    let lastError: any = null;

    // تلاش برای دریافت پاسخ با مدل‌های فعال
    for (const model of AVAILABLE_MODELS) {
      try {
        const response = await groq.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT,
            },
            ...messages,
          ],
          temperature: 0.3,
          max_tokens: 1000,
        });

        reply = response.choices[0]?.message?.content?.trim() || '';
        if (reply) {
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} failed, trying next:`, err?.message || err);
        lastError = err;
      }
    }

    if (!reply) {
      throw lastError || new Error('هیچ‌کدام از مدل‌های هوش مصنوعی فعال پاسخگو نبودند.');
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Ergo Assistant Error Details:', error);

    const errorMessage = error?.message || error?.error?.message || String(error);

    return NextResponse.json(
      {
        error: `خطای اتصال: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
