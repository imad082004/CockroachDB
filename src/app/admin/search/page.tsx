"use client";

import React from "react";
import { Search, TrendingUp, AlertCircle } from "lucide-react";

export default function AdminSearchManagementPage() {
  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Search className="w-8 h-8 text-blue-400" />
            إدارة محرك البحث
          </h1>
          <p className="text-sm text-gray-400 mt-1">تتبع الكلمات الأكثر بحثاً، تحسين الفهرسة (Search Index)، وإدارة الاقتراحات.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-gray-800 rounded-3xl p-6">
          <h3 className="text-white font-bold flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            الكلمات الأكثر بحثاً (Trending)
          </h3>
          <div className="space-y-3">
            {["game of thrones", "breaking bad", "أفلام أكشن 2026", "مسلسلات كورية"].map((term, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#181818] rounded-xl">
                <span className="text-gray-300 font-bold">{term}</span>
                <span className="text-xs text-gray-500">تم البحث {1000 - idx * 200} مرة</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-3xl p-6">
          <h3 className="text-white font-bold flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            عمليات بحث بدون نتائج (Failed Searches)
          </h3>
          <div className="space-y-3">
            {["avengrs 5", "مسلسل غير موجود", "asdfasdf"].map((term, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#181818] rounded-xl border border-red-900/30">
                <span className="text-gray-300">{term}</span>
                <span className="text-xs text-red-400 font-bold">0 نتيجة</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
