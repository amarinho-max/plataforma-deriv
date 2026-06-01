'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { User, Shield, Bell, Palette, Globe, Wallet, CheckCircle, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/lib/useAuth';

const settingsSections = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'security', label: 'Segurança', icon: Shield },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'appearance', label: 'Aparência', icon: Palette },
  { id: 'language', label: 'Idioma', icon: Globe },
  { id: 'accounts', label: 'Contas', icon: Wallet },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { isAuthenticated, login, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [isConnecting, setIsConnecting] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configurações
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Gerencie suas preferências e configurações da conta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1">
          <nav className="space-y-1">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeSection === 'profile' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Perfil
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Aron Marinho</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      aronmarinho@gmail.com
                    </p>
                  </div>
                </div>
                <Input label="Nome" placeholder="Seu nome" defaultValue="Aron Marinho" />
                <Input label="Email" placeholder="Seu email" defaultValue="aronmarinho@gmail.com" />
                <Button>Salvar Alterações</Button>
              </div>
            </Card>
          )}

          {activeSection === 'accounts' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Contas Deriv
              </h2>

              {/* Connection Status */}
              <div
                className={`p-4 rounded-xl border mb-6 ${
                  isAuthenticated
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Wallet className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {isAuthenticated ? 'Conectado' : 'Não conectado'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isAuthenticated
                          ? 'Sua conta Deriv está conectada'
                          : 'Conecte sua conta Deriv para começar a negociar'}
                      </p>
                    </div>
                  </div>
                  {isAuthenticated ? (
                    <Button variant="danger" size="sm" onClick={logout}>
                      Desconectar
                    </Button>
                  ) : (
                    <Button 
                      variant="success" 
                      size="sm" 
                      onClick={login}
                      loading={isConnecting}
                    >
                      Conectar com Deriv
                    </Button>
                  )}
                </div>
              </div>

              {/* Account Info */}
              {isAuthenticated && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Status
                        </p>
                        <p className="font-medium text-green-500">
                          Conectado
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Tipo de Conta
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Demo / Real
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Moeda
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          USD
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Token
                        </p>
                        <p className="font-medium text-green-500">
                          Válido
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Connect Button */}
              {!isAuthenticated && (
                <div className="text-center py-8">
                  <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Conecte sua conta Deriv para acessar todas as funcionalidades
                  </p>
                  <Button 
                    variant="success" 
                    size="lg"
                    onClick={login}
                    loading={isConnecting}
                  >
                    Conectar com Deriv OAuth2
                  </Button>
                </div>
              )}
            </Card>
          )}

          {activeSection === 'security' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Segurança
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Autenticação de Dois Fatores
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Adicione uma camada extra de segurança
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                      Ativado
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Sessões Ativas
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        2 dispositivos conectados
                      </p>
                    </div>
                    <Button variant="secondary" size="sm">
                      Gerenciar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Notificações
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Notificações de trade', description: 'Receba alertas quando trades forem executados', enabled: true },
                  { label: 'Alertas de preço', description: 'Seja notificado quando ativos atingirem preços alvo', enabled: false },
                  { label: 'Novidades e atualizações', description: 'Receba informações sobre novos recursos', enabled: true },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>
                    <button
                      className={`w-12 h-6 rounded-full transition-colors ${
                        item.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          item.enabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeSection === 'appearance' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Aparência
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="font-medium text-gray-900 dark:text-white mb-2">Tema</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 p-4 rounded-lg border-2 bg-white transition-all ${
                        theme === 'light'
                          ? 'border-blue-500 ring-2 ring-blue-500/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-full h-20 rounded bg-gray-100 mb-2" />
                      <p className="text-sm font-medium text-gray-900">Claro</p>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 p-4 rounded-lg border-2 bg-gray-800 transition-all ${
                        theme === 'dark'
                          ? 'border-blue-500 ring-2 ring-blue-500/20'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="w-full h-20 rounded bg-gray-900 mb-2" />
                      <p className="text-sm font-medium text-white">Escuro</p>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'language' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Idioma
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="font-medium text-gray-900 dark:text-white mb-2">
                    Idioma da Interface
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Atualmente detectado: Português (Brasil)
                  </p>
                  <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
