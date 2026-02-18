import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/api/user";
import { type User } from "@/api/user";

interface AuthContextType {
  user: User | undefined;
  isLoading: boolean;
  isError: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // TanStack Query handles the loading, error, and data states for us
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["authUser"],
    queryFn: getMe,
    retry: false, // Don't retry if the user isn't logged in (401)
    staleTime: 1000 * 60 * 5, // Cache user data for 5 minutes
  });

  return (
    <AuthContext.Provider value={{ user, isLoading, isError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};