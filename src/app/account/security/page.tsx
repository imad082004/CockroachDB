"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { PasswordStrength } from "@/components/security/PasswordStrength";
import { SecurityBadge } from "@/components/security/SecurityBadge";
import { Shield, Key, Smartphone, Monitor, Mail, LogOut, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SecurityDashboard() {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passkeySetup, setPasskeySetup] = useState(false);
  
  const score = twoFactorEnabled ? (passkeySetup ? 100 : 80) : 40;

  const devices = [
    { id: 1, name: "Windows PC - Chrome", location: "Casablanca, Morocco", active: true, icon: Monitor, lastActive: "الآن" },
    { id: 2, name: "iPhone 15 Pro", location: "Rabat, Morocco", active: false, icon: Smartphone, lastActive: "قبل ساعتين" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#e50914] selection:text-white" dir="rtl">
      <Navbar />

      <div className="pt-24 md:pt-32 pb-24 px-4 md:px-12 max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="border-b border-gray-800 pb-6 flex items-center gap-4">
          <Link href="/profile" className="p-2 bg-gray-900 hover:bg-gray-800 rounded-full transition">
            <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
              <span>الأمان وحماية الحساب</span>
              <SecurityBadge icon={Shield} label="مؤمن" variant="success" />
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              إدارة إعدادات الأمان، الأجهزة المسجلة، وطرق تسجيل الدخول المتقدمة.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Security Score Widget */}
          <div className="bg-[#111] p-6 rounded-3xl border border-gray-800 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className={`absolute inset-0 opacity-10 blur-3xl transition duration-500 group-hover:opacity-20 ${score > 70 ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
            
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" fill="none" stroke="#222" strokeWidth="8" />
                <circle 
                  cx="64" cy="64" r="56" fill="none" 
                  stroke={score > 70 ? "#10B981" : "#EAB308"} 
                  strokeWidth="8" 
                  strokeDasharray={351.8} 
                  strokeDashoffset={351.8 - (351.8 * score) / 100}
                  className="transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black">{score}%</span>
              </div>
            </div>
            
            <h3 className="mt-4 font-bold text-lg">مستوى الأمان</h3>
            <p className="text-xs text-gray-400 mt-1">
              {score > 70 ? "حسابك محمي بشكل ممتاز!" : "نوصي بتفعيل التحقق بخطوتين."}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#111] p-6 rounded-3xl border border-gray-800 space-y-4 relative overflow-hidden group hover:border-blue-500/50 transition">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg flex items-center justify-between">
                  التحقق بخطوتين (2FA)
                  {twoFactorEnabled && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  أضف طبقة حماية إضافية تمنع المتسللين من الدخول حتى لو عرفوا كلمة المرور.
                </p>
              </div>
              <button 
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition ${twoFactorEnabled ? 'bg-gray-800 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'}`}
              >
                {twoFactorEnabled ? "إدارة الإعدادات" : "تفعيل الآن"}
              </button>
            </div>

            <div className="bg-[#111] p-6 rounded-3xl border border-gray-800 space-y-4 relative overflow-hidden group hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg flex items-center justify-between">
                  مفاتيح المرور (Passkeys)
                  {passkeySetup && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  تسجيل دخول آمن وسريع باستخدام بصمة الإصبع أو الوجه بدون حاجة لكلمة مرور.
                </p>
              </div>
              <button 
                onClick={() => setPasskeySetup(!passkeySetup)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition ${passkeySetup ? 'bg-gray-800 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]'}`}
              >
                {passkeySetup ? "مفعل (إدارة)" : "إعداد مفتاح جديد"}
              </button>
            </div>
          </div>
        </div>

        {/* Password & Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Change Password */}
          <div className="bg-[#111] p-6 rounded-3xl border border-gray-800 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Key className="w-5 h-5 text-red-500" />
              تغيير كلمة المرور
            </h2>
            
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold">كلمة المرور الحالية</label>
                <input type="password" placeholder="••••••••" className="w-full bg-[#181818] text-white text-xs px-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-red-600" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold">كلمة المرور الجديدة</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-[#181818] text-white text-xs px-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-red-600" 
                />
                <PasswordStrength password={newPassword} />
              </div>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-red-600/20 text-sm mt-4">
                تحديث كلمة المرور
              </button>
            </form>
          </div>

          {/* Active Sessions */}
          <div className="bg-[#111] p-6 rounded-3xl border border-gray-800 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Monitor className="w-5 h-5 text-emerald-500" />
                الأجهزة النشطة
              </h2>
              <button className="text-[10px] text-red-500 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg font-bold border border-red-500/20 transition">
                تسجيل الخروج من كل الأجهزة
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {devices.map(device => {
                const IconComp = device.icon;
                return (
                  <div key={device.id} className="flex items-center justify-between bg-[#181818] p-4 rounded-2xl border border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
                        <IconComp className="w-5 h-5 text-gray-300" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          {device.name}
                          {device.active && <SecurityBadge icon={CheckCircle2} label="الجهاز الحالي" variant="success" />}
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">{device.location} • نشط {device.lastActive}</p>
                      </div>
                    </div>
                    {!device.active && (
                      <button className="text-gray-500 hover:text-red-500 transition p-2">
                        <LogOut className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
