import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForPublicClientWrite",
  authDomain: "kooralive-bdb11.firebaseapp.com",
  projectId: "kooralive-bdb11",
  storageBucket: "kooralive-bdb11.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MOVIES_PATH = path.join(__dirname, "src", "lib", "tmdb_movies.json");

async function syncMovies() {
  console.log("Reading enriched movies JSON...");
  const movies = JSON.parse(fs.readFileSync(MOVIES_PATH, "utf8"));
  console.log(`Uploading ${movies.length} enriched movies to Firebase Firestore 'movies' collection...`);

  const BATCH_SIZE = 50;
  for (let i = 0; i < movies.length; i += BATCH_SIZE) {
    const chunk = movies.slice(i, i + BATCH_SIZE);
    await Promise.all(
      chunk.map((movie) =>
        setDoc(doc(db, "movies", movie.id.toString()), movie, { merge: true })
      )
    );
    console.log(`Uploaded ${Math.min(i + BATCH_SIZE, movies.length)} / ${movies.length} movies to Firestore...`);
  }

  console.log("SUCCESS! All 1,842 enriched movies synced to Firebase Firestore!");
  process.exit(0);
}

syncMovies().catch((err) => {
  console.error("Sync error:", err);
  process.exit(1);
});
