"use client";

import React from "react";
import { Activity, Server, Database, Globe } from "lucide-react";

export default function AdminMonitoringPage() {
  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-400" />
            مراقبة النظام (Monitoring)
          </h1>
          <p className="text-sm text-gray-400 mt-1">مراقبة أداء السيرفرات، استهلاك الذاكرة، وقواعد البيانات في الوقت الفعلي.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "استهلاك المعالج (CPU)", value: "32%", icon: Server, color: "emerald" },
          { title: "استهلاك الذاكرة (RAM)", value: "4.2 GB", icon: Database, color: "blue" },
          { title: "الشبكة (Network I/O)", value: "1.2 Gbps", icon: Globe, color: "purple" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-[#111] border border-gray-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-bold text-sm">{stat.title}</h3>
                <Icon className={`w-5 h-5 text-${stat.color}-500`} />
              </div>
              <p className="text-3xl font-black text-white mb-2">{stat.value}</p>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className={`bg-${stat.color}-500 h-full w-[${parseInt(stat.value)}%]`}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
