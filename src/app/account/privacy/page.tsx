"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Shield, Download, Trash2, Eye, Bell, Cookie, AlertTriangle, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function PrivacyDashboard() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    analytics: true,
    marketing: false,
    publicProfile: false,
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#e50914] selection:text-white" dir="rtl">
      <Navbar />

      <div className="pt-24 md:pt-32 pb-24 px-4 md:px-12 max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-gray-800 pb-6 flex items-center gap-4">
          <Link href="/profile" className="p-2 bg-gray-900 hover:bg-gray-800 rounded-full transition">
            <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
              <span>الخصوصية والبيانات</span>
              <Shield className="w-8 h-8 text-blue-500" />
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              تحكم في بياناتك الشخصية، التفضيلات، ومستوى الخصوصية.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Data Management */}
          <div className="bg-[#111] p-6 rounded-3xl border border-gray-800 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-500" />
              إدارة البيانات
            </h2>
            
            <div className="space-y-4">
              <div className="bg-[#181818] p-4 rounded-2xl border border-gray-800">
                <h3 className="font-bold text-sm">تنزيل نسخة من بياناتك</h3>
                <p className="text-xs text-gray-400 mt-1 mb-3">احصل على نسخة بتنسيق JSON تحتوي على سجل المشاهدة وإعداداتك.</p>
                <button className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2">
                  <Download className="w-3.5 h-3.5" />
                  تنزيل البيانات (JSON)
                </button>
              </div>

              <div className="bg-red-950/20 p-4 rounded-2xl border border-red-900/30">
                <h3 className="font-bold text-sm text-red-500 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  حذف الحساب نهائياً
                </h3>
                <p className="text-xs text-gray-400 mt-1 mb-3">هذا الإجراء لا يمكن التراجع عنه. سيتم مسح كل بياناتك.</p>
                <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-red-600/20">
                  حذف حسابي
                </button>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-[#111] p-6 rounded-3xl border border-gray-800 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-500" />
              تفضيلات الخصوصية
            </h2>

            <div className="space-y-2">
              <div className="flex items-center justify-between bg-[#181818] p-4 rounded-2xl border border-gray-800">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Cookie className="w-4 h-4 text-amber-500" />
                    بيانات التحليل (Analytics)
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">مشاركة بيانات الاستخدام مجهولة المصدر لتحسين المنصة.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.analytics}
                  onChange={e => setPreferences({...preferences, analytics: e.target.checked})}
                  className="w-5 h-5 accent-red-600"
                />
              </div>

              <div className="flex items-center justify-between bg-[#181818] p-4 rounded-2xl border border-gray-800">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-500" />
                    عروض التسويق
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">استلام رسائل ترويجية حول الميزات الجديدة.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.marketing}
                  onChange={e => setPreferences({...preferences, marketing: e.target.checked})}
                  className="w-5 h-5 accent-red-600"
                />
              </div>

              <div className="flex items-center justify-between bg-[#181818] p-4 rounded-2xl border border-gray-800">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-500" />
                    بروفايل عام
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">السماح للمستخدمين الآخرين برؤية نشاطك وغرف المشاهدة.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.publicProfile}
                  onChange={e => setPreferences({...preferences, publicProfile: e.target.checked})}
                  className="w-5 h-5 accent-red-600"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
