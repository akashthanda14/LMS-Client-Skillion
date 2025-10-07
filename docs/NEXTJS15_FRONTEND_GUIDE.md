# 🚀 Next.js 15 + Shadcn UI + Tailwind - LMS Frontend Guide

Complete setup guide for building the LMS frontend with Next.js 15, App Router, Shadcn UI, Tailwind CSS, and Turbopack.

---

## 📦 Initial Setup

### 1. Create Next.js 15 Project

```bash
npx create-next-app@latest lms-frontend
```

**Configuration prompts:**
```
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like to use `src/` directory? … Yes
✔ Would you like to use App Router? … Yes
✔ Would you like to customize the default import alias? … No
✔ Would you like to use Turbopack for next dev? … Yes
```

---

### 2. Install Shadcn UI

```bash
cd lms-frontend
npx shadcn@latest init
```

**Configuration:**
```
✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Slate
✔ Would you like to use CSS variables for colors? … yes
```

---

### 3. Install Required Dependencies

```bash
# Core dependencies
npm install axios react-query zustand
npm install react-player video.js
npm install react-hook-form zod @hookform/resolvers
npm install date-fns clsx
npm install sonner # Toast notifications

# Shadcn components (install as needed)
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add progress
npx shadcn@latest add dialog
npx shadcn@latest add tabs
npx shadcn@latest add select
npx shadcn@latest add form
npx shadcn@latest add avatar
npx shadcn@latest add skeleton
npx shadcn@latest add dropdown-menu
npx shadcn@latest add separator
npx shadcn@latest add toast
```

---

## 📁 Next.js 15 Folder Structure (with src/)

```
lms-frontend/
├── src/
│   ├── app/                          # App Router (Next.js 15)
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page (/)
│   │   ├── globals.css               # Global styles + Tailwind
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # /login
│   │   │   ├── register/
│   │   │   │   └── page.tsx          # /register
│   │   │   ├── verify-otp/
│   │   │   │   └── page.tsx          # /verify-otp
│   │   │   ├── complete-profile/
│   │   │   │   └── page.tsx          # /complete-profile
│   │   │   └── forgot-password/
│   │   │       └── page.tsx          # /forgot-password
│   │   ├── (dashboard)/              # Dashboard route group (protected)
│   │   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # /dashboard
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx          # /courses (catalog)
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # /courses/[id] (details)
│   │   │   │       └── lessons/
│   │   │   │           └── [lessonId]/
│   │   │   │               └── page.tsx # /courses/[id]/lessons/[lessonId]
│   │   │   ├── my-learning/
│   │   │   │   └── page.tsx          # /my-learning
│   │   │   ├── certificates/
│   │   │   │   ├── page.tsx          # /certificates
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # /certificates/[id]
│   │   │   ├── profile/
│   │   │   │   └── page.tsx          # /profile
│   │   │   └── become-creator/
│   │   │       └── page.tsx          # /become-creator
│   │   ├── api/                      # API routes (if needed for proxy)
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts
│   │   └── certificates/
│   │       └── verify/
│   │           └── [hash]/
│   │               └── page.tsx      # Public certificate verification
│   ├── components/
│   │   ├── ui/                       # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── form.tsx
│   │   │   └── ...
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   ├── otp-input.tsx
│   │   │   └── complete-profile-form.tsx
│   │   ├── courses/
│   │   │   ├── course-card.tsx
│   │   │   ├── course-grid.tsx
│   │   │   ├── course-filters.tsx
│   │   │   └── lesson-list.tsx
│   │   ├── lessons/
│   │   │   ├── video-player.tsx
│   │   │   ├── transcript-viewer.tsx
│   │   │   └── lesson-progress.tsx
│   │   ├── dashboard/
│   │   │   ├── enrollment-card.tsx
│   │   │   ├── stats-card.tsx
│   │   │   └── recent-activity.tsx
│   │   ├── certificates/
│   │   │   ├── certificate-card.tsx
│   │   │   └── certificate-viewer.tsx
│   │   ├── layout/
│   │   │   ├── navbar.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── mobile-nav.tsx
│   │   └── providers/
│   │       ├── auth-provider.tsx
│   │       ├── query-provider.tsx
│   │       └── theme-provider.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts              # Axios instance
│   │   │   ├── auth.ts                # Auth API calls
│   │   │   ├── courses.ts             # Course API calls
│   │   │   ├── enrollments.ts         # Enrollment API calls
│   │   │   └── certificates.ts        # Certificate API calls
│   │   ├── hooks/
│   │   │   ├── use-auth.ts
│   │   │   ├── use-courses.ts
│   │   │   ├── use-enrollment.ts
│   │   │   └── use-toast.ts
│   │   ├── store/
│   │   │   └── auth-store.ts          # Zustand store
│   │   ├── utils.ts                    # cn() and utilities
│   │   ├── validators.ts               # Zod schemas
│   │   └── constants.ts
│   └── types/
│       ├── auth.ts
│       ├── course.ts
│       ├── enrollment.ts
│       └── certificate.ts
├── public/
│   ├── images/
│   └── ...
├── .env.local                          # Environment variables
├── next.config.mjs                     # Next.js config with Turbopack
├── tailwind.config.ts                  # Tailwind config
├── tsconfig.json
├── components.json                     # Shadcn config
└── package.json
```

