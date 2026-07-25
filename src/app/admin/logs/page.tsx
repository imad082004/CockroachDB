"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";

interface LogEntry {
  id: string;
  type: "error" | "security" | "info" | "action";
  message: string;
  details: string;
  createdAt: any;
  userEmail?: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      let data: LogEntry[] = [];
      try {
        const q = query(collection(db, "admin_logs"), orderBy("createdAt", "desc"), limit(50));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as LogEntry);
        });
      } catch (err) {
        console.warn("Error fetching logs from Firestore, reading local cache:", err);
      }

      if (data.length === 0 && typeof window !== "undefined") {
        try {
          const local = JSON.parse(localStorage.getItem("movis_admin_logs") || "[]");
          data = local;
        } catch (e) {}
      }

      setLogs(data);
      setLoading(false);
    };
    
    fetchLogs();
  }, []);

  const getLogIcon = (type: string) => {
    switch (type) {
      case "security": return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "error": return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "action": return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getLogBg = (type: string) => {
    switch (type) {
      case "security": return "bg-red-950/20 border-red-900/50";
      case "error": return "bg-orange-950/20 border-orange-900/50";
      case "action": return "bg-emerald-950/20 border-emerald-900/50";
      default: return "bg-[#181818] border-gray-800";
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            سجلات النظام (Logs)
          </h1>
          <p className="text-sm text-gray-400 mt-1">سجلات مسحوبة من السحاب والتخزين المحلي.</p>
        </div>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-4 bg-[#181818] border-b border-gray-800 flex gap-4 overflow-x-auto scrollbar-hide">
          <button className="text-sm font-bold text-white border-b-2 border-red-500 pb-2 whitespace-nowrap">كل السجلات (All)</button>
        </div>
        
        {loading ? (
          <div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500 text-sm">لا توجد سجلات حالياً في قاعدة البيانات.</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {logs.map((log) => (
              <div key={log.id} className={`flex items-start gap-4 p-4 border rounded-xl ${getLogBg(log.type)}`}>
                <div className="shrink-0 mt-0.5">{getLogIcon(log.type)}</div>
                <div>
                  <p className="text-sm text-white font-bold">{log.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                  {log.userEmail && (
                    <p className="text-[10px] bg-black/40 px-2 py-1 rounded inline-block mt-2 text-gray-400">بواسطة: {log.userEmail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
