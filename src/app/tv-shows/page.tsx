"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { MovieRow } from "@/components/MovieRow";
import { MediaItem } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { getTvShowsPageContent } from "@/app/actions/media";

export default function TvShowsPage() {
  const router = useRouter();
  const [series, setSeries] = useState<MediaItem[]>([]);
  const [usDrama, setUsDrama] = useState<MediaItem[]>([]);
  const [kDrama, setKDrama] = useState<MediaItem[]>([]);
  const [anime, setAnime] = useState<MediaItem[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    const loadContent = async () => {
      try {
        const content = await getTvShowsPageContent();
        if (content) {
          setSeries(content.shows);
          setUsDrama(content.usDrama);
          setKDrama(content.kDrama);
          setAnime(content.anime);
        }
      } catch (err) {
        console.error("Failed to load TV shows:", err);
      }
    };

    loadContent();
  }, []);

  const handleOpenItem = (item: MediaItem) => {
    router.push(`/title/${item.id}`);
  };

  return (
    <div className="relative min-h-screen bg-[#141414] text-white overflow-x-hidden selection:bg-[#e50914] selection:text-white">
      <Navbar />

      {/* Removed Hero component as requested */}

      <div className="relative z-20 pt-24 md:pt-32 pb-20 space-y-8">
        {series.length > 0 && (
          <MovieRow
            title={t("Series")}
            items={series.slice(1, 20)}
            onOpenModal={handleOpenItem}
          />
        )}
        
        {usDrama.length > 0 && (
          <MovieRow
            title={t("USDrama")}
            items={usDrama.slice(0, 20)}
            onOpenModal={handleOpenItem}
          />
        )}

        {kDrama.length > 0 && (
          <MovieRow
            title={t("KDrama")}
            items={kDrama.slice(0, 20)}
            onOpenModal={handleOpenItem}
          />
        )}

        {anime.length > 0 && (
          <MovieRow
            title={t("AnimeTitle")}
            items={anime.slice(0, 20)}
            onOpenModal={handleOpenItem}
          />
        )}
      </div>

      <footer className="max-w-6xl mx-auto px-4 md:px-12 py-12 text-gray-500 text-xs space-y-4 border-t border-gray-800/60" dir="rtl">
        <p>{t("FooterRights")}</p>
      </footer>
    </div>
  );
}
