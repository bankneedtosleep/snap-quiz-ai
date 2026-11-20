import type { Metadata } from "next";
import { Noto_Sans_Thai, Prompt } from "next/font/google";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

import "./globals.css";
import "./desk.css";

const body = Noto_Sans_Thai({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
  adjustFontFallback: false,
});

const display = Prompt({
  subsets: ["latin", "thai"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: {
    default: "SnapQuiz AI",
    template: "%s · SnapQuiz AI",
  },
  description: "เปลี่ยนสรุปสั้นๆ ให้เป็นข้อสอบทวนความรู้ในคลิกเดียว",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${body.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full">
        <div className="desk-glow desk-glow-top" aria-hidden="true" />
        <div className="desk-glow desk-glow-bottom" aria-hidden="true" />
        <div className="desk-grain" aria-hidden="true" />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
