"use server";

import { prisma } from "@/lib/prisma";
import { MediaItem } from "@/lib/types";

// Helper to map Prisma models to the MediaItem type used in the frontend
const mapData = (item: any): MediaItem => ({
  id: item.id,
  tmdbId: item.tmdb_id,
  title: item.title,
  originalTitle: item.original_title || item.title,
  description: item.description,
  descriptionEn: item.description_en || item.description,
  coverUrl: item.cover_url,
  backdropUrl: item.backdrop_url,
  originalCoverUrl: item.cover_url_en || item.cover_url,
  originalBackdropUrl: item.backdrop_url_en || item.backdrop_url,
  rating: item.rating,
  releaseDate: item.release_date,
  type: item.type,
  genres: item.genres || [],
  genresEn: item.genres_en || item.genres || [],
});

export async function getHomePageContent() {
  try {
    const moviesData = await prisma.movie.findMany({
      orderBy: { rating: 'desc' }, // Using rating since we don't have trending_score in this schema
      take: 50,
    });
    
    // In our new schema, series are also stored in "Movie" table but we should filter if we had a type
    // Since the scraper might just mark everything as "movie" or we don't have series yet,
    // we'll simulate the same lists from the movie data for now, until series are scraped.
    const allData = moviesData.map(mapData);
    
    return {
      top10Items: allData.slice(0, 10),
      trendingItems: allData.slice(0, 15),
      featuredHeroItems: allData.slice(0, 4),
      popularMovies: allData,
      popularTV: allData.slice(10, 30), // Placeholder
      kDrama: allData.filter(m => m.genres?.includes('دراما')).slice(0, 20),
      usDrama: allData.slice(15, 35),
      kidsContent: allData.filter(m => m.genres?.includes('عائلي') || m.genres?.includes('رسوم متحركة')).slice(0, 20),
    };
  } catch (error) {
    console.error("Failed to load Prisma content:", error);
    return null;
  }
}

export async function getMediaDetails(id: string) {
  try {
    const data = await prisma.movie.findUnique({
      where: { id },
    });
    if (!data) return null;
    return mapData(data);
  } catch (error) {
    console.error("Failed to load Media Details:", error);
    return null;
  }
}

export async function getSimilarMedia(type: string, currentId: string) {
  try {
    const data = await prisma.movie.findMany({
      where: {
        type: type,
        id: { not: currentId }
      },
      take: 12,
    });
    return data.map(mapData);
  } catch (error) {
    console.error("Failed to load Similar Media:", error);
    return [];
  }
}

export async function getEpisodes(seriesId: string, seasonNumber: number) {
  try {
    const eps = await prisma.episode.findMany({
      where: {
        series_id: seriesId,
        season_number: seasonNumber,
      },
      orderBy: {
        episode_number: 'asc',
      },
    });
    return eps.map((e: any) => ({
      episodeNumber: e.episode_number,
      title: e.title,
      titleEn: e.title_en || e.title,
      description: e.description,
      descriptionEn: e.description_en || e.description,
      duration: e.duration,
      videoUrl: e.video_url,
      servers: e.servers,
      releaseDate: e.release_date,
      imageUrl: e.image_url,
      imageUrlEn: e.image_url_en || e.image_url
    }));
  } catch (error) {
    console.error("Failed to load episodes:", error);
    return [];
  }
}

export async function getMoviesPageContent() {
  try {
    const moviesData = await prisma.movie.findMany({
      orderBy: { rating: 'desc' },
      take: 100,
    });
    
    const allData = moviesData.map(mapData);
    const shuffled = [...allData].sort(() => 0.5 - Math.random());
    
    return {
      movies: shuffled,
      actionMovies: allData.filter(m => m.genres?.includes("أكشن") || m.genresEn?.includes("Action")),
      comedyMovies: allData.filter(m => m.genres?.includes("كوميديا") || m.genresEn?.includes("Comedy")),
      dramaMovies: allData.filter(m => m.genres?.includes("دراما") || m.genresEn?.includes("Drama")),
      scifiMovies: allData.filter(m => m.genres?.includes("خيال علمي") || m.genresEn?.includes("Science Fiction")),
    };
  } catch (error) {
    console.error("Failed to load movies content:", error);
    return null;
  }
}

export async function getTvShowsPageContent() {
  try {
    const tvData = await prisma.movie.findMany({
      orderBy: { rating: 'desc' },
      take: 100,
    });
    
    const allData = tvData.map(mapData);
    const shuffled = [...allData].sort(() => 0.5 - Math.random());
    
    return {
      shows: shuffled,
      kDrama: allData.filter(m => m.genres?.includes("دراما")),
      usDrama: allData.slice(15, 35),
      anime: allData.filter(m => m.genres?.includes("رسوم متحركة")),
      comedy: allData.filter(m => m.genres?.includes("كوميديا")),
    };
  } catch (error) {
    console.error("Failed to load tv content:", error);
    return null;
  }
}

export async function getTrendingPageContent() {
  try {
    const data = await prisma.movie.findMany({
      orderBy: { rating: 'desc' },
      take: 100,
    });
    return data.map(mapData);
  } catch (error) {
    console.error("Failed to load trending content:", error);
    return [];
  }
}
