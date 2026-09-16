"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "پیشرفت من", href: "/progress" },
    { name: "چک‌لیست روزانه", href: "/checklist" },
    { name: "برنامه آموزشی", href: "/training-plan" },
    { name: "تمرینات اصلاحی", href: "/exercises" },
    { name: "اصول ارگونومی", href: "/modules" },
    { name: "خانه", href: "/" },
  ];

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* منو سمت راست */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-sky-100 text-sky-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* لوگو سمت چپ */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="text-right">
            <span className="block text-lg font-black text-slate-800 tracking-tight leading-tight">ارگونو</span>
            <span className="block text-[10px] text-slate-400 font-sans tracking-wide">Ergono</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
        </Link>
      </div>
    </header>
  );
}
