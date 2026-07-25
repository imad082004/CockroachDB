"use client";

import React from "react";
import { Globe, Key, Copy, Plus } from "lucide-react";

export default function AdminApiPage() {
  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Globe className="w-8 h-8 text-indigo-400" />
            إدارة الواجهة البرمجية (API)
          </h1>
          <p className="text-sm text-gray-400 mt-1">إصدار مفاتيح API، إدارة الـ Webhooks، وتتبع الاستهلاك.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-indigo-600/20">
          <Plus className="w-5 h-5" />
          إنشاء مفتاح جديد
        </button>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-400" />
          <h3 className="text-white font-bold">مفاتيح API النشطة</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between bg-[#181818] border border-gray-800 p-4 rounded-xl">
            <div className="space-y-1 mb-4 md:mb-0">
              <p className="text-white font-bold text-sm">تطبيق الجوال (Mobile App)</p>
              <p className="text-xs text-gray-500">تم الإنشاء: 2026-07-23</p>
            </div>
            <div className="flex items-center gap-3">
              <code className="bg-black border border-gray-800 px-3 py-1.5 rounded-lg text-indigo-400 text-xs font-mono">sk_live_abc123...xyz987</code>
              <button className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition" title="نسخ المفتاح">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
