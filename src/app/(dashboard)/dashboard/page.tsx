'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Wifi,
  WifiOff,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Wallet,
  User,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface TickData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface AccountData {
  account_id: string;
  balance: number;
  currency: string;
  account_type: string;
}

interface LogEntry {
  time: string;
  type: 'info' | 'success' | 'error' | 'data';
  message: string;
}

const APP_ID = '33oGBxMR7KHijUwdeKwVC';

export default function DashboardPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [ticks, setTicks] = useState<Record<string, TickData>>({});
  const [tickCount, setTickCount] = useState(0);
  const [account, setAccount] = useState<AccountData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const tickCountRef = useRef(0);

  const symbols = [
    { symbol: '1HZ100V', name: 'Volatility 100 Index' },
    { symbol: '1HZ75V', name: 'Volatility 75 Index' },
    { symbol: '1HZ50V', name: 'Volatility 50 Index' },
    { symbol: 'frxEURUSD', name: 'EUR/USD' },
    { symbol: 'frxGBPUSD', name: 'GBP/USD' },
    { symbol: 'R_100', name: 'Boom 100 Index' },
  ];

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const time = new Date().toLocaleTimeString('pt-BR');
    setLogs(prev => [...prev.slice(-50), { time, type, message }]);
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Get session token from localStorage
    const sessionToken = localStorage.getItem('deriv_session_token');

    addLog('info', 'Conectando WebSocket...');
    setIsConnected(false);
    setIsAuthorized(false);
    setTicks({});
    setAccount(null);
    setTickCount(0);
    tickCountRef.current = 0;

    const wsUrl = `wss://api.derivws.com/trading/v1/options/ws?app_id=${APP_ID}`;
    addLog('info', `URL: ${wsUrl}`);
    addLog('info', `Token de sessao: ${sessionToken ? sessionToken.substring(0, 15) + '...' : 'NAO ENCONTRADO'}`);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      addLog('success', 'WebSocket conectado!');
      setIsConnected(true);

      // Try to authorize with session token
      if (sessionToken) {
        addLog('info', 'Autorizando com token de sessao...');
        ws.send(JSON.stringify({
          authorize: sessionToken,
          req_id: 1
        }));
      } else {
        addLog('info', 'Sem token de sessao. Conectando em modo publico...');
        // Subscribe to public ticks
        symbols.forEach((item, index) => {
          ws.send(JSON.stringify({
            ticks: item.symbol,
            subscribe: 1,
            req_id: index + 10
          }));
        });
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.error) {
          addLog('error', `Erro: ${data.error.message}`);
          return;
        }

        // Handle authorize response
        if (data.msg_type === 'authorize' && data.authorize) {
          const auth = data.authorize;
          setIsAuthorized(true);
          addLog('success', `Autorizado! Login: ${auth.loginid} | Saldo: ${auth.balance} ${auth.currency}`);

          setAccount({
            account_id: auth.loginid,
            balance: auth.balance,
            currency: auth.currency,
            account_type: auth.is_virtual ? 'demo' : 'real',
          });

          // Subscribe to balance updates
          ws.send(JSON.stringify({
            balance: 1,
            subscribe: 1,
            req_id: 2
          }));

          // Subscribe to ticks
          symbols.forEach((item, index) => {
            ws.send(JSON.stringify({
              ticks: item.symbol,
              subscribe: 1,
              req_id: index + 10
            }));
          });
        }

        // Handle balance update
        if (data.msg_type === 'balance' && data.balance) {
          setAccount(prev => prev ? {
            ...prev,
            balance: data.balance.balance,
          } : null);
          addLog('data', `Saldo: $${data.balance.balance.toFixed(2)}`);
        }

        // Handle tick
        if (data.msg_type === 'tick' && data.tick) {
          const { symbol, quote } = data.tick;

          setTicks(prev => {
            const prevTick = prev[symbol];
            const change = prevTick ? quote - prevTick.price : 0;
            const changePercent = prevTick ? (change / prevTick.price) * 100 : 0;

            return {
              ...prev,
              [symbol]: {
                symbol,
                price: quote,
                change,
                changePercent,
              }
            };
          });

          tickCountRef.current += 1;
          setTickCount(tickCountRef.current);
        }
      } catch (error) {
        addLog('error', `Erro ao parsear: ${error}`);
      }
    };

    ws.onerror = () => {
      addLog('error', 'Erro no WebSocket');
      setIsConnected(false);
    };

    ws.onclose = () => {
      addLog('info', 'WebSocket desconectado');
      setIsConnected(false);
      setIsAuthorized(false);
    };
  }, [addLog]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const mainTick = ticks['1HZ100V'];

  const stats = [
    {
      label: 'Saldo da Conta',
      value: account ? `$${account.balance.toFixed(2)}` : '---',
      change: account ? `${account.currency} • ${account.account_type}` : 'Aguardando...',
      trend: 'up' as const,
      icon: Wallet,
      color: 'green',
    },
    {
      label: 'Preco V100',
      value: mainTick ? `$${mainTick.price.toFixed(2)}` : '---',
      change: mainTick ? `${mainTick.changePercent >= 0 ? '+' : ''}${mainTick.changePercent.toFixed(2)}%` : 'Aguardando...',
      trend: mainTick ? (mainTick.changePercent >= 0 ? 'up' : 'down') : 'up',
      icon: BarChart3,
      color: 'blue',
    },
    {
      label: 'Ticks Recebidos',
      value: tickCount.toString(),
      change: `${symbols.length} ativos`,
      trend: 'up' as const,
      icon: Activity,
      color: 'purple',
    },
    {
      label: 'Status',
      value: isAuthorized ? 'Autorizado' : isConnected ? 'Conectado' : 'Offline',
      change: isAuthorized ? 'Dados reais' : 'Aguardando auth',
      trend: isAuthorized ? 'up' : 'down',
      icon: isAuthorized ? Wifi : WifiOff,
      color: isAuthorized ? 'green' : 'red',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Dados em tempo real via Deriv API
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={connectWebSocket}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Reconectar
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowLogs(!showLogs)}>
            {showLogs ? 'Ocultar Logs' : 'Logs'}
          </Button>
          {isAuthorized ? (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Autorizado
            </span>
          ) : isConnected ? (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-medium">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              Conectado
            </span>
          ) : (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-medium">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              Offline
            </span>
          )}
        </div>
      </div>

      {/* Logs */}
      {showLogs && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Logs de Depuracao
            </h2>
            <span className="text-sm text-gray-400">{logs.length} mensagens</span>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 max-h-[300px] overflow-y-auto font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-gray-400">Aguardando logs...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="flex gap-2 mb-1">
                  <span className="text-gray-500">[{log.time}]</span>
                  <span className={
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'data' ? 'text-yellow-400' : 'text-blue-400'
                  }>
                    {log.type === 'success' ? 'V' :
                     log.type === 'error' ? 'X' :
                     log.type === 'data' ? '>' : '-'}
                  </span>
                  <span className="text-gray-300">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Account Banner */}
      {account && (
        <Card variant="gradient" className="bg-gradient-to-br from-green-500 to-emerald-500 border-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Conta</p>
                <p className="text-white text-xl font-bold">{account.account_id}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Saldo Disponivel</p>
              <p className="text-white text-3xl font-bold">${account.balance.toFixed(2)}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium">
                {account.account_type === 'demo' ? 'Conta Demo' : 'Conta Real'} {account.currency}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            green: 'from-green-500 to-emerald-500 bg-green-500/10 text-green-500',
            blue: 'from-blue-500 to-cyan-500 bg-blue-500/10 text-blue-500',
            purple: 'from-purple-500 to-pink-500 bg-purple-500/10 text-purple-500',
            red: 'from-red-500 to-rose-500 bg-red-500/10 text-red-500',
          };

          return (
            <Card key={stat.label} variant="gradient">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Prices Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Precos em Tempo Real</h2>
          <span className="text-sm text-gray-400">{Object.keys(ticks).length} ativos</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 font-medium">Ativo</th>
                <th className="pb-3 font-medium">Simbolo</th>
                <th className="pb-3 font-medium text-right">Preco</th>
                <th className="pb-3 font-medium text-right">Variacao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {symbols.map((item) => {
                const tick = ticks[item.symbol];
                const isPositive = tick ? tick.changePercent >= 0 : false;
                return (
                  <tr key={item.symbol} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 font-medium text-gray-900 dark:text-white">{item.name}</td>
                    <td className="py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{item.symbol}</td>
                    <td className="py-3 text-right font-semibold text-gray-900 dark:text-white">
                      {tick ? `$${tick.price.toFixed(2)}` : '---'}
                    </td>
                    <td className="py-3 text-right">
                      {tick ? (
                        <span className={`font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                          {isPositive ? '+' : ''}{tick.changePercent.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">Aguardando...</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/trading">
          <Card variant="gradient" className="bg-gradient-to-br from-blue-500 to-purple-500 border-0 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="text-white">
              <h3 className="text-lg font-semibold mb-2">Comecar a Negociar</h3>
              <p className="text-white/80 mb-4">Acesse o terminal de trading com dados em tempo real.</p>
              <span className="inline-block px-4 py-2 bg-white text-blue-600 rounded-lg font-medium">Abrir Trading</span>
            </div>
          </Card>
        </Link>
        <Link href="/test-websocket">
          <Card variant="gradient" className="bg-gradient-to-br from-cyan-500 to-blue-500 border-0 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="text-white">
              <h3 className="text-lg font-semibold mb-2">Teste de Conexao</h3>
              <p className="text-white/80 mb-4">Verifique a conexao com a API Deriv em detalhes.</p>
              <span className="inline-block px-4 py-2 bg-white text-cyan-600 rounded-lg font-medium">Abrir Teste</span>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
