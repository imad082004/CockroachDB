import { MediaItem } from "./types";
import localLibrary from "./tmdb_library.json";

export const getLocalLibrary = (): MediaItem[] => {
  return localLibrary as MediaItem[];
};

export const getTop10Morocco = async (): Promise<MediaItem[]> => {
  const library = getLocalLibrary();
  return library.slice(0, 10).map((item, idx) => ({
    ...item,
    badge: "TOP 10",
  }));
};

export const getTrendingDay = async (): Promise<MediaItem[]> => {
  const library = getLocalLibrary();
  return library;
};

export const getPopularMovies = async (): Promise<MediaItem[]> => {
  const library = getLocalLibrary();
  return library.filter((item) => item.type === "movie");
};

export const getPopularTV = async (): Promise<MediaItem[]> => {
  const library = getLocalLibrary();
  return library.filter((item) => item.type === "tv");
};

export const getKDrama = async (): Promise<MediaItem[]> => {
  const library = getLocalLibrary();
  return library.filter(
    (item) => item.genres.includes("دراما") || item.genres.includes("غموض")
  );
};

export const getUSDrama = async (): Promise<MediaItem[]> => {
  const library = getLocalLibrary();
  return library.filter((item) => item.type === "tv" || item.rating > 8);
};

export const getKidsContent = async (): Promise<MediaItem[]> => {
  const library = getLocalLibrary();
  return library.filter(
    (item) => item.genres.includes("أطفال") || item.genres.includes("أنيميشن") || item.genres.includes("عائلي")
  );
};
