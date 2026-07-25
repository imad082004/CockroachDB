"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Top10Row } from "@/components/Top10Row";
import { MovieRow } from "@/components/MovieRow";
import { MediaItem } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { getTrendingPageContent } from "@/app/actions/media";

export default function TrendingPage() {
  const router = useRouter();
  const [upcoming, setUpcoming] = useState<MediaItem[]>([]);
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [newReleases, setNewReleases] = useState<MediaItem[]>([]);
  const { t, language } = useLanguage();

  useEffect(() => {
    const loadContent = async () => {
      try {
        const allItems = await getTrendingPageContent();

        // Fetch Upcoming Movies from TMDB
        try {
          const tmdbLang = language === "en" ? "en-US" : "ar-SA";
          const upcomingRes = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=a3ea4c84477a77480256e85e2904c186&language=${tmdbLang}`);
          if (upcomingRes.ok) {
            const upcomingData = await upcomingRes.json();
            const today = new Date().toISOString().split("T")[0];
            const futureMovies = upcomingData.results.filter((m: any) => m.release_date && m.release_date > today);
            
            const mappedUpcoming: MediaItem[] = futureMovies.map((m: any) => ({
              id: m.id.toString(),
              tmdbId: m.id,
              title: m.title,
              originalTitle: m.original_title,
              description: m.overview,
              descriptionEn: m.overview,
              coverUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
              originalCoverUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
              backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : "",
              originalBackdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : "",
              type: "movie",
              rating: m.vote_average ? parseFloat(m.vote_average.toFixed(1)) : 0,
              releaseDate: m.release_date ? m.release_date.split("-")[0] : "",
              genres: [],
              genresEn: [],
              cast: []
            }));
            setUpcoming(mappedUpcoming);
          }
        } catch (e) {
          console.error("Error fetching upcoming:", e);
        }
        
        // Sort by rating for "Trending"
        const topRated = [...allItems].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setTrending(topRated.slice(0, 20));

        // Sort by releaseDate (or fallback to generic sort) for "New Releases"
        // Here we just shuffle them or use the first items from the API which are usually newest
        const latest = [...allItems].slice(0, 20);
        setNewReleases(latest);

      } catch (err) {
        console.error("Failed to load trending items:", err);
      }
    };

    loadContent();
  }, [language]);

  const handleOpenItem = (item: MediaItem) => {
    router.push(`/title/${item.id}`);
  };

  return (
    <div className="relative min-h-screen bg-[#141414] text-white overflow-x-hidden selection:bg-[#e50914] selection:text-white">
      <Navbar />

      {/* Removed Hero component as requested */}

      <div className="relative z-20 pt-24 md:pt-32 pb-20 space-y-8">
        {upcoming.length > 0 && (
          <MovieRow
            title={t("UpcomingMovies")}
            items={upcoming}
            onOpenModal={handleOpenItem}
          />
        )}

        {trending.length > 0 && (
          <Top10Row
            title={t("TopRatedThisWeek")}
            items={trending.slice(0, 10)}
            onOpenModal={handleOpenItem}
          />
        )}
        
        {newReleases.length > 0 && (
          <MovieRow
            title={t("NewReleases")}
            items={newReleases}
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
