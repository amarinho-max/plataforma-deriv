'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Loader2, Wifi, WifiOff, CheckCircle, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleOAuthLogin = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Get OAuth URL from our API
      const response = await fetch('/api/auth/login');
      const data = await response.json();

      if (data.url) {
        // Store code_verifier in sessionStorage for callback
        if (data.codeVerifier) {
          sessionStorage.setItem('pkce_code_verifier', data.codeVerifier);
        }
        if (data.state) {
          sessionStorage.setItem('oauth_state', data.state);
        }

        // Redirect to Deriv auth page
        window.location.href = data.url;
      } else {
        setError('Erro ao gerar URL de autenticação');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      setIsLoading(false);
    }
  };

  const handleDemoMode = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md mx-auto p-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <LineChart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Deriv Trading</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Plataforma de negociacao profissional
          </p>
        </div>

        {/* Login Card */}
        <Card variant="gradient" className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Conecte-se com sua conta Deriv
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
              </div>
            </div>
          )}

          {/* OAuth Login Button */}
          <Button
            variant="primary"
            className="w-full mb-3"
            size="lg"
            loading={isLoading}
            onClick={handleOAuthLogin}
          >
            {!isLoading && (
              <>
                <ExternalLink className="w-5 h-5 mr-2" />
                Conectar com Deriv
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-sm text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Demo Mode */}
          <Button
            variant="secondary"
            className="w-full"
            size="lg"
            onClick={handleDemoMode}
          >
            <WifiOff className="w-5 h-5 mr-2" />
            Modo Demo (Sem Login)
          </Button>

          {/* Info */}
          <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Wifi className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-700 dark:text-blue-300 font-medium mb-1">
                  Login via Deriv
                </p>
                <p className="text-blue-600 dark:text-blue-400">
                  Voce sera redirecionado para a pagina de login da Deriv.
                  Apos autenticar, seus dados reais serao carregados.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Precisa de ajuda?{' '}
          <a
            href="https://developers.deriv.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Documentacao da API
          </a>
        </p>
      </div>
    </div>
  );
}
