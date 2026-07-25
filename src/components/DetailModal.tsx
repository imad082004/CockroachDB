"use client";

import React, { useState } from "react";
import { X, Play, Plus, ThumbsUp, Star, Film, Tv, Globe, Monitor } from "lucide-react";
import { MediaItem } from "@/lib/types";

interface DetailModalProps {
  item: MediaItem | null;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ item, onClose }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "player" | "episodes">("overview");
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [serverIndex, setServerIndex] = useState<number>(0);

  if (!item) return null;

  const tmdbId = item.tmdbId || item.id;
  const isTV = item.type === "tv" || item.type === "anime";

  const servers = [
    {
      name: "سيرفر 1 (AutoEmbed)",
      url: isTV
        ? `https://player.autoembed.cc/embed/tv/${tmdbId}/${selectedSeason}/${selectedEpisode}`
        : `https://player.autoembed.cc/embed/movie/${tmdbId}`,
    },
    {
      name: "سيرفر 2 (VidSrc VIP)",
      url: isTV
        ? `https://vidsrc.icu/embed/tv/${tmdbId}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.icu/embed/movie/${tmdbId}`,
    },
    {
      name: "سيرفر 3 (2Embed HD)",
      url: isTV
        ? `https://www.2embed.cc/embedtv/${tmdbId}&s=${selectedSeason}&e=${selectedEpisode}`
        : `https://www.2embed.cc/embed/${tmdbId}`,
    },
  ];

  const displayDescription =
    item.description && item.description !== "لا يتوفر وصف لهذا الفيلم حالياً." && item.description.trim().length > 0
      ? item.description
      : item.descriptionEn || "لا يتوفر وصف تفصيلي لهذا العمل حالياً.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
      dir="rtl"
    >
      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-[#181818] rounded-xl overflow-hidden shadow-2xl border border-gray-800 text-white my-auto max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-40 w-10 h-10 rounded-full bg-black/70 hover:bg-white/20 text-white flex items-center justify-center transition border border-white/20"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Backdrop & Video Preview Area */}
        <div className="relative w-full h-[280px] sm:h-[360px] md:h-[420px] flex-none">
          {activeTab === "player" ? (
            <div className="w-full h-full bg-black relative">
              <iframe
                src={servers[serverIndex].url}
                className="w-full h-full border-0"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
              />
            </div>
          ) : (
            <>
              <img
                src={(language === "en" ? (item.originalBackdropUrl || item.backdropUrl) : item.backdropUrl) || undefined}
                alt={item.title}
                onError={(e) => { (e.target as HTMLImageElement).src = (item.coverUrl || item.originalCoverUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&auto=format&fit=crop&q=80"); }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-black/40 to-black/30" />

              {/* Overlaid Title & Quick Action Bar */}
              <div className="absolute bottom-6 right-6 left-6 space-y-3 z-20">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-black drop-shadow-lg tracking-tight">
                    {item.title}
                  </h2>
                  {item.originalTitle && item.originalTitle !== item.title && (
                    <p className="text-gray-300 text-xs sm:text-sm font-semibold tracking-wider opacity-90">
                      {item.originalTitle}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab("player")}
                    className="flex items-center gap-2 bg-white hover:bg-white/80 text-black font-extrabold px-6 py-2.5 rounded-md text-sm md:text-base transition active:scale-95 shadow-xl"
                  >
                    <Play className="w-5 h-5 fill-black" />
                    <span>تشغيل الآن</span>
                  </button>

                  {isTV && (
                    <button
                      onClick={() => setActiveTab("episodes")}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-bold transition backdrop-blur-md border ${
                        activeTab === "episodes"
                          ? "bg-white text-black border-white"
                          : "bg-black/60 hover:bg-black/80 text-white border-white/30"
                      }`}
                    >
                      <Tv className="w-4 h-4" />
                      <span>الحلقات والمواسم</span>
                    </button>
                  )}

                  <button className="w-10 h-10 rounded-full border border-gray-400 bg-black/50 hover:border-white text-white flex items-center justify-center transition">
                    <Plus className="w-5 h-5" />
                  </button>

                  <button className="w-10 h-10 rounded-full border border-gray-400 bg-black/50 hover:border-white text-white flex items-center justify-center transition">
                    <ThumbsUp className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 px-6 border-b border-gray-800 text-sm font-bold text-gray-400 bg-[#141414]">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 transition border-b-2 ${
              activeTab === "overview" ? "text-white border-white" : "border-transparent hover:text-white"
            }`}
          >
            نظرة عامة
          </button>

          <button
            onClick={() => setActiveTab("player")}
            className={`py-3 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === "player" ? "text-white border-white" : "border-transparent hover:text-white"
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>مشغّل الفيديو السريع</span>
          </button>

          {isTV && (
            <button
              onClick={() => setActiveTab("episodes")}
              className={`py-3 transition border-b-2 flex items-center gap-1.5 ${
                activeTab === "episodes" ? "text-white border-white" : "border-transparent hover:text-white"
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>الحلقات والمواسم</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-gray-300">
                <span className="text-emerald-400 font-bold">{Math.round(item.rating * 10)}% مطابقة</span>
                <span className="border border-gray-600 px-2 py-0.5 rounded text-xs">{item.releaseDate}</span>
                <span className="border border-gray-600 px-1.5 py-0.2 rounded text-[10px] uppercase font-bold">
                  Ultra HD 4K
                </span>
                <span className="bg-[#e50914] text-white text-[11px] font-bold px-2 py-0.5 rounded uppercase">
                  {item.type === "tv" ? "مسلسل" : item.type === "anime" ? "أنمي" : "فيلم"}
                </span>
                <span className="text-amber-400 flex items-center gap-1 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" /> {item.rating} / 10
                </span>
              </div>

              {/* Overview Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-base font-bold text-white">قصة العمل:</h3>
                  <p className="text-gray-200 text-sm md:text-base leading-relaxed">{displayDescription}</p>
                </div>

                <div className="space-y-3 text-xs text-gray-300 border-r border-gray-800 pr-4">
                  <div>
                    <span className="text-gray-500 font-bold ml-1">التصنيفات:</span>
                    <span className="text-white font-medium">{item.genres.join(" • ")}</span>
                  </div>

                  {item.originalTitle && (
                    <div>
                      <span className="text-gray-500 font-bold ml-1">الاسم الأصلي:</span>
                      <span className="text-white font-medium">{item.originalTitle}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-gray-500 font-bold ml-1">اللغة الصوتية:</span>
                    <span className="text-white font-medium">النسخة الأصلية + مترجم/مدبلج</span>
                  </div>

                  <div>
                    <span className="text-gray-500 font-bold ml-1">السيرفرات المتاحة:</span>
                    <span className="text-emerald-400 font-medium">3 سيرفرات عالية السرعة</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PLAYER TAB */}
          {activeTab === "player" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111111] p-3 rounded-lg border border-gray-800">
                <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-400" /> اختر السيرفر المناسب لمشاهدة خالية من التقطيع:
                </span>

                <div className="flex items-center gap-2">
                  {servers.map((server, idx) => (
                    <button
                      key={idx}
                      onClick={() => setServerIndex(idx)}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                        serverIndex === idx
                          ? "bg-white text-black shadow"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {server.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* EPISODES TAB (For TV & Anime) */}
          {activeTab === "episodes" && isTV && (
            <div className="space-y-4">
              {/* Season Selector */}
              <div className="flex items-center justify-between bg-[#111111] p-3 rounded-lg border border-gray-800">
                <span className="text-xs font-bold text-gray-300">الموسم:</span>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="bg-black text-white text-xs px-3 py-1.5 rounded border border-gray-700 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5].map((s) => (
                    <option key={s} value={s}>
                      الموسم {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Episodes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Array.from({ length: 12 }).map((_, idx) => {
                  const epNum = idx + 1;
                  const isSelected = selectedEpisode === epNum;
                  return (
                    <button
                      key={epNum}
                      onClick={() => {
                        setSelectedEpisode(epNum);
                        setActiveTab("player");
                      }}
                      className={`p-3 rounded-lg border text-right transition flex flex-col justify-between ${
                        isSelected
                          ? "bg-white text-black border-white font-bold"
                          : "bg-[#111111] hover:bg-gray-800 border-gray-800 text-gray-200"
                      }`}
                    >
                      <span className="text-xs font-bold">الحلقة {epNum}</span>
                      <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                        <Play className="w-3 h-3 fill-current" /> 45 دقيقة
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
