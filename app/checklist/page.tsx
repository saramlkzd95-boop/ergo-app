'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ChecklistItem {
  id: string;
  title: string;
  category: string;
  description: string;
}

const checklistData: ChecklistItem[] = [
  {
    id: 'workstation-1',
    category: 'شروع روز',
    title: 'تنظیم ارگونومیک ایستگاه کار در شروع روز',
    description: 'ارتفاع صندلی، فاصله و ارتفاع مانیتور، موقعیت کیبورد و ماوس را بررسی کنید.',
  },
  {
    id: 'posture-1',
    category: 'وضعیت بدن',
    title: 'تنظیم ارتفاع صندلی و زاویه زانوها',
    description: 'کف پاها باید کاملاً روی زمین باشد و زانوها زاویه ۹۰ تا ۱۰۰ درجه داشته باشند.',
  },
  {
    id: 'posture-2',
    category: 'وضعیت بدن',
    title: 'پشتیبانی کامل از گودی کمر',
    description: 'پشتی صندلی یا بالشتک ارگونومیک باید انحنای طبیعی گودی کمر را بپوشاند.',
  },
  {
    id: 'screen-1',
    category: 'مانیتور',
    title: 'تنظیم لبه بالایی مانیتور هم‌سطح چشم',
    description: 'از خم شدن گردن به جلو یا پایین خودداری کنید تا فشار به مهره‌های گردن کاهش یابد.',
  },
  {
    id: 'screen-2',
    category: 'مانیتور',
    title: 'رعایت فاصله مناسب از صفحه نمایش',
    description: 'فاصله مانیتور باید به اندازه طول یک دست کشیده (حدود ۵۰ تا ۷۰ سانتی‌متر) باشد.',
  },
  {
    id: 'break-1',
    category: 'استراحت و چشم',
    title: 'اجرای قانون ۲۰-۲۰-۲۰ برای چشم‌ها',
    description: 'هر ۲۰ دقیقه، به مدت ۲۰ ثانیه به فاصله‌ای در حدود ۶ متر (۲۰ فوت) نگاه کنید.',
  },
  {
    id: 'break-2',
    category: 'تحرک',
    title: 'حرکات کششی دست، مچ و شانه',
    description: 'حرکات کششی ساده برای رفع گرفتگی عضلات مچ و سرشانه انجام دهید.',
  },
  {
    id: 'mobility-1',
    category: 'تحرک',
    title: 'تغییر وضعیت و راه رفتن کوتاه',
    description: 'حداقل هر یک ساعت یک‌بار از جای خود بلند شوید و ۱ تا ۲ دقیقه راه بروید.',
  },
];

const weeklyData = [
  { day: 'ش', label: 'شنبه', percent: 0 },
  { day: 'ی', label: 'یکشنبه', percent: 0 },
  { day: 'د', label: 'دوشنبه', percent: 0 },
  { day: 'س', label: 'سه‌شنبه', percent: 0 },
  { day: 'چ', label: 'چهارشنبه', percent: 0 },
  { day: 'پ', label: 'پنج‌شنبه', percent: 0 },
  { day: 'ج', label: 'جمعه', percent: 0 },
];

