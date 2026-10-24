import { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken } from '../api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.me().then((r) => setUser(r.user)).catch(() => setToken(null)).finally(() => setLoading(false));
  }, []);

  const finish = ({ token, user }) => { setToken(token); setUser(user); return user; };
  const login = async (email, password) => finish(await api.login({ email, password }));
  const register = async (name, email, password) => finish(await api.register({ name, email, password }));
  const logout = () => { setToken(null); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}
