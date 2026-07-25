"use client";

import React from "react";
import { TrendingUp } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="p-6 md:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-emerald-600" />
          Platform Analytics
        </h1>
        <p className="text-sm text-gray-400 mt-1">Content analytics, user demographics, and revenue tracking.</p>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-3xl p-10 text-center">
        <p className="text-gray-400 text-sm">Charts and Analytics Dashboard will be implemented here.</p>
      </div>
    </div>
  );
}
