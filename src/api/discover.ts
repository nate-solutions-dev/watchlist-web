import apiClient from "./client";
import type { TMDBListResponse } from "../types/api";

export function getTrending(type: "movie" | "show" = "movie", page = 1): Promise<TMDBListResponse> {
  return apiClient.get<TMDBListResponse>(`/private/discover/trending?type=${type}&page=${page}`);
}

export function getPopular(type: "movie" | "show" = "movie", page = 1): Promise<TMDBListResponse> {
  return apiClient.get<TMDBListResponse>(`/private/discover/popular?type=${type}&page=${page}`);
}
