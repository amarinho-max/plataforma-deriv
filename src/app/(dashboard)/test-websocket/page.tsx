'use client';

import { useEffect, useState, useCallback } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface LogEntry {
  time: string;
  type: 'info' | 'success' | 'error' | 'data';
  message: string;
}

const APP_ID = '33oGBxMR7KHijUwdeKwVC';
const API_TOKEN = 'pat_c70115f276d2cd45b0ca248ca629a679abdac98ca26987bdf93ed7d7650d6a15';

export default function TestWebSocketPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [tickCount, setTickCount] = useState(0);
  const [step, setStep] = useState(0); // 0=init, 1=connecting, 2=connected, 3=authorized

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const time = new Date().toLocaleTimeString('pt-BR');
    setLogs(prev => [...prev, { time, type, message }]);
  }, []);

  const connectWebSocket = useCallback(() => {
    setLogs([]);
    setIsConnected(false);
    setIsAuthorized(false);
    setCurrentPrice(null);
    setBalance(null);
    setTickCount(0);
    setStep(1);

    addLog('info', '=== DIAGNÓSTICO WEBSOCKET DERIV ===');
    addLog('info', `App ID: ${APP_ID}`);
    addLog('info', `Token: ${API_TOKEN.substring(0, 15)}...`);
    addLog('info', '');

    // Test 1: Try public WebSocket (no auth)
    addLog('info', 'Teste 1: WebSocket PÚBLICO (sem auth)...');
    const publicUrl = 'wss://api.derivws.com/trading/v1/options/ws/public';

    try {
      const publicWs = new WebSocket(publicUrl);

      publicWs.onopen = () => {
        addLog('success', '✓ WebSocket PÚBLICO conectou!');

        // Subscribe to a tick
        publicWs.send(JSON.stringify({
          ticks: '1HZ100V',
          subscribe: 1,
          req_id: 1
        }));

        setTimeout(() => {
          publicWs.close();
          addLog('info', '');
          addLog('info', 'Teste 2: WebSocket COM APP ID...');

          // Test 2: Try with app_id
          const appUrl = `wss://api.derivws.com/trading/v1/options/ws?app_id=${APP_ID}`;
          addLog('info', `URL: ${appUrl}`);

          try {
            const appWs = new WebSocket(appUrl);

            appWs.onopen = () => {
              addLog('success', '✓ WebSocket COM APP ID conectou!');
              setIsConnected(true);
              setStep(2);

              // Try to authorize
              addLog('info', '');
              addLog('info', 'Teste 3: Tentando autorizar...');
              addLog('info', `Enviando: { "authorize": "${API_TOKEN.substring(0, 15)}..." }`);

              appWs.send(JSON.stringify({
                authorize: API_TOKEN,
                req_id: 2
              }));

              // Also try subscribe to ticks (public data should work)
              appWs.send(JSON.stringify({
                ticks: '1HZ100V',
                subscribe: 1,
                req_id: 3
              }));
            };

            appWs.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);

                if (data.error) {
                  addLog('error', `Erro: [${data.error.code}] ${data.error.message}`);
                  return;
                }

                if (data.msg_type === 'authorize') {
                  if (data.authorize) {
                    setIsAuthorized(true);
                    setStep(3);
                    addLog('success', `✓ AUTORIZADO! Login: ${data.authorize.loginid}`);
                    addLog('success', `  Saldo: ${data.authorize.balance} ${data.authorize.currency}`);
                    addLog('success', `  Virtual: ${data.authorize.is_virtual}`);
                    setBalance(data.authorize.balance);

                    // Subscribe to balance
                    appWs.send(JSON.stringify({
                      balance: 1,
                      subscribe: 1,
                      req_id: 4
                    }));
                  } else if (data.echo_req) {
                    addLog('error', `Authorize falhou. Resposta: ${JSON.stringify(data).substring(0, 200)}`);
                  }
                }

                if (data.msg_type === 'balance' && data.balance) {
                  setBalance(data.balance.balance);
                  addLog('data', `Saldo: $${data.balance.balance.toFixed(2)}`);
                }

                if (data.msg_type === 'tick' && data.tick) {
                  setCurrentPrice(data.tick.quote);
                  setTickCount(prev => prev + 1);
                  addLog('data', `Tick #${tickCount + 1}: ${data.tick.symbol} = $${data.tick.quote}`);
                }
              } catch (error) {
                addLog('error', `Erro parse: ${error}`);
              }
            };

            appWs.onerror = (error) => {
              addLog('error', `✗ Erro no WebSocket com App ID: ${error}`);
              setIsConnected(false);
              setStep(0);
            };

            appWs.onclose = (event) => {
              addLog('info', `WebSocket fechado. Code: ${event.code} Reason: ${event.reason || 'nenhum'}`);
              setIsConnected(false);
              setIsAuthorized(false);
              setStep(0);
            };
          } catch (error) {
            addLog('error', `✗ Erro ao criar WebSocket: ${error}`);
            setStep(0);
          }
        }, 2000);
      };

      publicWs.onerror = () => {
        addLog('error', '✗ WebSocket PÚBLICO falhou!');
        addLog('error', 'Possível problema de rede ou firewall');
        setStep(0);
      };

      publicWs.onclose = () => {
        addLog('info', 'WebSocket público fechado');
      };
    } catch (error) {
      addLog('error', `✗ Erro ao criar WebSocket público: ${error}`);
      setStep(0);
    }
  }, [addLog, tickCount]);

  useEffect(() => {
    connectWebSocket();
  }, []);

  const stepLabels = ['Iniciado', 'Conectando...', 'Conectado', 'Autorizado'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Diagnóstico WebSocket
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Teste passo a passo da conexão com Deriv
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isAuthorized ? 'bg-green-100 text-green-700' :
            isConnected ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            Passo {step}: {stepLabels[step]}
          </span>
          <Button variant="secondary" size="sm" onClick={connectWebSocket}>
            <RefreshCw className="w-4 h-4 mr-1" /> Reconectar
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <div className="flex items-center justify-between">
          {['Rede OK', 'WebSocket OK', 'App ID OK', 'Token OK', 'Saldo OK'].map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step > i ? 'bg-green-500 text-white' :
                step === i ? 'bg-blue-500 text-white animate-pulse' :
                'bg-gray-200 dark:bg-gray-700 text-gray-400'
              }`}>
                {step > i ? <CheckCircle className="w-5 h-5" /> : i + 1}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="gradient">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Saldo</p>
            <p className="text-3xl font-bold text-green-500 mt-1">
              {balance !== null ? `$${balance.toFixed(2)}` : '---'}
            </p>
          </div>
        </Card>
        <Card variant="gradient">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Preço V100</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {currentPrice ? `$${currentPrice.toFixed(2)}` : '---'}
            </p>
          </div>
        </Card>
        <Card variant="gradient">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Ticks</p>
            <p className="text-3xl font-bold text-blue-500 mt-1">{tickCount}</p>
          </div>
        </Card>
      </div>

      {/* Logs */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Logs Detalhados
          </h2>
          <span className="text-sm text-gray-400">{logs.length} mensagens</span>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 max-h-[500px] overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-gray-400">Iniciando diagnóstico...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="flex gap-2 mb-1">
                <span className="text-gray-500">[{log.time}]</span>
                <span className={
                  log.type === 'success' ? 'text-green-400' :
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'data' ? 'text-yellow-400' : 'text-blue-400'
                }>
                  {log.type === 'success' ? '✓' :
                   log.type === 'error' ? '✗' :
                   log.type === 'data' ? '→' : '•'}
                </span>
                <span className="text-gray-300">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Help */}
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-300 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          O que verificar se der erro?
        </h3>
        <ul className="text-sm text-yellow-600 dark:text-yellow-400 space-y-1">
          <li>• <strong>Erro: App ID invalido</strong>: Verifique se o App ID esta correto no portal Deriv</li>
          <li>• <strong>Erro: Token invalido</strong>: O token PAT pode nao funcionar com WebSocket. Gere um novo token.</li>
          <li>• <strong>Erro de rede</strong>: Verifique sua conexao com a internet</li>
          <li>• <strong>WebSocket nao abre</strong>: Firewall pode estar bloqueando. Tente outro navegador.</li>
        </ul>
      </Card>
    </div>
  );
}
