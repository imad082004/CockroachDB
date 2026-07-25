"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Bell, ChevronDown, Globe, LogIn } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t("Home") },
    { href: "/tv-shows", label: t("Series") },
    { href: "/movies", label: t("Movies") },
    { href: "/trending", label: t("New") },
    { href: "/rooms", label: language === "en" ? "Watch Parties" : "غرف المشاهدة" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-12 py-3.5 flex items-center justify-between ${
        isScrolled
          ? "bg-[#141414]/95 backdrop-blur-sm shadow-xl"
          : "bg-gradient-to-b from-black/80 via-black/40 to-transparent"
      }`}
      dir="rtl"
    >
      {/* Right Section: MOVIS Logo + Nav Links with Active Capsule Pills */}
      <div className="flex items-center gap-8">
        {/* MOVIS Logo */}
        <Link href="/" className="text-2xl font-black tracking-widest text-white uppercase hover:opacity-90 transition">
          MOVIS
        </Link>

        {/* Nav Links with Active Capsule Pill Style */}
        <div className="hidden lg:flex items-center gap-2 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href === "/" && pathname === "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-[#333333] text-white font-bold shadow-md"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Left Section: Search, Bell & Minimalist Avatar */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="relative flex items-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            className="flex items-center"
          >
            {searchOpen && (
              <input
                type="text"
                placeholder={t("SearchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/70 text-white text-xs px-3 py-1.5 pl-8 border border-white/30 rounded focus:outline-none focus:border-white w-44 md:w-60 transition-all"
                autoFocus
              />
            )}
            <button
              type={searchOpen && searchQuery.trim() ? "submit" : "button"}
              onClick={() => {
                if (!searchOpen) {
                  setSearchOpen(true);
                } else if (searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                } else {
                  setSearchOpen(false);
                }
              }}
              className="text-white hover:text-gray-300 p-1 transition"
              title="بحث"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
          className="flex items-center gap-1 text-white hover:text-gray-300 p-1 transition font-bold text-xs"
          title="تغيير اللغة / Change Language"
        >
          <Globe className="w-5 h-5" />
          <span className="uppercase">{language}</span>
        </button>

        {/* Notification Bell */}
        <button className="relative text-white hover:text-gray-300 p-1 transition" title="الإشعارات">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Profile Avatar / Login Button */}
        {user ? (
          <div className="relative group cursor-pointer flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-red-600 border border-transparent group-hover:border-white transition flex items-center justify-center font-bold text-white uppercase text-xs shadow-md">
              {user.displayName ? user.displayName.substring(0, 2) : (user.email ? user.email.substring(0, 2) : "M")}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-white group-hover:rotate-180 transition-transform duration-200" />

            {/* Profile Dropdown */}
            <div className="absolute top-full left-0 mt-2 w-48 bg-[#141414] border border-gray-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-2 text-xs text-gray-200">
              <Link href="/profile" className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg cursor-pointer">
                <div className="w-7 h-7 rounded-md bg-[#e50914] text-white font-bold flex items-center justify-center text-xs">
                  {user.displayName ? user.displayName.substring(0, 1) : "U"}
                </div>
                <div className="overflow-hidden">
                  <span className="font-bold text-white block truncate">{user.displayName || "مستخدم MOVIS"}</span>
                  <span className="text-[10px] text-gray-400 block truncate">{user.email}</span>
                </div>
              </Link>

              <div className="h-px bg-gray-800 my-2" />

              <Link href="/profile" className="block px-2 py-1.5 hover:bg-white/5 rounded text-gray-300">
                {language === "en" ? "Account Settings" : "إعدادات الحساب والبروفايل"}
              </Link>

              {(user as any)?.role === "admin" || (user as any)?.role === "super_admin" ? (
                <Link href="/admin" className="block px-2 py-1.5 hover:bg-red-950/40 text-red-400 font-bold rounded">
                  {language === "en" ? "Admin Panel 🛡️" : "لوحة الإدارة (Admin) 🛡️"}
                </Link>
              ) : null}

              <div className="h-px bg-gray-800 my-2" />

              <button
                onClick={() => logout()}
                className="w-full text-center py-2 text-red-500 hover:bg-red-950/40 rounded-lg font-semibold transition"
              >
                {t("SignOut")}
              </button>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 bg-[#e50914] hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-md active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            <span>{t("SignIn")}</span>
          </Link>
        )}
      </div>
    </nav>
  );
};
