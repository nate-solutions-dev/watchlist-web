const VITE_API_URL = import.meta.env.VITE_API_URL as string | undefined;

// In dev the Vite proxy forwards /public, /private, /health to the API, so
// relative paths work and the browser never crosses origins (no CORS).
// In prod (Vercel) requests go directly to the Railway URL.
const API_URL: string = import.meta.env.DEV ? "" : (VITE_API_URL ?? "");

if (!import.meta.env.DEV && !VITE_API_URL) {
  console.error(
    "VITE_API_URL is not set. Add it to Vercel environment variables and redeploy."
  );
}

export class APIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "APIError";
    this.status = status;
  }
}

const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    clearToken();
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new APIError("Session expired", 401);
  }

  let body: { message: string; response: number; result?: T };
  try {
    body = (await response.json()) as { message: string; response: number; result?: T };
  } catch {
    throw new APIError("Invalid response from server", response.status);
  }

  if (!response.ok) {
    throw new APIError(body.message || "Request failed", response.status);
  }

  if (body.result === undefined) {
    throw new APIError("Response missing result data", response.status);
  }

  return body.result;
}

const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: "GET" });
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: "DELETE" });
  },
};

export default apiClient;
