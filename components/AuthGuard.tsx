'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// صفحاتی که نیاز به لاگین ندارند
const PUBLIC_ROUTES = ['/login'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // بررسی وضعیت نشست کاربر
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.replace('/login');
          setIsAuthenticated(false);
          return;
        }
      } else {
        // اگر لاگین بود و خواست بره به صفحه لاگین، هدایتش کن به صفحه اصلی
        if (pathname === '/login') {
          router.replace('/');
          setIsAuthenticated(true);
          return;
        }
      }

      setIsAuthenticated(true);
    };

    checkAuth();

    // گوش دادن به تغییرات وضعیت نشست (لاگین/خروج)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !PUBLIC_ROUTES.includes(pathname)) {
        router.replace('/login');
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  // تا زمانی که وضعیت لاگین مشخص نشده، لودینگ تم ارگونو نمایش داده می‌شود
  if (isAuthenticated === null && !PUBLIC_ROUTES.includes(pathname)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm font-medium animate-pulse">در حال بررسی دسترسی...</p>
      </div>
    );
  }

  return <>{children}</>;
}
