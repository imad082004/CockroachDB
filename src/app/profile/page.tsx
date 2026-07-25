"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  User as UserIcon,
  Mail,
  Shield,
  Tv,
  Globe,
  Bell,
  Check,
  Smartphone,
  Laptop,
  Monitor,
  Lock,
  Sparkles,
  CreditCard,
  ArrowRight,
} from "lucide-react";

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [selectedCountry, setSelectedCountry] = useState("Morocco");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [notifications, setNotifications] = useState({
    newReleases: true,
    recommendations: true,
    securityAlerts: true,
  });

  const [devices, setDevices] = useState([
    { id: 1, name: "Windows PC - Chrome", location: "Casablanca, Morocco", active: true, icon: Laptop },
    { id: 2, name: "iPhone 15 Pro", location: "Rabat, Morocco", active: false, icon: Smartphone },
    { id: 3, name: "Samsung Smart TV 4K", location: "Living Room", active: false, icon: Monitor },
  ]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    setPasswordSuccess(true);
    setNewPassword("");
    setTimeout(() => setPasswordSuccess(false), 4000);
  };

  const removeDevice = (id: number) => {
    setDevices(devices.filter((d) => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white selection:bg-[#e50914] selection:text-white" dir="rtl">
      <Navbar />

      <div className="pt-24 md:pt-32 pb-24 px-4 md:px-12 max-w-5xl mx-auto space-y-10">
        {/* Header Title */}
        <div className="border-b border-gray-800 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black">
              {language === "en" ? "Account & Profile Settings" : "إعدادات الملف الشخصي والحساب"}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {language === "en" ? "Manage your membership, security, devices, and preferences." : "إدارة العضوية، الأمان، الأجهزة المسجلة والتفضيلات الخاصة بك."}
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-[#e50914]/10 border border-[#e50914]/30 text-[#e50914] px-4 py-2 rounded-xl text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>MOVIS Premium 4K</span>
          </div>
        </div>

        {/* 1. Avatar & Personal Info */}
        <div className="bg-[#181818] p-6 md:p-8 rounded-2xl border border-gray-800 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
            <UserIcon className="w-5 h-5 text-[#e50914]" />
            <h2 className="text-lg font-bold">
              {language === "en" ? "Profile Details & Avatar" : "تفاصيل البروفايل والصورة الشخصية"}
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Current Selected Avatar */}
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#e50914] shadow-2xl flex-none">
              <img src={selectedAvatar} alt="Profile Avatar" className="w-full h-full object-cover" />
            </div>

            {/* Avatar Selector Grid */}
            <div className="space-y-2 flex-1 text-center md:text-right">
              <span className="text-xs text-gray-400 font-semibold block">
                {language === "en" ? "Choose your Netflix Avatar:" : "اختر صورتك التعبيرية المفضلة:"}
              </span>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {AVATAR_OPTIONS.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedAvatar(imgUrl)}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition duration-200 ${
                      selectedAvatar === imgUrl
                        ? "border-[#e50914] scale-110 shadow-lg"
                        : "border-gray-800 hover:border-gray-500 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* User Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-800/80">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">{t("Name")}</label>
              <div className="bg-[#111111] px-4 py-3 rounded-xl border border-gray-800 text-sm font-bold text-white">
                {user?.displayName || "مستخدم MOVIS المميز"}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">{t("Email")}</label>
              <div className="bg-[#111111] px-4 py-3 rounded-xl border border-gray-800 text-sm font-bold text-gray-300">
                {user?.email || "user@movis.com"}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Subscription Membership */}
        <div className="bg-[#181818] p-6 md:p-8 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold">
                {language === "en" ? "Subscription & Plan Details" : "تفاصيل الاشتراك والعضوية"}
              </h2>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/30">
              {language === "en" ? "Active" : "نشط"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-[#111111] p-4 rounded-xl border border-gray-800 space-y-1">
              <span className="text-xs text-gray-500 font-semibold">{language === "en" ? "Current Plan" : "الخطة الحالية"}</span>
              <h4 className="text-sm font-extrabold text-white">MOVIS Ultra HD 4K</h4>
            </div>

            <div className="bg-[#111111] p-4 rounded-xl border border-gray-800 space-y-1">
              <span className="text-xs text-gray-500 font-semibold">{language === "en" ? "Video Quality" : "جودة البث"}</span>
              <h4 className="text-sm font-extrabold text-amber-400">4K + HDR + Dolby Atmos</h4>
            </div>

            <div className="bg-[#111111] p-4 rounded-xl border border-gray-800 space-y-1">
              <span className="text-xs text-gray-500 font-semibold">{language === "en" ? "Next Billing Date" : "تاريخ التجديد القادم"}</span>
              <h4 className="text-sm font-extrabold text-gray-300">21 August 2026</h4>
            </div>
          </div>
        </div>

        {/* 3. Preferences (Language & Country) */}
        <div className="bg-[#181818] p-6 md:p-8 rounded-2xl border border-gray-800 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
            <Globe className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold">
              {language === "en" ? "Language & Country Preferences" : "تفضيلات اللغة والدولة"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language Selector */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-semibold">{language === "en" ? "Interface Language" : "لغة واجهة المستخدم"}</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "ar" | "en")}
                className="w-full bg-[#111111] text-white text-sm px-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-white font-bold"
              >
                <option value="ar">العربية (Arabic)</option>
                <option value="en">English (US)</option>
              </select>
            </div>

            {/* Country Selector */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-semibold">{language === "en" ? "Content Region / Country" : "منطقة المحتوى / الدولة"}</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-[#111111] text-white text-sm px-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-white font-bold"
              >
                <option value="Morocco">المغرب (Morocco)</option>
                <option value="Saudi Arabia">المملكة العربية السعودية (Saudi Arabia)</option>
                <option value="UAE">الإمارات (UAE)</option>
                <option value="Egypt">مصر (Egypt)</option>
                <option value="USA">الولايات المتحدة (USA)</option>
                <option value="France">فرنسا (France)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Active Registered Devices */}
        <div className="bg-[#181818] p-6 md:p-8 rounded-2xl border border-gray-800 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
            <Tv className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold">
              {language === "en" ? "Registered Devices" : "الأجهزة المسجلة والنشطة"}
            </h2>
          </div>

          <div className="space-y-3">
            {devices.map((device) => {
              const IconComp = device.icon;
              return (
                <div
                  key={device.id}
                  className="flex items-center justify-between bg-[#111111] p-4 rounded-xl border border-gray-800/80"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-300">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {device.name}
                        {device.active && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                            {language === "en" ? "Current Session" : "الجلسة الحالية"}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{device.location}</p>
                    </div>
                  </div>

                  {!device.active && (
                    <button
                      onClick={() => removeDevice(device.id)}
                      className="text-xs text-red-500 hover:underline font-bold px-3 py-1 rounded bg-red-950/30 hover:bg-red-900/50 border border-red-800/40 transition"
                    >
                      {language === "en" ? "Sign Out Device" : "إلغاء الترخيص"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Security & Privacy Dashboards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Security Dashboard Link */}
          <Link href="/account/security" className="bg-[#181818] p-6 md:p-8 rounded-2xl border border-gray-800 flex flex-col items-center text-center space-y-4 hover:border-red-500/50 transition group shadow-xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center group-hover:scale-110 transition duration-300">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{language === "en" ? "Security Dashboard" : "لوحة التحكم بالأمان"}</h2>
              <p className="text-xs text-gray-400 mt-1">
                {language === "en" ? "Manage passwords, 2FA, and active sessions." : "إدارة كلمات المرور، التحقق بخطوتين، والأجهزة النشطة."}
              </p>
            </div>
            <span className="text-red-500 text-sm font-bold flex items-center gap-1 group-hover:underline mt-2">
              {language === "en" ? "Manage Security" : "إدارة الأمان"} <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
            </span>
          </Link>

          {/* Privacy Dashboard Link */}
          <Link href="/account/privacy" className="bg-[#181818] p-6 md:p-8 rounded-2xl border border-gray-800 flex flex-col items-center text-center space-y-4 hover:border-blue-500/50 transition group shadow-xl">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition duration-300">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{language === "en" ? "Privacy Dashboard" : "لوحة الخصوصية والبيانات"}</h2>
              <p className="text-xs text-gray-400 mt-1">
                {language === "en" ? "Manage your data, notifications, and privacy." : "إدارة بياناتك الشخصية، الإشعارات، وتفضيلات الخصوصية."}
              </p>
            </div>
            <span className="text-blue-500 text-sm font-bold flex items-center gap-1 group-hover:underline mt-2">
              {language === "en" ? "Manage Privacy" : "إدارة الخصوصية"} <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
