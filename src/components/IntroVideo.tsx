"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export const IntroVideo: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    // Check if intro was already played in this browser session
    const played = sessionStorage.getItem("movis_intro_played");
    if (played === "true") {
      setShowIntro(false);
    }
  }, []);

  const handleFinish = () => {
    setFadingOut(true);
    sessionStorage.setItem("movis_intro_played", "true");
    setTimeout(() => {
      setShowIntro(false);
    }, 700); // 700ms smooth fade out transition
  };

  if (!showIntro) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-700 select-none ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Cinematic Fullscreen Intro Video */}
      <video
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleFinish}
        className="w-full h-full object-cover scale-105"
      />

      {/* Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none" />
    </div>
  );
};
