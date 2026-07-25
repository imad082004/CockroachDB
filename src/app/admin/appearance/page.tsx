"use client";

import React, { useState, useEffect } from "react";
import { Paintbrush, LayoutTemplate, Palette, Check, AlertCircle } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function AdminAppearancePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [appearance, setAppearance] = useState({
    primaryColor: "#DC2626",
    bgColor: "#050505",
    logoUrl: "",
    faviconUrl: ""
  });

  useEffect(() => {
    async function fetchAppearance() {
      try {
        const docRef = doc(db, "global_settings", "appearance");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAppearance(docSnap.data() as any);
        }
      } catch (err) {
        console.error("Error fetching appearance:", err);
      }
      setLoading(false);
    }
    fetchAppearance();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await setDoc(doc(db, "global_settings", "appearance"), appearance);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "فشل حفظ الإعدادات.");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-10 flex justify-center"><div className="w-10 h-10 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Paintbrush className="w-8 h-8 text-fuchsia-500" />
            المظهر والتصميم
          </h1>
          <p className="text-sm text-gray-400 mt-1">تخصيص ألوان المنصة، الشعار، والخطوط. (محفوظة في Firebase)</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-fuchsia-600/20 disabled:opacity-50"
        >
          {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Check className="w-5 h-5" />}
          حفظ التغييرات
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-950/50 border border-red-800 text-red-400 p-4 rounded-xl text-sm font-bold">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 bg-emerald-950/50 border border-emerald-800 text-emerald-400 p-4 rounded-xl text-sm font-bold">
          <Check className="w-5 h-5" /> تم الحفظ بنجاح!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 space-y-6">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Palette className="w-5 h-5 text-fuchsia-500" />
            ألوان المنصة
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-bold mb-2 block">اللون الرئيسي (Primary Color)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={appearance.primaryColor} 
                  onChange={e => setAppearance({...appearance, primaryColor: e.target.value})}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0" 
                />
                <input 
                  type="text" 
                  value={appearance.primaryColor} 
                  onChange={e => setAppearance({...appearance, primaryColor: e.target.value})}
                  className="bg-[#181818] border border-gray-800 rounded-lg px-4 py-2 text-sm text-white" 
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-bold mb-2 block">لون الخلفية (Background Color)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={appearance.bgColor} 
                  onChange={e => setAppearance({...appearance, bgColor: e.target.value})}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0" 
                />
                <input 
                  type="text" 
                  value={appearance.bgColor} 
                  onChange={e => setAppearance({...appearance, bgColor: e.target.value})}
                  className="bg-[#181818] border border-gray-800 rounded-lg px-4 py-2 text-sm text-white" 
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 space-y-6">
          <h3 className="text-white font-bold flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-fuchsia-500" />
            الشعار والأيقونات (روابط)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-bold mb-2 block">رابط الشعار (Logo URL)</label>
              <input 
                type="url" 
                value={appearance.logoUrl} 
                onChange={e => setAppearance({...appearance, logoUrl: e.target.value})}
                placeholder="https://example.com/logo.png"
                className="w-full bg-[#181818] border border-gray-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-fuchsia-500" 
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-bold mb-2 block">رابط الأيقونة المصغرة (Favicon URL)</label>
              <input 
                type="url" 
                value={appearance.faviconUrl} 
                onChange={e => setAppearance({...appearance, faviconUrl: e.target.value})}
                placeholder="https://example.com/favicon.ico"
                className="w-full bg-[#181818] border border-gray-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-fuchsia-500" 
                dir="ltr"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
