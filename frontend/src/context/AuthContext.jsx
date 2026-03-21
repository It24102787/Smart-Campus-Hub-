import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import {
  getStoredUser,
  setAuthSession,
  clearAuthSession
} from '../utils/authSession';

const AuthContext = createContext();

const normalizeUser = (payload) => {
  if (!payload) return null;
  const source = payload.user || payload;
  const fallbackRoles = Array.isArray(payload.roles) ? payload.roles : [];
  const roles = Array.isArray(source.roles) && source.roles.length > 0
    ? source.roles
    : fallbackRoles.length > 0
      ? fallbackRoles
      : source.role
        ? [source.role]
        : payload.role
          ? [payload.role]
          : [];

  const role = source.role || payload.role || roles[0] || 'STUDENT';

  return {
    id: source.id || payload.id || null,
    name: source.name || payload.name || '',
    email: source.email || payload.email || '',
    role,
    roles: roles.length > 0 ? roles : [role]
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => normalizeUser(getStoredUser()));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(normalizeUser(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const normalizedUser = normalizeUser(data);
    setAuthSession({ token: data.token, user: normalizedUser });
    setUser(normalizedUser);
    return { token: data.token, user: normalizedUser };
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    const normalizedUser = normalizeUser(data);
    setAuthSession({ token: data.token, user: normalizedUser });
    setUser(normalizedUser);
    return { token: data.token, user: normalizedUser };
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
