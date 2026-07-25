const fs = require("fs");
const path = require("path");

const API_KEY = "a3ea4c84477a77480256e85e2904c186";
const ANIME_PATH = path.join(__dirname, "src", "lib", "tmdb_anime.json");

const genreMap = {
  "مغامرة": "Adventure",
  "أكشن": "Action",
  "فانتازيا": "Fantasy",
  "رسوم متحركة": "Animation",
  "أنيميشن": "Animation",
  "كوميديا": "Comedy",
  "جريمة": "Crime",
  "وثائقي": "Documentary",
  "دراما": "Drama",
  "عائلي": "Family",
  "رعب": "Horror",
  "موسيقى": "Music",
  "غموض": "Mystery",
  "رومانسية": "Romance",
  "خيال علمي": "Science Fiction",
  "خيال علمي وفانتازيا": "Sci-Fi & Fantasy",
  "أكشن ومغامرة": "Action & Adventure",
  "فيلم تلفزيوني": "TV Movie",
  "إثارة": "Thriller",
  "حرب": "War",
  "حرب وسياسة": "War & Politics",
  "غرب أمريكي": "Western",
  "تاريخ": "History",
  "أطفال": "Kids",
  "واقعي": "Reality",
  "برنامج حواري": "Talk",
  "أخبار": "News",
  "مسلسل قصير": "Soap"
};

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {
      if (i === retries - 1) return null;
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  return null;
}

async function run() {
  console.log("Loading Anime JSON...");
  const animes = JSON.parse(fs.readFileSync(ANIME_PATH, "utf8"));
  console.log(`Total Anime to enrich: ${animes.length}`);

  const enrichedAnimes = [];
  const BATCH_SIZE = 40;

  for (let i = 0; i < animes.length; i += BATCH_SIZE) {
    const chunk = animes.slice(i, i + BATCH_SIZE);
    const promises = chunk.map(async (show) => {
      const tmdbId = show.tmdbId || show.id;

      // First try as TV
      let detailsUrlAr = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${API_KEY}&language=ar&append_to_response=credits`;
      let detailsUrlEn = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${API_KEY}&language=en-US&append_to_response=credits`;
      let isMovie = false;

      let detailsData = await fetchWithRetry(detailsUrlAr);
      
      // If fails or no credits, try English TV
      if (!detailsData || !detailsData.credits) {
        detailsData = await fetchWithRetry(detailsUrlEn) || detailsData;
      }

      // If STILL fails (likely a movie, like anime movies), try as Movie
      if (!detailsData || !detailsData.credits) {
        isMovie = true;
        detailsUrlAr = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${API_KEY}&language=ar&append_to_response=credits`;
        detailsUrlEn = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${API_KEY}&language=en-US&append_to_response=credits`;
        
        detailsData = await fetchWithRetry(detailsUrlAr);
        if (!detailsData || !detailsData.credits) {
          detailsData = await fetchWithRetry(detailsUrlEn) || detailsData;
        }
      }

      let cast = [];
      let totalSeasons = 1;

      if (detailsData) {
        totalSeasons = detailsData.number_of_seasons || 1;
        
        if (detailsData.credits && detailsData.credits.cast) {
          cast = detailsData.credits.cast.slice(0, 8).map((c) => ({
            name: c.name,
            character: c.character || "Actor",
            profilePath: c.profile_path
              ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
              : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          }));
        }
      }

      // Map genres to English
      const genresEn = (show.genres || []).map((g) => genreMap[g] || g);

      // Add Base Video Stream Servers
      // TV embed uses /embed/tv?tmdb=... and Movie uses /embed/movie?tmdb=...
      const servers = isMovie 
        ? [
            { name: "سيرفر 1 (VidSrc ME)", url: `https://vidsrc.me/embed/movie?tmdb=${tmdbId}` },
            { name: "سيرفر 2 (AutoEmbed 4K)", url: `https://player.autoembed.cc/embed/movie/${tmdbId}` },
            { name: "سيرفر 3 (VidSrc TO)", url: `https://vidsrc.to/embed/movie/${tmdbId}` },
            { name: "سيرفر 4 (2Embed HD)", url: `https://www.2embed.cc/embed/${tmdbId}` },
          ]
        : [
            { name: "سيرفر 1 (VidSrc ME)", url: `https://vidsrc.me/embed/tv?tmdb=${tmdbId}` },
            { name: "سيرفر 2 (AutoEmbed 4K)", url: `https://player.autoembed.cc/embed/tv/${tmdbId}` },
            { name: "سيرفر 3 (VidSrc TO)", url: `https://vidsrc.to/embed/tv/${tmdbId}` },
            { name: "سيرفر 4 (2Embed HD)", url: `https://www.2embed.cc/embedtv/${tmdbId}` },
          ];

      return {
        ...show,
        totalSeasons,
        cast,
        genresEn,
        servers,
        actualType: isMovie ? "movie" : "tv" // Important for UI to know if it needs episode selector
      };
    });

    const results = await Promise.all(promises);
    enrichedAnimes.push(...results);
    console.log(`Processed ${enrichedAnimes.length} / ${animes.length} Animes...`);
  }

  console.log("Writing enriched Animes to JSON file locally...");
  fs.writeFileSync(ANIME_PATH, JSON.stringify(enrichedAnimes, null, 2), "utf8");
  console.log(`SUCCESS! All ${animes.length} Animes enriched locally!`);
}

run().catch(console.error);
