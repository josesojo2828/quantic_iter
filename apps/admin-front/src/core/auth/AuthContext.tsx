'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/api.client';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
}

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const result = await apiClient.get<any>('/auth/me');
      const profileData = result?.data;

      if (profileData && profileData.role === 'super_admin') {
        setUser(profileData);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await apiClient.post<any>('/auth/login', {
        email,
        password,
      });

      console.log('[AuthContext] 🟢 Login Result:', result);

      // Accessing data through the wrapper { success, data: { user }, message }
      const adminUser = result?.data?.user;

      if (!adminUser) {
        throw new Error('El servidor no devolvió los datos del usuario.');
      }

      if (adminUser.role !== 'super_admin') {
        setError('Acceso denegado. Solo administradores pueden ingresar.');
        setUser(null);
        return;
      }

      setUser(adminUser);
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
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
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
