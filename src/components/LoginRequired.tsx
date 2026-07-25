"use client";

import React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

export function LoginRequired() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="bg-[#181818] border border-gray-800 p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl">
        <div className="w-20 h-20 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">تسجيل الدخول مطلوب</h2>
          <p className="text-sm text-gray-400 font-bold">عذراً، يجب أن يكون لديك حساب مسجل لتتمكن من المشاهدة.</p>
        </div>
        <Link href="/login" className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition">
          تسجيل الدخول الآن
        </Link>
        <Link href="/" className="block w-full bg-transparent text-gray-400 hover:text-white font-bold py-3.5 transition">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
