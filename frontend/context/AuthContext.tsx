"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCurrentUser, type CurrentUser } from "@/lib/api";

type AuthContextType = {
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  token: string | null;
  user: CurrentUser | null;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<CurrentUser | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const loadUserFromToken = useCallback(async (activeToken: string) => {
    try {
      const result = await getCurrentUser(activeToken);

      if (!result.ok) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        return null;
      }

      setUser(result.data);
      return result.data;
    } catch (error) {
      console.error("Erreur chargement utilisateur :", error);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    const loadUser = async () => {
      if (!storedToken) {
        setToken(null);
        setUser(null);
        setIsAuthLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        await loadUserFromToken(storedToken);
      } finally {
        setIsAuthLoading(false);
      }
    };

    loadUser();
  }, [loadUserFromToken]);

  const login = async (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setIsAuthLoading(true);

    try {
      const loadedUser = await loadUserFromToken(newToken);
      return Boolean(loadedUser);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsAuthLoading(false);
  };

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      return null;
    }

    return loadUserFromToken(token);
  }, [loadUserFromToken, token]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        isAuthLoading,
        token,
        user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
