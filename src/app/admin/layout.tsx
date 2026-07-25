"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Security check: verify admin claims via user.role
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin" && user.role !== "super_admin") {
        router.push("/"); // Redirect clients to home page
      }
    }
  }, [user, loading, router]);

  if (loading || !user || (user.role !== "admin" && user.role !== "super_admin")) {
    return <div className="min-h-screen bg-[#0a0a0a]" />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex" dir="ltr">
      {/* Sidebar is fixed to the right/left depending on dir, but we use LTR for Admin Panel usually or force RTL for content. We'll use LTR for the Sidebar layout for now, with text in English/Arabic */}
      <AdminSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 transition-all duration-300 w-full min-h-screen bg-[#050505]">
        {children}
      </main>
    </div>
  );
}
