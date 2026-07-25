"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Wrench, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export const MaintenanceGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { language } = useLanguage();
  // null = still checking
  const [isMaintenance, setIsMaintenance] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkMaintenance() {
      try {
        // Fetch from our own API route (server-side, always works)
        const res = await fetch("/api/maintenance", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const val = data.maintenance === true;
          setIsMaintenance(val);
          localStorage.setItem("movis_maintenance_mode", JSON.stringify(val));
          return;
        }
      } catch (e) {
        console.warn("API maintenance check failed, falling back to localStorage");
      }

      // Fallback: localStorage
      const localVal = localStorage.getItem("movis_maintenance_mode");
      if (localVal !== null) {
        try {
          setIsMaintenance(JSON.parse(localVal));
        } catch {
          setIsMaintenance(false);
        }
      } else {
        setIsMaintenance(false);
      }
    }

    checkMaintenance();

    // Listen to cross-tab storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "movis_maintenance_mode" && e.newValue !== null) {
        try {
          setIsMaintenance(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Listen to same-tab updates from admin panel
    const handleCustomEvent = () => {
      checkMaintenance();
    };
    window.addEventListener("movis_maintenance_update", handleCustomEvent);

    // Poll every 30 seconds to pick up changes made in admin
    const interval = setInterval(checkMaintenance, 30000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("movis_maintenance_update", handleCustomEvent);
      clearInterval(interval);
    };
  }, []);

  // Allow access to admin pages and login page regardless of maintenance mode
  const isAdminPath = pathname?.startsWith("/admin") || pathname?.startsWith("/login");
  const isAdminUser = (user as any)?.role === "admin" || (user as any)?.role === "super_admin";

  // Still checking — show minimal loader to avoid flash of site content
  if (isMaintenance === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Maintenance is ON, user is NOT admin, NOT on admin/login page
  if (isMaintenance && !isAdminPath && !isAdminUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center selection:bg-red-600 selection:text-white relative overflow-hidden" dir="rtl">
        {/* Animated background glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

        <div className="relative z-10 max-w-lg space-y-6 bg-[#111] p-8 md:p-12 rounded-3xl border border-gray-800/80 shadow-2xl backdrop-blur-xl">
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 font-black tracking-widest text-xs uppercase">
            MOVIS PLATFORM
          </div>

          {/* Animated Icon */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-yellow-500/20 to-red-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-500 shadow-xl shadow-yellow-500/5">
            <Wrench className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tight text-white">
              {language === "en" ? "System Under Maintenance" : "الموقع حالياً قيد الصيانة والتحديث"}
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              {language === "en"
                ? "We are performing scheduled maintenance and performance upgrades to provide you with the best streaming experience. We'll be back online shortly!"
                : "نقوم حالياً بإجراء تحديثات وتحسينات هامة للأنظمة وضمان أفضل جودة لمشاهدة الأفلام والمسلسلات. سنعود للعمل خلال وقت قصير!"}
            </p>
          </div>

          {/* Live Pulse Badge */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-yellow-400 font-medium bg-yellow-950/30 border border-yellow-800/30 py-2.5 px-4 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
            <span>{language === "en" ? "Auto-refreshing status..." : "جاري تحديث الحالة تلقائياً..."}</span>
          </div>

          {/* Admin Login Link */}
          <div className="pt-4 border-t border-gray-800/60">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-white transition font-medium"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{language === "en" ? "Admin Access" : "دخول المشرفين (Admin)"}</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="absolute bottom-6 text-xs text-gray-600">
          © {new Date().getFullYear()} MOVIS. All rights reserved.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Admin banner when maintenance is active */}
      {isMaintenance && isAdminUser && !isAdminPath && (
        <div className="bg-red-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 relative z-[100] shadow-lg">
          <Wrench className="w-4 h-4 animate-spin" />
          <span>وضع الصيانة مفعّل حالياً للمستخدمين العاديين. أنت تتصفح الموقع بصلاحية مشرف (Admin Bypass).</span>
        </div>
      )}
      {children}
    </>
  );
};
