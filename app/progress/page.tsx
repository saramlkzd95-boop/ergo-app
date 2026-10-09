'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

interface ChecklistRecord {
  id?: string;
  user_id?: string;
  date: string; // فرمت YYYY-MM-DD
  completed_items: number[];
  progress_percentage?: number;
  percentage?: number;
  created_at?: string;
}

interface DayChartData {
  dayName: string;
  shortLabel: string;
  percentage: number;
  dateStr: string;
}

interface HistoryItem {
  formattedDate: string;
  percentage: number;
  countStr: string;
}

export default function MyProgressPage() {
  const [loading, setLoading] = useState(true);
  const [totalTicks, setTotalTicks] = useState<number>(0);
  const [activeDaysCount, setActiveDaysCount] = useState<number>(0);
  const [averagePercentage, setAveragePercentage] = useState<number>(0);
  const [weeklyData, setWeeklyData] = useState<DayChartData[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

  // تبدیل تاریخ میلادی به شمسی
  const formatShamsiDate = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(date);
  };

  const getShamsiDayNumber = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
  };

  // فرمت استاندارد محلی YYYY-MM-DD بدون تداخل منطقه زمانی
  const formatLocalDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchProgressData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: records, error } = await supabase
        .from('checklist_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;

      const userRecords: ChecklistRecord[] = records || [];

      // ۱. محاسبات کارت‌های آماری
      let ticksSum = 0;
      let activeDays = 0;
      let totalPercentSum = 0;

      const recordMap = new Map<string, { pct: number; items: number[] }>();

      userRecords.forEach((rec) => {
        const completedCount = Array.isArray(rec.completed_items) ? rec.completed_items.length : 0;
        const pct = typeof rec.percentage === 'number' 
          ? rec.percentage 
          : (typeof rec.progress_percentage === 'number' ? rec.progress_percentage : 0);

        ticksSum += completedCount;
        if (completedCount > 0) {
          activeDays += 1;
        }
        totalPercentSum += pct;
        recordMap.set(rec.date, { pct, items: Array.isArray(rec.completed_items) ? rec.completed_items : [] });
      });

      setTotalTicks(ticksSum);
      setActiveDaysCount(activeDays);
      setAveragePercentage(
        userRecords.length > 0 ? Math.round(totalPercentSum / userRecords.length) : 0
      );

      // ۲. داده‌های ۷ روز اخیر (شنبه تا جمعه)
      const daysOfWeekNames = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
      const today = new Date();
      const currentDayOfWeek = (today.getDay() + 1) % 7; // 0 = شنبه

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - currentDayOfWeek);

      const weekChart: DayChartData[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const dateISO = formatLocalDate(d);

        const found = recordMap.get(dateISO);
        weekChart.push({
          dayName: daysOfWeekNames[i],
          shortLabel: daysOfWeekNames[i],
          percentage: found ? found.pct : 0,
          dateStr: dateISO
        });
      }
      setWeeklyData(weekChart);

      // ۳. داده‌های روند ۳۰ روز اخیر
      const monthChart: any[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateISO = formatLocalDate(d);

        const found = recordMap.get(dateISO);
        monthChart.push({
          dayNumber: getShamsiDayNumber(d),
          percentage: found ? found.pct : 0,
          dateISO: dateISO
        });
      }
      setMonthlyData(monthChart);

      // ۴. لیست تاریخچه
      const sortedDesc = [...userRecords].reverse();
      const historyFormatted: HistoryItem[] = sortedDesc.map((rec) => {
        const parts = rec.date.split('-');
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const count = Array.isArray(rec.completed_items) ? rec.completed_items.length : 0;
        const pct = typeof rec.percentage === 'number' 
          ? rec.percentage 
          : (typeof rec.progress_percentage === 'number' ? rec.progress_percentage : 0);

        return {
          formattedDate: formatShamsiDate(d),
          percentage: pct,
          countStr: `(${pct}%) ${count}/8`
        };
      });
      setHistoryList(historyFormatted);

    } catch (err) {
      console.error('خطا در بارگذاری اطلاعات پیشرفت:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgressData(true);

    // ۱. به‌روزرسانی زنده هنگام بازگشت کاربر به تب یا فوکوس دوباره روی صفحه
    const onFocus = () => {
      fetchProgressData(false);
    };
    window.addEventListener('focus', onFocus);

    // ۲. اتصال Realtime به پایگاه داده سوپابیس برای دریافت آنی تغییرات چک‌لیست
    const channel = supabase
      .channel('checklist_progress_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'checklist_progress' },
        () => {
          fetchProgressData(false);
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('focus', onFocus);
      supabase.removeChannel(channel);
    };
  }, [fetchProgressData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eaf4f4] flex items-center justify-center font-[Vazirmatn]" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0e4e63] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">در حال دریافت و تحلیل اطلاعات پیشرفت...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eaf4f4] text-slate-800 font-[Vazirmatn] pb-16" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">

        {/* هدر صفحه */}
        <div className="text-right mb-8">
          <h1 className="text-3xl font-extrabold text-[#0e4e63] mb-2">پیشرفت من</h1>
          <p className="text-slate-600 text-sm">
            روند رعایت چک‌لیست‌های ارگونومی شما در طول زمان.
          </p>
        </div>

        {/* سه کارت آماری بالای صفحه */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold text-[#0e4e63] mb-1">
              {averagePercentage}%
            </span>
            <span className="text-xs text-slate-500 font-medium">میانگین کلی رعایت</span>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold text-[#0e4e63] mb-1">
              {activeDaysCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">روزهای فعال</span>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold text-[#0e4e63] mb-1">
              {totalTicks}
            </span>
            <span className="text-xs text-slate-500 font-medium">کل گزینه‌های تیک‌خورده</span>
          </div>
        </div>

        {/* دو کادر نمودارها */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* نمودار ۱: روند ۳۰ روز اخیر */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold text-[#0e4e63] text-center mb-6">
              روند ۳۰ روز اخیر
            </h2>
            <div className="h-64 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="dayNumber" 
                    tickLine={false} 
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    ticks={[0, 25, 50, 75, 100]} 
                    tickFormatter={(v) => `${v}%`}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip 
                    formatter={(val: any) => [`${val}%`, 'درصد رعایت']}
                    labelFormatter={(label) => `روز ${label}`}
                    contentStyle={{ fontFamily: 'Vazirmatn', borderRadius: '8px', direction: 'rtl' }}
                  />
                  <Line 
                    type="linear" 
                    dataKey="percentage" 
                    stroke="#0d9488" 
                    strokeWidth={2.5}
                    dot={{ fill: '#ffffff', stroke: '#0d9488', strokeWidth: 2, r: 3.5 }}
                    activeDot={{ r: 5, fill: '#0d9488' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* نمودار ۲: پیشرفت ۷ روز اخیر */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold text-[#0e4e63] text-center mb-6">
              پیشرفت ۷ روز اخیر
            </h2>
            <div className="h-64 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="shortLabel" 
                    tickLine={false} 
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    ticks={[0, 25, 50, 75, 100]} 
                    tickFormatter={(v) => `${v}%`}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip 
                    formatter={(val: any) => [`${val}%`, 'پیشرفت']}
                    contentStyle={{ fontFamily: 'Vazirmatn', borderRadius: '8px', direction: 'rtl' }}
                  />
                  <Bar 
                    dataKey="percentage" 
                    fill="#007a8c" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* کادر تاریخچه چک‌لیست‌ها */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-[#0e4e63] text-right mb-4">
            تاریخچه چک‌لیست‌ها
          </h2>

          <div className="divide-y divide-slate-100">
            {historyList.length > 0 ? (
              historyList.map((item, index) => (
                <div key={index} className="py-3.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700 tracking-wide" dir="ltr">
                    {item.countStr}
                  </span>
                  <span className="text-slate-600 font-medium">
                    {item.formattedDate}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-slate-400">
                هنوز هیچ داده‌ای ثبت نشده است. گزینه‌های چک‌لیست امروز را تیک بزنید!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
