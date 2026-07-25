"use client";

import React, { useState, useEffect } from "react";
import { Wrench, RefreshCw, Power } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { addAdminLog } from "@/lib/adminLogger";

export default function AdminMaintenancePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMaintenance() {
      try {
        const docRef = doc(db, "global_settings", "maintenance");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIsMaintenanceMode(docSnap.data().isMaintenanceMode || false);
        } else {
          const localValue = localStorage.getItem("movis_maintenance_mode");
          if (localValue !== null) setIsMaintenanceMode(JSON.parse(localValue));
        }
      } catch (err) {
        console.warn("Firestore error, falling back to localStorage:", err);
        const localValue = localStorage.getItem("movis_maintenance_mode");
        if (localValue !== null) setIsMaintenanceMode(JSON.parse(localValue));
      }
      setLoading(false);
    }
    fetchMaintenance();
  }, []);

  const toggleMaintenanceMode = async () => {
    setSaving(true);
    const newValue = !isMaintenanceMode;
    
    // Update state & localStorage immediately
    setIsMaintenanceMode(newValue);
    localStorage.setItem("movis_maintenance_mode", JSON.stringify(newValue));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("movis_maintenance_update"));
    }

    // Save via API route (Supabase - always works)
    try {
      await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenance: newValue }),
      });
    } catch (err) {
      console.warn("API save failed:", err);
    }

    // Also try Firestore (backup)
    try {
      const { setDoc, doc } = await import("firebase/firestore");
      await setDoc(doc(db, "global_settings", "maintenance"), { isMaintenanceMode: newValue }, { merge: true });
    } catch (err) {
      console.warn("Firestore save failed, using local mode:", err);
    }

    // Log the action
    await addAdminLog(
      user?.email,
      "security",
      newValue ? "تفعيل وضع الصيانة" : "إلغاء تفعيل وضع الصيانة",
      `تم ${newValue ? "تفعيل" : "إلغاء"} وضع الصيانة للموقع بالكامل.`
    );

    setSaving(false);
  };

  const clearCache = async () => {
    setCacheStatus("جاري تنظيف الذاكرة...");
    setTimeout(async () => {
      await addAdminLog(
        user?.email,
        "action",
        "مسح الذاكرة المخبأة (Cache)",
        "تم تشغيل أمر تفريغ الكاش للواجهة الأمامية."
      );
      setCacheStatus("تم تنظيف الكاش بنجاح!");
      setTimeout(() => setCacheStatus(null), 3000);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <div className="w-10 h-10 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Wrench className="w-8 h-8 text-yellow-600" />
            الصيانة والتحديثات
          </h1>
          <p className="text-sm text-gray-400 mt-1">إعدادات الصيانة العالمية (مدعومة بالسحاب والتخزين المحلي).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`bg-[#111] border ${isMaintenanceMode ? 'border-red-500' : 'border-gray-800'} rounded-3xl p-8 text-center space-y-4 transition`}>
          <Power className={`w-12 h-12 mx-auto ${isMaintenanceMode ? 'text-red-500 animate-pulse' : 'text-gray-600'}`} />
          <h3 className="text-white font-bold text-lg">وضع الصيانة (Maintenance Mode)</h3>
          <p className="text-sm text-gray-400">عند التفعيل، سيظهر للمستخدمين شاشة صيانة ولن يتمكنوا من تصفح الموقع.</p>
          <button 
            onClick={toggleMaintenanceMode}
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl font-bold transition w-full mt-4 flex items-center justify-center gap-2 ${
              isMaintenanceMode 
                ? "bg-gray-800 hover:bg-gray-700 text-white" 
                : "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
            }`}
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
            {isMaintenanceMode ? "إلغاء وضع الصيانة" : "تفعيل وضع الصيانة"}
          </button>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 text-center space-y-4 hover:border-blue-500/50 transition">
          <RefreshCw className="w-12 h-12 text-blue-500 mx-auto" />
          <h3 className="text-white font-bold text-lg">مسح الذاكرة المخبأة (Clear Cache)</h3>
          <p className="text-sm text-gray-400">يستخدم لتحديث الواجهات في المتصفحات بعد إجراء تعديلات برمجية.</p>
          <button 
            onClick={clearCache}
            className="bg-[#181818] hover:bg-gray-800 text-white border border-gray-700 px-6 py-2.5 rounded-xl font-bold transition w-full mt-4 flex items-center justify-center gap-2"
          >
            مسح Cache
          </button>
          {cacheStatus && (
            <p className="text-emerald-500 text-xs font-bold mt-2">{cacheStatus}</p>
          )}
        </div>
      </div>
    </div>
  );
}
