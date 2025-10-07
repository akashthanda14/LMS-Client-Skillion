import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BrandOrbs from '@/components/presentational/BrandOrbs';
import Footer from '@/components/Footer';
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { CourseProvider } from "@/contexts/CourseContext";
import { AppQueryProvider } from "@/contexts/QueryClientProvider";

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
            <AppQueryProvider>
              <ToastProvider>
                <div className="relative min-h-screen w-full flex flex-col">
                  <BrandOrbs />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
              </ToastProvider>
            </AppQueryProvider>
          </CourseProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
