"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiFetch } from "./api-client";

export interface UserSkill {
  skillId: string;
  skillName: string;
  category: string;
  type: "TEACH" | "LEARN";
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  yearsExp?: number;
  description?: string;
}

export interface UserReputation {
  ratingAverage: number;
  totalReviews: number;
  sessionsCompleted: number;
  badges: string[];
}

export interface UserLocation {
  city?: string;
  country?: string;
  mode?: "ONLINE" | "IN_PERSON" | "BOTH";
}

export interface AvailabilitySlot {
  dayOfWeek: string;
  slots: string[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  timezone?: string;
  languages: string[];
  location?: UserLocation;
  availability: AvailabilitySlot[];
  skills: UserSkill[];
  reputation: UserReputation;
  role: "USER" | "ADMIN";
  status?: string;
  onboardingCompleted?: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { emailOrUsername: string; password: string }) => Promise<User>;
  register: (data: { email: string; username: string; password: string; name: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => { throw new Error("AuthProvider not mounted"); },
  register: async () => { throw new Error("AuthProvider not mounted"); },
  logout: async () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await apiFetch<User>("/api/auth/me");
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: { emailOrUsername: string; password: string }) => {
    const res = await apiFetch<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    setUser(res.user);
    return res.user;
  };

  const register = async (data: { email: string; username: string; password: string; name: string }) => {
    const res = await apiFetch<{ user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
