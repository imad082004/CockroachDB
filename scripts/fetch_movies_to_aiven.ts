import { PrismaClient } from "@prisma/client";
import 'dotenv/config';

const prisma = new PrismaClient();
const TMDB_API_KEY = "a3ea4c84477a77480256e85e2904c186"; 

const COUNTRIES = [
  { name: "USA", code: "US" }, { name: "UK", code: "GB" }, { name: "France", code: "FR" },
  { name: "Spain", code: "ES" }, { name: "Italy", code: "IT" }, { name: "Germany", code: "DE" },
  { name: "Japan", code: "JP" }, { name: "South Korea", code: "KR" }, { name: "China", code: "CN" },
  { name: "India", code: "IN" }, { name: "Turkey", code: "TR" }, { name: "Morocco", code: "MA" },
  { name: "Egypt", code: "EG" }, { name: "Saudi Arabia", code: "SA" }, { name: "Mexico", code: "MX" },
  { name: "Brazil", code: "BR" }, { name: "Canada", code: "CA" }, { name: "Australia", code: "AU" },
  { name: "Russia", code: "RU" }
];

const GENRES = [
  { id: 28, name: "Action", nameAr: "أكشن" }, { id: 12, name: "Adventure", nameAr: "مغامرة" },
  { id: 16, name: "Animation", nameAr: "رسوم متحركة" }, { id: 35, name: "Comedy", nameAr: "كوميديا" },
  { id: 80, name: "Crime", nameAr: "جريمة" }, { id: 99, name: "Documentary", nameAr: "وثائقي" },
  { id: 18, name: "Drama", nameAr: "دراما" }, { id: 10751, name: "Family", nameAr: "عائلي" },
  { id: 14, name: "Fantasy", nameAr: "فانتازيا" }, { id: 36, name: "History", nameAr: "تاريخ" },
  { id: 27, name: "Horror", nameAr: "رعب" }, { id: 10402, name: "Music", nameAr: "موسيقى" },
  { id: 9648, name: "Mystery", nameAr: "غموض" }, { id: 10749, name: "Romance", nameAr: "رومانسية" },
  { id: 878, name: "Science Fiction", nameAr: "خيال علمي" }, { id: 10770, name: "TV Movie", nameAr: "فيلم تلفزيوني" },
  { id: 53, name: "Thriller", nameAr: "إثارة" }, { id: 10752, name: "War", nameAr: "حرب" },
  { id: 37, name: "Western", nameAr: "غربي" }
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getGenreNames = (genreIds: any[], lang: "ar" | "en") => {
  return genreIds.map((g: any) => {
    const found = GENRES.find(gen => gen.id === (g.id || g));
    return found ? (lang === "ar" ? found.nameAr : found.name) : "";
  }).filter(Boolean);
};

async function fetchMovieDetails(tmdbId: number) {
  try {
    const [resAr, resEn] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=ar-SA&append_to_response=credits,videos`),
      fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos`)
    ]);

    if (!resAr.ok || !resEn.ok) return null;
    const dataAr = await resAr.json();
    const dataEn = await resEn.json();

    const castAr = (dataAr.credits?.cast || []).slice(0, 8).map((c: any) => ({
      name: c.name, character: c.character, imageUrl: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : "",
    }));
    const castEn = (dataEn.credits?.cast || []).slice(0, 8).map((c: any) => ({
      name: c.name, character: c.character, imageUrl: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : "",
    }));

    const officialTrailer = (dataEn.videos?.results || []).find((v: any) => v.type === "Trailer" || v.type === "Teaser");

    return {
      tmdb_id: tmdbId.toString(),
      title: dataAr.title || dataEn.title,
      original_title: dataEn.title || dataEn.original_title,
      description: dataAr.overview || dataEn.overview,
      description_en: dataEn.overview || "",
      cover_url: dataAr.poster_path ? `https://image.tmdb.org/t/p/w500${dataAr.poster_path}` : (dataEn.poster_path ? `https://image.tmdb.org/t/p/w500${dataEn.poster_path}` : ""),
      backdrop_url: dataAr.backdrop_path ? `https://image.tmdb.org/t/p/w1280${dataAr.backdrop_path}` : (dataEn.backdrop_path ? `https://image.tmdb.org/t/p/w1280${dataEn.backdrop_path}` : ""),
      cover_url_en: dataEn.poster_path ? `https://image.tmdb.org/t/p/w500${dataEn.poster_path}` : "",
      backdrop_url_en: dataEn.backdrop_path ? `https://image.tmdb.org/t/p/w1280${dataEn.backdrop_path}` : "",
      genres: getGenreNames(dataAr.genres || [], "ar"),
      genres_en: getGenreNames(dataEn.genres || [], "en"),
      rating: dataEn.vote_average ? Number(dataEn.vote_average.toFixed(1)) : 0,
      release_date: dataEn.release_date || "",
      duration: dataEn.runtime ? `${dataEn.runtime} دقيقة` : "",
      cast_list: JSON.stringify(castAr),
      cast_en: JSON.stringify(castEn),
      trailer_url: officialTrailer ? officialTrailer.key : "",
      type: "movie",
      servers: "[]"
    };
  } catch (error) {
    return null;
  }
}

