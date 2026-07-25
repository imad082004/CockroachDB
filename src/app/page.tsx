"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Top10Row } from "@/components/Top10Row";
import { MovieRow } from "@/components/MovieRow";
import { MediaItem } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { getHomePageContent } from "@/app/actions/media";

export default function HomePage() {
  const router = useRouter();
  const [top10Items, setTop10Items] = useState<MediaItem[]>([]);
  const [trendingItems, setTrendingItems] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [popularTV, setPopularTV] = useState<MediaItem[]>([]);
  const [kDrama, setKDrama] = useState<MediaItem[]>([]);
  const [usDrama, setUSDrama] = useState<MediaItem[]>([]);
  const [kidsContent, setKidsContent] = useState<MediaItem[]>([]);
  const [featuredHeroItems, setFeaturedHeroItems] = useState<MediaItem[]>([]);
  const [continueWatchingList, setContinueWatchingList] = useState<MediaItem[]>([]);
  const { language, t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    const loadContent = async () => {
      try {
        const content = await getHomePageContent();
        if (content) {
          setTop10Items(content.top10Items);
          setTrendingItems(content.trendingItems);
          setFeaturedHeroItems(content.featuredHeroItems);
          setPopularMovies(content.popularMovies);
          setPopularTV(content.popularTV);
          setKDrama(content.kDrama);
          setUSDrama(content.usDrama);
          setKidsContent(content.kidsContent);
        }
      } catch (err) {
        console.error("Failed to load Prisma content:", err);
      }
    };

    loadContent();
  }, []);



  // Load User Watch History for Continue Watching
  useEffect(() => {
    try {
      const userKey = user ? `movis_history_${user.uid}` : "movis_history_guest";
      const existingStr = localStorage.getItem(userKey);
      if (existingStr) {
        const parsed: MediaItem[] = JSON.parse(existingStr);
        setContinueWatchingList(parsed);
      } else {
        setContinueWatchingList([]);
      }
    } catch (e) {
      console.error("Failed to load user watch history:", e);
    }
  }, [user]);

  const handleOpenItem = (item: MediaItem) => {
    router.push(`/title/${item.id}`);
  };

  return (
    <div className="relative min-h-screen bg-[#141414] text-white overflow-x-hidden selection:bg-[#e50914] selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero
        items={featuredHeroItems}
        onOpenModal={handleOpenItem}
      />

      {/* Main Content Rows */}
      <div className="relative z-20 -mt-16 md:-mt-24 pb-20 space-y-4">
        {/* Top 10 Morocco Row with 3D Numbers */}
        <Top10Row
          title={t("Top10Morocco")}
          items={top10Items}
          onOpenModal={handleOpenItem}
        />

        {/* Dynamic Per-User Continue Watching Row */}
        {continueWatchingList.length > 0 && (
          <MovieRow
            title={user?.displayName ? `${t("ContinueWatching")} ${user.displayName}` : t("ContinueWatching")}
            items={continueWatchingList}
            isWide={true}
            isContinueWatching={true}
            onOpenModal={handleOpenItem}
          />
        )}

        {/* Group Watch Row */}
        <MovieRow
          title={t("GroupWatch")}
          items={popularTV.slice(0, 20)}
          onOpenModal={handleOpenItem}
        />

        {/* Anime Section */}
        <MovieRow
          title={t("AnimeTitle")}
          items={kidsContent.slice(0, 20)}
          onOpenModal={handleOpenItem}
        />

        {/* Korean Drama Row */}
        <MovieRow
          title={t("KDrama")}
          items={kDrama.slice(0, 20)}
          onOpenModal={handleOpenItem}
        />

        {/* High School / US Drama Row */}
        <MovieRow
          title={t("USDrama")}
          items={usDrama.slice(0, 20)}
          onOpenModal={handleOpenItem}
        />

        {/* New Movies */}
        <MovieRow
          title={t("LatestMovies")}
          items={popularMovies.slice(0, 20)}
          onOpenModal={handleOpenItem}
        />
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 md:px-12 py-12 text-gray-500 text-xs space-y-4 border-t border-gray-800/60" dir="rtl">
        <p>{t("FooterHelp")}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a href="#" className="hover:underline">الأسئلة الشائعة</a>
          <a href="#" className="hover:underline">مركز المساعدة</a>
          <a href="#" className="hover:underline">الحساب</a>
          <a href="#" className="hover:underline">مركز الإعلام</a>
          <a href="#" className="hover:underline">علاقات المستثمرين</a>
          <a href="#" className="hover:underline">الوظائف</a>
          <a href="#" className="hover:underline">طرق المشاهدة</a>
          <a href="#" className="hover:underline">شروط الاستخدام</a>
          <a href="#" className="hover:underline">الخصوصية</a>
          <a href="#" className="hover:underline">تفضيلات الكوكيز</a>
          <a href="#" className="hover:underline">معلومات الشركة</a>
          <a href="#" className="hover:underline">اتصل بنا</a>
        </div>
        <p className="pt-4 text-gray-600">{t("FooterRights")}</p>
      </footer>
    </div>
  );
}
