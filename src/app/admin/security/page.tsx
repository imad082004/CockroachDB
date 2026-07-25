"use client";

import React, { useState } from "react";
import { ShieldAlert, Users, Activity, Globe, ShieldCheck, Filter, AlertOctagon, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

export default function AdminSecurityDashboard() {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  React.useEffect(() => {
    async function fetchLogs() {
      let fetchedLogs: any[] = [];
      try {
        const q = query(collection(db, "admin_logs"), orderBy("createdAt", "desc"), limit(10));
        const snap = await getDocs(q);
        fetchedLogs = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            user: data.userEmail || "system",
            action: data.message,
            target: data.details,
            time: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : "قريباً",
            status: data.type === "error" ? "danger" : (data.type === "security" ? "warning" : "success"),
          };
        });
      } catch (err) {
        console.warn("Error fetching audit logs from Firestore, reading local:", err);
      }

      if (fetchedLogs.length === 0 && typeof window !== "undefined") {
        try {
          const local = JSON.parse(localStorage.getItem("movis_admin_logs") || "[]");
          fetchedLogs = local.map((log: any) => ({
            id: log.id,
            user: log.userEmail || "system",
            action: log.message,
            target: log.details,
            time: new Date(log.createdAt || Date.now()).toLocaleString(),
            status: log.type === "error" ? "danger" : (log.type === "security" ? "warning" : "success"),
          }));
        } catch (e) {}
      }

      setAuditLogs(fetchedLogs);
      setLoadingLogs(false);
    }
    fetchLogs();
  }, []);

  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            مركز الأمان للمشرفين
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            مراقبة النشاطات، إدارة الصلاحيات، وسجلات الدخول المشبوهة (Audit Logs).
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#111] p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold">محاولات مشبوهة (24h)</p>
            <h3 className="text-2xl font-black">12</h3>
          </div>
        </div>

        <div className="bg-[#111] p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold">المشرفين النشطين</p>
            <h3 className="text-2xl font-black">4</h3>
          </div>
        </div>

        <div className="bg-[#111] p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold">حالة النظام</p>
            <h3 className="text-2xl font-black text-emerald-500">مستقر</h3>
          </div>
        </div>

        <div className="bg-[#111] p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold">عناوين IP المحظورة</p>
            <h3 className="text-2xl font-black">142</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audit Logs */}
        <div className="lg:col-span-2 bg-[#111] p-6 rounded-3xl border border-gray-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-500" />
              سجل النشاطات (Audit Logs)
            </h2>
            <button className="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition">
              <Filter className="w-3.5 h-3.5" />
              تصفية
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="pb-3 font-semibold">المستخدم / النظام</th>
                  <th className="pb-3 font-semibold">الإجراء</th>
                  <th className="pb-3 font-semibold">الهدف</th>
                  <th className="pb-3 font-semibold">الوقت</th>
                  <th className="pb-3 font-semibold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {loadingLogs ? (
                  <tr><td colSpan={5} className="text-center py-4 text-gray-500">جاري التحميل...</td></tr>
                ) : auditLogs.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4 text-gray-500">لا توجد سجلات.</td></tr>
                ) : auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition">
                    <td className="py-4 font-bold text-gray-300">{log.user}</td>
                    <td className="py-4 text-gray-400">{log.action}</td>
                    <td className="py-4 font-mono text-xs text-gray-500 line-clamp-1 max-w-[200px]" title={log.target}>{log.target}</td>
                    <td className="py-4 text-gray-500 text-xs" dir="ltr">{log.time}</td>
                    <td className="py-4">
                      {log.status === "success" && <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1 w-max"><CheckCircle2 className="w-3 h-3" /> ناجح</span>}
                      {log.status === "warning" && <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-[10px] font-bold border border-yellow-500/20 flex items-center gap-1 w-max"><AlertOctagon className="w-3 h-3" /> تحذير</span>}
                      {log.status === "danger" && <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-[10px] font-bold border border-red-500/20 flex items-center gap-1 w-max"><ShieldAlert className="w-3 h-3" /> خطير</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button className="w-full text-center text-xs text-gray-400 hover:text-white font-bold transition pt-2">
            عرض كل السجلات
          </button>
        </div>

        {/* RBAC & Policies */}
        <div className="bg-[#111] p-6 rounded-3xl border border-gray-800 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            سياسات الوصول (RBAC)
          </h2>
          
          <div className="space-y-3">
            <div className="bg-[#181818] p-4 rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-red-500">Super Admin</h4>
                <p className="text-[10px] text-gray-500">صلاحيات كاملة على النظام</p>
              </div>
              <span className="text-xs font-bold">2 مستخدمين</span>
            </div>
            
            <div className="bg-[#181818] p-4 rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-blue-500">Content Editor</h4>
                <p className="text-[10px] text-gray-500">إدارة الأفلام والمسلسلات فقط</p>
              </div>
              <span className="text-xs font-bold">5 مستخدمين</span>
            </div>

            <div className="bg-[#181818] p-4 rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-emerald-500">Support Staff</h4>
                <p className="text-[10px] text-gray-500">رؤية تذاكر الدعم والرد عليها</p>
              </div>
              <span className="text-xs font-bold">8 مستخدمين</span>
            </div>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-600/20 text-xs">
            إدارة الأدوار والصلاحيات
          </button>
        </div>
      </div>
    </div>
  );
}
