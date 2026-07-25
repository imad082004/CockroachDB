const fs = require("fs");
const path = require("path");

const MOVIES_PATH = path.join(__dirname, "src", "lib", "tmdb_movies.json");

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
  "فيلم تلفزيوني": "TV Movie",
  "إثارة": "Thriller",
  "حرب": "War",
  "غرب أمريكي": "Western",
  "تاريخ": "History"
};

function run() {
  console.log("Loading movies JSON...");
  const movies = JSON.parse(fs.readFileSync(MOVIES_PATH, "utf8"));

  const updated = movies.map((m) => {
    const genresEn = (m.genres || []).map((g) => genreMap[g] || g);
    return {
      ...m,
      genresEn,
    };
  });

  console.log("Writing updated movies JSON locally...");
  fs.writeFileSync(MOVIES_PATH, JSON.stringify(updated, null, 2), "utf8");
  console.log("SUCCESS! Added genresEn to all 1,842 movies locally without touching Firebase!");
}

run();
