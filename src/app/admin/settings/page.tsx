"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, Globe, Type, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { addAdminLog } from "@/lib/adminLogger";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [siteSettings, setSiteSettings] = useState({
    siteName: "MOVIS",
    seoDescription: "أفضل منصة لمشاهدة الأفلام والمسلسلات بجودة عالية.",
    defaultLanguage: "ar",
    contactEmail: "support@movis.com"
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const docRef = doc(db, "global_settings", "site_settings");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSiteSettings(docSnap.data() as any);
        } else {
          const local = localStorage.getItem("movis_site_settings");
          if (local) setSiteSettings(JSON.parse(local));
        }
      } catch (err) {
        console.warn("Error fetching site settings, reading local cache:", err);
        const local = localStorage.getItem("movis_site_settings");
        if (local) setSiteSettings(JSON.parse(local));
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSiteSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Always save locally immediately
    localStorage.setItem("movis_site_settings", JSON.stringify(siteSettings));

    try {
      await setDoc(doc(db, "global_settings", "site_settings"), siteSettings, { merge: true });
    } catch (err) {
      console.warn("Firestore error on save, stored locally:", err);
    }

    await addAdminLog(
      user?.email,
      "action",
      "تحديث إعدادات الموقع",
      `تم تحديث إعدادات الموقع (الاسم: ${siteSettings.siteName})`
    );

    alert("تم حفظ الإعدادات بنجاح!");
    setSaving(false);
  };

  if (loading) {
    return <div className="p-10 flex justify-center"><div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-gray-400" />
            إعدادات الموقع (Site Settings)
          </h1>
          <p className="text-sm text-gray-400 mt-1">تكوين الإعدادات العامة، SEO، والخيارات الأساسية للمنصة.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-50"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
          حفظ التغييرات
        </button>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 md:p-8 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
              <Type className="w-4 h-4 text-gray-500" />
              اسم الموقع (Site Name)
            </label>
            <input 
              type="text" 
              name="siteName"
              value={siteSettings.siteName}
              onChange={handleChange}
              className="w-full bg-[#181818] border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-red-500 focus:outline-none transition"
              dir="auto"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-500" />
              اللغة الافتراضية (Default Language)
            </label>
            <select 
              name="defaultLanguage"
              value={siteSettings.defaultLanguage}
              onChange={handleChange}
              className="w-full bg-[#181818] border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-red-500 focus:outline-none transition"
            >
              <option value="ar">العربية (AR)</option>
              <option value="en">الإنجليزية (EN)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            وصف الموقع لمركات البحث (SEO Description)
          </label>
          <textarea 
            name="seoDescription"
            value={siteSettings.seoDescription}
            onChange={handleChange}
            rows={3}
            className="w-full bg-[#181818] border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-red-500 focus:outline-none transition"
            dir="auto"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            البريد الإلكتروني للتواصل (Contact Email)
          </label>
          <input 
            type="email" 
            name="contactEmail"
            value={siteSettings.contactEmail}
            onChange={handleChange}
            className="w-full bg-[#181818] border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-red-500 focus:outline-none transition text-left"
            dir="ltr"
          />
        </div>

      </div>
    </div>
  );
}
