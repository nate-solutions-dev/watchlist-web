import apiClient from "./client";
import type { TitleResult } from "../types/api";

export function searchTitles(query: string): Promise<TitleResult[]> {
  return apiClient.get<TitleResult[]>(`/private/search?query=${encodeURIComponent(query)}`);
}
