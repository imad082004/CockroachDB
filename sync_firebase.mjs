import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, doc } from "firebase/firestore";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const __dirname = path.resolve();

const loadJson = (filename) => {
  const filePath = path.join(__dirname, "src", "lib", filename);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
  return [];
};

const main = async () => {
  console.log("🔥 Connecting to Firebase Firestore...");
  console.log(`Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);

  const collectionsToClear = ["movies", "series", "anime", "tv_shows"];

  // Step 1: Clear existing legacy documents
  console.log("🧹 Step 1: Wiping old documents from legacy collections...");
  for (const colName of collectionsToClear) {
    try {
      const snap = await getDocs(collection(db, colName));
      console.log(`Deleting ${snap.docs.length} old documents from '${colName}'...`);

      let deleteBatch = writeBatch(db);
      let opCount = 0;

      for (const d of snap.docs) {
        deleteBatch.delete(d.ref);
        opCount++;
        if (opCount % 450 === 0) {
          await deleteBatch.commit();
          deleteBatch = writeBatch(db);
        }
      }
      if (opCount % 450 !== 0) {
        await deleteBatch.commit();
      }
      console.log(`✅ Cleared collection: '${colName}'`);
    } catch (err) {
      console.error(`Error clearing collection '${colName}':`, err.message);
    }
  }

  // Step 2: Load new dataset (Movies, TV, Anime)
  console.log("📦 Step 2: Loading new TMDB dataset...");
  const movies = loadJson("tmdb_movies.json");
  const tvSeries = loadJson("tmdb_tv.json");
  const anime = loadJson("tmdb_anime.json");

  console.log(`Loaded: ${movies.length} Movies, ${tvSeries.length} TV Series, ${anime.length} Anime.`);

  // Upload Movies into 'movies' collection
  let batch = writeBatch(db);
  let count = 0;

  const uploadItems = async (items, colName) => {
    console.log(`🚀 Uploading ${items.length} items to '${colName}' collection...`);
    for (const item of items) {
      const docRef = doc(db, colName, item.id);
      batch.set(docRef, {
        id: item.id,
        tmdbId: item.tmdbId,
        title: item.title,
        originalTitle: item.originalTitle || "",
        description: item.description,
        descriptionEn: item.descriptionEn || "",
        coverUrl: item.coverUrl,
        backdropUrl: item.backdropUrl,
        originalCoverUrl: item.originalCoverUrl || "",
        originalBackdropUrl: item.originalBackdropUrl || "",
        posterPath: item.posterPath || "",
        backdropPath: item.backdropPath || "",
        genres: item.genres || [],
        genresEn: item.genresEn || [],
        cast: item.cast || [],
        castEn: item.castEn || [],
        rating: item.rating || 7.5,
        releaseDate: item.releaseDate || "2024",
        type: item.type || colName,
        createdAt: Date.now(),
      });

      count++;
      if (count % 450 === 0) {
        await batch.commit();
        batch = writeBatch(db);
        console.log(`Committed ${count} items to Firebase...`);
      }
    }
  };

  await uploadItems(movies, "movies");
  await uploadItems(tvSeries, "series");
  await uploadItems(anime, "anime");

  if (count % 450 !== 0) {
    await batch.commit();
  }

  console.log(`🎉 SUCCESS! Database completely cleaned and updated with ${count} items on Firebase Firestore!`);
  process.exit(0);
};

main();
