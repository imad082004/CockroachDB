"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { MediaItem } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import {
  Play,
  Star,
  Film,
  Search as SearchIcon,
  Filter,
  User as UserIcon,
  X,
  Sparkles,
} from "lucide-react";

interface ActorResult {
  id: number;
  name: string;
  profilePath: string | null;
  knownForDepartment: string;
  popularity: number;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const { language, t } = useLanguage();

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [mediaResults, setMediaResults] = useState<MediaItem[]>([]);
  const [actorResults, setActorResults] = useState<ActorResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [selectedType, setSelectedType] = useState<string>("all"); // "all", "movie", "tv", "anime", "actor"
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");

  // Debounce search query input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Keep query synced with URL search params if changed from outside
  useEffect(() => {
    if (initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Main Instant Search Effect
  useEffect(() => {
    const performInstantSearch = async () => {
      setLoading(true);
      try {
        const langParam = language === "en" ? "en-US" : "ar-SA";

        if (selectedType === "actor") {
          // Search Person API
          const personRes = await fetch(
            `https://api.themoviedb.org/3/search/person?api_key=a3ea4c84477a77480256e85e2904c186&language=${langParam}&query=${encodeURIComponent(
              debouncedQuery || "a"
            )}`
          );
          if (personRes.ok) {
            const data = await personRes.json();
            const actors: ActorResult[] = (data.results || []).map((p: any) => ({
              id: p.id,
              name: p.name,
              profilePath: p.profile_path ? `https://image.tmdb.org/t/p/w500${p.profile_path}` : null,
              knownForDepartment: p.known_for_department || "Actor",
              popularity: p.popularity ? Number(p.popularity.toFixed(1)) : 7.0,
            }));
            setActorResults(actors);
            setMediaResults([]);
          }
        } else {
          // Search Multi Endpoint (Movies & TV)
          const endpoint = debouncedQuery.trim()
            ? `https://api.themoviedb.org/3/search/multi?api_key=a3ea4c84477a77480256e85e2904c186&language=${langParam}&query=${encodeURIComponent(
                debouncedQuery
              )}`
            : `https://api.themoviedb.org/3/trending/all/week?api_key=a3ea4c84477a77480256e85e2904c186&language=${langParam}`;

          const res = await fetch(endpoint);

          if (res.ok) {
            const data = await res.json();
            let rawList = data.results || [];

            // Filter out non-movie/tv
            let filtered = rawList.filter(
              (item: any) =>
                (item.media_type === "movie" || item.media_type === "tv" || !item.media_type) &&
                (item.poster_path || item.backdrop_path)
            );

            // Filter Type
            if (selectedType === "movie") {
              filtered = filtered.filter((i: any) => i.media_type === "movie" || i.title);
            } else if (selectedType === "tv") {
              filtered = filtered.filter((i: any) => i.media_type === "tv" || i.name);
            } else if (selectedType === "anime") {
              filtered = filtered.filter((i: any) => (i.genre_ids || []).includes(16));
            }

            // Filter Year
            if (selectedYear !== "all") {
              filtered = filtered.filter((i: any) => {
                const year = (i.release_date || i.first_air_date || "").substring(0, 4);
                return year === selectedYear;
              });
            }

            // Filter Language
            if (selectedLanguage !== "all") {
              filtered = filtered.filter((i: any) => i.original_language === selectedLanguage);
            }

            const mapped: MediaItem[] = filtered.map((m: any) => ({
              id: m.id.toString(),
              tmdbId: m.id,
              title: m.title || m.name,
              originalTitle: m.original_title || m.original_name || m.title || m.name,
              description: m.overview || "",
              descriptionEn: m.overview || "",
              coverUrl: m.poster_path
                ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80",
              backdropUrl: m.backdrop_path
                ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}`
                : "",
              genres: [],
              rating: m.vote_average ? Number(m.vote_average.toFixed(1)) : 7.5,
              releaseDate: (m.release_date || m.first_air_date || "2024").substring(0, 4),
              type: m.media_type === "movie" || m.title ? "movie" : "tv",
            }));

            setMediaResults(mapped);
            setActorResults([]);
          }
        }
      } catch (err) {
        console.error("Instant search error:", err);
      } finally {
        setLoading(false);
      }
    };

    performInstantSearch();
  }, [debouncedQuery, selectedType, selectedGenre, selectedYear, selectedCountry, selectedLanguage, language]);

  const resetFilters = () => {
    setSelectedType("all");
    setSelectedGenre("all");
    setSelectedYear("all");
    setSelectedCountry("all");
    setSelectedLanguage("all");
    setQuery("");
  };

  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 md:px-12 max-w-7xl mx-auto space-y-8">
      {/* Search Bar Input */}
      <div className="relative max-w-3xl mx-auto">
        <div className="relative flex items-center">
          <SearchIcon className="absolute right-4 w-6 h-6 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === "en"
                ? "Search for movies, series, anime, actors, directors..."
                : "ابحث لحظياً عن الأنمي، الأفلام، المسلسلات، الممثلين، والمخرجين..."
            }
            className="w-full bg-[#181818] text-white text-sm md:text-base pr-12 pl-12 py-4 rounded-2xl border-2 border-gray-800 focus:outline-none focus:border-[#e50914] shadow-2xl transition"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute left-4 p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-[#181818] p-4 md:p-6 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#e50914]" />
            <h3 className="text-sm font-bold text-white">
              {language === "en" ? "Filter Results" : "تصفية نتائج البحث والفلاتر"}
            </h3>
          </div>

          {(selectedType !== "all" ||
            selectedGenre !== "all" ||
            selectedYear !== "all" ||
            selectedCountry !== "all" ||
            selectedLanguage !== "all" ||
            query) && (
            <button
              onClick={resetFilters}
              className="text-xs text-red-500 hover:underline font-bold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>{language === "en" ? "Reset Filters" : "إعادة ضبط الكل"}</span>
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          {/* Type Filter */}
          <div className="space-y-1">
            <label className="text-gray-400 font-semibold">{language === "en" ? "Type" : "نوع المحتوى"}</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-[#111111] text-white p-2.5 rounded-xl border border-gray-800 focus:outline-none font-bold"
            >
              <option value="all">{language === "en" ? "All Types" : "الكل (جميع الأنواع)"}</option>
              <option value="movie">{language === "en" ? "Movies" : "أفلام (Movie)"}</option>
              <option value="tv">{language === "en" ? "TV Shows" : "مسلسلات (TV Show)"}</option>
              <option value="anime">{language === "en" ? "Anime" : "أنمي (Anime)"}</option>
              <option value="actor">{language === "en" ? "Actors & Cast" : "ممثلين (Actor)"}</option>
            </select>
          </div>

          {/* Genre Filter */}
          <div className="space-y-1">
            <label className="text-gray-400 font-semibold">{language === "en" ? "Genre" : "التصنيف"}</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full bg-[#111111] text-white p-2.5 rounded-xl border border-gray-800 focus:outline-none font-bold"
            >
              <option value="all">{language === "en" ? "All Genres" : "جميع التصنيفات"}</option>
              <option value="action">{language === "en" ? "Action" : "أكشن"}</option>
              <option value="comedy">{language === "en" ? "Comedy" : "كوميديا"}</option>
              <option value="drama">{language === "en" ? "Drama" : "دراما"}</option>
              <option value="scifi">{language === "en" ? "Sci-Fi & Fantasy" : "خيال علمي"}</option>
              <option value="horror">{language === "en" ? "Horror" : "رعب"}</option>
              <option value="romance">{language === "en" ? "Romance" : "رومانسية"}</option>
            </select>
          </div>

          {/* Year Filter */}
          <div className="space-y-1">
            <label className="text-gray-400 font-semibold">{language === "en" ? "Release Year" : "سنة الإصدار"}</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-[#111111] text-white p-2.5 rounded-xl border border-gray-800 focus:outline-none font-bold"
            >
              <option value="all">{language === "en" ? "All Years" : "جميع السنين"}</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>

          {/* Language Filter */}
          <div className="space-y-1">
            <label className="text-gray-400 font-semibold">{language === "en" ? "Language" : "لغة المحتوى"}</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full bg-[#111111] text-white p-2.5 rounded-xl border border-gray-800 focus:outline-none font-bold"
            >
              <option value="all">{language === "en" ? "All Languages" : "جميع اللغات"}</option>
              <option value="ar">العربية (Arabic)</option>
              <option value="en">English</option>
              <option value="ja">日本語 (Japanese Anime)</option>
              <option value="ko">한국어 (Korean)</option>
              <option value="fr">Français</option>
            </select>
          </div>

          {/* Country Filter */}
          <div className="space-y-1">
            <label className="text-gray-400 font-semibold">{language === "en" ? "Country" : "بلد الإنتاج"}</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-[#111111] text-white p-2.5 rounded-xl border border-gray-800 focus:outline-none font-bold"
            >
              <option value="all">{language === "en" ? "All Countries" : "جميع الدول"}</option>
              <option value="US">الولايات المتحدة (USA)</option>
              <option value="KR">كوريا الجنوبية (South Korea)</option>
              <option value="JP">اليابان (Japan)</option>
              <option value="FR">فرنسا (France)</option>
              <option value="MA">المغرب (Morocco)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="py-20 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm font-semibold">
            {language === "en" ? "Searching in real-time..." : "جاري البحث الفوري حسب الفلاتر..."}
          </p>
        </div>
      )}

      {/* Actor Results Grid (If selectedType === 'actor') */}
      {!loading && selectedType === "actor" && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#e50914]" />
            <span>{language === "en" ? "Actors & Cast Results" : "نتائج طاقم التمثيل والممثلين"}</span>
          </h3>

          {actorResults.length === 0 ? (
            <div className="py-16 text-center bg-[#181818] rounded-2xl border border-gray-800">
              <UserIcon className="w-12 h-12 text-gray-600 mx-auto" />
              <p className="text-gray-400 text-sm mt-2">{language === "en" ? "No actors found" : "لم يتم العثور على ممثلين بهذا الاسم"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {actorResults.map((actor) => (
                <div
                  key={actor.id}
                  onClick={() => router.push(`/actor/${actor.id}`)}
                  className="bg-[#181818] p-3 rounded-2xl border border-gray-800 hover:border-gray-600 cursor-pointer transition flex flex-col items-center text-center space-y-2 group shadow-lg"
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-[#e50914] transition">
                    <img
                      src={
                        actor.profilePath ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                      }
                      alt={actor.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white truncate group-hover:text-[#e50914] transition">
                      {actor.name}
                    </h4>
                    <span className="text-[10px] text-gray-500 font-semibold block">{actor.knownForDepartment}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Media Results Grid (Movies & Series) */}
      {!loading && selectedType !== "actor" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              {language === "en"
                ? `Showing ${mediaResults.length} instant results`
                : `تم العثور على ${mediaResults.length} نتيجة متطابقة`}
            </span>
          </div>

          {mediaResults.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-[#181818] rounded-2xl border border-gray-800 p-8">
              <Film className="w-12 h-12 text-gray-600 mx-auto" />
              <h3 className="text-lg font-bold text-gray-300">
                {language === "en" ? "No matches found" : "لم يتم العثور على أي نتائج متطابقة"}
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                {language === "en"
                  ? "Try adjusting your filters or typing a different keyword."
                  : "جرب تغيير الفلاتر المحددة أو كتابة كلمة مختلفة في مربع البحث."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {mediaResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/title/${item.id}`)}
                  className="relative flex flex-col rounded-xl overflow-hidden bg-[#181818] border border-gray-800 cursor-pointer group hover:scale-105 transition duration-300 shadow-xl"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-900">
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />

                    {/* Rating Badge */}
                    <div className="absolute top-2 right-2 bg-black/80 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-400/30 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" /> {item.rating}
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2 bg-[#e50914] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow uppercase">
                      {item.type === "movie" ? (language === "en" ? "Movie" : "فيلم") : (language === "en" ? "Series" : "مسلسل")}
                    </div>

                    {/* Play Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center transform scale-75 group-hover:scale-100 transition">
                        <Play className="w-6 h-6 fill-black translate-x-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 space-y-1">
                    <h3 className="font-bold text-xs md:text-sm text-white truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                      <span>{item.releaseDate}</span>
                      <span className="text-gray-500 truncate max-w-[90px]">{item.originalTitle}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-white selection:bg-[#e50914] selection:text-white" dir="rtl">
      <Navbar />
      <Suspense
        fallback={
          <div className="pt-32 py-20 text-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </div>
  );
}
