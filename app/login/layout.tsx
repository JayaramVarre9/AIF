import "@/app/globals.css";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata = {
  title: "Login | AI Factory",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#233A77] via-[#1E2E5A] to-[#C51E26]">
        {children}
      </body>
    </html>
  );
}
