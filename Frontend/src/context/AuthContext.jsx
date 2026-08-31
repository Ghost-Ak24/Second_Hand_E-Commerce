import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
const C = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });
  useEffect(() => {
    const f = () => logout();
    window.addEventListener("auth:expired", f);
    return () => window.removeEventListener("auth:expired", f);
  }, []);
  function save(d) {
    const u = { userId: d.userId, name: d.name, email: d.email, role: d.role };
    localStorage.setItem("token", d.token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  }
  async function login(b) {
    const d = await api.login(b);
    save(d);
  }
  async function register(b) {
    const d = await api.register(b);
    save(d);
  }
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }
  return (
    <C.Provider
      value={useMemo(() => ({ user, login, register, logout }), [user])}
    >
      {children}
    </C.Provider>
  );
}
export const useAuth = () => useContext(C);
