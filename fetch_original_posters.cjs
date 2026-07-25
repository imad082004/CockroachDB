const fs = require("fs");
const path = require("path");

const API_KEY = "a3ea4c84477a77480256e85e2904c186";

const files = [
  { path: path.join(__dirname, "src", "lib", "tmdb_movies.json"), type: "movie" },
  { path: path.join(__dirname, "src", "lib", "tmdb_tv.json"), type: "tv" },
  { path: path.join(__dirname, "src", "lib", "tmdb_anime.json"), type: "anime" } // Anime items already have actualType
];

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
  for (const fileObj of files) {
    console.log(`Loading ${fileObj.path}...`);
    const items = JSON.parse(fs.readFileSync(fileObj.path, "utf8"));
    console.log(`Total items to enrich in ${fileObj.type}: ${items.length}`);

    const enrichedItems = [];
    const BATCH_SIZE = 50;

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const chunk = items.slice(i, i + BATCH_SIZE);
      const promises = chunk.map(async (item) => {
        const tmdbId = item.tmdbId || item.id;
        
        let endpointType = item.actualType || item.type;
        if (endpointType === "anime") endpointType = "tv"; // Fallback if actualType is missing

        const detailsUrlEn = `https://api.themoviedb.org/3/${endpointType}/${tmdbId}?api_key=${API_KEY}&language=en-US`;
        const enData = await fetchWithRetry(detailsUrlEn);

        let originalCoverUrl = item.coverUrl;
        let originalBackdropUrl = item.backdropUrl;

        if (enData) {
          if (enData.poster_path) {
            originalCoverUrl = `https://image.tmdb.org/t/p/w500${enData.poster_path}`;
          }
          if (enData.backdrop_path) {
            originalBackdropUrl = `https://image.tmdb.org/t/p/w1280${enData.backdrop_path}`;
          }
        }

        return {
          ...item,
          originalCoverUrl,
          originalBackdropUrl
        };
      });

      const results = await Promise.all(promises);
      enrichedItems.push(...results);
      console.log(`Processed ${enrichedItems.length} / ${items.length} in ${fileObj.type}...`);
    }

    console.log(`Writing enriched ${fileObj.type} to JSON file locally...`);
    fs.writeFileSync(fileObj.path, JSON.stringify(enrichedItems, null, 2), "utf8");
    console.log(`SUCCESS! All ${items.length} ${fileObj.type} enriched with original posters!`);
  }
}

run().catch(console.error);
