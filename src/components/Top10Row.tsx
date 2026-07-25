"use client";

import React, { useRef } from "react";
import { ChevronRight, ChevronLeft, Star } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";

interface Top10RowProps {
  title: string;
  items: MediaItem[];
  onOpenModal: (item: MediaItem) => void;
}

export const Top10Row: React.FC<Top10RowProps> = ({ title, items, onOpenModal }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  const handleScroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      rowRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4 px-4 md:px-12 my-8 group/row select-none" dir="rtl">
      {/* Title Header */}
      <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
        {title}
      </h2>

      {/* Carousel Container */}
      <div className="relative">
        <button
          onClick={() => handleScroll("right")}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-24 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center rounded-l-md opacity-0 group-hover/row:opacity-100 transition duration-300"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        <button
          onClick={() => handleScroll("left")}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-24 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center rounded-r-md opacity-0 group-hover/row:opacity-100 transition duration-300"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <div
          ref={rowRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-4 pr-2"
        >
          {items.slice(0, 10).map((item, index) => (
            <div
              key={item.id}
              onClick={() => onOpenModal(item)}
              className="relative flex-none w-[190px] md:w-[230px] flex items-center cursor-pointer group hover:scale-105 transition-transform duration-300"
            >
              {/* Clean 3D Rank Number */}
              <div className="top-10-rank-number -ml-4 z-0 pointer-events-none transform translate-x-3">
                {index + 1}
              </div>

              {/* Clean Card */}
              <div className="relative w-[120px] md:w-[150px] h-[170px] md:h-[210px] rounded-md overflow-hidden z-10 border border-gray-800 bg-gray-900 shadow-xl group-hover/card:shadow-2xl transition">
                <img
                  src={(language === "en" ? (item.originalCoverUrl || item.coverUrl) : item.coverUrl) || undefined}
                  alt={item.title}
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&auto=format&fit=crop&q=80"; }}
                  className="w-full h-full object-cover"
                />

                {/* Rating Badge */}
                <div className="absolute top-2 right-2 bg-black/80 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-400/30 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400" /> {item.rating}
                </div>

                {/* White Badge */}
                {item.badge && (
                  <div className="absolute bottom-2 right-2 bg-white text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                    {item.badge}
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3 flex flex-col justify-end text-right">
                  <h3 className="text-white text-xs font-bold truncate">{item.title}</h3>
                  <p className="text-gray-300 text-[10px] mt-1">{item.genres.slice(0, 2).join(" • ")}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
