import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getCurrentUser,
  login as loginRequest,
  register as registerRequest,
} from "@/api/auth";
import { getToken, setToken, clearToken } from "@/api/client";
import type { LoginResponse } from "@/types/api";
import type { User } from "@/types/api";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On mount: if a stored token exists, validate it by fetching the current user.
  useEffect(() => {
    if (!getToken()) {
      setIsLoading(false);
      return;
    }
    getCurrentUser()
      .then((fetched) => setUser(fetched))
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest({ email, password }) as LoginResponse;
    setToken(result.token);
    const fullUser = await getCurrentUser();
    setUser(fullUser);
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await registerRequest({ username, email, password });
      const result = await loginRequest({ email, password }) as LoginResponse;
      setToken(result.token);
      const fullUser = await getCurrentUser();
      setUser(fullUser);
    },
    []
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
