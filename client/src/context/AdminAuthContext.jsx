// client/src/context/AdminAuthContext.jsx
//
// Mock admin auth for now — stores a fake token in localStorage. Real auth
// (checking credentials server-side and issuing a signed JWT) happens once
// the backend exists; this context is the seam where that plugs in later,
// so LoginPage / AdminLayout / ProtectedRoute don't need to change.

import { createContext, useCallback, useContext, useState } from "react";
import { loginAdmin } from "../services/api";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken"));
  const [adminName, setAdminName] = useState(() => localStorage.getItem("adminName") || "");

  const login = useCallback(async (username, password) => {
    const result = await loginAdmin(username, password);
    localStorage.setItem("adminToken", result.token);
    localStorage.setItem("adminName", result.name);
    setToken(result.token);
    setAdminName(result.name);
    return result;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    setToken(null);
    setAdminName("");
  }, []);

  const value = { token, adminName, isAuthenticated: Boolean(token), login, logout };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside an <AdminAuthProvider>");
  return ctx;
}
