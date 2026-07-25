"use client";

import React, { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Upload, Search, Trash2, Copy, CheckCircle2, Loader2, Link as LinkIcon, FileImage } from "lucide-react";
import { db, storage } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

interface MediaItem {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  createdAt: any;
}

export default function AdminMediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "media"));
      const data: MediaItem[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as MediaItem);
      });
      // Sort by newest first client-side to avoid needing Firestore index
      data.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.seconds - a.createdAt.seconds;
      });
      setMedia(data);
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow images
    if (!file.type.startsWith("image/")) {
      alert("الرجاء اختيار ملف صورة فقط.");
      return;
    }

    // Limit size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("حجم الصورة يجب أن لا يتعدى 5 ميجابايت.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create a unique filename
      const uniqueName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `media/${uniqueName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          alert("فشل في رفع الصورة.");
          setUploading(false);
        },
        async () => {
          // Upload completed
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Save to Firestore
          const docRef = await addDoc(collection(db, "media"), {
            url: downloadURL,
            name: file.name,
            size: file.size,
            type: file.type,
            storagePath: `media/${uniqueName}`, // Keep path to delete from storage later
            createdAt: serverTimestamp(),
          });

          // Update UI
          setMedia([{
            id: docRef.id,
            url: downloadURL,
            name: file.name,
            size: file.size,
            type: file.type,
            createdAt: { seconds: Date.now() / 1000 } // Mock timestamp for immediate UI sorting
          }, ...media]);

          setUploading(false);
          setUploadProgress(0);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      );
    } catch (error) {
      console.error("Error initiating upload:", error);
      alert("حدث خطأ أثناء بدء الرفع.");
      setUploading(false);
    }
  };

  const handleDelete = async (item: MediaItem & { storagePath?: string }) => {
    if (!confirm("هل أنت متأكد من حذف هذه الصورة نهائياً؟")) return;
    
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "media", item.id));
      
      // Delete from Storage if path exists
      if (item.storagePath) {
        const fileRef = ref(storage, item.storagePath);
        await deleteObject(fileRef).catch(err => console.error("Error deleting from storage:", err));
      }
      
      setMedia(media.filter(m => m.id !== item.id));
    } catch (error) {
      console.error("Error deleting media:", error);
      alert("فشل في الحذف.");
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = media.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-pink-500" />
            مكتبة الوسائط (Media Library)
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            إدارة الصور والبوسترات المرفوعة على Firebase Storage.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            {uploading ? "جاري الرفع..." : "رفع صورة جديدة"}
          </button>
        </div>
      </div>

      {uploading && (
        <div className="bg-[#111] p-4 rounded-2xl border border-pink-500/30">
          <div className="flex justify-between text-sm mb-2 font-bold">
            <span className="text-pink-500">جاري الرفع...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-pink-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-[#111] p-6 rounded-3xl border border-gray-800 space-y-6">
        
        <div className="relative">
          <Search className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث عن اسم الصورة..."
            className="w-full bg-[#181818] border border-gray-800 rounded-2xl pr-12 pl-4 py-3 text-white focus:outline-none focus:border-pink-500 transition"
          />
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <FileImage className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">لا توجد صور مرفوعة.</p>
            <p className="text-sm mt-2 opacity-70">قم برفع الصور لتتمكن من استخدامها في المنصة.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMedia.map((item) => (
              <div key={item.id} className="group relative bg-[#181818] rounded-2xl border border-gray-800 overflow-hidden hover:border-pink-500/50 transition">
                {/* Image Thumbnail */}
                <div className="aspect-[4/5] bg-gray-900 relative overflow-hidden">
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                    <button 
                      onClick={() => handleCopy(item.url, item.id)}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition text-white"
                      title="نسخ الرابط"
                    >
                      {copiedId === item.id ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <LinkIcon className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => handleDelete(item)}
                      className="p-3 bg-red-500/80 hover:bg-red-600 rounded-xl transition text-white"
                      title="حذف"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Details */}
                <div className="p-3 border-t border-gray-800">
                  <p className="text-xs font-bold truncate text-gray-300" title={item.name}>{item.name}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{formatSize(item.size)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
