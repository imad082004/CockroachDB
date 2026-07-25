"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import { Mail, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // If no user or if already verified, redirect.
    if (user && user.emailVerified) {
      router.push("/");
    }
  }, [user, router]);

  const handleResend = async () => {
    if (!auth.currentUser) return;
    setStatus("loading");
    try {
      await sendEmailVerification(auth.currentUser);
      setStatus("sent");
    } catch (err: any) {
      setStatus("error");
      if (err.code === "auth/too-many-requests") {
        setErrorMsg("لقد تجاوزت الحد المسموح. يرجى المحاولة لاحقاً.");
      } else {
        setErrorMsg("حدث خطأ أثناء إرسال الرابط.");
      }
    }
  };

  if (!user) return null; // Or a loading spinner

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4" dir="rtl">
      <div className="relative z-10 w-full max-w-md bg-[#0a0a0a] p-8 md:p-10 rounded-3xl border border-gray-800 shadow-2xl backdrop-blur-md space-y-6 text-center">
        
        <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
          <Mail className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-black text-white">تأكيد البريد الإلكتروني</h1>
          <p className="text-xs text-gray-400 font-bold leading-relaxed">
            لقد أرسلنا رابط تفعيل إلى بريدك الإلكتروني<br/>
            <span className="text-blue-400 block mt-1">{user.email}</span>
          </p>
          <p className="text-[10px] text-gray-500">
            يرجى التحقق من صندوق الوارد (أو مجلد الرسائل المزعجة) والضغط على الرابط لتفعيل حسابك ومواصلة المشاهدة.
          </p>
        </div>

        {status === "sent" && (
          <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>تم إعادة إرسال الرابط بنجاح!</span>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center justify-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-xs font-bold">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="pt-4 flex flex-col gap-3">
          <button
            onClick={handleResend}
            disabled={status === "loading" || status === "sent"}
            className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-xl border border-gray-800 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
            <span>إعادة إرسال الرابط</span>
          </button>
          
          <Link href="/" className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-red-600/20">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