async function runSeed() {
  console.log("🚀 Starting AIVEN TMDB Scraping Script...");

  // Germany = index 5 in COUNTRIES array, Mystery = index 12 in GENRES array
  // Update these after each run to resume from where we stopped
  const START_COUNTRY_INDEX = 5; // Germany (DE)
  const START_GENRE_INDEX = 12; // Mystery
  const MAX_PAGES = 150;

  for (let c = START_COUNTRY_INDEX; c < COUNTRIES.length; c++) {
    const country = COUNTRIES[c];
    console.log(`\n🌎 ===== Country: ${country.name} =====`);

    for (let g = (c === START_COUNTRY_INDEX ? START_GENRE_INDEX : 0); g < GENRES.length; g++) {
      const genre = GENRES[g];
      console.log(`\n🎬 --- Genre: ${genre.name} ---`);
      
      let moviesCountInGenre = 0;

      for (let page = 1; page <= MAX_PAGES; page++) {
        try {
          const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_origin_country=${country.code}&with_genres=${genre.id}&primary_release_date.gte=2000-01-01&primary_release_date.lte=2026-12-31&sort_by=popularity.desc&page=${page}`;
          
          const listRes = await fetch(url);
          if (!listRes.ok) {
            console.log(`⚠️ Rate limit? Waiting 3s...`);
            await sleep(3000);
            page--; 
            continue;
          }
          
          const listData = await listRes.json();
          const results = listData.results || [];
          if (results.length === 0) break;

          // Check existing in Aiven DB
          const tmdbIds = results.map((r: any) => r.id.toString());
          const existing = await prisma.movie.findMany({
            where: { tmdb_id: { in: tmdbIds } },
            select: { tmdb_id: true }
          });
          const existingIds = new Set(existing.map(e => e.tmdb_id));

          const moviesToFetch = results.filter((r: any) => !existingIds.has(r.id.toString()));
          
          if (moviesToFetch.length > 0) {
            const fetchedMovies = await Promise.all(moviesToFetch.map((m: any) => fetchMovieDetails(m.id)));
            const validMovies = fetchedMovies.filter(Boolean);

            if (validMovies.length > 0) {
              await prisma.movie.createMany({
                data: validMovies as any,
                skipDuplicates: true
              });
              
              moviesCountInGenre += validMovies.length;
              console.log(`✅ Page ${page}: Inserted ${validMovies.length} movies to Aiven. Total in Genre: ${moviesCountInGenre}`);
            }
          } else {
            console.log(`⏭️ Page ${page}: All movies already exist, skipping.`);
          }

          if (moviesCountInGenre >= 3000) break;
          await sleep(1000); 

        } catch (error) {
          console.error("Critical error:", error);
          await sleep(3000);
        }
      }
    }
  }
  console.log("\n🎉 🎉 FINISHED ALL SCRAPING TASKS 🎉 🎉");
}

runSeed();
