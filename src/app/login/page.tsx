"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Film, Lock, Mail, AlertCircle } from "lucide-react";
import { CaptchaPlaceholder } from "@/components/security/CaptchaPlaceholder";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithProvider } = useAuth();
  const { language, t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !captchaVerified) return;

    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError(language === "en" ? "Invalid email or password." : "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      } else {
        setError(language === "en" ? "Failed to sign in. Please try again." : "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple" | "facebook" | "github") => {
    setError(null);
    try {
      await loginWithProvider(provider);
      router.push("/");
    } catch (err: any) {
      console.error("Social login error:", err);
      setError(language === "en" ? "Failed to sign in with provider." : "فشل تسجيل الدخول باستخدام الحساب المحدد.");
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 selection:bg-[#e50914] selection:text-white" dir="rtl">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-40">
        <img
          src="https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1600&auto=format&fit=crop&q=80"
          alt="MOVIS Background"
          className="w-full h-full object-cover scale-105 filter blur-xs"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80" />
      </div>

      {/* Header Logo */}
      <div className="absolute top-8 right-8 md:right-12 z-20">
        <Link href="/" className="text-3xl font-black tracking-widest text-white uppercase hover:opacity-90 transition">
          MOVIS
        </Link>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-black/75 p-8 md:p-12 rounded-2xl border border-gray-800 shadow-2xl backdrop-blur-md space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            {t("SignInTitle")}
          </h1>
          <p className="text-xs text-gray-400">
            {language === "en" ? "Welcome back! Enter your details to access your account." : "مرحباً بعودتك! أدخل بياناتك للمتابعة والاستمتاع بالمشاهدة."}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 bg-red-950/80 border border-red-800 text-red-200 text-xs p-3.5 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-500 flex-none" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span>{t("Email")}</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@movis.com"
              className="w-full bg-[#161616] text-white text-xs px-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-white transition"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                <span>{t("Password")}</span>
              </label>
              <Link href="/forgot-password" className="text-[10px] font-bold text-red-500 hover:text-red-400 transition">
                نسيت كلمة المرور؟
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#161616] text-white text-xs px-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-white transition"
            />
          </div>

          <CaptchaPlaceholder onVerify={setCaptchaVerified} />

          <button
            type="submit"
            disabled={submitting || !captchaVerified}
            className="w-full bg-[#e50914] hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-lg active:scale-95 text-sm disabled:opacity-50 mt-2"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              t("SignIn")
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-gray-800 w-full" />
          <span className="bg-[#111111] px-3 text-[11px] text-gray-500 font-semibold absolute">
            {language === "en" ? "OR CONTINUE WITH" : "أو المتابعة باستخدام"}
          </span>
        </div>

        {/* Social Buttons Grid */}
        <div className="grid grid-cols-4 gap-2.5">
          {/* Google */}
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            className="flex items-center justify-center bg-[#181818] hover:bg-gray-800 border border-gray-800 p-3 rounded-xl transition active:scale-95"
            title="Google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.8 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.3 14.7c-.3-.8-.4-1.7-.4-2.7s.1-1.9.4-2.7L1.6 6.4C.6 8.4 0 10.1 0 12s.6 3.6 1.6 5.6l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.1-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"/>
            </svg>
          </button>

          {/* Apple */}
          <button
            type="button"
            onClick={() => handleSocialLogin("apple")}
            className="flex items-center justify-center bg-[#181818] hover:bg-gray-800 border border-gray-800 p-3 rounded-xl transition active:scale-95 text-white"
            title="Apple"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.97.99-3.12-1 .04-2.18.67-2.88 1.49-.62.72-1.16 1.88-1.01 3.01 1.12.09 2.23-.56 2.9-1.38z"/>
            </svg>
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={() => handleSocialLogin("facebook")}
            className="flex items-center justify-center bg-[#181818] hover:bg-gray-800 border border-gray-800 p-3 rounded-xl transition active:scale-95 text-[#1877F2]"
            title="Facebook"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>

          {/* GitHub */}
          <button
            type="button"
            onClick={() => handleSocialLogin("github")}
            className="flex items-center justify-center bg-[#181818] hover:bg-gray-800 border border-gray-800 p-3 rounded-xl transition active:scale-95 text-white"
            title="GitHub"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </button>
        </div>

        <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
          <span>{t("NewToMovis")}</span>
          <Link href="/signup" className="text-white hover:underline font-bold">
            {t("SignUp")}
          </Link>
        </div>
      </div>
    </div>
  );
}
