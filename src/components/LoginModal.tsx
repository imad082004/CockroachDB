"use client";

import React from "react";
import Link from "next/link";
import { Lock, X } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
      <div className="bg-[#181818] border border-gray-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-500 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">عذراً!</h2>
          <p className="text-xs text-gray-400 font-bold leading-relaxed">
            يجب عليك تسجيل الدخول أولاً لتتمكن من استخدام هذه الميزة.
          </p>
        </div>
        
        <div className="flex flex-col gap-3 pt-2">
          <Link 
            href="/login" 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-red-600/20"
          >
            تسجيل الدخول
          </Link>
          <button 
            onClick={onClose} 
            className="w-full bg-transparent hover:bg-gray-800 text-gray-300 font-bold py-3.5 rounded-xl transition"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
