"use client";

import React, { useMemo } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password?: string;
}

export function PasswordStrength({ password = "" }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    let score = 0;
    if (!password) return 0;
    if (password.length > 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(score, 4);
  }, [password]);

  const getColor = () => {
    if (strength === 0) return "bg-gray-800 shadow-none";
    if (strength <= 2) return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
    if (strength === 3) return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]";
    return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
  };

  const getLabel = () => {
    if (!password) return "أدخل كلمة المرور";
    if (strength <= 2) return "ضعيفة";
    if (strength === 3) return "متوسطة";
    return "قوية جداً";
  };

  const getLabelColor = () => {
    if (!password) return "text-gray-500";
    if (strength <= 2) return "text-red-400";
    if (strength === 3) return "text-yellow-400";
    return "text-emerald-400";
  };

  const requirements = [
    { label: "8 أحرف على الأقل", met: password.length >= 8 },
    { label: "حرف كبير", met: /[A-Z]/.test(password) },
    { label: "حرف صغير", met: /[a-z]/.test(password) },
    { label: "رقم أو رمز", met: /[0-9^A-Za-z0-9]/.test(password) }
  ];

  return (
    <div className="space-y-3 mt-2" dir="rtl">
      <div className="flex items-center justify-between text-[10px] font-bold">
        <span className="text-gray-400">قوة كلمة المرور:</span>
        <span className={getLabelColor()}>{getLabel()}</span>
      </div>
      
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4].map((level) => (
          <div 
            key={level} 
            className={`flex-1 rounded-full transition-all duration-300 ${strength >= level ? getColor() : 'bg-gray-800'}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        {requirements.map((req, i) => (
          <div key={i} className={`flex items-center gap-1.5 text-[10px] font-bold ${req.met ? 'text-emerald-400' : 'text-gray-500'}`}>
            {req.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