---

## ⚙️ Configuration Files

### 1. `next.config.mjs` (with Turbopack)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Turbopack for faster development builds
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Image optimization for Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
    ],
  },

  // API proxy to backend (optional)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
```

---

### 2. `.env.local`

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 3. `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## 🎨 Component Examples (Next.js 15 + Shadcn)

### 1. Root Layout (`src/app/layout.tsx`)

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LMS - Learning Management System",
  description: "Modern learning platform for online courses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

---

### 2. Dashboard Layout (`src/app/(dashboard)/layout.tsx`)

```typescript
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

### 3. Course Card Component (`src/components/courses/course-card.tsx`)

```typescript
"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Clock } from "lucide-react";
import type { Course } from "@/types/course";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="relative h-48 w-full">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-2">
            {course.title}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          by {course.creator.name}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary">{course.category}</Badge>
          <Badge variant="outline">{course.level}</Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{course.enrollmentCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.lessonCount} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(course.duration)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/courses/${course.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

### 4. OTP Input Component (`src/components/auth/otp-input.tsx`)

```typescript
"use client";

import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  className?: string;
}

export function OTPInput({ length = 6, onComplete, className }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all digits entered
    if (newOtp.every((digit) => digit !== "")) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    const newOtp = pastedData.split("");
    
    setOtp([...newOtp, ...new Array(length - newOtp.length).fill("")]);

    if (newOtp.length === length) {
      onComplete(newOtp.join(""));
    }
  };

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-lg font-semibold"
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
}
```

---

### 5. Enrollment Card Component (`src/components/dashboard/enrollment-card.tsx`)

```typescript
"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Award, Play } from "lucide-react";
import type { Enrollment } from "@/types/enrollment";

interface EnrollmentCardProps {
  enrollment: Enrollment;
}

export function EnrollmentCard({ enrollment }: EnrollmentCardProps) {
  const { course, progress, completedLessons, certificate } = enrollment;
  const isCompleted = progress === 100;

  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 w-full">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold line-clamp-1">{course.title}</h3>
          <p className="text-sm text-muted-foreground">
            by {course.creator.name}
          </p>
        </div>

        {isCompleted ? (
          <div className="flex items-center gap-2 text-green-600">
            <Award className="h-5 w-5" />
            <span className="font-medium">Completed</span>
          </div>
        ) : (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {completedLessons} / {course.lessonCount} lessons completed ({progress}%)
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {isCompleted && certificate ? (
          <Button asChild className="w-full" variant="outline">
            <Link href={`/certificates/${certificate.id}`}>
              <Award className="h-4 w-4 mr-2" />
              View Certificate
            </Link>
          </Button>
        ) : (
          <Button asChild className="w-full">
            <Link href={`/courses/${course.id}`}>
              <Play className="h-4 w-4 mr-2" />
              Continue Learning
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
```

---

### 6. Video Player Component (`src/components/lessons/video-player.tsx`)

```typescript
"use client";

import { useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Card } from "@/components/ui/card";

interface VideoPlayerProps {
  videoUrl: string;
  onProgress?: (played: number) => void;
  onEnded?: () => void;
}

export function VideoPlayer({ videoUrl, onProgress, onEnded }: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(false);

  const handleProgress = (state: { played: number }) => {
    onProgress?.(state.played);
  };

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-black">
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          playing={playing}
          controls
          width="100%"
          height="100%"
          onProgress={handleProgress}
          onEnded={onEnded}
          config={{
            file: {
              attributes: {
                controlsList: "nodownload",
              },
            },
          }}
        />
      </div>
    </Card>
  );
}
```

---

## 🔐 API Client Setup

### `src/lib/api/client.ts`

```typescript
import axios from "axios";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      toast.error("Session expired. Please login again.");
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("An error occurred. Please try again.");
    }
    return Promise.reject(error);
  }
);
```

---

### `src/lib/api/auth.ts`

```typescript
import { apiClient } from "./client";
import type { LoginRequest, RegisterRequest, User } from "@/types/auth";

export const authAPI = {
  login: async (credentials: LoginRequest) => {
    const { data } = await apiClient.post("/auth/login", credentials);
    return data;
  },

  register: async (userData: RegisterRequest) => {
    const { data } = await apiClient.post("/auth/register", userData);
    return data;
  },

  verifyOTP: async (userId: string, otp: string, type: "email" | "phone") => {
    const endpoint = type === "email" ? "/auth/verify-email" : "/auth/verify-phone";
    const { data } = await apiClient.post(endpoint, { userId, otp });
    return data;
  },

  completeProfile: async (userId: string, profileData: { name: string; username: string }) => {
    const { data } = await apiClient.post("/auth/complete-profile", {
      userId,
      ...profileData,
    });
    return data;
  },

  getCurrentUser: async () => {
    const { data } = await apiClient.get("/auth/me");
    return data.user as User;
  },

  logout: () => {
    localStorage.removeItem("token");
  },
};
```

---

## 🪝 Custom Hooks with React Query

### `src/lib/hooks/use-auth.ts`

```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api/auth";
import { toast } from "sonner";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: authAPI.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      queryClient.setQueryData(["user"], data.user);
      toast.success("Login successful!");
      router.push("/dashboard");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
      toast.success("Logged out successfully");
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
  };
}
```

---

### `src/lib/hooks/use-courses.ts`

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { coursesAPI } from "@/lib/api/courses";

export function useCourses() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["courses"],
    queryFn: coursesAPI.getAllCourses,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    courses: data?.courses || [],
    isLoading,
    error,
  };
}

