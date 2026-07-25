"use client";

import React from "react";
import { Star, Plus, GripVertical } from "lucide-react";

export default function AdminFeaturedContentPage() {
  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-500" />
            المحتوى المميز (Featured)
          </h1>
          <p className="text-sm text-gray-400 mt-1">التحكم في البانر الرئيسي، ترشيحات المحررين، وقوائم الواجهة الرئيسية.</p>
        </div>
        <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-yellow-600/20">
          <Plus className="w-5 h-5" />
          إضافة قائمة جديدة
        </button>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-white font-bold flex items-center gap-2 mb-4 border-b border-gray-800 pb-4">
          <GripVertical className="w-5 h-5 text-gray-500" />
          ترتيب أقسام الصفحة الرئيسية
        </h3>
        <div className="space-y-3">
          {["البانر الرئيسي (Hero Banner)", "الأعلى مشاهدة هذا الأسبوع", "أفلام الأكشن والإثارة", "مختارات المحررين", "يضاف قريباً"].map((section, idx) => (
            <div key={idx} className="flex items-center justify-between bg-[#181818] border border-gray-800 p-4 rounded-xl hover:border-yellow-500/50 transition cursor-move">
              <span className="text-gray-300 font-bold">{section}</span>
              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">مرئي</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
