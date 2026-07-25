"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "ar" | "en";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Very simple dictionary for hardcoded text
const dictionary: Record<Language, Record<string, string>> = {
  ar: {
    "Home": "الرئيسية",
    "Series": "مسلسلات",
    "Movies": "أفلام",
    "Anime": "أنمي",
    "SearchPlaceholder": "بحث عن فيلم أو مسلسل...",
    "LatestMovies": "أحدث الأفلام السينمائية",
    "Top10": "أفضل 10 أعمال اليوم",
    "Top10Morocco": "أفضل 10 مسلسلات وبرامج في المغرب اليوم",
    "ContinueWatching": "متابعة المشاهدة",
    "GroupWatch": "اختيارات للمشاهدة الجماعية تُشعل النقاش",
    "AnimeTitle": "أنمي ياباني ورسوم متحركة",
    "KDrama": "دراما كورية",
    "USDrama": "عروض تلفزيونية نالت إعجاب النقاد",
    "Play": "تشغيل",
    "MoreInfo": "مزيد من المعلومات",
    "HD": "HD",
    "New": "جديد",
    "ReleaseYear": "سنة الإصدار:",
    "Type": "النوع:",
    "Cast": "بطولة:",
    "Watch": "مشاهدة",
    "Season": "الموسم",
    "Episode": "الحلقة",
    "EpisodesList": "قائمة الحلقات والمواسم:",
    "MovieDetails": "تفاصيل العمل:",
    "UpNext": "التالي للمشاهدة:",
    "Servers": "سيرفرات البث المباشر:",
    "OpenServer": "فتح بالسيرفر المباشر",
    "Comments": "تعليقات وانطباعات المشاهدين:",
    "AddComment": "أضف تعليقك حول الحلقة أو العمل...",
    "Send": "إرسال",
    "FooterHelp": "هل لديك أسئلة؟ اتصل بنا.",
    "FooterRights": "© 2026 MOVIS, Inc.",
    "SimilarTitles": "أعمال مشابهة قد تعجبك",
    "AddToList": "إضافة لقائمتي",
    "Back": "الرجوع للرئيسية",
    "Minutes": "دقيقة",
    "LiveServers": "سيرفرات البث المباشر:",
    "LoadingPlayer": "جاري تحضير مشغل البث سينمائياً...",
    "Movie": "الفيلم",
    "ActionMovies": "أفلام الأكشن والإثارة",
    "ComedyMovies": "أفلام كوميدية",
    "DramaMovies": "أفلام درامية",
    "SciFiMovies": "خيال علمي وفانتازيا",
    "UpcomingMovies": "أفلام قريباً (Upcoming)",
    "TopRatedThisWeek": "الأكثر مشاهدة هذا الأسبوع",
    "NewReleases": "إضافات جديدة",
    "SignIn": "تسجيل الدخول",
    "SignUp": "إنشاء حساب جديد",
    "SignOut": "تسجيل الخروج",
    "Email": "البريد الإلكتروني",
    "Password": "كلمة المرور",
    "Name": "الاسم الكامل",
    "NewToMovis": "جديد في MOVIS؟",
    "AlreadyHaveAccount": "لديك حساب بالفعل؟",
    "SignInTitle": "تسجيل الدخول",
    "SignUpTitle": "إنشاء حساب جديد"
  },
  en: {
    "Home": "Home",
    "Series": "Series",
    "Movies": "Movies",
    "Anime": "Anime",
    "SearchPlaceholder": "Search for a movie or TV show...",
    "LatestMovies": "Latest Movies",
    "Top10": "Top 10 Today",
    "Top10Morocco": "Top 10 TV Shows in Morocco Today",
    "ContinueWatching": "Continue Watching",
    "GroupWatch": "Top Picks for Group Watching",
    "AnimeTitle": "Japanese Anime & Animation",
    "KDrama": "Korean Drama",
    "USDrama": "Critically Acclaimed TV Shows",
    "Play": "Play",
    "MoreInfo": "More Info",
    "HD": "HD",
    "New": "New",
    "ReleaseYear": "Release Year:",
    "Type": "Genre:",
    "Cast": "Starring:",
    "Watch": "Watch",
    "Season": "Season",
    "Episode": "Episode",
    "EpisodesList": "Episodes & Seasons:",
    "MovieDetails": "Title Details:",
    "UpNext": "Up Next:",
    "Servers": "Live Servers:",
    "OpenServer": "Open Direct Server",
    "Comments": "Viewer Comments & Impressions:",
    "AddComment": "Add your comment...",
    "Send": "Send",
    "FooterHelp": "Questions? Contact us.",
    "FooterRights": "© 2026 MOVIS, Inc.",
    "SimilarTitles": "Similar titles you may like",
    "AddToList": "Add to My List",
    "Back": "Back to Home",
    "Minutes": "min",
    "LiveServers": "Live Servers:",
    "LoadingPlayer": "Preparing cinematic player...",
    "Movie": "Movie",
    "ActionMovies": "Action & Thriller Movies",
    "ComedyMovies": "Comedy Movies",
    "DramaMovies": "Drama Movies",
    "SciFiMovies": "Sci-Fi & Fantasy Movies",
    "UpcomingMovies": "Upcoming Movies",
    "TopRatedThisWeek": "Top Rated This Week",
    "NewReleases": "New Releases",
    "SignIn": "Sign In",
    "SignUp": "Sign Up",
    "SignOut": "Sign Out",
    "Email": "Email Address",
    "Password": "Password",
    "Name": "Full Name",
    "NewToMovis": "New to MOVIS?",
    "AlreadyHaveAccount": "Already have an account?",
    "SignInTitle": "Sign In",
    "SignUpTitle": "Create Account"
  }
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("ar");

  useEffect(() => {
    // Load from local storage on mount
    const stored = localStorage.getItem("movis_language") as Language;
    if (stored === "ar" || stored === "en") {
      setLanguageState(stored);
    }
  }, []);

  useEffect(() => {
    // Update HTML attributes when language changes
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    localStorage.setItem("movis_language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string) => {
    return dictionary[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
