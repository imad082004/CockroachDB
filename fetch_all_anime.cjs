const fs = require("fs");
const path = require("path");

const API_KEY = "a3ea4c84477a77480256e85e2904c186";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

const genreMap = {
  16: "أنيميشن",
  10759: "أكشن ومغامرة",
  35: "كوميديا",
  18: "دراما",
  14: "فانتازيا",
  9648: "غموض",
  10765: "خيال علمي وفانتازيا",
  28: "أكشن",
  12: "مغامرة",
  878: "خيال علمي",
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
  console.log("🚀 Starting bulk fetch of Anime (Series & Movies) from TMDB...");
  const animeList = [];
  const seenIds = new Set();
  const totalPagesToFetch = 35;

  const categories = [
    { name: "anime_tv_popular", path: "/discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc" },
    { name: "anime_tv_top", path: "/discover/tv?with_genres=16&with_original_language=ja&sort_by=vote_average.desc&vote_count.gte=100" },
    { name: "anime_movies_popular", path: "/discover/movie?with_genres=16&with_original_language=ja&sort_by=popularity.desc" },
    { name: "anime_movies_top", path: "/discover/movie?with_genres=16&with_original_language=ja&sort_by=vote_average.desc&vote_count.gte=100" },
  ];

  for (const cat of categories) {
    console.log(`📡 Fetching Anime category: ${cat.name}...`);
    for (let page = 1; page <= totalPagesToFetch; page++) {
      const urlAr = `${BASE_URL}${cat.path}&api_key=${API_KEY}&language=ar-SA&page=${page}`;
      const urlEn = `${BASE_URL}${cat.path}&api_key=${API_KEY}&language=en-US&page=${page}`;

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
          const isMovie = cat.name.includes("movie");

          const nameAr = item.title || item.name || enItem.title || enItem.name || item.original_title || item.original_name;
          const nameOrig = item.original_title || item.original_name || enItem.original_title || enItem.original_name || nameAr;

          const arabicDesc = item.overview && item.overview.trim().length > 0 ? item.overview : null;
          const englishDesc = enItem.overview && enItem.overview.trim().length > 0 ? enItem.overview : null;

          animeList.push({
            id: item.id.toString(),
            tmdbId: item.id,
            title: nameAr || "أنمي غير معروف",
            originalTitle: nameOrig || "",
            description: arabicDesc || englishDesc || "No description available.",
            descriptionEn: englishDesc || "No description available.",
            coverUrl: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : (enItem.poster_path ? `${IMAGE_BASE_URL}${enItem.poster_path}` : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80"),
            backdropUrl: item.backdrop_path ? `${BACKDROP_BASE_URL}${item.backdrop_path}` : (enItem.backdrop_path ? `${BACKDROP_BASE_URL}${enItem.backdrop_path}` : "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80"),
            posterPath: item.poster_path || enItem.poster_path || "",
            backdropPath: item.backdrop_path || enItem.backdrop_path || "",
            genres: (item.genre_ids || []).map((id) => genreMap[id]).filter(Boolean),
            rating: item.vote_average ? Number(item.vote_average.toFixed(1)) : 7.5,
            releaseDate: (item.release_date || item.first_air_date || enItem.release_date || enItem.first_air_date || "2024").split("-")[0],
            type: isMovie ? "movie" : "anime",
          });
        }
      }
    }
  }

  const outputPath = path.join(__dirname, "src", "lib", "tmdb_anime.json");
  fs.writeFileSync(outputPath, JSON.stringify(animeList, null, 2), "utf-8");
  console.log(`✅ Finished! Successfully saved ${animeList.length} Anime titles to ${outputPath}`);
};

main();
