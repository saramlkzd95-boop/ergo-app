"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Bell, Send, Check, X, Volume2 } from "lucide-react";

interface NotificationMsg {
  title: string;
  body: string;
}

interface FixedNotification {
  time: string;
  title: string;
  body: string;
}

const notificationMessages: NotificationMsg[] = [
  { title: "زمان استراحت! 🧘‍♂️", body: "بدنت رو بکش و چند نفس عمیق بکش." },
  { title: "حواست به گردنت هست؟ 👀", body: "مانیتور رو هم‌سطح چشم تنظیم کن." },
  { title: "قانون ۲۰-۲۰-۲۰ 👁️", body: "برای ۲۰ ثانیه به فاصله دور از میز کارت نگاه کن." },
  { title: "وضعیت نشستن 🪑", body: "صاف بنشین! ستون فقراتت ازت ممنون میشه." },
  { title: "شانه‌ها 💪", body: "شانه‌هات رو رها کن. داری قوز می‌کنی؟" },
  { title: "آب‌رسانی 💧", body: "یه لیوان آب بخور و چند قدم از جات بلند شو." },
  { title: "مچ دست 🖐️", body: "مچ دستت رو در وضعیت خنثی و بدون زاویه نگه دار." },
];

const fixedNotifications: FixedNotification[] = [
  { time: "10:00", title: "زمان انجام تمرینات اصلاحی 🧘‍♂️", body: "چند دقیقه برای تمرینات کششی وقت بگذار و بدنت رو رفرش کن." },
  { time: "12:00", title: "یادآوری تکمیل چک‌لیست روزانه 📋", body: "چک‌لیست روزانه ارگونو را تکمیل کن تا وضعیت امروز ثبت شود." },
];

const STORAGE_KEY = "ergono_reminder_settings";
const SYNC_EVENT_KEY = "ergono_sync_settings";

interface ReminderBarProps {
  variant?: "floating" | "inline";
}

