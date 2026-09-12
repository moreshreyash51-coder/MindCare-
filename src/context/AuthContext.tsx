import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  switchDemoUser: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updated: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mindcare_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      if (token) {
        try {
          const data = await api.getMe();
          setUser(data.user);
        } catch (_) {
          // Token invalid, clear it
          localStorage.removeItem('mindcare_token');
          setToken(null);
          setUser(null);
        }
      } else {
        // Newly appeared user starts in unauthenticated state
        setUser(null);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      localStorage.setItem('mindcare_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Partial<User> & { password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      localStorage.setItem('mindcare_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('mindcare_token');
    setToken(null);
    setUser(null);
  };

  const switchDemoUser = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const email = role === 'caregiver' ? 'sarah@example.com' : 'eleanor@example.com';
      const res = await api.login(email, 'password123');
      localStorage.setItem('mindcare_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (e) {
      console.warn('Could not switch demo user, using local default:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (user?._id) {
      try {
        const fresh = await api.getPatient(user._id);
        setUser(fresh);
      } catch (_) {}
    }
  };

  const updateUser = (updated: User) => {
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        switchDemoUser,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
