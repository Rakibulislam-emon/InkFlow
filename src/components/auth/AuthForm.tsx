"use client";

import React, { useState } from "react";
import {
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  UserPlus,
  LogIn,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Verification email sent! Please check your inbox.");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Decorative Background Elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <Card className="relative border border-white/20 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden rounded-[2rem]">
        {/* Animated Top Border Accent */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-indigo-500 to-transparent animate-shimmer" />

        <CardHeader className="space-y-3 text-center pt-12">
          <div className="relative inline-flex mb-4 group">
            <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-16 h-16 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-300">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div className="space-y-1">
            <CardTitle className="text-4xl font-black tracking-tight bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-lg font-medium">
              {isLogin
                ? "Sign in to continue your journey"
                : "Join InkFlow and start mastering cursive"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 px-8 pb-12 pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1"
              >
                Email Address
              </Label>
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-12 h-14 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-2xl transition-all duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <Label
                  htmlFor="password"
                  className="text-sm font-bold text-slate-700 dark:text-slate-300"
                >
                  Password
                </Label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-xs text-indigo-500 hover:text-indigo-600 font-bold transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-12 h-14 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-2xl transition-all duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-lg rounded-2xl shadow-[0_10px_20px_-10px_rgba(79,70,229,0.4)] hover:shadow-[0_15px_25px_-10px_rgba(79,70,229,0.5)] active:scale-[0.98] transition-all group overflow-hidden relative"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-white/70" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isLogin ? "Sign In" : "Get Started"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent backdrop-blur-md px-4 text-slate-400 font-bold tracking-widest">
                Identity Center
              </span>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="group text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 font-bold transition-all duration-200"
            >
              {isLogin ? (
                <span className="flex items-center justify-center gap-2">
                  <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  New here?{" "}
                  <span className="text-indigo-500">Create an account</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Have an account?{" "}
                  <span className="text-indigo-500">Sign in instead</span>
                </span>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Support/Privacy */}
      <p className="text-center text-slate-400 dark:text-slate-500 text-xs mt-8 font-medium">
        Secure authentication powered by Supabase. <br className="md:hidden" />
        By continuing, you agree to our Terms of Service.
      </p>
    </div>
  );
}
