import "./globals.css";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import ErgoChatBot from "@/components/ErgoChatBot";

export const metadata = {
  title: "ارگونو | سامانه ارگونومی و سلامت کار",
  description: "راهکار هوشمند اصلاح الگوهای حرکتی و پاسچر کاری",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-[#eaf4f4] font-[Vazirmatn] text-slate-900 min-h-screen flex flex-col">
        <AuthGuard>
          {/* نوبار هوشمند شامل منوها و دکمه ورود/خروج */}
          <Navbar />

          {/* محتوای صفحات مختلف */}
          <main className="flex-1">{children}</main>
        </AuthGuard>

        {/* دستیار ارگونو */}
        <ErgoChatBot />
      </body>
    </html>
  );
}
