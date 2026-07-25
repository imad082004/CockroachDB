"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { MediaItem } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import {
  ArrowRight,
  Award,
  Calendar,
  MapPin,
  Star,
  Film,
  User,
  Sparkles,
  Play,
} from "lucide-react";

interface ActorDetail {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  profilePath: string | null;
  knownForDepartment: string;
  popularity: number;
}

export default function ActorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { language, t } = useLanguage();

  const [actor, setActor] = useState<ActorDetail | null>(null);
  const [knownFor, setKnownFor] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchActorData = async () => {
      setLoading(true);
      try {
        const langParam = language === "en" ? "en-US" : "ar-SA";
        let targetPersonId = id;

        // If ID is a text name (e.g. "Robert Downey Jr."), search TMDB to get the numeric person ID
        if (isNaN(Number(id))) {
          const searchRes = await fetch(
            `https://api.themoviedb.org/3/search/person?api_key=a3ea4c84477a77480256e85e2904c186&language=${langParam}&query=${encodeURIComponent(
              decodeURIComponent(id)
            )}`
          );
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            if (searchData.results && searchData.results.length > 0) {
              targetPersonId = searchData.results[0].id.toString();
            }
          }
        }

        // Fetch Person Details using targetPersonId
        const personRes = await fetch(
          `https://api.themoviedb.org/3/person/${targetPersonId}?api_key=a3ea4c84477a77480256e85e2904c186&language=${langParam}`
        );

        if (personRes.ok) {
          const p = await personRes.json();
          setActor({
            id: p.id,
            name: p.name,
            biography: p.biography || (language === "en" ? "No biography available." : "لا توجد سيرة ذاتية متوفرة حالياً."),
            birthday: p.birthday,
            deathday: p.deathday,
            placeOfBirth: p.place_of_birth,
            profilePath: p.profile_path ? `https://image.tmdb.org/t/p/w500${p.profile_path}` : null,
            knownForDepartment: p.known_for_department || "Acting",
            popularity: p.popularity ? Number(p.popularity.toFixed(1)) : 8.5,
          });

          // Fetch Actor Combined Credits
          const creditsRes = await fetch(
            `https://api.themoviedb.org/3/person/${targetPersonId}/combined_credits?api_key=a3ea4c84477a77480256e85e2904c186&language=${langParam}`
          );

          if (creditsRes.ok) {
            const creditsData = await creditsRes.json();
            const castItems = (creditsData.cast || [])
              .filter((c: any) => c.poster_path || c.backdrop_path)
              .sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0))
              .slice(0, 20);

            const mapped: MediaItem[] = castItems.map((m: any) => ({
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
              type: m.media_type === "movie" ? "movie" : "tv",
            }));

            setKnownFor(mapped);
          }
        }
      } catch (err) {
        console.error("Actor fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActorData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, language]);

  // Calculate age from birthday
  const getAge = (birthday: string | null) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex flex-col justify-center items-center" dir="rtl">
        <Navbar />
        <div className="text-center space-y-3 pt-32">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm font-semibold">
            {language === "en" ? "Loading actor profile..." : "جاري تحميل تفاصيل الممثل..."}
          </p>
        </div>
      </div>
    );
  }

  if (!actor) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex flex-col justify-center items-center" dir="rtl">
        <Navbar />
        <div className="text-center space-y-4 pt-32">
          <User className="w-12 h-12 text-gray-500 mx-auto" />
          <h2 className="text-xl font-bold">{language === "en" ? "Actor not found" : "لم يتم العثور على الممثل"}</h2>
          <button onClick={() => router.back()} className="bg-gray-800 px-4 py-2 rounded-lg text-xs font-bold">
            {t("Back")}
          </button>
        </div>
      </div>
    );
  }

  const age = getAge(actor.birthday);

  return (
    <div className="min-h-screen bg-[#141414] text-white selection:bg-[#e50914] selection:text-white" dir="rtl">
      <Navbar />

      <div className="pt-24 md:pt-32 pb-24 px-4 md:px-12 max-w-7xl mx-auto space-y-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700 text-white px-4 py-2 rounded-full text-xs font-bold transition border border-gray-700 backdrop-blur-md"
        >
          <ArrowRight className="w-4 h-4" />
          <span>{t("Back")}</span>
        </button>

        {/* Top Profile Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start bg-[#181818] p-6 md:p-10 rounded-3xl border border-gray-800 shadow-2xl">
          {/* Profile Image */}
          <div className="md:col-span-1 flex flex-col items-center">
            <div className="w-48 h-64 md:w-full md:h-80 rounded-2xl overflow-hidden border-2 border-white/10 bg-gray-900 shadow-2xl">
              <img
                src={
                  actor.profilePath ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"
                }
                alt={actor.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Actor Info & Bio */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="bg-[#e50914] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  {actor.knownForDepartment}
                </span>
                <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                  Popularity Score: {actor.popularity}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black mt-2 text-white drop-shadow">
                {actor.name}
              </h1>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[#111111] p-4 rounded-2xl border border-gray-800/80 text-xs">
              {age && (
                <div className="space-y-0.5">
                  <span className="text-gray-500 font-semibold flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {language === "en" ? "Age" : "العمر"}
                  </span>
                  <p className="font-extrabold text-white">{age} {language === "en" ? "years old" : "سنة"}</p>
                </div>
              )}

              {actor.birthday && (
                <div className="space-y-0.5">
                  <span className="text-gray-500 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {language === "en" ? "Date of Birth" : "تاريخ الميلاد"}
                  </span>
                  <p className="font-extrabold text-gray-200">{actor.birthday}</p>
                </div>
              )}

              {actor.placeOfBirth && (
                <div className="space-y-0.5 col-span-2 sm:col-span-1">
                  <span className="text-gray-500 font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {language === "en" ? "Place of Birth" : "مكان الميلاد / الجنسية"}
                  </span>
                  <p className="font-extrabold text-gray-200 truncate">{actor.placeOfBirth}</p>
                </div>
              )}
            </div>

            {/* Biography */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-[#e50914]" />
                <span>{language === "en" ? "Biography" : "السيرة الذاتية"}</span>
              </h3>
              <p className="text-xs md:text-sm text-gray-300 leading-relaxed max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {actor.biography}
              </p>
            </div>
          </div>
        </div>

        {/* Known For Section (Movies & Series Grid) */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
            <Film className="w-6 h-6 text-[#e50914]" />
            <h2 className="text-xl md:text-2xl font-bold">
              {language === "en" ? `Top Movies & Series starring ${actor.name}` : `أشهر أعمال ${actor.name}`}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {knownFor.map((item) => (
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

                  {/* Rating */}
                  <div className="absolute top-2 right-2 bg-black/80 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-400/30 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" /> {item.rating}
                  </div>

                  {/* Play Overlay */}
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
                    <span className="uppercase text-[#e50914] font-bold">{item.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
