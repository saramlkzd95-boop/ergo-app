"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, BellOff, Send, X, Volume2 } from "lucide-react";

const notificationMessages = [
  { title: "زمان استراحت! 🧘‍♂️", body: "بدنت رو بکش و چند نفس عمیق بکش." },
  { title: "حواست به گردنت هست؟ 👀", body: "مانیتور رو هم‌سطح چشم تنظیم کن." },
  { title: "قانون ۲۰-۲۰-۲۰ 👁️", body: "برای ۲۰ ثانیه به فاصله دور از میز کارت نگاه کن." },
  { title: "وضعیت نشستن 🪑", body: "صاف بنشین! ستون فقراتت ازت ممنون میشه." },
  { title: "شانه‌ها 💪", body: "شانه‌هات رو رها کن. داری قوز می‌کنی؟" },
  { title: "آب‌رسانی 💧", body: "یه لیوان آب بخور و چند قدم از جات بلند شو." },
  { title: "مچ دست 🖐️", body: "مچ دستت رو در وضعیت خنثی و بدون زاویه نگه دار." },
];

const fixedNotifications = [
  { time: "10:00", title: "زمان انجام تمرینات اصلاحی 🧘‍♂️", body: "چند دقیقه برای تمرینات کششی وقت بگذار و بدنت رو رفرش کن." },
  { time: "12:00", title: "یادآوری تکمیل چک‌لیست روزانه 📋", body: "چک‌لیست روزانه ارگونو را تکمیل کن تا وضعیت امروز ثبت شود." },
];

const STORAGE_KEY = "ergono_reminder_settings";

