"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users, Lock, Search, Plus, Play, Info } from "lucide-react";
import { LoginModal } from "@/components/LoginModal";

type Room = {
  id: string;
  name: string;
  password?: string | null;
  host_id: string;
  media_id: string;
  media_type: string;
  media_title?: string;
  media_cover?: string;
  participants?: { id: string; name: string; isHost: boolean }[];
  createdAt: any;
};

type TMDBResult = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  media_type: string;
  release_date?: string;
  first_air_date?: string;
};

export default function RoomsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [selectedMedia, setSelectedMedia] = useState<TMDBResult | null>(null);
  const [roomName, setRoomName] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRooms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];
      setRooms(fetchedRooms);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Search TMDB
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const tmdbKey = "a3ea4c84477a77480256e85e2904c186"; // fallback key
          const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&language=ar&query=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();
          if (data.results) {
            setSearchResults(data.results.filter((r: any) => r.media_type === "movie" || r.media_type === "tv"));
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedia || !roomName.trim()) return;
    
    setIsCreatingRoom(true);
    try {
      const hostId = user?.uid || `guest_${Math.random().toString(36).substring(2, 9)}`;
      
      const docRef = await addDoc(collection(db, "rooms"), {
        name: roomName,
        password: roomPassword || null,
        host_id: hostId,
        media_id: selectedMedia.id.toString(),
        media_type: selectedMedia.media_type,
        media_title: selectedMedia.title || selectedMedia.name,
        media_cover: selectedMedia.poster_path ? `https://image.tmdb.org/t/p/w500${selectedMedia.poster_path}` : "https://via.placeholder.com/500x750?text=No+Poster",
        metadata: {
          season: 1,
          episode: 1,
          server: 0
        },
        participants: [],
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
      <Navbar />

      <div className="pt-24 max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161616] p-6 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -z-10" />
          
          <div className="space-y-2 z-10">
            <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2">
              <Users className="w-8 h-8 text-red-500" />
              <span>غرف المشاهدة (Watch Parties)</span>
            </h1>
            <p className="text-sm text-gray-400 font-bold">شاهد أفلامك ومسلسلاتك المفضلة مع أصدقائك في نفس الوقت ودردش معهم!</p>
          </div>

          <button
            onClick={() => {
              if (!user) {
                setShowLoginModal(true);
                return;
              }
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-red-600/20 z-10 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>إنشاء غرفة جديدة</span>
          </button>
        </div>

        {/* Rooms Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            الغرف النشطة حالياً
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-[#161616] border border-gray-800 rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="bg-[#161616] border border-gray-800 rounded-2xl p-12 text-center space-y-4 shadow-xl">
              <Users className="w-16 h-16 text-gray-700 mx-auto" />
              <h3 className="text-xl font-bold text-gray-300">لا توجد غرف نشطة حالياً</h3>
              <p className="text-sm text-gray-500">كن أول من ينشئ غرفة مشاهدة ويدعو أصدقاءه!</p>
              <button
                onClick={() => {
                  if (!user) {
                    setShowLoginModal(true);
                    return;
                  }
                  setShowAddModal(true);
                }}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-xl transition shadow-lg shadow-red-600/20"
              >
                <Plus className="w-4 h-4" /> إنشاء غرفة
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {rooms.map(room => (
                <div key={room.id} className="bg-[#161616] border border-gray-800 hover:border-red-500/50 rounded-2xl overflow-hidden transition group shadow-xl flex flex-col">
                  {/* Media Cover */}
                  <div className="relative aspect-video bg-black overflow-hidden">
                    <img 
                      src={room.media_cover || "https://via.placeholder.com/500x281?text=MOVIS"} 
                      alt={room.media_title} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#161616] to-transparent" />
                    
                    {room.password && (
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-2 py-1 rounded-md border border-gray-700/50 flex items-center gap-1 text-[10px] font-bold text-gray-300">
                        <Lock className="w-3 h-3" /> خاص
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3 bg-red-600/90 px-2 py-1 rounded-md flex items-center gap-1.5 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                      <span className="text-[10px] font-black text-white uppercase">LIVE</span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-sm font-black text-white truncate drop-shadow-md">{room.name}</h3>
                      <p className="text-[10px] text-gray-300 truncate drop-shadow-md">{room.media_title}</p>
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-red-400" />
                        <span>{room.participants?.length || 0} حضور</span>
                      </div>
                      <span className="bg-gray-800 px-2 py-1 rounded text-[10px] uppercase">{room.media_type}</span>
                    </div>

                    <Link 
                      href={`/room/${room.id}`}
                      className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/30 px-4 py-2 rounded-xl transition font-bold text-xs"
                    >
                      <Play className="w-3.5 h-3.5" /> الانضمام للغرفة
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE ROOM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-gray-800 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-500" />
                إنشاء غرفة مشاهدة جديدة
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedMedia(null);
                  setSearchQuery("");
                }}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {!selectedMedia ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">ابحث عن فيلم أو مسلسل <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Search className="absolute right-3 top-3.5 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="اكتب اسم العمل الفني..."
                        className="w-full bg-[#111111] text-white text-sm pr-10 pl-4 py-3 rounded-xl border border-gray-800 focus:border-red-500 focus:outline-none transition"
                        autoFocus
                      />
                    </div>
                  </div>

                  {isSearching ? (
                    <div className="text-center py-8">
                      <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2 mt-4">
                      {searchResults.map((res) => (
                        <div 
                          key={res.id} 
                          onClick={() => setSelectedMedia(res)}
                          className="flex items-center gap-3 p-2 bg-[#111111] hover:bg-gray-800 border border-gray-800/80 rounded-xl cursor-pointer transition group"
                        >
                          <div className="w-10 h-14 bg-gray-900 rounded-md overflow-hidden shrink-0">
                            {res.poster_path && (
                              <img src={`https://image.tmdb.org/t/p/w200${res.poster_path}`} alt={res.title || res.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition">{res.title || res.name}</h4>
                            <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                              {res.media_type === "movie" ? "فيلم" : "مسلسل"} • {res.release_date || res.first_air_date ? (res.release_date || res.first_air_date)?.substring(0, 4) : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery.length >= 2 ? (
                    <div className="text-center py-8 text-gray-500 text-xs font-bold">لا توجد نتائج مطابقة</div>
                  ) : null}
                </div>
              ) : (
                <form onSubmit={handleCreateRoom} className="space-y-5">
                  
                  {/* Selected Media Preview */}
                  <div className="flex items-center gap-3 p-3 bg-red-900/10 border border-red-500/20 rounded-xl">
                    <div className="w-12 h-16 bg-gray-900 rounded-md overflow-hidden shrink-0">
                      {selectedMedia.poster_path && (
                        <img src={`https://image.tmdb.org/t/p/w200${selectedMedia.poster_path}`} alt={selectedMedia.title || selectedMedia.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white">{selectedMedia.title || selectedMedia.name}</h4>
                      <p className="text-[10px] text-red-400 font-bold mt-0.5">{selectedMedia.media_type === "movie" ? "فيلم" : "مسلسل"}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setSelectedMedia(null)}
                      className="text-[10px] text-gray-400 hover:text-white underline font-bold"
                    >
                      تغيير
                    </button>
                  </div>

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
                    <p className="text-[10px] text-gray-500 pt-1">إذا وضعت كلمة مرور، فلن يدخل الغرفة إلا من تعطيه الكلمة.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingRoom}
                    className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-bold py-3.5 rounded-xl transition shadow-lg shadow-red-500/20 mt-4 flex justify-center items-center gap-2"
                  >
                    {isCreatingRoom ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                    {isCreatingRoom ? "جاري الإنشاء..." : "إنشاء الغرفة والدخول"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

    </div>
  );
}
