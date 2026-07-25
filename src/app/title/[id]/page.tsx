"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Plus,
  Star,
  Film,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MovieRow } from "@/components/MovieRow";
import { MediaItem } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { getMediaDetails, getSimilarMedia } from "@/app/actions/media";

export default function TitleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { language, t } = useLanguage();

  const [item, setItem] = useState<MediaItem | null>(null);
  const [similarItems, setSimilarItems] = useState<MediaItem[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;

    const loadDetail = async () => {
      try {
        let foundItem: MediaItem | null = null;
        let mediaType: "movie" | "tv" = "movie";

        // Fetch from Server Action
        foundItem = await getMediaDetails(id);

        // 2. If not found in DB, fallback to fetching directly from TMDB!
        if (!foundItem) {
          try {
            const langParam = language === "en" ? "en-US" : "ar-SA";
            let tmdbRes = await fetch(
              `https://api.themoviedb.org/3/movie/${id}?api_key=a3ea4c84477a77480256e85e2904c186&language=${langParam}`
            );
            mediaType = "movie";

            if (!tmdbRes.ok) {
              tmdbRes = await fetch(
                `https://api.themoviedb.org/3/tv/${id}?api_key=a3ea4c84477a77480256e85e2904c186&language=${langParam}`
              );
              mediaType = "tv";
            }

            if (tmdbRes.ok) {
              const tmdbData = await tmdbRes.json();
              foundItem = {
                id: tmdbData.id.toString(),
                tmdbId: tmdbData.id,
                title: tmdbData.title || tmdbData.name,
                originalTitle: tmdbData.original_title || tmdbData.original_name || tmdbData.title || tmdbData.name,
                description: tmdbData.overview || "",
                descriptionEn: tmdbData.overview || "",
                coverUrl: tmdbData.poster_path
                  ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
                  : "",
                backdropUrl: tmdbData.backdrop_path
                  ? `https://image.tmdb.org/t/p/w1280${tmdbData.backdrop_path}`
                  : "",
                genres: (tmdbData.genres || []).map((g: any) => g.name),
                rating: tmdbData.vote_average ? Number(tmdbData.vote_average.toFixed(1)) : 7.5,
                releaseDate: (tmdbData.release_date || tmdbData.first_air_date || "2024").substring(0, 4),
                type: mediaType,
              };
            }
          } catch (e) {
            console.error("TMDB Fallback error:", e);
          }
        }

        if (foundItem) {
          setItem(foundItem);

          // Get some fast similar items using limited query
          const simDocs = await getSimilarMedia(foundItem.type, foundItem.id.toString());
          setSimilarItems(simDocs);

          const tmdbId = foundItem.tmdbId || foundItem.id;
          const fetchMediaType = foundItem.type === "movie" ? "movie" : "tv";
          try {
            const trailerRes = await fetch(
              `https://api.themoviedb.org/3/${fetchMediaType}/${tmdbId}/videos?api_key=a3ea4c84477a77480256e85e2904c186&language=en-US`
            );
            if (trailerRes.ok) {
              const trailerData = await trailerRes.json();
              const officialTrailer = trailerData.results?.find(
                (v: any) => v.type === "Trailer" || v.type === "Teaser"
              );
              if (officialTrailer) {
                setTrailerKey(officialTrailer.key);
              }
            }
          } catch (e) {
            console.error("Trailer fetch error:", e);
          }
        }
      } catch (err) {
        console.error("Error loading detail item:", err);
      }
    };

    loadDetail();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);



  useEffect(() => {
    if (!trailerKey || typeof window === "undefined") return;

    const onPlayerStateChange = (event: any) => {
      // If video ended (state = 0), play it again
      if (event.data === 0) {
        event.target.playVideo();
      }
    };

    let player: any;
    const initPlayer = () => {
      player = new (window as any).YT.Player("hero-trailer-iframe", {
        events: {
          onStateChange: onPlayerStateChange,
        },
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag?.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (player && player.destroy) {
        player.destroy();
      }
    };
  }, [trailerKey]);

  if (!item) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex flex-col" dir="rtl">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm font-semibold">جاري تحميل تفاصيل العمل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white selection:bg-[#e50914] selection:text-white" dir="rtl">
      <Navbar />

      <div className="relative w-full h-[68vh] min-h-[500px] max-h-[780px] bg-black">
        {/* Background Layer with overflow-hidden */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {trailerKey ? (
            <div className="absolute inset-0 w-full h-full scale-125">
              <iframe
                id="hero-trailer-iframe"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${
                  isMuted ? 1 : 0
                }&controls=0&playsinline=1&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1&enablejsapi=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}`}
                className="w-full h-full border-0 object-cover"
                allow="autoplay; encrypted-media"
              />
            </div>
          ) : (
            <img
              src={(language === "en" ? (item.originalBackdropUrl || item.backdropUrl || item.originalCoverUrl || item.coverUrl) : (item.backdropUrl || item.coverUrl)) || `https://image.tmdb.org/t/p/w1280${item.backdropUrl}`}
              alt={item.title}
              onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&auto=format&fit=crop&q=80"; }}
              className="w-full h-full object-cover object-center scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#141414] via-[#141414]/50 to-transparent w-full" />
        </div>

        <button
          onClick={() => router.back()}
          className="absolute top-20 right-6 md:right-12 z-30 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md transition border border-white/20"
        >
          <ArrowRight className="w-4 h-4" />
          <span>{t("Back")}</span>
        </button>

        {trailerKey && (
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute top-20 left-6 md:left-12 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition border border-white/20"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        )}

        {/* Content Layer */}
        <div className="absolute bottom-6 right-6 md:right-12 left-6 z-20 flex items-end justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-6xl font-black drop-shadow-xl">{language === "en" ? (item.originalTitle || item.title) : item.title}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-300">
              <span className="text-[#46d369]">{t("New")}</span>
              <span>{item.releaseDate}</span>
              <span className="border border-gray-500 px-1.5 py-0.5 rounded text-xs">+18</span>
              <span className="bg-white text-black px-1.5 py-0.5 rounded text-[10px] font-bold">{t("HD")}</span>
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" /> {item.rating}
              </span>
            </div>

            <p className="text-base md:text-lg text-gray-200 max-w-3xl leading-relaxed drop-shadow-md">
              {language === "en" ? (item.descriptionEn || item.description) : item.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={`/watch/${item.id}`}
                className="flex items-center justify-center gap-2 bg-white text-black font-bold py-3 px-8 rounded hover:bg-white/80 transition shadow-lg active:scale-95"
              >
                <Play className="w-6 h-6 fill-black" />
                <span className="text-lg">{t("Play")}</span>
              </Link>

              <button className="flex items-center gap-2 bg-gray-500/40 hover:bg-gray-500/60 text-white font-bold px-6 py-3 rounded-md text-base backdrop-blur-md transition active:scale-95 border border-white/20">
                <Plus className="w-5 h-5" />
                <span>{t("AddToList")}</span>
              </button>
            </div>
          </div>

          {/* Left Side: Vertical Poster Image */}
          <div className="w-[140px] md:w-[160px] lg:w-[190px] h-[210px] md:h-[240px] lg:h-[285px] rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 flex-none transition duration-300 hover:scale-105 bg-gray-900">
            <img
              src={(language === "en" ? (item.originalCoverUrl || item.coverUrl) : item.coverUrl) || undefined}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 pt-16 space-y-12">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">{t("MovieDetails")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 text-sm text-gray-300 bg-[#181818] p-6 rounded-xl border border-gray-800">
            <div>
              <span className="text-gray-500">{t("ReleaseYear")}</span> {item.releaseDate}
            </div>
            <div>
              <span className="text-gray-500">{t("Type")}</span> {language === "en" ? (item.genresEn || item.genres).join(", ") : item.genres.join("، ")}
            </div>
            <div className="md:col-span-2">
              <span className="text-gray-500">{t("Cast")}</span> {(language === "en" && item.castEn ? item.castEn : item.cast || []).map((c) => c.name).join(", ")}
            </div>
          </div>
        </div>

        {(language === "en" && item.castEn ? item.castEn : item.cast || []).length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white border-r-4 border-[#e50914] pr-3 flex items-center gap-2">
              <User className="w-5 h-5 text-[#e50914]" />
              <span>{t("Cast")}</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(language === "en" && item.castEn ? item.castEn : item.cast || []).slice(0, 10).map((actor, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push(`/actor/${(actor as any).id || (actor as any).tmdbId || encodeURIComponent(actor.name)}`)}
                  className="flex items-center gap-3 bg-[#181818] p-3 rounded-xl border border-gray-800 hover:bg-gray-800/80 cursor-pointer transition hover:border-[#e50914]/50 group"
                >
                  <img
                    src={actor.profilePath || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                    alt={actor.name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-700 flex-none group-hover:scale-105 transition"
                  />
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-[#e50914] transition">{actor.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Similar Items Carousel */}
        {similarItems.length > 0 && (
          <div className="pt-8">
            <MovieRow
              title={t("SimilarTitles")}
              items={similarItems}
              onOpenModal={(item) => router.push(`/title/${item.id}`)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