export default function NotificationManager() {
  const [enabled, setEnabled] = useState(false);
  const [intervalTime, setIntervalTime] = useState(5);
  const [isLoaded, setIsLoaded] = useState(false);
  const [modal, setModal] = useState<{ title: string; body: string } | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timeoutIdsRef = useRef<number[]>([]);

  // 🔊 پخش صدای زنگ (بدون فایل صوتی - Web Audio API)
  const playAlertSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      // سه بوق پشت‌سرهم برای جلب توجه
      [0, 0.3, 0.6].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime + delay);
        osc.frequency.setValueAtTime(660, ctx.currentTime + delay + 0.12);
        gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.25);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.25);
      });
    } catch (e) {
      console.error("خطا در پخش صدا:", e);
    }
  };

  // نمایش هم‌زمان: مودال وسط صفحه + صدای زنگ + نوتیفیکیشن سیستم
  const showAlert = (title: string, body: string) => {
    setModal({ title, body });
    playAlertSound();
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, { body, tag: "ergono-alert" }); // tag جلوگیری از تکرار
      } catch {}
    }
  };

  // ۱. خواندن تنظیمات ذخیره‌شده
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const hasPermission = typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted";
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.enabled && hasPermission) setEnabled(true);
        if (parsed.intervalTime) setIntervalTime(Number(parsed.intervalTime));
      }
    } catch (e) {
      console.error("خطا در خواندن LocalStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updateSettings = (nextEnabled: boolean, nextInterval: number) => {
    setEnabled(nextEnabled);
    setIntervalTime(nextInterval);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: nextEnabled, intervalTime: nextInterval }));
    } catch (e) {
      console.error("خطا در ذخیره:", e);
    }
  };

  // سوئیچ فعال/غیرفعال
  const handleToggle = async () => {
    if (!("Notification" in window)) {
      alert("مرورگر شما از سیستم اعلان‌ها پشتیبانی نمی‌کند.");
      return;
    }

    if (!enabled) {
      let perm = Notification.permission;
      if (perm !== "granted") perm = await Notification.requestPermission();
      if (perm === "granted") {
        updateSettings(true, intervalTime);
        showAlert("یادآور ارگونو فعال شد ✅", `اعلان‌ها هر ${intervalTime} دقیقه یک‌بار ارسال می‌شوند.`);
      } else {
        alert("لطفاً در نوار آدرس مرورگر، اجازه Notification را فعال کنید.");
      }
    } else {
      updateSettings(false, intervalTime);
    }
  };

  const handleTestNow = () => {
    const msg = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];
    showAlert(msg.title, msg.body);
  };

  const handleIntervalChange = (val: number) => {
    updateSettings(enabled, Math.max(1, Math.min(240, val || 1)));
  };

  // ۲. تایمرها
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    // الف) دوره‌ای تصادفی
    const intervalId = window.setInterval(() => {
      const msg = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];
      showAlert(msg.title, msg.body);
    }, intervalTime * 60 * 1000);

    // ب) اعلان‌های ثابت روزانه
    const getNextNotificationTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const t = new Date();
      t.setHours(hours, minutes, 0, 0);
      if (t.getTime() <= Date.now()) t.setDate(t.getDate() + 1);
      return t;
    };

    timeoutIdsRef.current = [];
    const scheduleFixed = (n: (typeof fixedNotifications)[number]) => {
      const delay = getNextNotificationTime(n.time).getTime() - Date.now();
      const id = window.setTimeout(() => {
        showAlert(n.title, n.body);
        scheduleFixed(n);
      }, delay);
      timeoutIdsRef.current.push(id);
    };
    fixedNotifications.forEach(scheduleFixed);

    return () => {
      window.clearInterval(intervalId);
      timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutIdsRef.current = [];
    };
  }, [enabled, intervalTime]);

  if (!isLoaded) return null;

  return (
    <>
      {/* 🔔 مودال اعلان وسط صفحه */}
      {modal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center relative border-2 border-[#d8f3dc]">
            <button
              onClick={() => setModal(null)}
              className="absolute top-3 left-3 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="بستن"
            >
              <X size={18} />
            </button>

            <div className="w-16 h-16 mx-auto bg-[#d8f3dc] rounded-2xl flex items-center justify-center text-[#1b4332] mb-4">
              <Volume2 size={32} className="animate-bounce" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 mb-2">{modal.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">{modal.body}</p>

            <button
              onClick={() => setModal(null)}
              className="w-full bg-[#1b4332] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#2d6a4f] transition-colors"
            >
              متوجه شدم، ممنون!
            </button>
          </div>
        </div>
      )}

      {/* کارت تنظیمات */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl transition-colors ${enabled ? "bg-[#d8f3dc] text-[#1b4332]" : "bg-slate-100 text-slate-400"}`}>
            {enabled ? <Bell size={22} className="animate-pulse" /> : <BellOff size={22} />}
          </div>
          <div>
            <h4 className="text-sm md:text-base font-bold text-slate-900">یادآور هوشمند ارگونومی</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {enabled
                ? `فعال: اعلان وسط صفحه با صدا، هر ${intervalTime} دقیقه + یادآوری روزانه (۱۰:۰۰ و ۱۲:۰۰)`
                : "برای دریافت نکات سلامتی، اعلان‌ها را فعال کنید"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end flex-wrap">
          {enabled && (
            <>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs text-slate-700">
                <span>هر</span>
                <input
                  type="number"
                  min={1}
                  max={240}
                  value={intervalTime}
                  onChange={(e) => handleIntervalChange(Number(e.target.value))}
                  className="w-12 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-center font-bold focus:outline-none focus:ring-1 focus:ring-[#1b4332]"
                />
                <span>دقیقه</span>
              </div>
              <button
                onClick={handleTestNow}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
              >
                <Send size={14} />
                <span>تست فوری</span>
              </button>
            </>
          )}
          <button
            onClick={handleToggle}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              enabled
                ? "bg-[#d8f3dc] text-[#1b4332] border border-emerald-300 hover:bg-[#c4ebd0]"
                : "bg-[#1b4332] text-white hover:bg-[#2d6a4f]"
            }`}
          >
            {enabled ? "فعال است ✅ (خاموش کردن)" : "فعال‌سازی اعلان‌ها"}
          </button>
        </div>
      </div>
    </>
  );
}
