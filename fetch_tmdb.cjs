const fs = require("fs");
const path = require("path");

const API_KEY = "a3ea4c84477a77480256e85e2904c186";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

const genreMap = {
  28: "أكشن",
  12: "مغامرة",
  16: "أنيميشن",
  35: "كوميديا",
  80: "جريمة",
  99: "وثائقي",
  18: "دراما",
  10751: "عائلي",
  14: "فانتازيا",
  36: "تاريخي",
  27: "رعب",
  10402: "موسيقى",
  9648: "غموض",
  10749: "رومانسية",
  878: "خيال علمي",
  10770: "فيلم تلفزيوني",
  53: "إثارة وتشويق",
  10752: "حرب",
  37: "غرب أمريكي",
  10759: "أكشن ومغامرة",
  10762: "أطفال",
  10765: "خيال علمي وفانتازيا",
};

const fetchUrl = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err.message);
    return null;
  }
};

const main = async () => {
  console.log("🚀 Starting TMDB library fetch...");
  const mediaList = [];
  const seenIds = new Set();

  const endpoints = [
    { url: `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=ar-SA&page=1`, type: "movie" },
    { url: `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=ar-SA&page=2`, type: "movie" },
    { url: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=ar-SA&page=1`, type: "movie" },
    { url: `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=ar-SA&page=1`, type: "tv" },
    { url: `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=ar-SA&page=2`, type: "tv" },
    { url: `${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=ar-SA`, type: "movie" },
    { url: `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=ar-SA&with_original_language=ko`, type: "tv" },
    { url: `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=ar-SA&with_genres=10762`, type: "tv" },
  ];

  const badges = ["TOP 10", "حلقة جديدة", "دبلجة جديدة", "أضيف حديثاً", "موسم جديد"];

  for (const ep of endpoints) {
    const data = await fetchUrl(ep.url);
    if (data && data.results) {
      for (let i = 0; i < data.results.length; i++) {
        const item = data.results[i];
        if (seenIds.has(item.id)) continue;
        seenIds.add(item.id);

        const mediaType = item.media_type || ep.type;

        mediaList.push({
          id: item.id.toString(),
          tmdbId: item.id,
          title: item.title || item.name || "عنوان غير معروف",
          description: item.overview || "لا يتوفر وصف لهذا العمل حالياً.",
          coverUrl: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80",
          backdropUrl: item.backdrop_path ? `${BACKDROP_BASE_URL}${item.backdrop_path}` : "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80",
          genres: (item.genre_ids || []).map((id) => genreMap[id]).filter(Boolean),
          rating: item.vote_average ? Number(item.vote_average.toFixed(1)) : 7.5,
          releaseDate: (item.release_date || item.first_air_date || "2024").split("-")[0],
          type: mediaType,
          badge: i < 5 ? badges[i % badges.length] : undefined,
        });
      }
    }
  }

  const outputPath = path.join(__dirname, "src", "lib", "tmdb_library.json");
  fs.writeFileSync(outputPath, JSON.stringify(mediaList, null, 2), "utf-8");
  console.log(`✅ Successfully saved ${mediaList.length} items to ${outputPath}`);
};

main();
