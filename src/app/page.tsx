'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar se há token nos cookies
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith('deriv_token=')
    );
    
    const hasToken = !!tokenCookie;
    setIsAuthenticated(hasToken);
    
    if (hasToken) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center animate-pulse">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold gradient-text mb-2">Deriv Trading</h1>
        <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
      </div>
    </div>
  );
}
