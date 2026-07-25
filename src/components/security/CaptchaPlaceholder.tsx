"use client";

import React, { useState, useEffect } from "react";
import { Check, ShieldAlert } from "lucide-react";

interface CaptchaPlaceholderProps {
  onVerify?: (verified: boolean) => void;
}

export function CaptchaPlaceholder({ onVerify }: CaptchaPlaceholderProps) {
  const [status, setStatus] = useState<"idle" | "checking" | "verified">("idle");

  useEffect(() => {
    if (status === "verified" && onVerify) {
      onVerify(true);
    }
  }, [status, onVerify]);

  const handleClick = () => {
    if (status === "verified") return;
    setStatus("checking");
    setTimeout(() => {
      setStatus("verified");
    }, 1500);
  };

  return (
    <div 
      className={`relative overflow-hidden bg-[#161616] border ${status === 'verified' ? 'border-emerald-500/50' : 'border-gray-800'} rounded-xl p-3 flex items-center justify-between transition-colors duration-300 group cursor-pointer`}
      onClick={handleClick}
      dir="ltr"
    >
      <div className="flex items-center gap-3">
        <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all duration-300 ${status === 'verified' ? 'bg-emerald-500 border-emerald-500' : status === 'checking' ? 'border-red-500 border-t-transparent rounded-full animate-spin' : 'border-gray-600 bg-[#111] group-hover:border-red-500'}`}>
          {status === 'verified' && <Check className="w-4 h-4 text-white" />}
        </div>
        <span className={`text-xs font-bold ${status === 'verified' ? 'text-emerald-400' : 'text-gray-300'}`}>
          {status === 'verified' ? 'Verified securely' : 'Verify you are human'}
        </span>
      </div>
      <div className="flex flex-col items-center opacity-60">
        <ShieldAlert className="w-5 h-5 text-red-500" />
        <span className="text-[8px] font-bold text-gray-500 mt-0.5">MOVIS Shield</span>
      </div>

      {status === 'checking' && (
        <div className="absolute bottom-0 left-0 h-0.5 bg-red-600 animate-[progress_1.5s_ease-in-out]" style={{ width: '100%' }} />
      )}
    </div>
  );
}
