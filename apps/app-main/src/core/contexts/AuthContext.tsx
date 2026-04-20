'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/core/api/api.client';

export interface ModuleItem {
  key: string;
  label: string;
  icon: string;
  path: string;
  module: string;
  permission?: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  modules: ModuleItem[];
  tenantId: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await apiClient.get<User>('/auth/me');
      setUser(data);
    } catch (err) {
      console.error('Session error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const logout = async () => {
    // We could call a /auth/logout endpoint if it existed, 
    // but the access_token is HttpOnly, so we just redirect or let the backend handle it.
    // For now we just clear local state and redirect to login
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshProfile: fetchProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
