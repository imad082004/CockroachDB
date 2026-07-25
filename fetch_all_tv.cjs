const fs = require("fs");
const path = require("path");

const API_KEY = "a3ea4c84477a77480256e85e2904c186";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

const genreMap = {
  10759: "أكشن ومغامرة",
  16: "أنيميشن",
  35: "كوميديا",
  80: "جريمة",
  99: "وثائقي",
  18: "دراما",
  10751: "عائلي",
  10762: "أطفال",
  9648: "غموض",
  10763: "أخبار",
  10764: "تلفزيون الواقع",
  10765: "خيال علمي وفانتازيا",
  10766: "مسلسلات طويلة",
  10767: "حوار",
  10768: "حرب وسياسة",
  37: "غرب أمريكي",
};

const fetchUrl = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
};

const main = async () => {
  console.log("🚀 Starting bulk fetch of TV Series from TMDB...");
  const tvSeries = [];
  const seenIds = new Set();
  const totalPagesToFetch = 30;

  const categories = [
    { name: "popular_tv", path: "/tv/popular" },
    { name: "top_rated_tv", path: "/tv/top_rated" },
    { name: "k_drama", path: "/discover/tv?with_original_language=ko" },
    { name: "anime", path: "/discover/tv?with_genres=16&with_original_language=ja" },
    { name: "kids", path: "/discover/tv?with_genres=10762" },
  ];

  for (const cat of categories) {
    console.log(`📡 Fetching TV category: ${cat.name}...`);
    for (let page = 1; page <= totalPagesToFetch; page++) {
      const urlAr = cat.path.includes("?")
        ? `${BASE_URL}${cat.path}&api_key=${API_KEY}&language=ar-SA&page=${page}`
        : `${BASE_URL}${cat.path}?api_key=${API_KEY}&language=ar-SA&page=${page}`;

      const urlEn = cat.path.includes("?")
        ? `${BASE_URL}${cat.path}&api_key=${API_KEY}&language=en-US&page=${page}`
        : `${BASE_URL}${cat.path}?api_key=${API_KEY}&language=en-US&page=${page}`;

      const [dataAr, dataEn] = await Promise.all([fetchUrl(urlAr), fetchUrl(urlEn)]);

      if (dataAr && dataAr.results) {
        const enMap = new Map();
        if (dataEn && dataEn.results) {
          dataEn.results.forEach((item) => enMap.set(item.id, item));
        }

        for (const item of dataAr.results) {
          if (seenIds.has(item.id)) continue;
          seenIds.add(item.id);

          const enItem = enMap.get(item.id) || {};

          const arabicDesc = item.overview && item.overview.trim().length > 0 ? item.overview : null;
          const englishDesc = enItem.overview && enItem.overview.trim().length > 0 ? enItem.overview : null;

          tvSeries.push({
            id: item.id.toString(),
            tmdbId: item.id,
            title: item.name || enItem.name || item.original_name || "مسلسل غير معروف",
            originalTitle: item.original_name || enItem.original_name || item.name || "",
            description: arabicDesc || englishDesc || "No description available.",
            descriptionEn: englishDesc || "No description available.",
            coverUrl: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : (enItem.poster_path ? `${IMAGE_BASE_URL}${enItem.poster_path}` : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80"),
            backdropUrl: item.backdrop_path ? `${BACKDROP_BASE_URL}${item.backdrop_path}` : (enItem.backdrop_path ? `${BACKDROP_BASE_URL}${enItem.backdrop_path}` : "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80"),
            posterPath: item.poster_path || enItem.poster_path || "",
            backdropPath: item.backdrop_path || enItem.backdrop_path || "",
            genres: (item.genre_ids || []).map((id) => genreMap[id]).filter(Boolean),
            rating: item.vote_average ? Number(item.vote_average.toFixed(1)) : 7.5,
            releaseDate: (item.first_air_date || enItem.first_air_date || "2024").split("-")[0],
            type: "tv",
          });
        }
      }
    }
  }

  const outputPath = path.join(__dirname, "src", "lib", "tmdb_tv.json");
  fs.writeFileSync(outputPath, JSON.stringify(tvSeries, null, 2), "utf-8");
  console.log(`✅ Finished! Successfully saved ${tvSeries.length} TV series to ${outputPath}`);
};

main();
