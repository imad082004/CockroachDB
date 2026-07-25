"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Film, Tv, Users, Settings, TrendingUp, ShieldAlert,
  Image as ImageIcon, Database, Globe, MessageSquare, Bell, Star, 
  Bot, Search, Paintbrush, ShieldCheck, Download, HardDrive, 
  Activity, CreditCard, LifeBuoy, Wrench, Menu, X, ChevronDown, ChevronUp
} from "lucide-react";

const MENU_GROUPS = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
      { name: "Analytics", icon: TrendingUp, path: "/admin/analytics" },
    ]
  },
  {
    title: "Content & Media",
    items: [
      { name: "Movies", icon: Film, path: "/admin/content/movies" },
      { name: "TV Shows", icon: Tv, path: "/admin/content/series" },
      { name: "Media Library", icon: ImageIcon, path: "/admin/media" },
      { name: "Metadata", icon: Database, path: "/admin/metadata" },
      { name: "Featured Content", icon: Star, path: "/admin/featured" },
    ]
  },
  {
    title: "Community & Users",
    items: [
      { name: "User Management", icon: Users, path: "/admin/users" },
      { name: "Community & Reviews", icon: MessageSquare, path: "/admin/community" },
      { name: "Notifications", icon: Bell, path: "/admin/notifications" },
      { name: "Subscriptions", icon: CreditCard, path: "/admin/subscription" },
    ]
  },
  {
    title: "System & Tools",
    items: [
      { name: "AI Center", icon: Bot, path: "/admin/ai" },
      { name: "Search Management", icon: Search, path: "/admin/search" },
      { name: "Import & Export", icon: Download, path: "/admin/import-export" },
      { name: "Storage & Streaming", icon: HardDrive, path: "/admin/storage" },
    ]
  },
  {
    title: "Configuration",
    items: [
      { name: "Appearance", icon: Paintbrush, path: "/admin/appearance" },
      { name: "Site Settings", icon: Settings, path: "/admin/settings" },
      { name: "Security & Roles", icon: ShieldCheck, path: "/admin/security" },
      { name: "API & Webhooks", icon: Globe, path: "/admin/api" },
    ]
  },
  {
    title: "Maintenance",
    items: [
      { name: "Monitoring", icon: Activity, path: "/admin/monitoring" },
      { name: "Logs", icon: ShieldAlert, path: "/admin/logs" },
      { name: "Maintenance", icon: Wrench, path: "/admin/maintenance" },
      { name: "Support", icon: LifeBuoy, path: "/admin/support" },
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  // For mobile overlay
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-red-600 text-white rounded-lg shadow-xl"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[#0a0a0a] border-r border-gray-800 transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"}
          ${isOpen ? "lg:w-72" : "lg:w-20"}
        `}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800 bg-[#111]">
          {isOpen && (
            <Link href="/admin" className="text-2xl font-black text-red-600 tracking-widest uppercase">
              MOVIS <span className="text-white text-xs tracking-normal">Admin</span>
            </Link>
          )}
          <button 
            className="hidden lg:block text-gray-400 hover:text-white transition"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Scrollable Menu */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {MENU_GROUPS.map((group, idx) => (
            <div key={idx} className="mb-6">
              {isOpen && (
                <h3 className="px-6 mb-2 text-[10px] font-black text-gray-500 uppercase tracking-wider">
                  {group.title}
                </h3>
              )}
              <ul className="space-y-1 px-3">
                {group.items.map((item, itemIdx) => {
                  const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
                  const Icon = item.icon;
                  return (
                    <li key={itemIdx}>
                      <Link 
                        href={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                          ${isActive ? "bg-red-600/10 text-red-500 font-bold" : "text-gray-400 hover:bg-gray-800 hover:text-white"}
                        `}
                        title={!isOpen ? item.name : ""}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? "text-red-500" : "text-gray-500 group-hover:text-white"}`} />
                        {isOpen && <span className="text-sm">{item.name}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#111]">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition">
            <Globe className="w-5 h-5" />
            {isOpen && <span className="text-sm font-bold">العودة للموقع</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
