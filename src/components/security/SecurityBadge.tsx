import React from "react";

interface SecurityBadgeProps {
  icon: React.ElementType;
  label: string;
  variant?: "success" | "warning" | "danger" | "info" | "default";
}

export function SecurityBadge({ icon: Icon, label, variant = "default" }: SecurityBadgeProps) {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    default: "bg-gray-800/50 text-gray-300 border-gray-700",
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold backdrop-blur-sm ${styles[variant]}`}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  );
}
