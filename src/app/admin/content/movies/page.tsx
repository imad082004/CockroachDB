"use client";

import React, { useState, useEffect } from "react";
import { Film, Plus, Search, Trash2, Edit, AlertCircle, X, Check, Eye } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { getAdminMovies, addAdminMovie, deleteAdminMovie } from "@/app/actions/admin";

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Movie Form State
  const [newMovie, setNewMovie] = useState({
    tmdb_id: "",
    title: "",
    original_title: "",
    description: "",
    description_en: "",
    cover_url: "",
    backdrop_url: "",
    cover_url_en: "",
    backdrop_url_en: "",
    rating: "8.0",
    release_date: "2026-01-01",
  });

  const fetchMovies = async () => {
    setLoading(true);
    const data = await getAdminMovies();
    setMovies(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingItem(true);
    setError(null);

    try {
      const res = await addAdminMovie({
        tmdb_id: parseInt(newMovie.tmdb_id) || 0,
        title: newMovie.title,
        original_title: newMovie.original_title || newMovie.title,
        description: newMovie.description,
        description_en: newMovie.description_en || newMovie.description,
        cover_url: newMovie.cover_url,
        backdrop_url: newMovie.backdrop_url,
        cover_url_en: newMovie.cover_url_en || newMovie.cover_url,
        backdrop_url_en: newMovie.backdrop_url_en || newMovie.backdrop_url,
        rating: parseFloat(newMovie.rating),
        release_date: newMovie.release_date,
        type: "movie",
      });

      if (!res.success) throw new Error(res.error);

      setShowAddModal(false);
      setNewMovie({
        tmdb_id: "", title: "", original_title: "", description: "", description_en: "", cover_url: "", backdrop_url: "", cover_url_en: "", backdrop_url_en: "", rating: "8.0", release_date: "2026-01-01"
      });
      fetchMovies();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء الإضافة.");
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteMovie = async (id: string) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا الفيلم؟")) return;
    
    try {
      const res = await deleteAdminMovie(id.toString());
      if (!res.success) throw new Error(res.error);
      setMovies(movies.filter(m => m.id !== id.toString()));
    } catch (err) {
      console.error("Error deleting movie:", err);
      alert("فشل حذف الفيلم.");
    }
  };

  const filteredMovies = movies.filter(m => 
    m.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.originalTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Film className="w-8 h-8 text-red-600" />
            إدارة الأفلام
          </h1>
          <p className="text-sm text-gray-400 mt-1">إضافة، تعديل، وحذف الأفلام المتاحة في المنصة (Supabase Database).</p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-red-600/20"
        >
          <Plus className="w-5 h-5" />
          إضافة فيلم جديد
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 bg-[#111] p-4 rounded-2xl border border-gray-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-500 absolute top-1/2 -translate-y-1/2 right-4" />
          <input 
            type="text" 
            placeholder="ابحث عن فيلم..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#181818] border border-gray-800 rounded-xl px-12 py-2.5 text-sm focus:outline-none focus:border-red-600 transition"
          />
        </div>
        <div className="text-sm text-gray-400 font-bold px-4">
          إجمالي الأفلام: <span className="text-white">{movies.length}</span>
        </div>
      </div>

      {/* Movies Table */}
      <div className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-20">
            <div className="w-10 h-10 border-4 border-gray-800 border-t-red-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-[#181818] text-gray-400 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">الفيلم</th>
                  <th className="p-4">سنة الإصدار</th>
                  <th className="p-4">التقييم</th>
                  <th className="p-4">تاريخ الإضافة</th>
                  <th className="p-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filteredMovies.map(movie => (
                  <tr key={movie.id} className="hover:bg-white/5 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={movie.coverUrl || "https://via.placeholder.com/150"} alt={movie.title} className="w-10 h-14 object-cover rounded-md bg-gray-900" />
                        <div>
                          <p className="font-bold text-sm text-white">{movie.title}</p>
                          <p className="text-[10px] text-gray-500">{movie.originalTitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-300">{movie.releaseDate?.split("-")[0] || "-"}</td>
                    <td className="p-4">
                      <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-xs font-bold border border-yellow-500/20">
                        {movie.rating}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500">تم جلبها من DB</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition" title="تعديل">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMovie(movie.id as string)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition" title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredMovies.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-500">لا توجد أفلام.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Movie Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-gray-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#161616] sticky top-0 z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-500" />
                إضافة فيلم جديد
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddMovie} className="p-6 space-y-5">
              {error && (
                <div className="flex items-center gap-2 bg-red-950/50 border border-red-800 text-red-400 p-3 rounded-xl text-xs font-bold">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-bold">العنوان بالعربية</label>
                  <input required value={newMovie.title} onChange={e => setNewMovie({...newMovie, title: e.target.value})} type="text" className="w-full bg-[#181818] border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-600 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-bold">العنوان بالإنجليزية (Original Title)</label>
                  <input value={newMovie.original_title} onChange={e => setNewMovie({...newMovie, original_title: e.target.value})} type="text" className="w-full bg-[#181818] border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-600 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-bold">الوصف بالعربية</label>
                  <textarea required value={newMovie.description} onChange={e => setNewMovie({...newMovie, description: e.target.value})} rows={3} className="w-full bg-[#181818] border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-600 focus:outline-none resize-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-bold">الوصف بالإنجليزية</label>
                  <textarea value={newMovie.description_en} onChange={e => setNewMovie({...newMovie, description_en: e.target.value})} rows={3} className="w-full bg-[#181818] border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-600 focus:outline-none resize-none" dir="ltr" />
                </div>
              </div>

              <div className="p-4 bg-[#181818] rounded-xl border border-gray-800 space-y-4">
                <h3 className="text-xs font-bold text-white border-b border-gray-700 pb-2">الصور (النسخة العربية)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 font-bold">رابط صورة الغلاف (Cover URL)</label>
                    <input required value={newMovie.cover_url} onChange={e => setNewMovie({...newMovie, cover_url: e.target.value})} type="url" className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-600 focus:outline-none" dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 font-bold">رابط الخلفية (Backdrop URL)</label>
                    <input value={newMovie.backdrop_url} onChange={e => setNewMovie({...newMovie, backdrop_url: e.target.value})} type="url" className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-600 focus:outline-none" dir="ltr" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#181818] rounded-xl border border-gray-800 space-y-4">
                <h3 className="text-xs font-bold text-white border-b border-gray-700 pb-2">الصور (النسخة الإنجليزية) اختياري</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 font-bold">رابط صورة الغلاف الإنجليزية</label>
                    <input value={newMovie.cover_url_en} onChange={e => setNewMovie({...newMovie, cover_url_en: e.target.value})} type="url" className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-600 focus:outline-none" dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 font-bold">رابط الخلفية الإنجليزية</label>
                    <input value={newMovie.backdrop_url_en} onChange={e => setNewMovie({...newMovie, backdrop_url_en: e.target.value})} type="url" className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-600 focus:outline-none" dir="ltr" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-bold">التقييم (Rating)</label>
                  <input required value={newMovie.rating} onChange={e => setNewMovie({...newMovie, rating: e.target.value})} type="number" step="0.1" max="10" className="w-full bg-[#181818] border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-600 focus:outline-none" dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-bold">سنة الإصدار (Release Date)</label>
                  <input required value={newMovie.release_date} onChange={e => setNewMovie({...newMovie, release_date: e.target.value})} type="date" className="w-full bg-[#181818] border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-600 focus:outline-none" dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-bold">TMDB ID (اختياري)</label>
                  <input value={newMovie.tmdb_id} onChange={e => setNewMovie({...newMovie, tmdb_id: e.target.value})} type="number" className="w-full bg-[#181818] border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-600 focus:outline-none" dir="ltr" />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-800 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition">إلغاء</button>
                <button disabled={addingItem} type="submit" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-600/20">
                  {addingItem ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                  حفظ الفيلم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
