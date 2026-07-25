"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type VerifyResult = "success" | "expired" | "invalid";

type AuthContextValue = {
  isAuthenticated: boolean;
  pendingEmail: string | null;
  requestMagicLink: (email: string) => void;
  verifyToken: (token: string) => VerifyResult;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Fully simulated — there is no real backend, no real email gets sent, and
// no real token is ever issued or checked. This exists so the signup/login
// flow has somewhere real to write to and read from. The magic strings
// "expired" and "invalid" are how the failure states get demonstrated (see
// CheckEmailScreen's demo links and /auth/verify) — anything else is
// treated as a valid token, since there's nothing real to validate against.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  function requestMagicLink(email: string) {
    setPendingEmail(email);
  }

  function verifyToken(token: string): VerifyResult {
    if (token === "expired") return "expired";
    if (!token || token === "invalid") return "invalid";
    setIsAuthenticated(true);
    setPendingEmail(null);
    return "success";
  }

  function logout() {
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        pendingEmail,
        requestMagicLink,
        verifyToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
