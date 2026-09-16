import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Vazirmatn } from "next/font/google";

export const metadata: Metadata = {
  title: "ارگونو | سامانه پایش و آموزش ارگونومی اداری",
  description: "سامانه ارتقای سلامت شغلی، آموزش ارگونومی و ثبت چک‌لیست عادات روزانه کارمندان",
};
const vazir = Vazirmatn({ subsets: ["arabic"], weight: ["400", "600", "700", "800"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
        />
      </head>
      <body  className={vazir.className}>

        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
