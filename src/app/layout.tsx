import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BrandOrbs from '@/components/presentational/BrandOrbs';
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { CourseProvider } from "@/contexts/CourseContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MicroCourses - Learn, Create, Grow",
  description: "A modern Learning Management System built with Next.js 15",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <CourseProvider>
            <ToastProvider>
              <div className="relative min-h-screen w-full">
                <BrandOrbs />
                {children}
              </div>
            </ToastProvider>
          </CourseProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
