"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellOff } from "lucide-react";

const randomMessages = [
  "وقتشه! چند حرکت کششی انجام بده 🧘",
  "به پشتت استراحت بده! بلند شو و راه برو 🚶",
  "چشم‌هایت را از مانیتور بردار و به دوردست نگاه کن 👀",
  "یک لیوان آب بخور و هیکلت را صاف کن 💧",
  "شانه‌هایت را بالا بینداز و رها کن 💪",
];

type ReminderSettings = {
  enabled: boolean;
  intervalMinutes: number;
};

export default function SmartReminder() {
  const [enabled, setEnabled] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // بارگذاری تنظیمات ذخیره‌شده
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ergo-reminder-settings");
      if (raw) {
        const s: ReminderSettings = JSON.parse(raw);
        setEnabled(s.enabled);
        setIntervalMinutes(s.intervalMinutes || 60);
      }
    } catch {}
  }, []);

  const saveSettings = (s: ReminderSettings) => {
    localStorage.setItem("ergo-reminder-settings", JSON.stringify(s));
    setEnabled(s.enabled);
    setIntervalMinutes(s.intervalMinutes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToggle = async () => {
    const next = !enabled;
    if (next) {
      // گرفتن اجازه اعلان از مرورگر
      if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          alert("برای دریافت یادآور، اجازه اعلان را در مرورگر تایید کنید.");
          return;
        }
      }
    }
    saveSettings({ ...{ intervalMinutes }, enabled: next });
  };

  const handleIntervalChange = (val: number) => {
    const v = Math.max(1, Math.min(240, val || 60));
    saveSettings({ enabled, intervalMinutes: v });
  };

  // اجرای تایمر اعلان‌ها
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (enabled) {
      timerRef.current = setInterval(() => {
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          const msg = randomMessages[Math.floor(Math.random() * randomMessages.length)];
          new Notification("ارگونو 🪑", { body: msg });
        }
      }, intervalMinutes * 60 * 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, intervalMinutes]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-teal-50 p-2 rounded-full">
          <Bell className="text-teal-600" size={20} />
        </div>
        <div>
          <p className="font-bold text-gray-800 text-sm">یادآور هوشمند ارگونو</p>
          <p className="text-xs text-gray-500 mt-1">
            {enabled
              ? `فعال است — اعلان تصادفی هر ${intervalMinutes} دقیقه`
              : "فعال نیست — اعلان‌های یادآوری در ساعات کاری"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {enabled && (
          <label className="flex items-center gap-2 text-xs text-gray-600">
            هر
            <input
              type="number"
              min={1}
              max={240}
              value={intervalMinutes}
              onChange={(e) => handleIntervalChange(Number(e.target.value))}
              className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-center focus:ring-2 focus:ring-teal-200 focus:outline-none"
            />
            دقیقه
          </label>
        )}

        <button
          onClick={handleToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            enabled
              ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {enabled ? <Bell size={16} /> : <BellOff size={16} />}
          {enabled ? "فعال است ✅" : "غیرفعال"}
        </button>
      </div>

      {saved && (
        <span className="text-xs text-teal-600 w-full text-left">تنظیمات ذخیره شد ✓</span>
      )}
    </div>
  );
}
