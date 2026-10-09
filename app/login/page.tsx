'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [nationalCode, setNationalCode] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // تبدیل کد ملی به شناسه ایمیلی معتبر برای Auth سوپابیس
  const formatEmailFromNationalCode = (code: string) => {
    return `user_${code.trim()}@ergono.local`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // اعتبارسنجی ساده کد ملی و رمز عبور
    if (nationalCode.trim().length !== 10 || isNaN(Number(nationalCode))) {
      setErrorMessage('کد ملی باید دقیقاً ۱۰ رقم عددی باشد.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    setLoading(true);
    const fakeEmail = formatEmailFromNationalCode(nationalCode);

    try {
      if (isLoginMode) {
        // ورود کاربر
        const { error } = await supabase.auth.signInWithPassword({
          email: fakeEmail,
          password: password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('کد ملی یا رمز عبور اشتباه است.');
          }
          throw error;
        }

        router.push('/');
        router.refresh();
      } else {
        // ثبت‌نام کاربر
        if (!fullName.trim()) {
          setErrorMessage('لطفاً نام و نام خانوادگی خود را وارد کنید.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: fakeEmail,
          password: password,
          options: {
            data: {
              full_name: fullName,
              national_code: nationalCode,
            },
          },
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            throw new Error('این کد ملی قبلاً ثبت‌نام کرده است. وارد شوید.');
          }
          throw error;
        }

        // ایجاد رکورد در جدول profiles در صورت موفقیت
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            national_code: nationalCode,
            full_name: fullName,
          });
        }

        setSuccessMessage('ثبت‌نام با موفقیت انجام شد! در حال انتقال...');
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'خطایی در برقراری ارتباط رخ داد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white" dir="rtl">
      <div className="w-full max-w-md">
        {/* هدر و پیام انگیزشی */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 shadow-lg shadow-emerald-500/5">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mb-2">سامانه ارگونومی سلامت شغلی «ارگونو»</h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            «سلامت ستون فقرات شما، سرمایه فرداست. با ثبت منظم رفتارهای ارگونومیک، خستگی و درد را در محیط کار مهار کنید.»
          </p>
        </div>

        {/* کارت فرم */}
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* تب تغییر حالت ورود / ثبت‌نام */}
          <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-slate-800/80 mb-6">
            <button
              type="button"
              onClick={() => { setIsLoginMode(true); setErrorMessage(''); setSuccessMessage(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                isLoginMode
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ورود به حساب
            </button>
            <button
              type="button"
              onClick={() => { setIsLoginMode(false); setErrorMessage(''); setSuccessMessage(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                !isLoginMode
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ثبت‌نام جدید
            </button>
          </div>

          {/* پیام‌های وضعیت */}
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">نام و نام خانوادگی</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: فاطمه ملک‌زاده"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">کد ملی (۱۰ رقمی)</label>
              <input
                type="text"
                maxLength={10}
                required
                value={nationalCode}
                onChange={(e) => setNationalCode(e.target.value)}
                placeholder="مثال: 0012345678"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-mono tracking-wider text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">رمز عبور</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="حداقل ۶ کاراکتر"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>{isLoginMode ? 'ورود به سامانه' : 'تکمیل ثبت‌نام و ورود'}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
