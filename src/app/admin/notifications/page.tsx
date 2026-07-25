"use client";

import React from "react";
import { Bell, Send } from "lucide-react";

export default function AdminNotificationsPage() {
  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-orange-500" />
            مركز الإشعارات
          </h1>
          <p className="text-sm text-gray-400 mt-1">إرسال إشعارات جماعية، رسائل بريد إلكتروني، وإعلانات النظام.</p>
        </div>
        <button className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-orange-600/20">
          <Send className="w-5 h-5" />
          إرسال إشعار جديد
        </button>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-3xl p-10 text-center">
        <p className="text-gray-500 text-sm">واجهة إرسال الإشعارات قيد التطوير وسيتم ربطها بـ Firebase Cloud Messaging.</p>
      </div>
    </div>
  );
}
