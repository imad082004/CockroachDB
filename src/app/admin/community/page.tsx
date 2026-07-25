"use client";

import React from "react";
import { MessageSquare, ShieldAlert, Trash2 } from "lucide-react";

export default function AdminCommunityPage() {
  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-blue-400" />
            إدارة التعليقات والمجتمع
          </h1>
          <p className="text-sm text-gray-400 mt-1">مراقبة التعليقات، التقييمات، والتبليغات (Reports) من المستخدمين.</p>
        </div>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-white font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            التعليقات المُبلّغ عنها (Spam Queue)
          </h3>
        </div>
        <div className="p-10 text-center">
          <p className="text-gray-500 text-sm">سيتم جلب التعليقات من (Firebase Firestore) في التحديث القادم.</p>
        </div>
      </div>
    </div>
  );
}
