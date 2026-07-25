"use client";

import React from "react";
import { Download, Upload, Database } from "lucide-react";

export default function AdminImportExportPage() {
  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Download className="w-8 h-8 text-teal-500" />
            الاستيراد والتصدير
          </h1>
          <p className="text-sm text-gray-400 mt-1">استيراد الأفلام من TMDB أو تصدير قاعدة البيانات كنسخة احتياطية.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111] p-8 rounded-3xl border border-gray-800 flex flex-col items-center justify-center text-center space-y-4 hover:border-teal-500/50 transition">
          <Upload className="w-12 h-12 text-teal-500" />
          <h3 className="text-white font-bold text-lg">استيراد من TMDB</h3>
          <p className="text-gray-400 text-sm">جلب بيانات الأفلام والمسلسلات (القصة، التقييم، البوسترات) باستخدام ID فقط.</p>
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl font-bold transition w-full mt-4">البدء</button>
        </div>

        <div className="bg-[#111] p-8 rounded-3xl border border-gray-800 flex flex-col items-center justify-center text-center space-y-4 hover:border-blue-500/50 transition">
          <Database className="w-12 h-12 text-blue-500" />
          <h3 className="text-white font-bold text-lg">تصدير قاعدة البيانات</h3>
          <p className="text-gray-400 text-sm">تنزيل نسخة من جدول الأفلام، المسلسلات، والمستخدمين بصيغة CSV أو JSON.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold transition w-full mt-4">تصدير البيانات</button>
        </div>
      </div>
    </div>
  );
}
