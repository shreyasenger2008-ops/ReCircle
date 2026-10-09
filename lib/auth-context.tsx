"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, MOCK_USERS } from "./mock-data";

type AuthContextType = {
  user: User | null;
  login: (id: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Simple mock persist
  useEffect(() => {
    const saved = localStorage.getItem("mock_user_id");
    if (saved) {
      const found = MOCK_USERS.find(u => u.id === saved);
      if (found) setUser(found);
    }
  }, []);

  const login = (id: string) => {
    const found = MOCK_USERS.find(u => u.id === id);
    if (found) {
      setUser(found);
      localStorage.setItem("mock_user_id", found.id);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mock_user_id");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
