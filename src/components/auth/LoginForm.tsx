"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import * as z from "zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardHeader, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast";

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, "Please enter your email or phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [error, setError] = useState<string>("");
  const { login, isLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { emailOrPhone: "", password: "" },
  });

  const fillTestAccount = (email: string, password: string) => {
    form.setValue("emailOrPhone", email);
    form.setValue("password", password);
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError("");
      const user = await login(data);
      addToast("Login successful! Welcome back.", "success");

      await new Promise((r) => setTimeout(r, 200));

      if (user?.role === "ADMIN") router.replace("/admin/dashboard");
      else if (user?.role === "CREATOR") router.replace("/creator/dashboard");
      else router.replace("/courses");
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
      addToast(errorMessage, "error");
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-6 pt-20" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1612117229486-78abff6d84c3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`, backgroundSize: 'cover', backgroundPosition: 'center' }} role="img" aria-label="Person learning on a laptop with soft gradient background">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/65 to-black/30 mix-blend-multiply" aria-hidden />
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 80px 120px rgba(0,0,0,0.45), inset 0 -80px 120px rgba(0,0,0,0.25)' }} />
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 -left-8 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
        <div className="absolute bottom-0 -right-8 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full max-w-[480px] relative z-10">
        <div className="w-full bg-white rounded-[12px] border border-gray-100 shadow-lg p-6 md:p-8">
          <CardHeader className="sr-only" />

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="emailOrPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[#4A5568]">Email or Phone</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" placeholder="Enter your email or phone number" className="w-full h-[52px] text-base bg-gray-50 border border-gray-200 rounded-[10px] px-4 placeholder:text-gray-400 text-gray-900 focus:border-2 focus:border-[#0D6EFD] focus:ring-4 focus:ring-[#0D6EFD]/10 transition-all duration-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[#4A5568]">Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Enter your password" className="w-full h-[52px] text-base bg-gray-50 border border-gray-200 rounded-[10px] px-4 placeholder:text-gray-400 text-gray-900 focus:border-2 focus:border-[#0D6EFD] focus:ring-4 focus:ring-[#0D6EFD]/10 transition-all duration-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {error && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200 font-medium">
                    {error}
                  </motion.div>
                )}

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/10 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                    <h3 className="text-sm font-semibold text-gray-800">Test Accounts for Judges</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 hover:brightness-105 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1"><span className="text-xs font-semibold text-green-700">�‍🎓 LEARNER</span></div>
                          <div className="text-xs text-gray-700 space-y-0.5"><div>📧 akashthanda14@gmail.com</div><div>🔑 Ak@sh274648</div></div>
                        </div>
                        <Button type="button" size="sm" variant="outline" onClick={() => fillTestAccount('akashthanda14@gmail.com','Ak@sh274648')} className="text-xs h-7 px-2">Fill</Button>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 hover:brightness-105 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1"><span className="text-xs font-semibold text-indigo-700">🎨 CREATOR</span></div>
                          <div className="text-xs text-gray-700 space-y-0.5"><div>📧 sarah@example.com</div><div>🔑 password123</div></div>
                        </div>
                        <Button type="button" size="sm" variant="outline" onClick={() => fillTestAccount('sarah@example.com','password123')} className="text-xs h-7 px-2">Fill</Button>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 hover:brightness-105 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1"><span className="text-xs font-semibold text-red-600">�️ ADMIN</span></div>
                          <div className="text-xs text-gray-700 space-y-0.5"><div>📧 admin@microcourses.com</div><div>🔑 password123</div></div>
                        </div>
                        <Button type="button" size="sm" variant="outline" onClick={() => fillTestAccount('admin@microcourses.com','password123')} className="text-xs h-7 px-2">Fill</Button>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="text-right">
                  <Link href="/forgot-password" className="text-sm text-[#0D6EFD] hover:underline font-medium transition-colors">Forgot password?</Link>
                </div>

                <Button type="submit" className="w-full h-[52px] text-base bg-[#0D6EFD] hover:bg-[#0A58CA] text-white font-semibold rounded-[10px] shadow-[0_4px_12px_rgba(13,110,253,0.3)] hover:translate-y-[-2px] transition-all duration-200" disabled={isLoading}>
                  {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : 'Sign In'}
                </Button>
              </form>
            </Form>
          </CardContent>

          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-sm text-[#4A5568]">Don't have an account? <Link href="/register" className="text-[#0D6EFD] hover:underline font-semibold transition-colors">Sign up</Link></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

