'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    token: null,
  });

  useEffect(() => {
    // Verificar se há token nos cookies
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith('deriv_token=')
    );

    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        token,
      });
    } else {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        token: null,
      });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        token: null,
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  const login = useCallback(() => {
    router.push('/login');
  }, [router]);

  return {
    ...authState,
    logout,
    login,
  };
}
