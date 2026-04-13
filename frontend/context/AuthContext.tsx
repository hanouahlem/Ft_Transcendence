"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
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

function decodeBase64Url(value: string) {
  const normalizedValue = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddedValue = normalizedValue.padEnd(
    normalizedValue.length + ((4 - (normalizedValue.length % 4)) % 4),
    "=",
  );

  return atob(paddedValue);
}

function getTokenExpiryTimestamp(token: string) {
  try {
    const [, payload] = token.split(".");

    if (!payload) {
      return null;
    }

    const decodedPayload = JSON.parse(decodeBase64Url(payload)) as { exp?: number };

    if (typeof decodedPayload.exp !== "number") {
      return null;
    }

    return decodedPayload.exp * 1000;
  } catch (error) {
    console.error("Invalid JWT payload:", error);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAuthState = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsAuthLoading(false);

    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  const loadUserFromToken = useCallback(async (activeToken: string) => {
    try {
      const result = await getCurrentUser(activeToken);

      if (!result.ok) {
        clearAuthState();
        return null;
      }

      setUser(result.data);
      return result.data;
    } catch (error) {
      console.error("Erreur chargement utilisateur :", error);
      clearAuthState();
      return null;
    }
  }, [clearAuthState]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    const loadUser = async () => {
      if (!storedToken) {
        setToken(null);
        setUser(null);
        setIsAuthLoading(false);
        return;
      }

      const expiryTimestamp = getTokenExpiryTimestamp(storedToken);

      if (expiryTimestamp !== null && expiryTimestamp <= Date.now()) {
        clearAuthState();
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
  }, [clearAuthState, loadUserFromToken]);

  useEffect(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    if (!token) {
      return;
    }

    const expiryTimestamp = getTokenExpiryTimestamp(token);

    if (expiryTimestamp === null) {
      return;
    }

    const delay = expiryTimestamp - Date.now();

    if (delay <= 0) {
      clearAuthState();
      return;
    }

    logoutTimerRef.current = setTimeout(() => {
      clearAuthState();
    }, delay);

    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
    };
  }, [clearAuthState, token]);

  const login = async (newToken: string) => {
    const expiryTimestamp = getTokenExpiryTimestamp(newToken);

    if (expiryTimestamp !== null && expiryTimestamp <= Date.now()) {
      clearAuthState();
      return false;
    }

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
    clearAuthState();
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
