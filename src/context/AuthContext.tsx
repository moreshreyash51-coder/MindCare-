import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

export interface RememberedAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gender?: 'female' | 'male' | 'other';
  avatar?: string;
  lastLogin: string;
  isDemo?: boolean;
}

const DEFAULT_SAVED_PROFILES: RememberedAccount[] = [
  {
    id: 'patient_eleanor',
    name: 'Eleanor Vance',
    email: 'eleanor@example.com',
    role: 'patient',
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    lastLogin: new Date().toISOString(),
    isDemo: true,
  },
  {
    id: 'caregiver_sarah',
    name: 'Sarah Vance',
    email: 'sarah@example.com',
    role: 'caregiver',
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    lastLogin: new Date().toISOString(),
    isDemo: true,
  },
  {
    id: 'patient_arthur',
    name: 'Arthur Vance',
    email: 'arthur@example.com',
    role: 'patient',
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    lastLogin: new Date().toISOString(),
    isDemo: true,
  },
];

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  rememberedEmail: string | null;
  rememberedAccounts: RememberedAccount[];
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<void>;
  register: (data: Partial<User> & { password: string }, rememberMe?: boolean) => Promise<void>;
  logout: (forgetMe?: boolean) => void;
  removeRememberedAccount: (email: string) => void;
  switchDemoUser: (role: UserRole) => Promise<void>;
  quickSignInAsAccount: (account: RememberedAccount) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updated: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initialize user from local cache immediately for zero-flicker experience
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem('mindcare_user_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed._id) return parsed;
      }
    } catch (_) {}
    return null;
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mindcare_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 2. Remembered accounts on this device
  const [rememberedEmail, setRememberedEmail] = useState<string | null>(() =>
    localStorage.getItem('mindcare_remembered_email')
  );

  const [rememberedAccounts, setRememberedAccounts] = useState<RememberedAccount[]>(() => {
    try {
      const raw = localStorage.getItem('mindcare_remembered_accounts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (_) {}
    return DEFAULT_SAVED_PROFILES;
  });

  // Helper to persist remembered accounts list
  const persistRememberedAccounts = (accounts: RememberedAccount[]) => {
    setRememberedAccounts(accounts);
    try {
      localStorage.setItem('mindcare_remembered_accounts', JSON.stringify(accounts));
    } catch (_) {}
  };

  // Helper to add or update an account in remembered list
  const recordLoginAccount = (u: User) => {
    setRememberedAccounts((prev) => {
      const filtered = prev.filter((acc) => acc.email.toLowerCase() !== u.email.toLowerCase());
      const updated: RememberedAccount[] = [
        {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          gender: u.gender,
          avatar: u.avatar,
          lastLogin: new Date().toISOString(),
          isDemo:
            u.email === 'eleanor@example.com' ||
            u.email === 'sarah@example.com' ||
            u.email === 'arthur@example.com',
        },
        ...filtered,
      ];
      try {
        localStorage.setItem('mindcare_remembered_accounts', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  // Verify session on mount without destroying credentials on temporary network hiccup
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (token) {
        try {
          const data = await api.getMe();
          if (isMounted) {
            setUser(data.user);
            localStorage.setItem('mindcare_user_cache', JSON.stringify(data.user));
          }
        } catch (err: any) {
          console.warn('Session verification notice:', err);
          // Only clear if the server explicitly confirmed the session is expired or user is missing
          if (err?.status === 401 || err?.status === 404) {
            if (isMounted) {
              localStorage.removeItem('mindcare_token');
              localStorage.removeItem('mindcare_user_cache');
              setToken(null);
              setUser(null);
            }
          }
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (email: string, pass: string, rememberMe: boolean = true) => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await api.login(cleanEmail, pass);

      localStorage.setItem('mindcare_token', res.token);
      localStorage.setItem('mindcare_user_cache', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);

      if (rememberMe) {
        localStorage.setItem('mindcare_remembered_email', cleanEmail);
        setRememberedEmail(cleanEmail);
        recordLoginAccount(res.user);
      } else {
        localStorage.removeItem('mindcare_remembered_email');
        setRememberedEmail(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Partial<User> & { password: string }, rememberMe: boolean = true) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);

      localStorage.setItem('mindcare_token', res.token);
      localStorage.setItem('mindcare_user_cache', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);

      if (rememberMe) {
        localStorage.setItem('mindcare_remembered_email', res.user.email);
        setRememberedEmail(res.user.email);
        recordLoginAccount(res.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (forgetMe: boolean = false) => {
    localStorage.removeItem('mindcare_token');
    localStorage.removeItem('mindcare_user_cache');
    setToken(null);
    setUser(null);

    if (forgetMe) {
      localStorage.removeItem('mindcare_remembered_email');
      setRememberedEmail(null);
    }
  };

  const removeRememberedAccount = (email: string) => {
    const updated = rememberedAccounts.filter((a) => a.email.toLowerCase() !== email.toLowerCase());
    persistRememberedAccounts(updated);
    if (rememberedEmail?.toLowerCase() === email.toLowerCase()) {
      localStorage.removeItem('mindcare_remembered_email');
      setRememberedEmail(null);
    }
  };

  const quickSignInAsAccount = async (account: RememberedAccount) => {
    setIsLoading(true);
    try {
      // Default demo password for demo accounts
      const password = 'password123';
      const res = await api.login(account.email, password);

      localStorage.setItem('mindcare_token', res.token);
      localStorage.setItem('mindcare_user_cache', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);

      localStorage.setItem('mindcare_remembered_email', account.email);
      setRememberedEmail(account.email);
      recordLoginAccount(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoUser = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const email = role === 'caregiver' ? 'sarah@example.com' : 'eleanor@example.com';
      const res = await api.login(email, 'password123');

      localStorage.setItem('mindcare_token', res.token);
      localStorage.setItem('mindcare_user_cache', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);

      localStorage.setItem('mindcare_remembered_email', email);
      setRememberedEmail(email);
      recordLoginAccount(res.user);
    } catch (e) {
      console.warn('Could not switch demo user:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (user?._id) {
      try {
        const fresh = await api.getPatient(user._id);
        setUser(fresh);
        localStorage.setItem('mindcare_user_cache', JSON.stringify(fresh));
      } catch (_) {}
    }
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    try {
      localStorage.setItem('mindcare_user_cache', JSON.stringify(updated));
    } catch (_) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        rememberedEmail,
        rememberedAccounts,
        login,
        register,
        logout,
        removeRememberedAccount,
        switchDemoUser,
        quickSignInAsAccount,
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
