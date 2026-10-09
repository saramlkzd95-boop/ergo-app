'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function NavbarAuthButton() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session?.user);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    router.push('/login');
  };

  if (isAuthenticated === null) {
    return <div className="w-24 h-9"></div>; // لودینگ نامرئی برای جلوگیری از پرش تصویر
  }

  if (isAuthenticated) {
    return (
      <button
        onClick={handleLogout}
        className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all shadow-sm"
      >
        خروج از حساب
      </button>
    );
  }

  return (
    <Link
      href="/login"
      className="bg-[#1b4332] hover:bg-[#2d6a4f] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm"
    >
      ورود به حساب
    </Link>
  );
}
