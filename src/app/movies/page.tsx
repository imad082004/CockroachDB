"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { MovieRow } from "@/components/MovieRow";
import { MediaItem } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { getMoviesPageContent } from "@/app/actions/media";

export default function MoviesPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [actionMovies, setActionMovies] = useState<MediaItem[]>([]);
  const [comedyMovies, setComedyMovies] = useState<MediaItem[]>([]);
  const [dramaMovies, setDramaMovies] = useState<MediaItem[]>([]);
  const [scifiMovies, setScifiMovies] = useState<MediaItem[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    const loadContent = async () => {
      try {
        const content = await getMoviesPageContent();
        if (content) {
          setMovies(content.movies);
          setActionMovies(content.actionMovies);
          setComedyMovies(content.comedyMovies);
          setDramaMovies(content.dramaMovies);
          setScifiMovies(content.scifiMovies);
        }
      } catch (err) {
        console.error("Failed to load movies:", err);
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
        {movies.length > 0 && (
          <MovieRow
            title={t("LatestMovies")}
            items={movies.slice(1, 20)}
            onOpenModal={handleOpenItem}
          />
        )}
        
        {actionMovies.length > 0 && (
          <MovieRow
            title={t("ActionMovies")}
            items={actionMovies.slice(0, 20)}
            onOpenModal={handleOpenItem}
          />
        )}

        {comedyMovies.length > 0 && (
          <MovieRow
            title={t("ComedyMovies")}
            items={comedyMovies.slice(0, 20)}
            onOpenModal={handleOpenItem}
          />
        )}

        {dramaMovies.length > 0 && (
          <MovieRow
            title={t("DramaMovies")}
            items={dramaMovies.slice(0, 20)}
            onOpenModal={handleOpenItem}
          />
        )}
        
        {scifiMovies.length > 0 && (
          <MovieRow
            title={t("SciFiMovies")}
            items={scifiMovies.slice(0, 20)}
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
