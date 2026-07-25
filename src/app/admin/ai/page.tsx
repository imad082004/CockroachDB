"use client";

import React from "react";
import { Bot, Sparkles, Settings } from "lucide-react";

export default function AdminAICenterPage() {
  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Bot className="w-8 h-8 text-cyan-500" />
            مركز الذكاء الاصطناعي (AI Center)
          </h1>
          <p className="text-sm text-gray-400 mt-1">إعدادات الترشيحات الذكية، التوليد التلقائي للوصف، وفلترة التعليقات بالـ AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111] p-6 rounded-3xl border border-gray-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-500" />
              توليد الوصف التلقائي (Auto Description)
            </h3>
            <div className="w-12 h-6 bg-gray-800 rounded-full relative cursor-pointer">
              <div className="w-4 h-4 bg-gray-400 rounded-full absolute top-1 right-1"></div>
            </div>
          </div>
          <p className="text-sm text-gray-400">تفعيل هذه الميزة سيسمح للنظام بكتابة وصف دقيق للأفلام والمسلسلات تلقائياً باستخدام OpenAI.</p>
        </div>

        <div className="bg-[#111] p-6 rounded-3xl border border-gray-800 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-500" />
              محرك التوصيات الذكي (AI Recommendations)
            </h3>
            <div className="w-12 h-6 bg-gray-800 rounded-full relative cursor-pointer">
              <div className="w-4 h-4 bg-gray-400 rounded-full absolute top-1 right-1"></div>
            </div>
          </div>
          <p className="text-sm text-gray-400">استخدام الذكاء الاصطناعي لاقتراح أفلام مشابهة بناءً على سلوك المشاهدة بدلاً من الاعتماد على التصنيف فقط.</p>
        </div>
      </div>
    </div>
  );
}
