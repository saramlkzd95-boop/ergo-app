"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { LogIn, LogOut, Menu, X, ShieldCheck } from "lucide-react";

const links = [
  { href: "/", label: "خانه" },
  { href: "/principles", label: "اصول ارگونومی" },
  { href: "/exercises", label: "تمرینات اصلاحی" },
  { href: "/training", label: "برنامه آموزشی من" },
  { href: "/checklist", label: "چک‌لیست روزانه" },
  { href: "/progress", label: "پیشرفت من" },
  { href: "/rewards", label: "افتخارات و نشان‌ها 🏆" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // بررسی وضعیت ادمین بودن بر اساس ایمیل کاربر در جدول admin_users
  const checkIfAdmin = async (userEmail?: string | null) => {
    if (!userEmail) {
      setIsAdmin(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("email")
        .eq("email", userEmail)
        .maybeSingle();

      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      checkIfAdmin(data.session?.user?.email);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        checkIfAdmin(newSession?.user?.email);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setMobileMenuOpen(false);
    router.push("/login");
  };

  const isAdminActive = pathname.startsWith("/admin");

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between md:grid md:grid-cols-[auto_1fr_auto] gap-4">
        {/* لوگو — راست */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-200 flex items-center justify-center">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 19v2" />
                <path d="M18 19v2" />
                <path d="M12 15v6" />
                <path d="M6 15h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Z" />
                <path d="M6 9h12" />
              </svg>
            </span>
            <span className="text-xl font-extrabold text-teal-700">
              ارگونو
            </span>
          </Link>
        </div>

        {/* منو در لپ‌تاپ و تبلت — وسط */}
        <nav className="hidden md:flex justify-center overflow-x-auto py-1">
          <ul className="flex items-center gap-1.5 lg:gap-2">
            {links.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-bold whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200"
                        : "text-gray-700 hover:text-teal-700"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}

            {/* دکمه اختصاصی پنل مدیریت (فقط برای ادمین) */}
            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-extrabold whitespace-nowrap transition-all ${
                    isAdminActive
                      ? "bg-amber-100 text-amber-900 ring-1 ring-amber-300"
                      : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>پنل مدیریت</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* ورود/خروج + دکمه همبرگری موبایل — چپ */}
        <div className="flex items-center gap-2 shrink-0">
          {session ? (
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-bold text-teal-700 hover:bg-teal-50 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>ورود</span>
            </Link>
          )}

          {/* دکمه باز و بسته کردن منوی موبایل */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="منو"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-teal-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* منوی کشویی مخصوص موبایل */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-5 shadow-lg space-y-2">
          <ul className="flex flex-col space-y-1">
            {links.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                      isActive
                        ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200"
                        : "text-gray-700 hover:bg-gray-50 hover:text-teal-700"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}

            {/* دکمه پنل مدیریت در منوی موبایل */}
            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition-colors ${
                    isAdminActive
                      ? "bg-amber-100 text-amber-900 ring-1 ring-amber-300"
                      : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>پنل مدیریت</span>
                </Link>
              </li>
            )}
          </ul>

          <div className="pt-3 border-t border-gray-100">
            {session ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>خروج از حساب</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>ورود به حساب</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
