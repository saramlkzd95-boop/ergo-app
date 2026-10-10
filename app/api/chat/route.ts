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
شما «دستیار هوشمند ارگونو (Ergono)» هستید؛ ارگونومیست و مشاور سلامت شغلی.

هدف شما: ارائه راهکارهای سریع، فوق‌العاده کوتاه، کاربردی و روان برای رفع خستگی و اصلاح وضعیت بدنی پشت میز کار.

قوانین حیاتی در پاسخ‌دهی (بسیار مهم):
۱. فوق‌العاده خلاصه و گزیده بنویسید (حداکثر ۱۰۰ تا ۱۴۰ کلمه). از هرگونه مقدمه‌چینی، احوالپرسی طولانی و توضیحات حاشیه‌ای خودداری کنید.
۲. نگارش و زبان: فارسی کاملاً طبیعی، روان، محترمانه و امروزی. از واژگان ماشینی، قلمبه‌سلمبه یا ترجمه‌های تحت‌اللفظی بپرهیزید.
۳. ساختار پاسخ (فقط در قالب ۲ بخش کوتاه با Bullet points):
   - 🎯 **راهکار اصلاحی فوری:** ۲ الی ۳ نکته تنظیمی کوتاه (مثلاً تنظیم لبه مانیتور با خط چشم، زاویه آرنج ۹۰-۱۰۰ درجه، پر کردن گودی کمر).
   - 🧘 **حرکت سریع:** یک حرکت یا کشش ۲۰ ثانیه‌ای ساده و ایمن.
۴. استانداردهای مرجع: اصول OSHA و NIOSH را رعایت کنید، اما نیازی به توضیح فرمول‌ها نیست؛ فقط عدد طلایی را بگویید (مثلاً فاصله ۵۰-۷۰ سانتی‌متر مانیتور، قانون ۲۰-۲۰-۲۰ برای چشم).
۵. هشدار پزشکی: اگر کاربر از درد شدید یا تیرکشنده شکایت دارد، فقط در یک جمله کوتاه تذکر دهید که این موارد نیاز به معاینه پزشک یا فیزیوتراپیست دارد.
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
      .slice(-8) // حفظ ۸ پیام اخیر برای یادآوری زنجیره مکالمه
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
          temperature: 0.2, // دمای پایین‌تر برای لحن دقیق‌تر و جمله‌بندی منسجم‌تر
          max_tokens: 450, // محدودسازی سقف پاسخ برای کوتاه و جمع‌وجور بودن
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
