// Auth API: login, register, current user. All calls go through apiClient
// which handles JWT injection and {data,error} unwrapping.

import apiClient from "./client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateUserRequest,
  User,
} from "../types/api";

export async function login(request: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/public/auth/login", request);
}

export async function register(
  request: RegisterRequest
): Promise<RegisterResponse> {
  return apiClient.post<RegisterResponse>("/public/auth/register", request);
}

export async function getCurrentUser(): Promise<User> {
  return apiClient.get<User>("/private/auth/me");
}

export async function updateCurrentUser(
  request: UpdateUserRequest
): Promise<User> {
  return apiClient.patch<User>("/private/auth/me", request);
}
