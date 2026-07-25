"use server";

import { prisma } from "@/lib/prisma";

export async function getAdminStats() {
  try {
    const moviesCount = await prisma.movie.count();
    const seriesCount = await prisma.series.count();

    return {
      movies: moviesCount,
      series: seriesCount,
      users: 1420, // Placeholder
      revenue: 45200, // Placeholder
    };
  } catch (error) {
    console.error("Failed to get admin stats:", error);
    return { movies: 0, series: 0, users: 0, revenue: 0 };
  }
}

export async function getAdminMovies() {
  try {
    const data = await prisma.movie.findMany({
      orderBy: { created_at: 'desc' }
    });
    return data.map(item => ({
      id: item.id,
      tmdbId: item.tmdb_id,
      title: item.title,
      originalTitle: item.original_title,
      description: item.description,
      descriptionEn: item.description_en,
      coverUrl: item.cover_url,
      backdropUrl: item.backdrop_url,
      originalCoverUrl: item.cover_url_en,
      originalBackdropUrl: item.backdrop_url_en,
      rating: item.rating,
      releaseDate: item.release_date,
      type: item.type,
      genres: [],
      genresEn: [],
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function addAdminMovie(data: any) {
  try {
    await prisma.movie.create({
      data: {
        tmdb_id: data.tmdb_id.toString(),
        title: data.title,
        original_title: data.original_title,
        description: data.description,
        description_en: data.description_en,
        cover_url: data.cover_url,
        backdrop_url: data.backdrop_url,
        cover_url_en: data.cover_url_en,
        backdrop_url_en: data.backdrop_url_en,
        rating: data.rating,
        release_date: data.release_date,
        type: data.type,
      }
    });
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function deleteAdminMovie(id: string) {
  try {
    await prisma.movie.delete({
      where: { id: id }
    });
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function getAdminSeries() {
  try {
    const data = await prisma.series.findMany({
      orderBy: { created_at: 'desc' }
    });
    return data.map(item => ({
      id: item.id,
      tmdbId: item.tmdb_id,
      title: item.title,
      originalTitle: item.original_title,
      description: item.description,
      descriptionEn: item.description_en,
      coverUrl: item.cover_url,
      backdropUrl: item.backdrop_url,
      originalCoverUrl: item.cover_url_en,
      originalBackdropUrl: item.backdrop_url_en,
      rating: item.rating,
      releaseDate: item.release_date,
      type: item.type,
      genres: [],
      genresEn: [],
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function addAdminSeries(data: any) {
  try {
    await prisma.series.create({
      data: {
        tmdb_id: data.tmdb_id.toString(),
        title: data.title,
        original_title: data.original_title,
        description: data.description,
        description_en: data.description_en,
        cover_url: data.cover_url,
        backdrop_url: data.backdrop_url,
        cover_url_en: data.cover_url_en,
        backdrop_url_en: data.backdrop_url_en,
        rating: data.rating,
        release_date: data.release_date,
        type: data.type,
      }
    });
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function deleteAdminSeries(id: string) {
  try {
    await prisma.series.delete({
      where: { id: id }
    });
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}
