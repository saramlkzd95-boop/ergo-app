'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  Bot,
  Loader2,
  Send,
  Sparkles,
  User,
  X,
} from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const initialMessage: Message = {
  role: 'assistant',
  content:
    'سلام! من «دستیار ارگونو» هستم. درباره وضعیت نشستن، میز و صندلی، مانیتور، وقفه‌های کاری یا حرکات ساده ارگونومی سؤالتان را بپرسید. پاسخ‌ها آموزشی هستند و جایگزین ارزیابی پزشک یا متخصص ارگونومی نمی‌شوند.',
};

export default function ErgoChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedInput = input.trim();

    if (!trimmedInput || loading) {
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: trimmedInput,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        // در صورتی که سرور به جای JSON پاسخ HTML یا 404 برگرداند
        data = null;
      }

      if (!response.ok || !data?.reply) {
        const errorText =
          data?.error ||
          (response.status === 404
            ? 'مسیر سرویس در سرور یافت نشد (کد 404). لطفاً وضعیت استقرار در ورسل را بررسی کنید.'
            : `خطای سرور (${response.status})`);
        throw new Error(errorText);
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: 'assistant',
          content: data.reply,
        },
      ]);
    } catch (err: any) {
      const displayMessage =
        err?.message ||
        'در ارتباط با دستیار ارگونو مشکلی پیش آمد. لطفاً کمی بعد دوباره تلاش کنید.';

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: 'assistant',
          content: displayMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="fixed bottom-6 left-6 z-[60] font-sans"
    >
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="گفتگو با دستیار هوش مصنوعی ارگونو"
          title="دستیار هوش مصنوعی ارگونو"
          className="group relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-700/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-600/40 focus:outline-none focus:ring-4 focus:ring-emerald-300"
        >
          {/* افکت نوری هوش مصنوعی */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex h-4 w-4 rounded-full bg-teal-400 text-[9px] items-center justify-center">
              <Sparkles className="h-2.5 w-2.5 text-slate-900" />
            </span>
          </span>

          <Bot className="h-9 w-9 transition-transform duration-300 group-hover:rotate-6" />
        </button>
      )}

      {isOpen && (
        <section className="flex h-[min(580px,calc(100vh-40px))] w-[min(380px,calc(100vw-40px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <header className="flex items-center justify-between bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Bot className="h-6 w-6 text-white" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold">دستیار ارگونو</h2>
                  <span className="rounded bg-teal-300/30 px-1.5 py-0.5 text-[10px] font-semibold text-teal-100">
                    AI
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-emerald-100">
                  راهنمای علمی ارگونومی
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="بستن دستیار ارگونو"
              title="بستن"
              className="rounded-lg p-2 text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3">
            {messages.map((message, index) => {
              const isUser = message.role === 'user';

              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex items-start gap-2 ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                      isUser
                        ? 'bg-sky-600 text-white'
                        : 'bg-emerald-600 text-white shadow-sm'
                    }`}
                  >
                    {isUser ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-5 w-5" />
                    )}
                  </div>

                  <div
                    className={`max-w-[82%] whitespace-pre-wrap break-words px-3.5 py-2.5 text-sm leading-6 ${
                      isUser
                        ? 'rounded-2xl rounded-tr-sm bg-sky-600 text-white'
                        : 'rounded-2xl rounded-tl-sm border border-slate-200 bg-white text-slate-800 shadow-sm'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Bot className="h-5 w-5" />
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  <span>در حال آماده‌سازی پاسخ...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="flex gap-2 border-t border-slate-200 bg-white p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="سؤال خود را بنویسید..."
              aria-label="پیام شما برای دستیار ارگونو"
              disabled={loading}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="ارسال پیام"
              title="ارسال پیام"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