export default function ReminderBar({ variant }: ReminderBarProps) {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState<boolean>(true);
  const [intervalTime, setIntervalTime] = useState<number>(1);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [modal, setModal] = useState<{ title: string; body: string } | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastPeriodicRef = useRef<number>(Date.now());
  const lastAlertedTimesRef = useRef<Record<string, string>>({});
  const isMasterTimerRef = useRef<boolean>(false);

  const isHomePage = pathname === "/";
  // تعیین حالت کامپوننت: لایوت به صورت سراسری floating را کنترل می‌کند
  const currentVariant = variant || (isHomePage ? "inline" : "floating");

  // نسخه قرارگرفته در Layout همیشه متولی تایمر مرکزی است
  isMasterTimerRef.current = currentVariant === "floating";

  const playAlertSound = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      [0, 0.25, 0.5].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime + delay);
        osc.frequency.setValueAtTime(660, ctx.currentTime + delay + 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.2);
      });
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  const showAlert = (title: string, body: string) => {
    setModal({ title, body });
    playAlertSound();
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, { body, icon: "/favicon.ico" });
      } catch (err) {
        console.error("System notification error:", err);
      }
    }
  };

  // بارگذاری تنظیمات و همگام‌سازی بلادرنگ بین تمام بخش‌ها
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.enabled === "boolean") setEnabled(parsed.enabled);
        if (parsed.intervalTime) setIntervalTime(Number(parsed.intervalTime));
      }
    } catch (e) {
      console.error("LocalStorage load error:", e);
    } finally {
      setIsLoaded(true);
    }

    const handleSync = (e: Event) => {
      let data: { enabled?: boolean; intervalTime?: number } | null = null;
      if ("detail" in e && (e as CustomEvent).detail) {
        data = (e as CustomEvent).detail;
      } else if ("key" in e && (e as StorageEvent).key === STORAGE_KEY && (e as StorageEvent).newValue) {
        try {
          data = JSON.parse((e as StorageEvent).newValue!);
        } catch {
          data = null;
        }
      }

      if (data) {
        if (typeof data.enabled === "boolean") setEnabled(data.enabled);
        if (typeof data.intervalTime === "number") setIntervalTime(data.intervalTime);
      }
    };

    window.addEventListener(SYNC_EVENT_KEY, handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener(SYNC_EVENT_KEY, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const saveAndBroadcastSettings = (newEnabled: boolean, newInterval: number) => {
    try {
      const payload = { enabled: newEnabled, intervalTime: newInterval };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent(SYNC_EVENT_KEY, { detail: payload }));
    } catch (e) {
      console.error("LocalStorage save error:", e);
    }
  };

  const handleToggle = async () => {
    if (!enabled) {
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission !== "granted") {
          const perm = await Notification.requestPermission();
          if (perm !== "granted") {
            alert("لطفاً اجازه ارسال اعلان (Notification) را در مرورگر فعال کنید.");
            return;
          }
        }
      }
      setEnabled(true);
      lastPeriodicRef.current = Date.now();
      saveAndBroadcastSettings(true, intervalTime);
    } else {
      setEnabled(false);
      saveAndBroadcastSettings(false, intervalTime);
    }
  };

  const handleIntervalChange = (value: number) => {
    const val = Math.max(1, Math.min(120, value));
    setIntervalTime(val);
    lastPeriodicRef.current = Date.now();
    saveAndBroadcastSettings(enabled, val);
  };

  // تایمر مرکزی در پس‌زمینه
  useEffect(() => {
    if (!enabled || !isMasterTimerRef.current) return;

    const heartbeat = setInterval(() => {
      const now = new Date();
      const nowTime = now.getTime();
      const todayStr = now.toDateString();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      fixedNotifications.forEach((n) => {
        const [targetH, targetM] = n.time.split(":").map(Number);
        if (currentHours === targetH && currentMinutes === targetM) {
          if (lastAlertedTimesRef.current[n.time] !== todayStr) {
            showAlert(n.title, n.body);
            lastAlertedTimesRef.current[n.time] = todayStr;
          }
        }
      });

      if (nowTime - lastPeriodicRef.current >= intervalTime * 60 * 1000) {
        const msg = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];
        showAlert(msg.title, msg.body);
        lastPeriodicRef.current = nowTime;
      }
    }, 15000);

    return () => clearInterval(heartbeat);
  }, [enabled, intervalTime]);

  if (!isLoaded) return null;

  // در صفحه اصلی نسخه عمومی لایوت را مخفی می‌کنیم تا فقط نسخه وسط صفحه اصلی دیده شود
  const shouldHide = currentVariant === "floating" && isHomePage;

  // کلاس‌های استایل: در صفحات دیگر به جای شناور بودن (fixed)، در انتهای صفحه و ثابت (static/mt-auto) قرار می‌گیرد
  const containerClasses =
    currentVariant === "floating"
      ? "w-full max-w-5xl mx-auto px-4 mt-auto pt-6 pb-8"
      : "w-full max-w-5xl mx-auto my-6 px-4";

  return (
    <>
      {!shouldHide && (
        <div className={containerClasses}>
          <div className="bg-white rounded-2xl border border-emerald-100/90 shadow-sm hover:shadow-md transition-shadow px-4 py-3 flex flex-wrap items-center justify-between gap-3 dir-rtl">
            {/* عنوان و آیکن */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm md:text-base">
                  یادآور هوشمند ارگونومی
                </h3>
                <p className="text-[11px] md:text-xs text-slate-500 mt-0.5">
                  فعال: اعلان وسط صفحه با صدا، هر {intervalTime} دقیقه + یادآوری روزانه (۱۰:۰۰ و ۱۲:۰۰)
                </p>
              </div>
            </div>

            {/* کنترلرها */}
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-lg px-2 py-1 text-xs text-slate-600">
                <span>هر</span>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={intervalTime}
                  onChange={(e) => handleIntervalChange(Number(e.target.value))}
                  className="w-10 text-center font-bold bg-white border border-slate-200 rounded py-0.5 text-slate-800 focus:outline-none focus:border-emerald-500"
                />
                <span>دقیقه</span>
              </div>

              <button
                onClick={() => {
                  const msg = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];
                  showAlert(msg.title, msg.body);
                }}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5 rotate-45" />
                تست فوری
              </button>

              <button
                onClick={handleToggle}
                type="button"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                  enabled
                    ? "bg-emerald-100/80 text-emerald-800 hover:bg-emerald-200/80"
                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                }`}
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center ${enabled ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-400"}`}>
                  {enabled && <Check className="w-3 h-3 stroke-[3]" />}
                </span>
                <span>{enabled ? "فعال است" : "غیرفعال"}</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  ({enabled ? "خاموش کردن" : "روشن کردن"})
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مدال اعلان */}
      {modal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-emerald-200 shadow-2xl max-w-sm w-full p-5 text-center relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setModal(null)}
              className="absolute top-3 left-3 p-1 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="w-14 h-14 mx-auto bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-3">
              <Volume2 size={28} className="animate-bounce" />
            </div>

            <h3 className="text-base font-extrabold text-slate-800 mb-1">{modal.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">{modal.body}</p>

            <button
              onClick={() => setModal(null)}
              className="w-full bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </>
  );
}