export function useCourse(courseId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => coursesAPI.getCourseById(courseId),
    enabled: !!courseId,
  });

  return {
    course: data?.course,
    isLoading,
    error,
  };
}
```

---

## 📄 Page Examples

### Dashboard Page (`src/app/(dashboard)/dashboard/page.tsx`)

```typescript
import { EnrollmentCard } from "@/components/dashboard/enrollment-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { enrollmentAPI } from "@/lib/api/enrollments";
import { BookOpen, Award, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const { enrollments } = await enrollmentAPI.getUserProgress();

  const inProgress = enrollments.filter((e) => e.progress < 100);
  const completed = enrollments.filter((e) => e.progress === 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Learning Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress and continue learning
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgress.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completed.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      {inProgress.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Continue Learning</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inProgress.map((enrollment) => (
              <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        </section>
      )}

      {/* Completed Courses */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Completed Courses</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completed.map((enrollment) => (
              <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

---

### Login Page (`src/app/(auth)/login/page.tsx`)

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const { login } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ emailOrPhone, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailOrPhone">Email or Phone</Label>
              <Input
                id="emailOrPhone"
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full">
              Login
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
```

---

## 🚀 Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint

# Type check
npm run type-check
```

---

## ✅ Next.js 15 Features Used

1. **App Router** - File-based routing with layouts
2. **Server Components** - Default server rendering for better performance
3. **Turbopack** - Faster development builds
4. **Server Actions** - Direct server-side mutations (optional)
5. **Metadata API** - SEO optimization
6. **Image Optimization** - Automatic image optimization with Cloudinary
7. **Route Groups** - `(auth)` and `(dashboard)` for logical grouping
8. **Loading UI** - `loading.tsx` files for suspense states
9. **Error Handling** - `error.tsx` files for error boundaries

---

## 🎨 Shadcn UI Components Used

- ✅ Button, Input, Label
- ✅ Card, Badge, Progress
- ✅ Dialog, Tabs, Select
- ✅ Form (with React Hook Form + Zod)
- ✅ Dropdown Menu, Avatar
- ✅ Skeleton (loading states)
- ✅ Toast (Sonner)

---

## 📦 Key Differences from React-Only Setup

| Feature | React Setup | Next.js 15 Setup |
|---------|-------------|------------------|
| Routing | React Router | App Router (file-based) |
| File Location | `src/components` | `src/app` + `src/components` |
| Pages | `.jsx` files | `page.tsx` in folders |
| Layouts | Manual wrapper | `layout.tsx` per route group |
| API Calls | Client-side only | Server Components + Client hooks |
| Images | `<img>` tag | `<Image>` component (optimized) |
| Styling | CSS Modules | Tailwind CSS + Shadcn |
| State | Redux/Zustand | React Query + Zustand |
| Build Tool | Vite/CRA | Next.js (with Turbopack) |

---

## 🔥 Performance Optimizations

1. **Server Components** - Dashboard, course list rendered on server
2. **Image Optimization** - Next.js Image component with Cloudinary
3. **Code Splitting** - Automatic with App Router
4. **Turbopack** - 10x faster than Webpack for development
5. **React Query** - Smart caching and background refetching
6. **Lazy Loading** - Dynamic imports for heavy components

---

## 🎯 Implementation Checklist

### Week 1: Setup & Auth
- [x] Create Next.js 15 project with Turbopack
- [x] Install Shadcn UI + Tailwind
- [ ] Build auth pages (login, register, OTP, complete profile)
- [ ] Setup API client with interceptors
- [ ] Implement useAuth hook

### Week 2: Courses & Enrollment
- [ ] Build course catalog with filters
- [ ] Course detail page with lessons
- [ ] Enrollment functionality
- [ ] Video player component

### Week 3: Learning & Progress
- [ ] Dashboard with enrollment cards
- [ ] Progress tracking
- [ ] Mark lesson complete
- [ ] Course completion flow

### Week 4: Certificates & Profile
- [ ] Certificate gallery
- [ ] Certificate viewer/download
- [ ] Profile management
- [ ] Email/phone change with OTP

### Week 5: Creator & Polish
- [ ] Creator application form
- [ ] Application status page
- [ ] Toast notifications
- [ ] Error handling
- [ ] Responsive design testing

---

**Your Next.js 15 + Shadcn UI setup is ready! Start building! 🚀**
