import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api, setToken, clearToken, getToken } from '../api/client';

export type User = {
  id: number;
  email: string;
  name: string;
  wallet_address?: string;
  attempts_left: number;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateWallet: (wallet: string) => Promise<void>;
  updateUser: (user: User) => void;
  refreshBalance: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('aibirdlab_user');
    if (savedUser && getToken()) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const updateUser = (updatedUser: User) => {
    localStorage.setItem('aibirdlab_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const login = async (data: any) => {
    const response = await api.post<{ access_token: string; user: User }>(
      '/central/auth/login', 
      data, 
      false
    );
    setToken(response.access_token);
    localStorage.setItem('aibirdlab_user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const register = async (data: any) => {
    await api.post('/central/auth/register', data, false);
    await login({ email: data.email, password: data.password });
  };

  const updateWallet = async (wallet: string) => {
    const response = await api.patch<{ message: string; wallet_address: string }>(
      '/central/auth/wallet',
      { wallet_address: wallet }
    );
    
    if (user) {
      updateUser({ ...user, wallet_address: response.wallet_address });
    }
  };

  const refreshBalance = async () => {
    if (!user) return;
    try {
      const response = await api.get<{ attempts_left: number }>('/central/pay/balance');
      if (user.attempts_left !== response.attempts_left) {
        updateUser({ ...user, attempts_left: response.attempts_left });
      }
    } 
    catch (err) {
      console.error('Не вдалося оновити баланс', err);
    }
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem('aibirdlab_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateWallet, updateUser, refreshBalance }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}