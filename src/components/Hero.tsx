"use client";

import React, { useState, useEffect } from "react";
import { Play, Info, Volume2, VolumeX, Star } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";

interface HeroProps {
  item?: MediaItem;
  items?: MediaItem[];
  onOpenModal: (item: MediaItem) => void;
}

export const Hero: React.FC<HeroProps> = ({ item, items = [], onOpenModal }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { language, t } = useLanguage();

  const heroList = items.length > 0 ? items : (item ? [item] : []);

  // Auto rotate hero slide every 7 seconds
  useEffect(() => {
    if (heroList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroList.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroList.length]);

  if (heroList.length === 0) {
    return (
      <div className="relative w-full h-[85vh] min-h-[550px] max-h-[800px] bg-[#141414] flex flex-col justify-center px-4 md:px-12 overflow-hidden" dir="rtl">
        <div className="max-w-2xl space-y-4 pt-16 animate-pulse">
          <div className="h-12 w-3/4 bg-gray-800/80 rounded-xl" />
          <div className="flex gap-3">
            <div className="h-5 w-16 bg-gray-800/60 rounded" />
            <div className="h-5 w-20 bg-gray-800/60 rounded" />
            <div className="h-5 w-24 bg-gray-800/60 rounded" />
          </div>
          <div className="h-16 w-full bg-gray-800/40 rounded-xl" />
          <div className="flex gap-3 pt-2">
            <div className="h-11 w-32 bg-gray-700/80 rounded-lg" />
            <div className="h-11 w-32 bg-gray-800/60 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const currentItem = heroList[currentIndex];

  return (
    <div className="relative w-full h-[85vh] min-h-[550px] max-h-[800px] text-white overflow-hidden select-none" dir="rtl">
      {/* Background Poster with Fade & Ken Burns Zoom */}
      <div key={`bg-${currentItem.id}`} className="absolute inset-0 w-full h-full animate-hero-bg">
        <img
          src={(language === "en" ? (currentItem.originalBackdropUrl || currentItem.backdropUrl || currentItem.originalCoverUrl || currentItem.coverUrl) : (currentItem.backdropUrl || currentItem.originalBackdropUrl || currentItem.coverUrl || currentItem.originalCoverUrl)) || undefined}
          alt={language === "en" ? (currentItem.originalTitle || currentItem.title) : currentItem.title}
          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&auto=format&fit=crop&q=80"; }}
          className="w-full h-full object-cover object-center"
        />
        {/* Natural Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#141414] via-[#141414]/50 to-transparent w-full" />
      </div>

      {/* Hero Content with Smooth Text Slide-in */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 md:px-12 flex flex-col justify-center pb-20 pt-16">
        <div key={`text-${currentItem.id}`} className="max-w-2xl space-y-4 animate-hero-text">
          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-black tracking-tight drop-shadow-2xl transition-all duration-500">
            {language === "en" ? (currentItem.originalTitle || currentItem.title) : currentItem.title}
          </h1>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-sm font-semibold text-gray-300">
            <span className="bg-white text-black text-[11px] font-bold px-2 py-0.5 rounded">
              {currentItem.releaseDate}
            </span>
            <span className="border border-gray-400 px-1.5 py-0.2 text-xs rounded">+18</span>
            <span className="bg-[#e50914] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
              {currentItem.type === "movie" ? (language === "en" ? "Movie" : "فيلم") : currentItem.type === "anime" ? (language === "en" ? "Anime" : "أنمي") : (language === "en" ? "Series" : "مسلسل")}
            </span>
            <span>{language === "en" ? (currentItem.genresEn || currentItem.genres).join(" • ") : currentItem.genres.join(" • ")}</span>
          </div>

          {/* Synopsis */}
          <p className="text-sm md:text-base text-gray-200 line-clamp-3 leading-relaxed drop-shadow">
            {language === "en" ? (currentItem.descriptionEn || currentItem.description) : currentItem.description}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onOpenModal(currentItem)}
              className="flex items-center gap-2 bg-white hover:bg-white/80 text-black font-bold px-6 py-2.5 rounded text-sm md:text-base transition active:scale-95 shadow-lg"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>{t("Play")}</span>
            </button>

            <button
              onClick={() => onOpenModal(currentItem)}
              className="flex items-center gap-2 bg-gray-500/50 hover:bg-gray-500/40 text-white font-bold px-6 py-2.5 rounded text-sm md:text-base backdrop-blur-sm transition active:scale-95 shadow-lg"
            >
              <Info className="w-5 h-5" />
              <span>{t("MoreInfo")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mute Button & Slide Indicators */}
      <div className="absolute left-6 md:left-12 bottom-24 z-20 flex items-center gap-4">
        {heroList.length > 1 && (
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-2 rounded-full backdrop-blur-md border border-white/10">
            {heroList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-gray-500 hover:bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-10 h-10 rounded-full border border-gray-400/50 bg-black/40 hover:bg-black/70 flex items-center justify-center text-white transition backdrop-blur-md"
          title={isMuted ? "إلغاء الكتم" : "كتم الصوت"}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        <span className="border-x-2 border-white px-3 py-1 text-xs font-bold text-gray-300 bg-black/40 rounded backdrop-blur-md">
          {currentItem.rating} ★
        </span>
      </div>
    </div>
  );
};
