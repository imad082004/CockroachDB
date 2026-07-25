"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoginRequired } from "@/components/LoginRequired";
import { db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove, collection, addDoc, query, orderBy, serverTimestamp, limit } from "firebase/firestore";
import { createClient } from "@supabase/supabase-js";
import {
  Users,
  MessageSquare,
  Send,
  Lock,
  Settings,
  Link as LinkIcon,
  LogOut,
  Play,
  Star
} from "lucide-react";

import { getMediaDetails } from "@/app/actions/media";

type Room = {
  id?: string;
  name: string;
  password?: string | null;
  host_id: string;
  media_id: string;
  media_type: string;
  metadata?: any;
  participants?: { id: string; name: string; isHost: boolean }[];
};

type Message = {
  id: string;
  user_name: string;
  text: string;
  timestamp: any;
};

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId as string;
  const { user, loading: authLoading } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Guest Name State
  const [guestName, setGuestName] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [currentParticipantId, setCurrentParticipantId] = useState("");

  const [activeTab, setActiveTab] = useState<"chat" | "episodes">("chat");

  // Firebase Realtime State
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  // Media State
  const [mediaTitle, setMediaTitle] = useState("");
  const [serverIndex, setServerIndex] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isTV, setIsTV] = useState(false);
  const [seasonsData, setSeasonsData] = useState<any[]>([]);
  const [tmdbId, setTmdbId] = useState("");

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const currentUserDisplayName = user?.displayName || guestName || "ضيف";
  const isHost = room?.host_id === (user?.uid || currentParticipantId);

  useEffect(() => {
    if (!roomId) return;
    loadRoomInitial();
  }, [roomId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const loadRoomInitial = async () => {
    try {
      const roomRef = doc(db, "rooms", roomId);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        setError("هذه الغرفة غير موجودة أو تم حذفها.");
        setLoading(false);
        return;
      }

      const roomData = roomSnap.data() as Room;
      setRoom({ ...roomData, id: roomSnap.id });
      
      const isHostUser = user && user.uid === roomData.host_id;
      if (roomData.password && !isHostUser) {
        setShowPasswordModal(true);
      } else {
        setIsAuthenticated(true);
      }

      // Load media details from Server Action
      const mediaData = await getMediaDetails(roomData.media_id);
      
      if (mediaData) {
        setMediaTitle(mediaData.title);
        const tvMode = roomData.media_type === "tv" || mediaData.type === "tv";
        setIsTV(tvMode);
        const actualTmdbId = mediaData.tmdbId || mediaData.id;
        setTmdbId(actualTmdbId.toString());

        // Fetch real season/episode counts from TMDB if it's a TV show
        if (tvMode && actualTmdbId) {
          try {
            const tmdbKey = "a3ea4c84477a77480256e85e2904c186";
            const res = await fetch(`https://api.themoviedb.org/3/tv/${actualTmdbId}?api_key=${tmdbKey}&language=ar`);
            const tmdbData = await res.json();
            if (tmdbData.seasons) {
              const realSeasons = tmdbData.seasons.filter((s: any) => s.season_number > 0);
              setSeasonsData(realSeasons);
            }
          } catch (e) {
            console.error("Failed to fetch tmdb seasons", e);
          }
        }
      }

      setLoading(false);
    } catch (err) {
      setError("حدث خطأ في الاتصال.");
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === room?.password) {
      setShowPasswordModal(false);
      setIsAuthenticated(true);
    } else {
      alert("كلمة المرور غير صحيحة");
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestName.trim()) {
      setShowNameModal(false);
      joinRoom();
    }
  };

  // Setup Firebase Listeners AFTER authentication and name is set
  useEffect(() => {
    if (isAuthenticated && room && !loading) {
      if (!user && !guestName) {
        setShowNameModal(true);
      } else {
        joinRoom();
      }
    }
  }, [isAuthenticated, guestName, user, loading]);

  const joinRoom = async () => {
    const participantId = user?.uid || `guest_${Math.random().toString(36).substring(7)}`;
    setCurrentParticipantId(participantId);

    const roomRef = doc(db, "rooms", roomId);
    
    // 1. Add self to participants array
    const participantObj = {
      id: participantId,
      name: user?.displayName || guestName || "ضيف",
      isHost: room?.host_id === participantId
    };

    try {
      await updateDoc(roomRef, {
        participants: arrayUnion(participantObj)
      });
    } catch(e) {
      console.error("Failed to join presence", e);
    }

    // 2. Remove self on window close
    const handleBeforeUnload = () => {
      // Use navigator.sendBeacon or simple sync call in real app, but for simplicity:
      updateDoc(roomRef, {
        participants: arrayRemove(participantObj)
      });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // 3. Listen to Room State changes (metadata sync & presence)
    const unsubscribeRoom = onSnapshot(roomRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Room;
        setRoom(data);
        if (data.metadata) {
          if (data.metadata.server !== undefined) setServerIndex(data.metadata.server);
          if (data.metadata.season !== undefined) setSelectedSeason(data.metadata.season);
          if (data.metadata.episode !== undefined) setSelectedEpisode(data.metadata.episode);
        }
      } else {
        setError("تم إغلاق الغرفة.");
      }
    });

    // 4. Listen to Messages
    const messagesRef = collection(db, "rooms", roomId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"), limit(100));
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload();
      unsubscribeRoom();
      unsubscribeMessages();
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId) return;

    const msgText = newMessage.trim();
    setNewMessage("");

    await addDoc(collection(db, "rooms", roomId, "messages"), {
      user_name: currentUserDisplayName,
      text: msgText,
      timestamp: serverTimestamp(),
    });
  };

  const handleSyncStateChange = async (server: number, season: number, episode: number) => {
    if (!isHost) return;
    
    setServerIndex(server);
    setSelectedSeason(season);
    setSelectedEpisode(episode);

    await updateDoc(doc(db, "rooms", roomId), {
      metadata: { server, season, episode }
    });
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("تم نسخ رابط الغرفة! أرسله لأصدقائك.");
  };

  if (!authLoading && !user) {
    return <LoginRequired />;
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center space-y-4">
        <h1 className="text-3xl font-black">الغرفة غير متوفرة</h1>
        <p className="text-gray-400">{error}</p>
        <button onClick={() => router.push("/")} className="bg-red-600 px-6 py-2 rounded-xl font-bold hover:bg-red-700">العودة للرئيسية</button>
      </div>
    );
  }

  if (showPasswordModal) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4" dir="rtl">
        <form onSubmit={handlePasswordSubmit} className="bg-[#181818] border border-gray-800 p-8 rounded-3xl max-w-sm w-full space-y-6">
          <div className="text-center space-y-2">
            <Lock className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-black text-white">غرفة خاصة</h2>
            <p className="text-xs text-gray-400 font-bold">أدخل كلمة المرور للانضمام إلى الغرفة</p>
          </div>
          <input
            type="password"
            required
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="كلمة المرور..."
            className="w-full bg-[#111111] text-white text-center tracking-widest text-lg px-4 py-3 rounded-xl border border-gray-800 focus:border-red-600 focus:outline-none"
          />
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition">
            دخول الغرفة
          </button>
        </form>
      </div>
    );
  }

  if (showNameModal) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4" dir="rtl">
        <form onSubmit={handleNameSubmit} className="bg-[#181818] border border-gray-800 p-8 rounded-3xl max-w-sm w-full space-y-6">
          <div className="text-center space-y-2">
            <Users className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-black text-white">اختر اسماً لك</h2>
            <p className="text-xs text-gray-400 font-bold">الرجاء إدخال اسمك ليظهر للآخرين في الدردشة</p>
          </div>
          <input
            type="text"
            required
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="اسمك..."
            className="w-full bg-[#111111] text-white text-center text-lg px-4 py-3 rounded-xl border border-gray-800 focus:border-red-600 focus:outline-none"
          />
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition">
            متابعة
          </button>
        </form>
      </div>
    );
  }

  const servers = [
    { name: "سيرفر 1", url: isTV ? `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${selectedSeason}&episode=${selectedEpisode}` : `https://vidsrc.me/embed/movie?tmdb=${tmdbId}` },
    { name: "سيرفر 2", url: isTV ? `https://player.autoembed.cc/embed/tv/${tmdbId}/${selectedSeason}/${selectedEpisode}` : `https://player.autoembed.cc/embed/movie/${tmdbId}` },
    { name: "سيرفر 3", url: isTV ? `https://vidsrc.to/embed/tv/${tmdbId}/${selectedSeason}/${selectedEpisode}` : `https://vidsrc.to/embed/movie/${tmdbId}` },
  ];
  const currentStreamUrl = servers[serverIndex]?.url || servers[0].url;

  return (
    <div className="h-screen flex flex-col bg-[#0f0f0f] text-white overflow-hidden selection:bg-[#e50914] selection:text-white" dir="rtl">
      {/* Header */}
      <div className="h-16 bg-[#161616] border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-black text-white flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <span className="text-red-600 font-extrabold text-2xl">MOVIS</span> 
            <span className="bg-red-600/20 text-red-500 text-[10px] px-2 py-1 rounded font-bold">WATCH PARTY</span>
          </h1>
          <div className="h-6 w-px bg-gray-800 mx-2" />
          <div>
            <h2 className="text-sm font-bold">{room?.name}</h2>
            <p className="text-[10px] text-gray-400 flex items-center gap-1">
              <Play className="w-3 h-3 text-red-500 fill-red-500" /> {mediaTitle} {isTV && `(موسم ${selectedSeason} حلقة ${selectedEpisode})`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={copyRoomLink} className="flex items-center gap-1.5 bg-[#222] hover:bg-[#333] text-gray-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-800 transition">
            <LinkIcon className="w-3.5 h-3.5" />
            <span>نسخ الرابط</span>
          </button>
          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 text-xs font-bold px-3 py-1.5 rounded-lg transition border border-red-900/30">
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT/MAIN: Video Player */}
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 relative">
            <iframe
              key={`${serverIndex}-${selectedSeason}-${selectedEpisode}`}
              src={currentStreamUrl}
              className="w-full h-full border-0"
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
            />
          </div>

          {/* Host Controls */}
          {isHost && (
            <div className="bg-[#161616] p-4 rounded-xl border border-red-900/50 shadow-lg space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
                <Settings className="w-4 h-4 text-red-500" />
                <h3 className="text-xs font-bold text-red-500">تحكم مدير الغرفة (Host)</h3>
                <span className="text-[10px] text-gray-400 mr-auto">أي تغيير سيتغير عند جميع الحضور فوراً</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-300">السيرفر:</span>
                  <select 
                    value={serverIndex} 
                    onChange={(e) => handleSyncStateChange(Number(e.target.value), selectedSeason, selectedEpisode)}
                    className="bg-black text-white text-xs px-2 py-1.5 rounded-lg border border-gray-700 outline-none focus:border-red-600"
                  >
                    {servers.map((s, i) => <option key={i} value={i}>{s.name}</option>)}
                  </select>
                </div>
                
                {isTV ? (
                  <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded">
                    يمكنك تغيير الحلقات من القائمة الجانبية
                  </span>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Chat & Presence Sidebar */}
        <div className="w-80 bg-[#141414] border-r border-gray-800 flex flex-col shrink-0 relative z-10">
          
          {isTV && (
            <div className="flex border-b border-gray-800 shrink-0">
              <button 
                onClick={() => setActiveTab('chat')} 
                className={`flex-1 py-3 text-xs font-bold transition ${activeTab === 'chat' ? 'text-red-500 border-b-2 border-red-600 bg-red-900/10' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'}`}
              >
                الدردشة
              </button>
              <button 
                onClick={() => setActiveTab('episodes')} 
                className={`flex-1 py-3 text-xs font-bold transition ${activeTab === 'episodes' ? 'text-red-500 border-b-2 border-red-600 bg-red-900/10' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'}`}
              >
                مواسم وحلقات
              </button>
            </div>
          )}

          {/* Presence Tab */}
          <div className="p-3 border-b border-gray-800 shrink-0">
            <h3 className="text-xs font-bold text-gray-400 mb-2 flex items-center justify-between">
              <span>الحضور ({room?.participants?.length || 0})</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {room?.participants?.map((p, idx) => (
                <div key={idx} className="bg-gray-800 text-[10px] px-2 py-1 rounded-md font-bold flex items-center gap-1">
                  {p.isHost && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                  {p.name}
                </div>
              ))}
            </div>
          </div>

          {activeTab === 'chat' ? (
            <>
              {/* Chat Messages */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <MessageSquare className="w-10 h-10 mb-2" />
                    <p className="text-xs font-bold">لا توجد رسائل بعد</p>
                    <p className="text-[10px]">ابدأ الدردشة مع أصدقائك!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.user_name === currentUserDisplayName;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] text-gray-500 mb-1 mx-1">{msg.user_name}</span>
                        <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm break-words ${isMe ? 'bg-red-600 rounded-tr-sm' : 'bg-[#222] rounded-tl-sm border border-gray-800'}`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-gray-800 bg-[#161616] shrink-0">
                <form onSubmit={sendMessage} className="relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="اكتب رسالة..."
                    className="w-full bg-black text-white text-xs px-4 py-3 pr-12 rounded-xl border border-gray-700 focus:border-red-600 focus:outline-none transition"
                  />
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="absolute right-1.5 top-1.5 bottom-1.5 w-9 bg-red-600 disabled:bg-gray-800 hover:bg-red-700 text-white rounded-lg flex items-center justify-center transition"
                  >
                    <Send className="w-4 h-4 rtl:-scale-x-100" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Seasons Select */}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">اختر الموسم:</label>
                <select 
                  value={selectedSeason}
                  onChange={(e) => handleSyncStateChange(serverIndex, Number(e.target.value), 1)}
                  disabled={!isHost}
                  className="w-full bg-[#111] border border-gray-800 text-white p-2.5 rounded-xl text-xs font-bold outline-none focus:border-red-600 transition disabled:opacity-50"
                >
                  {seasonsData.length > 0 ? (
                    seasonsData.map((s) => (
                      <option key={s.season_number} value={s.season_number}>الموسم {s.season_number}</option>
                    ))
                  ) : (
                    <option value={1}>الموسم 1</option>
                  )}
                </select>
              </div>

              {/* Episodes Grid */}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-3 block">حلقات الموسم {selectedSeason}:</label>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({length: seasonsData.find(s => s.season_number === selectedSeason)?.episode_count || 10}).map((_, i) => {
                    const ep = i + 1;
                    const isCurrent = selectedEpisode === ep;
                    return (
                      <button 
                        key={ep}
                        onClick={() => handleSyncStateChange(serverIndex, selectedSeason, ep)}
                        disabled={!isHost}
                        className={`py-2 text-xs font-black rounded-lg border transition-all ${
                          isCurrent 
                            ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/20' 
                            : 'bg-[#222] text-gray-300 border-gray-800 hover:border-gray-600'
                        } ${!isHost && 'opacity-50 cursor-not-allowed hover:border-gray-800'}`}
                      >
                        {ep}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {!isHost && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center mt-4">
                  <p className="text-[10px] text-red-400 font-bold">مدير الغرفة (Host) فقط يمكنه تغيير الحلقات.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
