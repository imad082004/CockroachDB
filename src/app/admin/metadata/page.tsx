"use client";

import React, { useState, useEffect } from "react";
import { Database, Plus, Search, Tag, Trash2, Edit2, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";

interface MetadataItem {
  id: string;
  name: string;
  nameEn?: string; // Optional english name
  slug?: string;
  createdAt?: any;
}

export default function AdminMetadataPage() {
  const [activeTab, setActiveTab] = useState<"genres" | "studios" | "tags">("genres");
  const [items, setItems] = useState<MetadataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Add new item state
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemNameEn, setNewItemNameEn] = useState("");

  const fetchItems = async (type: "genres" | "studios" | "tags") => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, type));
      const data: MetadataItem[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as MetadataItem);
      });
      setItems(data);
    } catch (error) {
      console.error("Error fetching metadata:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(activeTab);
  }, [activeTab]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      const slug = newItemNameEn 
        ? newItemNameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-') 
        : newItemName.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-');
        
      const docRef = await addDoc(collection(db, activeTab), {
        name: newItemName.trim(),
        nameEn: newItemNameEn.trim(),
        slug,
        createdAt: serverTimestamp()
      });
      
      setItems([{
        id: docRef.id,
        name: newItemName.trim(),
        nameEn: newItemNameEn.trim(),
        slug
      }, ...items]);
      
      setNewItemName("");
      setNewItemNameEn("");
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding item:", error);
      alert("فشل في إضافة العنصر.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العنصر؟")) return;
    try {
      await deleteDoc(doc(db, activeTab, id));
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("فشل في الحذف.");
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.nameEn && item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTabLabel = (tab: string) => {
    switch(tab) {
      case "genres": return "التصنيفات (Genres)";
      case "studios": return "الاستوديوهات (Studios)";
      case "tags": return "الكلمات المفتاحية (Tags)";
      default: return "";
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-500" />
            البيانات الوصفية (Metadata)
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            إدارة التصنيفات، الاستوديوهات، والكلمات المفتاحية للأفلام والمسلسلات.
          </p>
        </div>
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة {activeTab === "genres" ? "تصنيف" : activeTab === "studios" ? "استوديو" : "كلمة مفتاحية"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 space-x-reverse border-b border-gray-800 pb-px overflow-x-auto">
        {["genres", "studios", "tags"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-bold text-sm whitespace-nowrap transition border-b-2 ${
              activeTab === tab 
                ? "border-blue-500 text-blue-500" 
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {getTabLabel(tab)}
          </button>
        ))}
      </div>

      {/* Search & Add Form */}
      <div className="bg-[#111] p-6 rounded-3xl border border-gray-800 space-y-6">
        
        {isAdding && (
          <form onSubmit={handleAddItem} className="bg-[#181818] p-5 rounded-2xl border border-blue-500/30 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-sm font-bold text-gray-400">الاسم بالعربية</label>
              <input 
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="مثال: أكشن..."
              />
            </div>
            <div className="flex-1 w-full space-y-2">
              <label className="text-sm font-bold text-gray-400">الاسم بالإنجليزية (اختياري)</label>
              <input 
                type="text"
                value={newItemNameEn}
                onChange={(e) => setNewItemNameEn(e.target.value)}
                className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="مثال: Action..."
              />
            </div>
            <div className="w-full md:w-auto flex gap-2">
              <button type="submit" className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl font-bold transition">
                حفظ
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 md:flex-none bg-gray-800 hover:bg-gray-700 px-6 py-2.5 rounded-xl font-bold transition">
                إلغاء
              </button>
            </div>
          </form>
        )}

        <div className="relative">
          <Search className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`البحث في ${getTabLabel(activeTab)}...`}
            className="w-full bg-[#181818] border border-gray-800 rounded-2xl pr-12 pl-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>لا يوجد عناصر. قم بإضافة {getTabLabel(activeTab)} جديدة.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-[#181818] p-4 rounded-2xl border border-gray-800 flex items-center justify-between group hover:border-blue-500/50 transition">
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  {item.nameEn && <p className="text-xs text-gray-500">{item.nameEn}</p>}
                  {item.slug && <p className="text-[10px] text-gray-600 mt-1">/{item.slug}</p>}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
