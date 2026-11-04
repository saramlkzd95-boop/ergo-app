'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  Users, 
  CheckCircle2, 
  Flame, 
  Calendar, 
  ShieldAlert, 
  ArrowRight,
  TrendingUp,
  Search,
  Activity,
  ArrowUpLeft,
  Percent
} from 'lucide-react';

interface ChecklistRecord {
  id: string;
  user_id: string;
  date: string;
  completed_items: string[];
  progress_percentage?: number;
  percentage?: number;
  discomfort_level?: string | null;
  streak_count?: number;
  created_at?: string;
}

interface AuthUserRpc {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string | null;
}

interface UserSummary {
  userId: string;
  fullName: string;
  totalSubmissions: number;
  lastActiveDate: string;
  lastActiveDateJalali: string;
  adherencePercentage: number;   
  averageScore: number;          
  maxStreak: number;
  expectedWorkingDays: number;
  submittedWorkingDays: number;
  discomfortDistribution: { [key: string]: number };
  records: ChecklistRecord[];
}

// تابع تبدیل تاریخ میلادی به تقویم شمسی
const toPersianDate = (dateStr: string): string => {
  if (!dateStr || dateStr === '—') return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
};

// محاسبه روزهای کاری (بدون پنج‌شنبه و جمعه) بین دو تاریخ
const countWorkingDays = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  if (start > end) return 1;

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const day = current.getDay();
    if (day !== 4 && day !== 5) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return Math.max(count, 1);
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [usersSummary, setUsersSummary] = useState<UserSummary[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || !user.email) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // ۱. بررسی دسترسی ادمین
      const { data: adminRecord, error: adminErr } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', user.email)
        .maybeSingle();

      if (adminErr || !adminRecord) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      // ۲. دریافت اطلاعات و نام کاربران از طریق تابع امن RPC
      const authUsersMap = new Map<string, AuthUserRpc>();
      const { data: rpcUsers, error: rpcErr } = await supabase.rpc('get_admin_auth_user_names');

      if (!rpcErr && rpcUsers) {
        (rpcUsers as AuthUserRpc[]).forEach((u) => {
          authUsersMap.set(u.id, u);
        });
      }

      // ۳. دریافت گزارش پیشرفت همه کاربران
      const { data: records, error: recordsErr } = await supabase
        .from('checklist_progress')
        .select('*')
        .order('date', { ascending: false });

      if (recordsErr) throw recordsErr;

      // ۴. گروه‌بندی رکوردها بر اساس شناسه کاربر
      const grouped: { [key: string]: ChecklistRecord[] } = {};
      (records || []).forEach((rec: ChecklistRecord) => {
        if (!grouped[rec.user_id]) {
          grouped[rec.user_id] = [];
        }
        grouped[rec.user_id].push(rec);
      });

      const today = new Date();

      const summaries: UserSummary[] = Object.keys(grouped).map((uid) => {
        const userRecs = grouped[uid];
        const authUsr = authUsersMap.get(uid);

        // دریافت نام و نام خانوادگی
        let fullName = authUsr?.full_name?.trim() || '';

        if (!fullName) {
          fullName = `کاربر (${uid.substring(0, 6)})`;
        }

        // تاریخ ثبت‌نام کاربر
        let regDate = authUsr?.created_at ? new Date(authUsr.created_at) : null;

        if (!regDate || isNaN(regDate.getTime())) {
          const oldestRecord = userRecs[userRecs.length - 1];
          regDate = oldestRecord?.created_at 
            ? new Date(oldestRecord.created_at) 
            : (oldestRecord?.date ? new Date(oldestRecord.date) : new Date());
        }

        const expectedDays = countWorkingDays(regDate, today);

        const distinctDates = new Set<string>();
        userRecs.forEach((r) => {
          if (r.date) distinctDates.add(r.date.split('T')[0]);
        });
        const submittedDays = distinctDates.size;

        const adherencePct = Math.min(100, Math.round((submittedDays / expectedDays) * 100));

        // مجموع نمرات به‌دست‌آمده از چک‌لیست‌ها
        const totalScoreAchieved = userRecs.reduce((acc, cur) => {
          const score = cur.progress_percentage ?? cur.percentage ?? 0;
          return acc + score;
        }, 0);

        // حداکثر نمره‌ای که کاربر در کل روزهای کاری دوره می‌توانست کسب کند (هر روز کاری ۱۰۰ نمره)
        const totalPossibleScore = expectedDays * 100;

        // محاسبه میانگین کل بر مبنای روزهای موردانتظار: (مجموع نمرات / سقف نمرات ممکن) * 100
        const avgScore = totalPossibleScore > 0 
          ? Math.min(100, Math.round((totalScoreAchieved / totalPossibleScore) * 100))
          : 0;

        const highestStreak = Math.max(...userRecs.map((r) => r.streak_count || 0), 0);

        const discomfortCount: { [key: string]: number } = {};
        userRecs.forEach((r) => {
          if (r.discomfort_level) {
            discomfortCount[r.discomfort_level] = (discomfortCount[r.discomfort_level] || 0) + 1;
          }
        });

        const lastRawDate = userRecs[0]?.date || '—';

        return {
          userId: uid,
          fullName: fullName,
          totalSubmissions: userRecs.length,
          lastActiveDate: lastRawDate,
          lastActiveDateJalali: toPersianDate(lastRawDate),
          adherencePercentage: adherencePct,
          averageScore: avgScore,
          maxStreak: highestStreak,
          expectedWorkingDays: expectedDays,
          submittedWorkingDays: submittedDays,
          discomfortDistribution: discomfortCount,
          records: userRecs,
        };
      });

      setUsersSummary(summaries);
    } catch (err) {
      console.error('Admin page fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDiscomfortBadge = (level: string | null | undefined) => {
    switch (level) {
      case 'comfortable':
        return <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">احساس راحتی</span>;
      case 'mild_pain':
        return <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">درد خفیف</span>;
      case 'fatigue_cramp':
        return <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">خستگی/گرفتگی</span>;
      default:
        return <span className="text-slate-400 text-xs font-medium">ثبت‌نشده</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eaf4f4] flex items-center justify-center font-[Vazirmatn] text-slate-900" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#113a53] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#113a53] font-bold text-sm">در حال احراز هویت مدیریت ارگونو...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-[#eaf4f4] flex items-center justify-center p-4 font-[Vazirmatn]" dir="rtl">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-[#113a53]">دسترسی غیرمجاز</h1>
          <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed">
            این حساب کاربری در لیست مدیران سیستم ارگونو ثبت نشده است. لطفاً با ایمیل مجاز وارد شوید.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-[#113a53] text-white py-3 rounded-2xl text-sm font-bold hover:bg-[#113a53]/90 transition"
          >
            بازگشت به ارگونو
          </button>
        </div>
      </div>
    );
  }

  const filteredUsers = usersSummary.filter((u) =>
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSubmissionsAll = usersSummary.reduce((a, b) => a + b.totalSubmissions, 0);
  const totalAvgAdherence = usersSummary.length > 0
    ? Math.round(usersSummary.reduce((a, b) => a + b.adherencePercentage, 0) / usersSummary.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#eaf4f4] py-6 sm:py-8 px-3 sm:px-6 lg:px-8 font-[Vazirmatn] text-slate-900 dir-rtl overflow-x-hidden" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">

        {/* هدر صفحه ادمین */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 p-5 rounded-3xl border border-slate-200/60 backdrop-blur-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#113a53] text-white text-[11px] font-black px-2.5 py-0.5 rounded-lg">
                پنل مدیریت سازمان
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#113a53]">
                داشبورد نظارت و سلامت ارگونو
              </h1>
            </div>
            <p className="text-slate-700 text-xs sm:text-sm font-medium">
              پایش یکپارچه رفتار ارگونومیک، تداوم روزانه و وضعیت خستگی عضلانی پرسنل
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/checklist"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-[#113a53] text-white px-4 py-2.5 rounded-2xl hover:bg-[#113a53]/90 transition"
            >
              <span>چک‌لیست من</span>
              <ArrowUpLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ۳ کارت آماری ارگونو */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          <div className="bg-[#113a53] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="flex justify-end">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4 text-center">
              <span className="text-3xl sm:text-5xl font-black block tracking-tight">
                {usersSummary.length}
              </span>
              <span className="text-xs sm:text-sm font-bold text-teal-100 mt-1 block">
                تعداد کل کاربران ثبت‌شده
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-sm border border-slate-200/80">
            <div className="flex justify-end">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-teal-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-teal-700" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4 text-center">
              <span className="text-3xl sm:text-5xl font-black text-[#113a53] block tracking-tight">
                {totalAvgAdherence}%
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 mt-1 block">
                میانگین درصد رعایت روزهای کاری
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-sm border border-slate-200/80">
            <div className="flex justify-end">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-cyan-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-cyan-700" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4 text-center">
              <span className="text-3xl sm:text-5xl font-black text-[#113a53] block tracking-tight">
                {totalSubmissionsAll}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 mt-1 block">
                مجموع دفعات ثبت چک‌لیست
              </span>
            </div>
          </div>
        </div>

        {/* بخش جزییات کاربر انتخابی یا جدول کلی */}
        {selectedUser ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-900 mb-2 transition cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" /> بازگشت به لیست همه کاربران
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-black text-[#113a53]">
                    سوابق ارزیابی: {selectedUser.fullName}
                  </h2>
                  <span className="text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-lg">
                    درصد رعایت: {selectedUser.adherencePercentage}% ({selectedUser.submittedWorkingDays} از {selectedUser.expectedWorkingDays} روز کاری)
                  </span>
                  <span className="text-[11px] font-bold bg-[#eaf4f4] text-[#113a53] px-2.5 py-0.5 rounded-lg">
                    میانگین کل دوره: {selectedUser.averageScore}%
                  </span>
                </div>
              </div>

              <div className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                مجموع ثبت‌ها: {selectedUser.totalSubmissions} بار
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-bold">
                    <th className="pb-3 pr-2">تاریخ (شمسی)</th>
                    <th className="pb-3">نمره چک‌لیست</th>
                    <th className="pb-3">استریک (Streak)</th>
                    <th className="pb-3">موارد انجام‌شده</th>
                    <th className="pb-3">وضعیت درد/خستگی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedUser.records.map((rec) => {
                    const score = rec.progress_percentage ?? rec.percentage ?? 0;
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 pr-2 font-mono text-slate-700 flex items-center gap-1.5 font-bold">
                          <Calendar className="w-4 h-4 text-teal-700" />
                          {toPersianDate(rec.date)}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                              score >= 80
                                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                : score >= 50
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {score}%
                          </span>
                        </td>
                        <td className="py-3.5">
                          <div className="inline-flex items-center gap-1 text-slate-800 font-bold text-xs bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                            <Flame className="w-3.5 h-3.5 text-cyan-700 fill-cyan-700" />
                            {rec.streak_count || 0} روز
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-700 font-medium">
                          {rec.completed_items ? rec.completed_items.length : 0} از ۷ آیتم
                        </td>
                        <td className="py-3.5">
                          {getDiscomfortBadge(rec.discomfort_level)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-black text-[#113a53] text-base sm:text-lg">
                لیست پرسنل و کاربران تحت نظارت
              </h2>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="text"
                  placeholder="جستجوی نام و نام خانوادگی..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#113a53] font-medium"
                />
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm font-medium">
                هیچ کاربری ثبت نشده یا داده‌ای با این مشخصات یافت نشد.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 font-bold">
                      <th className="pb-3 pr-2">نام و نام خانوادگی</th>
                      <th className="pb-3">آخرین ثبت</th>
                      <th className="pb-3">درصد رعایت روزها</th>
                      <th className="pb-3">میانگین کل دوره</th>
                      <th className="pb-3">رکورد تداوم</th>
                      <th className="pb-3">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.userId} className="hover:bg-[#eef7f6]/40 transition">
                        <td className="py-3.5 pr-2 font-bold text-slate-800">
                          {u.fullName}
                        </td>
                        <td className="py-3.5 text-xs text-slate-600 font-mono font-medium">
                          {u.lastActiveDateJalali}
                        </td>
                        <td className="py-3.5">
                          <span 
                            title={`${u.submittedWorkingDays} از ${u.expectedWorkingDays} روز کاری`}
                            className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
                              u.adherencePercentage >= 80
                                ? 'bg-teal-50 text-teal-800 border-teal-200'
                                : u.adherencePercentage >= 50
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {u.adherencePercentage}%
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span 
                            title={`مجموع نمرات کسب‌شده تقسیم بر کل نمرات ممکن در روزهای کاری (${u.expectedWorkingDays} روز × 100)`}
                            className="text-xs font-black text-[#113a53] bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200"
                          >
                            {u.averageScore}%
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1 text-slate-800 font-bold text-xs bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                            <Flame className="w-3.5 h-3.5 text-cyan-700 fill-cyan-700" />
                            {u.maxStreak} روز
                          </span>
                        </td>
                        <td className="py-3.5">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="text-xs text-[#113a53] bg-[#eaf4f4] hover:bg-teal-100 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                          >
                            مشاهده ریز گزارش
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
