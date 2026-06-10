import apiClient from "./client";
import type { TitleDetail, MediaType } from "../types/api";

export function getTitleDetail(tmdbId: number, mediaType: MediaType): Promise<TitleDetail> {
  return apiClient.get<TitleDetail>(`/private/title/${tmdbId}?type=${mediaType}`);
}
