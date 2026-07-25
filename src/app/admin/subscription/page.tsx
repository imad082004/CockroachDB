"use client";

import React from "react";
import { CreditCard, DollarSign, TrendingUp } from "lucide-react";

export default function AdminSubscriptionsPage() {
  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-emerald-500" />
            الاشتراكات والدفع
          </h1>
          <p className="text-sm text-gray-400 mt-1">إدارة الباقات (Plans)، الكوبونات، والفواتير.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-950/20 border border-emerald-900/50 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <h3 className="text-gray-400 font-bold text-sm">إيرادات هذا الشهر</h3>
          </div>
          <p className="text-4xl font-black text-white">$0.00</p>
        </div>
        
        <div className="bg-[#111] border border-gray-800 p-6 rounded-3xl">
          <h3 className="text-gray-400 font-bold text-sm mb-2">المشتركين النشطين (Premium)</h3>
          <p className="text-4xl font-black text-white">0</p>
        </div>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-3xl p-10 text-center">
        <p className="text-gray-500 text-sm">سجل المدفوعات (Stripe / PayPal Integration) سيتم عرضه هنا.</p>
      </div>
    </div>
  );
}