export default function ChecklistPage() {
  const [completedItems, setCompletedItems] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(true);

  // ۱. دریافت وضعیت آیتم‌ها از Supabase
  useEffect(() => {
    async function fetchChecklistProgress() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('checklist_progress')
          .select('item_id, completed')
          .eq('user_id', 'guest_user');

        if (error) {
          console.error('خطا در دریافت اطلاعات:', error.message);
        } else if (data) {
          const initialMap: { [key: string]: boolean } = {};
          data.forEach((row) => {
            if (row.completed) {
              initialMap[row.item_id] = true;
            }
          });
          setCompletedItems(initialMap);
        }
      } catch (err) {
        console.error('خطای غیرمنتظره در سرور:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchChecklistProgress();
  }, []);

  // ۲. محاسبات پیشرفت
  const totalCount = checklistData.length;
  const completedCount = Object.keys(completedItems).length;
  const todayProgress = Math.round((completedCount / totalCount) * 100);
const persianDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const todayDayName = persianDays[(new Date().getDay() + 1) % 7];

  const currentWeeklyData = weeklyData.map((item) =>
  item.day === todayDayName ? { ...item, percent: todayProgress } : item
);

  // ۳. تغییر وضعیت تیک و سینک با Supabase
  const toggleItem = async (id: string) => {
    const isCurrentlyCompleted = !!completedItems[id];
    const newStatus = !isCurrentlyCompleted;

    setCompletedItems((prev) => {
      const updated = { ...prev };
      if (newStatus) {
        updated[id] = true;
      } else {
        delete updated[id];
      }
      return updated;
    });

    try {
      await supabase
        .from('checklist_progress')
        .upsert(
          {
            user_id: 'guest_user',
            item_id: id,
            completed: newStatus,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,item_id' }
        );
    } catch (err) {
      console.error('خطای ارتباط با دیتابیس:', err);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7FAFC] py-10 px-4 sm:px-6 lg:px-8 dir-rtl font-[family-name:var(--font-vazirmatn)]" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* ۱. کارت‌های آمار بالای صفحه */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* کارت ۱: پیشرفت امروز (آبی تیره گرادیانت) */}
          <div className="bg-gradient-to-br from-[#0B4F6C] to-[#083344] rounded-3xl p-6 text-white shadow-sm flex flex-col justify-between h-36 relative overflow-hidden">
            <div className="flex justify-end">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold tracking-tight">{todayProgress}%</span>
              <p className="text-xs text-slate-200 mt-1">پیشرفت امروز</p>
            </div>
          </div>

          {/* کارت ۲: میانگین هفته */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-36">
            <div className="flex justify-end">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#0B4F6C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-[#0F2942]">0%</span>
              <p className="text-xs text-slate-400 mt-1">میانگین هفته</p>
            </div>
          </div>

          {/* کارت ۳: رکورد پیوسته */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-36">
            <div className="flex justify-end">
              <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-[#0F2942]">0 روز</span>
              <p className="text-xs text-slate-400 mt-1">رکورد پیوسته</p>
            </div>
          </div>

        </div>

        {/* ۲. نوار پیشرفت امروز (دقیقاً مطابق عکس) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex justify-between items-center text-sm font-bold text-[#0F2942]">
            <span>پیشرفت امروز</span>
            <span className="text-slate-600 font-extrabold">{completedCount} از {totalCount}</span>
          </div>

          {/* Track و نوار پرشونده از راست به چپ */}
          <div className="w-full bg-sky-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-[#0B4F6C] h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${todayProgress}%` }}
            />
          </div>
        </div>

        {/* ۳. لیست چک‌لیست */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">در حال دریافت داده‌ها...</div>
        ) : (
          <div className="space-y-3">
            {checklistData.map((item) => {
              const isCompleted = !!completedItems[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer flex items-center justify-between select-none ${
                    isCompleted
                      ? 'bg-[#EBF7F2] border-[#72CBB0] shadow-sm'
                      : 'bg-white border-slate-100 shadow-sm hover:border-slate-300'
                  }`}
                >
                  <div className="text-right flex-1 pl-4">
                    <h3 className={`font-bold text-base ${isCompleted ? 'line-through text-[#285A48]' : 'text-[#0F2942]'}`}>
                      {item.title}
                    </h3>
                    <p className={`text-xs mt-1 ${isCompleted ? 'text-[#3E7C66]' : 'text-slate-400'}`}>
                      {item.description}
                    </p>
                  </div>

                  {/* چک‌باکس با استایل منطبق */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-[#2BB282] text-white shadow-sm'
                        : 'border-2 border-slate-200 bg-white'
                    }`}
                  >
                    {isCompleted && (
                      <svg className="w-4 h-4 stroke-current stroke-[3] fill-none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ۴. نگاهی به ۷ روز اخیر */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
          <h2 className="text-right text-lg font-bold text-[#0F2942]">نگاهی به ۷ روز اخیر</h2>
          
          <div className="flex items-end justify-between px-4 pt-6 pb-2 h-44">
            {currentWeeklyData.map((item, index) => (
              <div key={index} className="flex flex-col items-center space-y-3 h-full justify-end group">
                <div className="w-8 sm:w-10 bg-slate-100 rounded-full h-full relative overflow-hidden flex items-end">
                  <div
                    className="w-full bg-[#0B4F6C] rounded-full transition-all duration-500 ease-out"
                    style={{ height: `${item.percent}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-[#0F2942] transition-colors">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
