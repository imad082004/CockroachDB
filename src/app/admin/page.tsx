"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, Film, Tv, TrendingUp, Activity, Server, Database, 
  ArrowUpRight, ArrowDownRight, Clock
} from "lucide-react";
import { getAdminStats } from "@/app/actions/admin";

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState({
    movies: 0,
    series: 0,
    users: 0,
    revenue: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const statsData = await getAdminStats();
      setStats(statsData);
    }
    fetchStats();
  }, []);

  const cards = [
    { title: "Total Users", value: stats.users.toLocaleString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+12%", up: true },
    { title: "Total Movies", value: stats.movies.toLocaleString(), icon: Film, color: "text-red-500", bg: "bg-red-500/10", trend: "+5%", up: true },
    { title: "Total Series", value: stats.series.toLocaleString(), icon: Tv, color: "text-purple-500", bg: "bg-purple-500/10", trend: "+2%", up: true },
    { title: "Revenue (MRR)", value: `$${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "-1%", up: false },
  ];

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">Dashboard Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Live statistics and platform status.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-[#111] p-6 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{card.title}</p>
                  <h3 className="text-3xl font-black text-white mt-1">{card.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bg} ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold">
                <span className={`flex items-center gap-1 ${card.up ? 'text-emerald-500' : 'text-red-500'}`}>
                  {card.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {card.trend}
                </span>
                <span className="text-gray-500">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <div className="bg-[#111] p-6 rounded-3xl border border-gray-800 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            System Status
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-400 flex items-center gap-1"><Server className="w-3.5 h-3.5"/> CPU Usage</span>
                <span className="text-white">32%</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[32%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-400 flex items-center gap-1"><Database className="w-3.5 h-3.5"/> Storage (S3)</span>
                <span className="text-white">78%</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-full w-[78%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-[#111] p-6 rounded-3xl border border-gray-800 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Recent Content Added
          </h2>
          <div className="text-center py-10">
            <p className="text-sm text-gray-500">Activity stream will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
