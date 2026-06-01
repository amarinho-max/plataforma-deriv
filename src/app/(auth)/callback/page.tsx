'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando autenticacao...');
  const { setAuthenticated, setToken } = useAuthStore();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage('Autenticacao cancelada ou negada.');
      return;
    }

    if (!code || !state) {
      setStatus('error');
      setMessage('Parametros de autenticacao invalidos.');
      return;
    }

    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      setStatus('error');
      setMessage('Erro de seguranca: state nao corresponde.');
      return;
    }

    const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
    if (!codeVerifier) {
      setStatus('error');
      setMessage('Erro de seguranca: code_verifier nao encontrado.');
      return;
    }

    const exchangeCode = async () => {
      try {
        const response = await fetch('/api/deriv/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            state,
            codeVerifier,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('Autenticacao realizada com sucesso!');
          sessionStorage.removeItem('oauth_state');
          sessionStorage.removeItem('pkce_code_verifier');
          
          // Store token in localStorage for WebSocket use
          localStorage.setItem('deriv_session_token', data.token);
          
          // Update auth store
          setAuthenticated(true);
          setToken(data.token);

          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Erro ao autenticar.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Erro de conexao com o servidor.');
      }
    };

    exchangeCode();
  }, [searchParams, router, setAuthenticated, setToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="text-center max-w-md mx-auto p-8">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Autenticando...
            </h1>
            <p className="text-gray-500 dark:text-gray-400">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sucesso!
            </h1>
            <p className="text-gray-500 dark:text-gray-400">{message}</p>
            <p className="text-sm text-gray-400 mt-4">Redirecionando...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Erro
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              Tentar Novamente
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
          <div className="text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
