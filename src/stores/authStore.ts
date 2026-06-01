import { create } from 'zustand';
import type { DerivAccount, DerivBalance } from '@/types/deriv';

interface AuthState {
  isAuthenticated: boolean;
  account: DerivAccount | null;
  balance: DerivBalance | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  setAuthenticated: (isAuthenticated: boolean) => void;
  setAccount: (account: DerivAccount | null) => void;
  setBalance: (balance: DerivBalance | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  account: null,
  balance: null,
  token: null,
  isLoading: false,
  error: null,

  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setAccount: (account) => set({ account }),
  setBalance: (balance) => set({ balance }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () =>
    set({
      isAuthenticated: false,
      account: null,
      balance: null,
      token: null,
      error: null,
    }),
}));
