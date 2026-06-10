// API request/response types matching the watchlist-api Go backend shapes.

export type CastMember = {
  name: string;
  character: string;
  profile_url: string;
};

export type TitleDetail = {
  tmdb_id: number;
  media_type: MediaType;
  title: string;
  overview: string;
  poster_url: string;
  backdrop_url: string;
  year: string;
  runtime: number;
  seasons: number;
  episodes: number;
  vote_average: number;
  genres: string[];
  status: string;
  cast: CastMember[];
  directors: string[];
  creators: string[];
};

export type MediaType = "movie" | "show";

export type TitleResult = {
  tmdb_id: number;
  media_type: MediaType;
  title: string;
  poster_url: string;
  backdrop_url: string;
  year: string;
  overview: string;
  vote_average: number;
};

export type TMDBListResponse = {
  page: number;
  total_pages: number;
  results: TitleResult[];
};

export type User = {
  user_data_id: string;
  username: string;
  email: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user_data_id: string;
  username: string;
  email: string;
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  user_data_id: string;
  username: string;
  email: string;
};

export type UpdateUserRequest = Partial<{
  email: string;
  region: string;
  preferred_genres: string[];
  avatar_url: string | null;
  bio: string | null;
}>;
