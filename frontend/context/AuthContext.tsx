"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, type CurrentUser } from "@/lib/api";

type AuthContextType = {
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  token: string | null;
  user: CurrentUser | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

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
        const result = await getCurrentUser(storedToken);

        if (!result.ok) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
          setIsAuthLoading(false);
          return;
        }

        setUser(result.data);
      } catch (error) {
        console.error("Erreur chargement utilisateur :", error);
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setIsAuthLoading(true);

    try {
      const result = await getCurrentUser(newToken);

      if (!result.ok) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        return;
      }

      setUser(result.data);
    } catch (error) {
      console.error("Erreur récupération utilisateur après login :", error);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
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

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        isAuthLoading,
        token,
        user,
        login,
        logout,
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