"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function ProgressPage() {
  const [stats, setStats] = useState({ totalCompleted: 0, activeDays: 0, average: 0 });
  const [weeklyChartData, setWeeklyChartData] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      // دریافت تمام لاگ‌ها بر اساس زمان ثبت
      const { data: logs } = await supabase
        .from("checklist_progress")
        .select("*")
        .order("updated_at", { ascending: false });

      if (logs && logs.length > 0) {
        // ۱. تجمیع داده‌ها بر اساس هر روز تقویمی شمسی/محلی
        const dailyGroups: { 
          [key: string]: { 
            date: Date; 
            completedCount: number; 
            totalCount: number; 
          } 
        } = {};

        logs.forEach(item => {
          const d = new Date(item.updated_at);
          // کلید بر اساس تاریخ تقویمی
          const dateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

          if (!dailyGroups[dateKey]) {
            dailyGroups[dateKey] = { date: d, completedCount: 0, totalCount: 0 };
          }

          dailyGroups[dateKey].totalCount += 1;
          if (item.completed) {
            dailyGroups[dateKey].completedCount += 1;
          }
        });

        const dailyArray = Object.values(dailyGroups);

        // ۲. کارت‌های آماری
        const totalCompleted = logs.filter(l => l.completed).length;
        // روزهایی که حداقل یک آیتم انجام داده است
        const activeDays = dailyArray.filter(d => d.completedCount > 0).length;

        // محاسبه میانگین درصد واقعی روزهای فعال (کاملاً هماهنگ با درصد روزانه چک‌لیست)
        const daysWithPercentages = dailyArray
          .filter(d => d.totalCount > 0)
          .map(d => Math.round((d.completedCount / d.totalCount) * 100));

        const average = daysWithPercentages.length > 0
          ? Math.round(daysWithPercentages.reduce((a, b) => a + b, 0) / daysWithPercentages.length)
          : 0;

        setStats({
          totalCompleted,
          activeDays,
          average
        });

        // ۳. هماهنگ‌سازی نمودار بر اساس میانگین درصد واقعی روزهای هفته
        const dayNamesOrder = ['جمعه', 'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه'];
        const dayMapNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
        
        const weeklyBuckets: { [key: string]: { completed: number; total: number } } = {
          'جمعه': { completed: 0, total: 0 },
          'شنبه': { completed: 0, total: 0 },
          'یکشنبه': { completed: 0, total: 0 },
          'دوشنبه': { completed: 0, total: 0 },
          'سه‌شنبه': { completed: 0, total: 0 },
          'چهارشنبه': { completed: 0, total: 0 },
          'پنجشنبه': { completed: 0, total: 0 },
        };

        logs.forEach(item => {
          const d = new Date(item.updated_at);
          const dayName = dayMapNames[d.getDay()];
          if (weeklyBuckets[dayName]) {
            weeklyBuckets[dayName].total += 1;
            if (item.completed) {
              weeklyBuckets[dayName].completed += 1;
            }
          }
        });

        const formattedChartData = dayNamesOrder.map(name => {
          const b = weeklyBuckets[name];
          const pct = b.total > 0 ? Math.round((b.completed / b.total) * 100) : 0;
          return { name, value: pct };
        });

        setWeeklyChartData(formattedChartData);

        // ۴. تاریخچه روزانه با فرمول دقیق درصد چک‌لیست
        const history = dailyArray
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .map(entry => {
            const weekday = entry.date.toLocaleDateString('fa-IR', { weekday: 'long' });
            const dateStr = entry.date.toLocaleDateString('fa-IR');
            // درصد دقیق = تعداد انجام شده تقسیم بر کل موارد ضربدر ۱۰۰
            const percentage = entry.totalCount > 0 
              ? Math.round((entry.completedCount / entry.totalCount) * 100) 
              : 0;

            return {
              title: `${weekday}، ${dateStr}`,
              percentage
            };
          });

        setHistoryList(history);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-8 font-sans text-right" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* هدر */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900">پیشرفت من</h1>
          <p className="text-slate-500 mt-2">روند رعایت چک‌لیست‌های ارگونومی شما در طول زمان.</p>
        </div>

        {/* کارت‌های آماری */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-sm text-slate-400">کل گزینه‌های تیک‌خورده</div>
            <div className="text-3xl font-bold mt-2 text-slate-800">{stats.totalCompleted.toLocaleString('fa-IR')}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-sm text-slate-400">روزهای فعال</div>
            <div className="text-3xl font-bold mt-2 text-slate-800">{stats.activeDays.toLocaleString('fa-IR')}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-sm text-slate-400">میانگین کلی رعایت</div>
            <div className="text-3xl font-bold mt-2 text-slate-800">{stats.average.toLocaleString('fa-IR')}٪</div>
          </div>
        </div>

        {/* بخش نمودارها */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* نمودار خطی */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold mb-6 text-slate-700">روند ۳۰ روز اخیر</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    interval={0} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                  />
                  <YAxis 
                    domain={[0, 100]}
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(val) => `${val}%`}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip formatter={(value) => [`${value}%`, 'میزان رعایت']} />
                  <Line type="monotone" dataKey="value" stroke="#0e7490" strokeWidth={3} dot={{ r: 4, fill: '#0e7490' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* نمودار میله‌ای */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold mb-6 text-slate-700">پیشرفت ۷ روز اخیر</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    interval={0} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                  />
                  <YAxis 
                    domain={[0, 100]}
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(val) => `${val}%`}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip formatter={(value) => [`${value}%`, 'میزان رعایت']} />
                  <Bar dataKey="value" fill="#0e7490" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* تاریخچه روزانه */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold mb-4 text-slate-700">تاریخچه چک‌لیست‌ها</h3>
          <div className="space-y-3">
            {historyList.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">هنوز دیتایی ثبت نشده است.</p>
            ) : (
              historyList.slice(0, 7).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
                  <span className="text-slate-600 text-sm">{item.title}</span>
                  <span className="font-medium text-slate-800 text-sm">({item.percentage.toLocaleString('fa-IR')}٪)</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
