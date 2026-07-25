"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Globe,
  Tv,
  Star,
  MessageSquare,
  ExternalLink,
  Info,
  CheckCircle2,
  Users,
  Lock,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MovieRow } from "@/components/MovieRow";
import { MediaItem, Episode } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { LoginRequired } from "@/components/LoginRequired";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getMediaDetails, getSimilarMedia, getEpisodes } from "@/app/actions/media";

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const id = params?.id as string;
  const initialSeason = Number(searchParams.get("season")) || 1;
  const initialEpisode = Number(searchParams.get("episode")) || 1;

  const [item, setItem] = useState<MediaItem | null>(null);
  const [similarItems, setSimilarItems] = useState<MediaItem[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(initialSeason);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(initialEpisode);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [serverIndex, setServerIndex] = useState<number>(0);
  const [comments, setComments] = useState<{ name: string; text: string; time: string }[]>([
    { name: "أمين التازي", text: "فيلم رائع جداً وجودة البث ممتازة بدون أي تقطيع!", time: "منذ ساعة" },
    { name: "سارة الفاسي", text: "المسلسل أحداثه مشوقة للغاية، شكراً موفيز على السرعة!", time: "منذ 3 ساعات" },
  ]);
  const [newComment, setNewComment] = useState("");

  // Room Modal State
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadMedia = async () => {
      try {
        let foundItem: MediaItem | null = null;
        let mediaType: "movie" | "tv" = "movie";

        // Fetch from Server Action
        foundItem = await getMediaDetails(id);

        // Fallback or handle if not found (TMDB removed for strict DB approach)
        if (foundItem) {
          setItem(foundItem);

          // Save item to user's continue watching history
          try {
            const userKey = user ? `movis_history_${user.uid}` : "movis_history_guest";
            const existingStr = localStorage.getItem(userKey);
            let historyList: MediaItem[] = existingStr ? JSON.parse(existingStr) : [];
            historyList = historyList.filter((m) => m.id.toString() !== foundItem!.id.toString());
            historyList.unshift(foundItem);
            localStorage.setItem(userKey, JSON.stringify(historyList.slice(0, 15)));
          } catch (e) {
            console.error("History save error:", e);
          }

          const simDocs = await getSimilarMedia(foundItem.type, foundItem.id.toString());
          setSimilarItems(simDocs);
          
          // Note: episodes are fetched in a separate effect that depends on selectedSeason
        }
      } catch (err) {
        console.error("Error loading watch media:", err);
      }
    };

    loadMedia();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  useEffect(() => {
    if (!id || item?.type !== "tv") return;
    const loadEpisodes = async () => {
      const epsData = await getEpisodes(id, selectedSeason);
      if (epsData) {
        setEpisodes(epsData);
      }
    };
    loadEpisodes();
  }, [id, selectedSeason, item?.type]);

  if (!authLoading && !user) {
    return <LoginRequired />;
  }

  if (!item || authLoading) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm font-semibold">{t("LoadingPlayer")}</p>
        </div>
      </div>
    );
  }

  const tmdbId = item.tmdbId || item.id;
  const isTV = item.type === "tv" || (item.type === "anime" && item.actualType === "tv");
  const maxSeasons = item.totalSeasons || 1;

  const servers = [
    {
      name: "سيرفر 1 (VidSrc ME)",
      url: isTV
        ? `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${selectedSeason}&episode=${selectedEpisode}`
        : `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`,
    },
    {
      name: "سيرفر 2 (AutoEmbed 4K)",
      url: isTV
        ? `https://player.autoembed.cc/embed/tv/${tmdbId}/${selectedSeason}/${selectedEpisode}`
        : `https://player.autoembed.cc/embed/movie/${tmdbId}`,
    },
    {
      name: "سيرفر 3 (VidSrc TO)",
      url: isTV
        ? `https://vidsrc.to/embed/tv/${tmdbId}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.to/embed/movie/${tmdbId}`,
    },
    {
      name: "سيرفر 4 (2Embed HD)",
      url: isTV
        ? `https://www.2embed.cc/embedtv/${tmdbId}&s=${selectedSeason}&e=${selectedEpisode}`
        : `https://www.2embed.cc/embed/${tmdbId}`,
    },
  ];

  const currentStreamUrl = servers[serverIndex].url;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([
      { name: user?.displayName || "مستخدم MOVIS", text: newComment, time: "الآن" },
      ...comments,
    ]);
    setNewComment("");
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    
    setIsCreatingRoom(true);
    try {
      const hostId = user?.uid || `guest_${Math.random().toString(36).substring(2, 9)}`;
      
      const docRef = await addDoc(collection(db, "rooms"), {
        name: roomName,
        password: roomPassword || null,
        host_id: hostId,
        media_id: id,
        media_type: item.type,
        media_title: language === "en" ? (item.originalTitle || item.title) : item.title,
        media_cover: item.coverUrl,
        metadata: {
          season: selectedSeason,
          episode: selectedEpisode,
          server: serverIndex
        },
        participants: [], // Will store active users here
        createdAt: serverTimestamp()
      });

      router.push(`/room/${docRef.id}`);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إنشاء الغرفة.");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white selection:bg-[#e50914] selection:text-white" dir="rtl">
      {/* Top Navbar */}
      <Navbar />

      <div className="pt-16 max-w-7xl mx-auto px-2 sm:px-4 md:px-8 py-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 text-xs font-bold text-gray-400 bg-[#161616] p-3.5 rounded-xl border border-gray-800">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-white transition">{t("Home")}</Link>
            <span>/</span>
            <Link href={`/title/${item.id}`} className="hover:text-white transition">{language === "en" ? (item.originalTitle || item.title) : item.title}</Link>
            <span>/</span>
            <span className="text-white">{t("Watch")} {isTV ? `${t("Season")} ${selectedSeason} - ${t("Episode")} ${selectedEpisode}` : t("Movie")}</span>
          </div>

          <button
            onClick={() => router.push(`/title/${item.id}`)}
            className="flex items-center gap-1.5 text-gray-300 hover:text-white bg-gray-800 px-3.5 py-1.5 rounded-lg transition text-xs font-bold"
          >
            <Info className="w-4 h-4" />
            <span>{t("MovieDetails")}</span>
          </button>
        </div>

        {/* 
          LAYOUT GRID:
          - RIGHT SIDE (Right in RTL): Episodes & Seasons drawer (for TV/Anime) or Movie Details
          - LEFT SIDE (Left in RTL): Dedicated Video Player Frame!
        */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* RIGHT COLUMN (قائمة الحلقات والمواسم على اليمين للمسلسلات والأنمي) */}
          <div className="order-2 lg:order-1 space-y-6">
            {isTV ? (
              <div className="bg-[#161616] p-5 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Tv className="w-4 h-4 text-[#e50914]" />
                    <span>{t("EpisodesList")}</span>
                  </h3>

                  <select
                    value={selectedSeason}
                    onChange={(e) => {
                      setSelectedSeason(Number(e.target.value));
                      setSelectedEpisode(1);
                    }}
                    className="bg-black text-white text-xs px-3 py-1.5 rounded-lg border border-gray-700 focus:outline-none font-bold"
                  >
                    {Array.from({ length: maxSeasons }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {t("Season")} {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vertical Scrollable Episodes List */}
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                  {episodes.length > 0 ? (
                    episodes.map((ep) => {
                      const epNum = ep.episodeNumber;
                      const isSelected = selectedEpisode === epNum;
                      const displayTitle = language === "en" ? ep.titleEn : ep.title;
                      return (
                        <button
                          key={epNum}
                          onClick={() => setSelectedEpisode(epNum)}
                          className={`w-full p-3 rounded-xl border text-right transition flex flex-col justify-center gap-2 ${
                            isSelected
                              ? "bg-white text-black border-white font-extrabold shadow-lg"
                              : "bg-[#111111] hover:bg-gray-800 border-gray-800/80 text-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2.5">
                              <Play className={`w-3.5 h-3.5 flex-none ${isSelected ? "fill-black" : "fill-gray-400"}`} />
                              <span className="text-xs truncate">{t("Episode")} {epNum} - {displayTitle}</span>
                            </div>
                            <span className={`text-[10px] font-semibold flex-none ${isSelected ? "text-gray-700" : "text-gray-500"}`}>
                              {ep.duration || "45"} {t("Minutes")}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center p-4 text-xs text-gray-500">
                      {t("LoadingEpisodes") || "لا توجد حلقات"}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* If Movie: Information & Metadata Card on the Right */
              <div className="bg-[#161616] p-5 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white border-b border-gray-800 pb-3">{t("MovieDetails")}</h3>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-20 rounded-lg overflow-hidden flex-none bg-gray-900 border border-gray-800">
                    <img src={(language === "en" ? (item.originalCoverUrl || item.coverUrl) : item.coverUrl) || undefined} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">{language === "en" ? (item.originalTitle || item.title) : item.title}</h4>
                    <p className="text-xs text-emerald-400 font-bold mt-1">{(language === "en" ? (item.genresEn || item.genres) : item.genres).slice(0, 2).join(" • ")}</p>
                    <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {item.rating} / 10
                    </span>
                  </div>
                </div>

                <p className="text-gray-300 text-xs leading-relaxed border-t border-gray-800/80 pt-3">
                  {language === "en" ? (item.descriptionEn || item.description) : item.description}
                </p>
              </div>
            )}

            {/* Up Next List on Right Sidebar */}
            <div className="bg-[#161616] p-5 rounded-2xl border border-gray-800 space-y-3 shadow-xl">
              <h3 className="text-sm font-bold text-white border-b border-gray-800 pb-3">{t("UpNext")}</h3>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {similarItems.slice(0, 5).map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => router.push(`/watch/${sim.id}`)}
                    className="flex gap-3 bg-[#111111] hover:bg-gray-800 p-2 rounded-xl border border-gray-800/80 cursor-pointer transition group"
                  >
                    <div className="w-14 h-16 rounded-md overflow-hidden flex-none bg-gray-900">
                      <img src={(language === "en" ? (sim.originalCoverUrl || sim.coverUrl) : sim.coverUrl) || undefined} alt={sim.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    </div>
                    <div className="flex flex-col justify-center space-y-0.5 overflow-hidden">
                      <h4 className="text-xs font-bold text-white truncate">{language === "en" ? (sim.originalTitle || sim.title) : sim.title}</h4>
                      <p className="text-[10px] text-gray-400">{(language === "en" ? (sim.genresEn || sim.genres) : sim.genres).slice(0, 1).join("")}</p>
                      <span className="text-[10px] text-amber-400 font-bold">★ {sim.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LEFT COLUMN (مشغّل الفيديو والسيرفرات منقول للجهة اليسرى في RTL!) */}
          <div className="order-1 lg:order-2 lg:col-span-2 space-y-4">
            {/* Video Player Frame Container */}
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
              <iframe
                key={`${serverIndex}-${selectedSeason}-${selectedEpisode}`}
                src={currentStreamUrl}
                className="w-full h-full border-0"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
              />
            </div>

            {/* Server Selector Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161616] p-3.5 rounded-xl border border-gray-800 shadow-md">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-gray-200">{t("LiveServers")}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    if (!user) {
                      alert("يجب تسجيل الدخول أولاً لإنشاء غرفة مشاهدة.");
                      router.push("/login");
                      return;
                    }
                    setShowRoomModal(true);
                  }}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition mr-2 shadow-lg shadow-red-600/20"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>مشاهدة جماعية (روم)</span>
                </button>

                {servers.map((server, idx) => (
                  <button
                    key={idx}
                    onClick={() => setServerIndex(idx)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition shadow ${
                      serverIndex === idx
                        ? "bg-white text-black scale-105"
                        : "bg-[#252525] text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {server.name}
                  </button>
                ))}

                <a
                  href={currentStreamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t("OpenServer")}</span>
                </a>
              </div>
            </div>

            {/* Title & Metadata Card */}
            <div className="space-y-3 bg-[#161616] p-5 rounded-xl border border-gray-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {language === "en" ? (item.originalTitle || item.title) : item.title} {isTV && <span className="text-[#e50914] text-base mx-2">({t("Season")} {selectedSeason} - {t("Episode")} {selectedEpisode})</span>}
                </h1>
                <span className="text-amber-400 font-bold flex items-center gap-1 text-xs bg-black/40 px-3 py-1 rounded-lg border border-amber-400/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {item.rating} / 10
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-400">
                <span className="border border-gray-700 px-2 py-0.5 rounded">{item.releaseDate}</span>
                <span className="border border-gray-700 px-1.5 py-0.2 rounded text-[10px]">Ultra HD 4K</span>
                <span className="text-emerald-400">{(language === "en" ? (item.genresEn || item.genres) : item.genres).join(" • ")}</span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-4 bg-[#161616] p-5 rounded-xl border border-gray-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
                <MessageSquare className="w-4 h-4 text-[#e50914]" />
                <span>{t("Comments")}</span>
              </h3>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder={t("AddComment")}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-black text-white text-xs px-4 py-2.5 rounded-lg border border-gray-800 focus:outline-none focus:border-white"
                />
                <button
                  type="submit"
                  className="bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition"
                >
                  {t("Send")}
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-2.5">
                {comments.map((c, idx) => (
                  <div key={idx} className="bg-[#111111] p-3 rounded-lg border border-gray-800/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-200">{c.name}</span>
                      <span className="text-[10px] text-gray-500">{c.time}</span>
                    </div>
                    <p className="text-xs text-gray-300">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE ROOM MODAL */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-gray-800 p-6 md:p-8 rounded-3xl max-w-sm w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowRoomModal(false)}
              className="absolute top-4 left-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-xl font-black text-white">إنشاء غرفة مشاهدة</h2>
              <p className="text-xs text-gray-400 font-bold">شاهد مع أصدقائك ودردش معهم في نفس الوقت</p>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">اسم الغرفة <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="مثال: سهرة الخميس"
                  className="w-full bg-[#111111] text-white text-sm px-4 py-3 rounded-xl border border-gray-800 focus:border-red-500 focus:outline-none transition"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">كلمة المرور (اختياري)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute right-3 top-3.5" />
                  <input
                    type="password"
                    value={roomPassword}
                    onChange={(e) => setRoomPassword(e.target.value)}
                    placeholder="اتركه فارغاً لغرفة عامة"
                    className="w-full bg-[#111111] text-white text-sm pl-4 pr-10 py-3 rounded-xl border border-gray-800 focus:border-red-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreatingRoom}
                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-bold py-3.5 rounded-xl transition shadow-lg shadow-red-500/20 mt-2"
              >
                {isCreatingRoom ? "جاري الإنشاء..." : "إنشاء الغرفة الآن"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
