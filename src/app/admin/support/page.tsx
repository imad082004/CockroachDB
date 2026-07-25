"use client";

import React, { useState, useEffect } from "react";
import { LifeBuoy, Mail, MessageCircle, Trash2, CheckCircle } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  email: string;
  status: "open" | "closed";
  createdAt: any;
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "support_tickets"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data: Ticket[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Ticket);
      });
      setTickets(data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
    setLoading(false);
  };

  const markAsClosed = async (id: string) => {
    try {
      await updateDoc(doc(db, "support_tickets", id), { status: "closed" });
      setTickets(tickets.map(t => t.id === id ? { ...t, status: "closed" } : t));
    } catch (err) {
      console.error(err);
      alert("فشل تحديث التذكرة.");
    }
  };

  const deleteTicket = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه التذكرة؟")) return;
    try {
      await deleteDoc(doc(db, "support_tickets", id));
      setTickets(tickets.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
      alert("فشل حذف التذكرة.");
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <LifeBuoy className="w-8 h-8 text-teal-500" />
            الدعم الفني والرسائل
          </h1>
          <p className="text-sm text-gray-400 mt-1">الرد على تذاكر الدعم الفني (مجلبة من Firebase `support_tickets`).</p>
        </div>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-400" />
            صندوق الوارد
          </h3>
          <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {tickets.filter(t => t.status === "open").length} رسائل جديدة
          </span>
        </div>
        
        {loading ? (
          <div className="p-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center space-y-3">
            <MessageCircle className="w-16 h-16 text-gray-800" />
            <h3 className="text-white font-bold text-lg">لا توجد رسائل حالياً</h3>
            <p className="text-gray-500 text-sm">كل شيء هادئ هنا. ستظهر رسائل المستخدمين هنا بمجرد إرسالها.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {tickets.map(ticket => (
              <div key={ticket.id} className={`p-6 flex flex-col md:flex-row gap-4 justify-between transition ${ticket.status === 'open' ? 'bg-[#151515] hover:bg-[#1a1a1a]' : 'bg-[#0f0f0f] opacity-70 hover:opacity-100'}`}>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h4 className={`font-bold ${ticket.status === 'open' ? 'text-white' : 'text-gray-400'}`}>{ticket.subject}</h4>
                    {ticket.status === 'open' ? (
                      <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded font-bold">جديد</span>
                    ) : (
                      <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-bold">مغلق</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 max-w-2xl">{ticket.message}</p>
                  <p className="text-xs text-teal-500 font-bold">{ticket.email}</p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {ticket.status === 'open' && (
                    <button 
                      onClick={() => markAsClosed(ticket.id)}
                      className="p-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-500 rounded-lg transition" 
                      title="تحديد كمقروء ومغلق"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteTicket(ticket.id)}
                    className="p-2 bg-red-950 hover:bg-red-900 text-red-500 rounded-lg transition" 
                    title="حذف الرسالة"
                  >
                    <Trash2 className="w-5 h-5" />
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
