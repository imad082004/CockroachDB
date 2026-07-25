import { NextRequest, NextResponse } from "next/server";

// Fetch TMDB data in English for a specific movie/show
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get("id");
  const type = searchParams.get("type") || "movie"; // "movie" or "tv"

  if (!tmdbId) {
    return NextResponse.json({ error: "Missing tmdb id" }, { status: 400 });
  }

  const TMDB_KEY = "a3ea4c84477a77480256e85e2904c186";

  try {
    // Fetch both main data and images in parallel
    const [mainRes, imagesRes] = await Promise.all([
      fetch(
        `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=en-US`,
        { next: { revalidate: 86400 } }
      ),
      fetch(
        `https://api.themoviedb.org/3/${type}/${tmdbId}/images?api_key=${TMDB_KEY}&include_image_language=en,null`,
        { next: { revalidate: 86400 } }
      ),
    ]);

    if (!mainRes.ok) return NextResponse.json({ error: "TMDB fetch failed" }, { status: 502 });

    const mainData = await mainRes.json();

    // Default to EN main data images
    let coverUrl = mainData.poster_path
      ? `https://image.tmdb.org/t/p/w500${mainData.poster_path}`
      : null;
    let backdropUrl = mainData.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${mainData.backdrop_path}`
      : null;

    if (imagesRes.ok) {
      const imagesData = await imagesRes.json();

      // Prefer English-language posters (iso_639_1 === "en")
      const enPosters = (imagesData.posters || []).filter((p: any) => p.iso_639_1 === "en");
      if (enPosters.length > 0) {
        enPosters.sort((a: any, b: any) => b.vote_average - a.vote_average);
        coverUrl = `https://image.tmdb.org/t/p/w500${enPosters[0].file_path}`;
      }

      // Prefer English or language-neutral backdrops
      const enBackdrops = (imagesData.backdrops || []).filter(
        (b: any) => b.iso_639_1 === "en" || b.iso_639_1 === null
      );
      if (enBackdrops.length > 0) {
        enBackdrops.sort((a: any, b: any) => b.vote_average - a.vote_average);
        backdropUrl = `https://image.tmdb.org/t/p/w1280${enBackdrops[0].file_path}`;
      }
    }

    return NextResponse.json({
      title: mainData.title || mainData.name,
      description: mainData.overview || "",
      coverUrl,
      backdropUrl,
      genres: (mainData.genres || []).map((g: any) => g.name),
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
