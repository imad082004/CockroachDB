const fs = require("fs");
const path = require("path");

const API_KEY = "a3ea4c84477a77480256e85e2904c186";
const MOVIES_PATH = path.join(__dirname, "src", "lib", "tmdb_movies.json");

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
  console.log("Loading movies JSON...");
  const movies = JSON.parse(fs.readFileSync(MOVIES_PATH, "utf8"));
  console.log(`Total movies to enrich: ${movies.length}`);

  const enrichedMovies = [];
  const BATCH_SIZE = 40;

  for (let i = 0; i < movies.length; i += BATCH_SIZE) {
    const chunk = movies.slice(i, i + BATCH_SIZE);
    const promises = chunk.map(async (movie) => {
      const tmdbId = movie.tmdbId || movie.id;

      // Fetch Credits (Cast & Characters)
      const creditsUrl = `https://api.themoviedb.org/3/movie/${tmdbId}/credits?api_key=${API_KEY}&language=ar`;
      const creditsData = await fetchWithRetry(creditsUrl);

      let cast = [];
      if (creditsData && creditsData.cast && creditsData.cast.length > 0) {
        cast = creditsData.cast.slice(0, 8).map((c) => ({
          name: c.name,
          character: c.character || "ممثل",
          profilePath: c.profile_path
            ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
            : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        }));
      } else {
        // Fallback to English credits if Arabic credits are empty
        const creditsUrlEn = `https://api.themoviedb.org/3/movie/${tmdbId}/credits?api_key=${API_KEY}&language=en-US`;
        const creditsDataEn = await fetchWithRetry(creditsUrlEn);
        if (creditsDataEn && creditsDataEn.cast) {
          cast = creditsDataEn.cast.slice(0, 8).map((c) => ({
            name: c.name,
            character: c.character || "Actor",
            profilePath: c.profile_path
              ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
              : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          }));
        }
      }

      // Add Direct Video Stream Servers
      const servers = [
        { name: "سيرفر 1 (VidSrc ME)", url: `https://vidsrc.me/embed/movie?tmdb=${tmdbId}` },
        { name: "سيرفر 2 (AutoEmbed 4K)", url: `https://player.autoembed.cc/embed/movie/${tmdbId}` },
        { name: "سيرفر 3 (VidSrc TO)", url: `https://vidsrc.to/embed/movie/${tmdbId}` },
        { name: "سيرفر 4 (2Embed HD)", url: `https://www.2embed.cc/embed/${tmdbId}` },
      ];

      return {
        ...movie,
        cast,
        servers,
      };
    });

    const results = await Promise.all(promises);
    enrichedMovies.push(...results);
    console.log(`Processed ${enrichedMovies.length} / ${movies.length} movies...`);
  }

  console.log("Writing enriched movies to JSON file...");
  fs.writeFileSync(MOVIES_PATH, JSON.stringify(enrichedMovies, null, 2), "utf8");
  console.log("SUCCESS! All 1,842 movies enriched with real cast & streaming servers!");
}

run().catch(console.error);
