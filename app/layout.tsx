import "./globals.css";
import type { Viewport } from "next";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import ErgoChatBot from "@/components/ErgoChatBot";
import NotificationManager from "@/components/NotificationManager";

export const metadata = {
  title: "ارگونو | سامانه ارگونومی و سلامت کار",
  description: "راهکار هوشمند اصلاح الگوهای حرکتی و پاسچر کاری",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-[#eaf4f4] font-[Vazirmatn] text-slate-900 min-h-screen flex flex-col overflow-x-hidden antialiased">
        <AuthGuard>
          <Navbar />
          <main className="flex-1 w-full max-w-full">{children}</main>
          {/* نوار یادآور در پایین صفحات (به جز صفحه اصلی) */}
          <NotificationManager variant="floating" />
        </AuthGuard>

        <ErgoChatBot />
      </body>
    </html>
  );
}
