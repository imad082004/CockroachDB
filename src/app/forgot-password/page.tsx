"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Mail, ArrowRight, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { CaptchaPlaceholder } from "@/components/security/CaptchaPlaceholder";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !captchaVerified) return;

    setStatus("loading");
    try {
      await sendPasswordResetEmail(auth, email);
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      if (err.code === "auth/user-not-found") {
        setErrorMsg("لا يوجد حساب مسجل بهذا البريد الإلكتروني.");
      } else {
        setErrorMsg("حدث خطأ أثناء إرسال الرابط. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-[#0a0a0a] p-8 md:p-10 rounded-3xl border border-gray-800 shadow-2xl backdrop-blur-md space-y-6">
        <button 
          onClick={() => router.back()} 
          className="absolute top-6 left-6 text-gray-500 hover:text-white transition"
        >
          <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
        </button>

        {status === "success" ? (
          <div className="text-center space-y-4 py-8 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white">تم الإرسال بنجاح!</h2>
            <p className="text-sm text-gray-400 font-bold leading-relaxed">
              لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى<br/>
              <span className="text-emerald-400">{email}</span>
            </p>
            <Link href="/login" className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition mt-6">
              العودة لتسجيل الدخول
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-2 text-center">
              <div className="w-16 h-16 bg-red-600/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                <Lock className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black text-white">نسيت كلمة المرور؟</h1>
              <p className="text-xs text-gray-400 font-bold">
                أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإنشاء كلمة مرور جديدة لحسابك في MOVIS.
              </p>
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2.5 bg-red-950/80 border border-red-800 text-red-200 text-xs p-3.5 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 flex-none" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>البريد الإلكتروني</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@movis.com"
                  className="w-full bg-[#111] text-white text-xs px-4 py-3.5 rounded-xl border border-gray-800 focus:outline-none focus:border-red-600 transition"
                  dir="ltr"
                />
              </div>

              <CaptchaPlaceholder onVerify={setCaptchaVerified} />

              <button
                type="submit"
                disabled={status === "loading" || !captchaVerified}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-red-600/20 active:scale-95 text-sm disabled:opacity-50 mt-2"
              >
                {status === "loading" ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  "إرسال رابط الاستعادة"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
