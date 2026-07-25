"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, Trash2, Edit, ShieldAlert, ShieldCheck, Mail, Calendar } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

interface UserData {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  status: string;
  createdAt: any;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData: UserData[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as UserData);
      });
      setUsers(usersData);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!confirm(`هل أنت متأكد من تغيير صلاحية هذا المستخدم إلى ${newRole}؟`)) return;
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error("Error updating role:", err);
      alert("فشل تحديث الصلاحية.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف بيانات هذا المستخدم نهائياً من قاعدة البيانات؟ (لن يؤدي هذا لحذف حسابه من نظام المصادقة إلا من لوحة تحكم Firebase)")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("فشل حذف المستخدم.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            إدارة المستخدمين
          </h1>
          <p className="text-sm text-gray-400 mt-1">إدارة حسابات المستخدمين، الصلاحيات، والباقات (Firebase Database).</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 bg-[#111] p-4 rounded-2xl border border-gray-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-500 absolute top-1/2 -translate-y-1/2 right-4" />
          <input 
            type="text" 
            placeholder="ابحث بالاسم أو البريد..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#181818] border border-gray-800 rounded-xl px-12 py-2.5 text-sm focus:outline-none focus:border-blue-600 transition"
          />
        </div>
        <div className="text-sm text-gray-400 font-bold px-4">
          إجمالي المستخدمين: <span className="text-white">{users.length}</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-20">
            <div className="w-10 h-10 border-4 border-gray-800 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-[#181818] text-gray-400 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">المستخدم</th>
                  <th className="p-4">الصلاحية (Role)</th>
                  <th className="p-4">الباقة (Plan)</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-white/5 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-500 font-bold border border-blue-800">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{user.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {user.role?.toLowerCase() === "admin" ? (
                          <span className="bg-red-500/10 text-red-500 px-2.5 py-1 rounded-md text-xs font-bold border border-red-500/20 flex items-center gap-1 w-fit">
                            <ShieldCheck className="w-3.5 h-3.5" /> Admin
                          </span>
                        ) : (
                          <span className="bg-gray-800 text-gray-400 px-2.5 py-1 rounded-md text-xs font-bold border border-gray-700 flex items-center gap-1 w-fit">
                            Client
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border w-fit ${
                        user.plan === "Free" ? "bg-gray-800 text-gray-400 border-gray-700" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      }`}>
                        {user.plan || "Free"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        {user.status || "Active"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {user.role?.toLowerCase() === "client" ? (
                          <button 
                            onClick={() => handleUpdateRole(user.id, "admin")}
                            className="text-xs font-bold bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 px-3 py-1.5 rounded-lg transition"
                          >
                            ترقية لمشرف
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUpdateRole(user.id, "client")}
                            className="text-xs font-bold bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition"
                          >
                            إزالة الإشراف
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition" title="حذف المستخدم"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-500">لا يوجد مستخدمين.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
