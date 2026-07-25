"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Play, Plus, Star } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";

interface MovieRowProps {
  title: string;
  items: MediaItem[];
  isWide?: boolean;
  isContinueWatching?: boolean;
  onOpenModal: (item: MediaItem) => void;
}

export const MovieRow: React.FC<MovieRowProps> = ({
  title,
  items,
  isWide = false,
  isContinueWatching = false,
  onOpenModal,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [maxScrollIndex, setMaxScrollIndex] = useState(0);
  const { language } = useLanguage();

  const itemsPerPage = isWide ? 4 : 6;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const updateScrollState = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll <= 0) {
        setMaxScrollIndex(0);
        setScrollIndex(0);
        return;
      }
      const currentPage = Math.round(Math.abs(scrollLeft) / (clientWidth * 0.75));
      setScrollIndex(Math.min(currentPage, totalPages - 1));
      setMaxScrollIndex(totalPages - 1);
    }
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [items]);

  const handleScroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;
      rowRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: "smooth" });
      setTimeout(updateScrollState, 350);
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2 px-4 md:px-10 my-6 group/row select-none" dir="rtl">
      {/* Title & Page Indicators */}
      <div className="flex items-center justify-between">
        {/* Title */}
        <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">
          {title}
        </h2>

        {/* Top Indicators Bar (Netflix Page Indicator Lines) */}
        <div className="hidden md:flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
          {Array.from({ length: Math.max(totalPages, 1) }).map((_, idx) => (
            <div
              key={idx}
              className={`h-0.5 transition-all duration-300 ${
                idx === scrollIndex
                  ? "w-4 bg-white"
                  : "w-3 bg-gray-600/60 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Right Arrow Button (Scrolls Right) */}
        <button
          onClick={() => handleScroll("right")}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-24 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center rounded-l-md opacity-0 group-hover/row:opacity-100 transition duration-300"
          title="التالي"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Left Arrow Button (Scrolls Left) */}
        <button
          onClick={() => handleScroll("left")}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-24 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center rounded-r-md opacity-0 group-hover/row:opacity-100 transition duration-300"
          title="السابق"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Scrollable Items */}
        <div
          ref={rowRef}
          onScroll={updateScrollState}
          className="flex items-center gap-3.5 overflow-x-auto no-scrollbar scroll-smooth py-3"
        >
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenModal(item)}
              className={`relative flex-none rounded-md overflow-hidden bg-gray-900 cursor-pointer group/card transition-all duration-300 hover:scale-105 hover:z-20 border border-gray-800 shadow-xl ${
                isWide
                  ? "w-[240px] md:w-[280px] h-[135px] md:h-[160px]"
                  : "w-[135px] md:w-[170px] h-[195px] md:h-[250px]"
              }`}
            >
              <img
                src={(language === "en" ? (isWide ? (item.originalBackdropUrl || item.backdropUrl) : (item.originalCoverUrl || item.coverUrl)) : (isWide ? item.backdropUrl : item.coverUrl)) || undefined}
                alt={item.title}
                onError={(e) => { (e.target as HTMLImageElement).src = isWide ? "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80" : "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&auto=format&fit=crop&q=80"; }}
                className="w-full h-full object-cover"
              />

              {/* Badge */}
              {item.badge && (
                <div className="absolute top-2 right-2 bg-[#e50914] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                  {item.badge}
                </div>
              )}

              {/* Continue Watching Bar */}
              {isContinueWatching && (
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-800">
                  <div className="h-full bg-[#e50914] w-[60%]" />
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 p-3 flex flex-col justify-end text-right">
                <div className="flex items-center gap-2 mb-2">
                  <button className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/80 transition">
                    <Play className="w-4 h-4 fill-black" />
                  </button>
                  <button className="w-8 h-8 rounded-full border border-gray-400 bg-black/40 text-white flex items-center justify-center hover:border-white transition">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-white text-xs font-bold truncate">{language === "en" ? (item.originalTitle || item.title) : item.title}</h3>
                <div className="flex items-center gap-2 text-[10px] text-gray-300 font-semibold mt-1">
                  <span className="text-amber-400 flex items-center gap-0.5 font-bold">
                    <Star className="w-3 h-3 fill-amber-400" /> {item.rating}
                  </span>
                  <span className="border border-white/20 px-1 py-0.2 rounded text-[9px]">HD</span>
                  <span>{item.releaseDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
