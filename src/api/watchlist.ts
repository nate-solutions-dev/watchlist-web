import apiClient from "./client";
import type { WatchlistItem, AddToWatchlistRequest, UpdateWatchlistRequest } from "../types/api";

export function getWatchlist(): Promise<WatchlistItem[]> {
  return apiClient.get<WatchlistItem[]>("/private/watchlist");
}

export function addToWatchlist(body: AddToWatchlistRequest): Promise<WatchlistItem> {
  return apiClient.post<WatchlistItem>("/private/watchlist", body);
}

export function updateWatchlistItem(id: string, body: UpdateWatchlistRequest): Promise<WatchlistItem> {
  return apiClient.patch<WatchlistItem>(`/private/watchlist/${id}`, body);
}

export function removeFromWatchlist(id: string): Promise<null> {
  return apiClient.delete<null>(`/private/watchlist/${id}`);
}
