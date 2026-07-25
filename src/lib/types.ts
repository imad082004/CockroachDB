export interface CastMember {
  name: string;
  character?: string;
  imageUrl?: string;
  profilePath?: string;
}

export interface Episode {
  episodeNumber: number;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  duration: string;
  videoUrl?: string;
  servers?: ServerOption[];
  releaseDate?: string;
  imageUrl?: string;
  imageUrlEn?: string;
}

export interface Season {
  seasonNumber: number;
  episodes: Episode[];
}

export interface ServerOption {
  name: string;
  url: string;
}

export interface MediaItem {
  id: string | number;
  tmdbId?: number | string;
  title: string;
  originalTitle?: string;
  description: string;
  descriptionEn?: string;
  coverUrl: string;
  backdropUrl: string;
  originalCoverUrl?: string;
  originalBackdropUrl?: string;
  posterPath?: string;
  backdropPath?: string;
  videoUrl?: string;
  trailerUrl?: string;
  genres: string[];
  genresEn?: string[];
  rating: number;
  releaseDate: string;
  duration?: string;
  director?: string;
  cast?: CastMember[];
  castEn?: CastMember[];
  servers?: ServerOption[];
  quality?: string;
  language?: string;
  type: "movie" | "tv" | "anime";
  actualType?: "movie" | "tv";
  totalSeasons?: number;
  views?: number;
  trendingScore?: number;
  seasons?: Season[];
  badge?: string; // e.g. "TOP 10", "حلقة جديدة", "دبلجة جديدة", "أضيف حديثاً"
}
