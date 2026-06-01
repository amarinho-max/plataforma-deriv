'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Zap, Wifi, WifiOff } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PriceChart from '@/components/trading/PriceChart';

interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

const APP_ID = '33oGBxMR7KHijUwdeKwVC';

export default function TradingPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [amount, setAmount] = useState('100');
  const [duration, setDuration] = useState('5');
  const [durationUnit, setDurationUnit] = useState('t');
  const [granularity, setGranularity] = useState(60);
  const wsRef = useRef<WebSocket | null>(null);

  const availableSymbols = [
    { symbol: '1HZ100V', name: 'Volatility 100 Index' },
    { symbol: '1HZ75V', name: 'Volatility 75 Index' },
    { symbol: '1HZ50V', name: 'Volatility 50 Index' },
    { symbol: '1HZ25V', name: 'Volatility 25 Index' },
    { symbol: '1HZ10V', name: 'Volatility 10 Index' },
    { symbol: 'frxEURUSD', name: 'EUR/USD' },
    { symbol: 'frxGBPUSD', name: 'GBP/USD' },
    { symbol: 'frxUSDJPY', name: 'USD/JPY' },
    { symbol: 'R_100', name: 'Boom 100 Index' },
    { symbol: 'R_75', name: 'Boom 75 Index' },
  ];

  const connectToWebSocket = useCallback((symbol: string, gran: number) => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const sessionToken = localStorage.getItem('deriv_session_token');
    const wsUrl = `wss://api.derivws.com/trading/v1/options/ws?app_id=${APP_ID}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);

      // Authorize with session token
      if (sessionToken) {
        ws.send(JSON.stringify({
          authorize: sessionToken,
          req_id: 1
        }));
      } else {
        // No token, just subscribe to public data
        ws.send(JSON.stringify({
          candles: symbol,
          count: 200,
          granularity: gran,
          req_id: 2
        }));
        ws.send(JSON.stringify({
          ticks: symbol,
          subscribe: 1,
          req_id: 3
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.error) return;

        // Handle authorize
        if (data.msg_type === 'authorize' && data.authorize) {
          setIsAuthorized(true);

          // Request candle history
          ws.send(JSON.stringify({
            candles: symbol,
            count: 200,
            granularity: gran,
            req_id: 2
          }));

          // Subscribe to ticks
          ws.send(JSON.stringify({
            ticks: symbol,
            subscribe: 1,
            req_id: 3
          }));

          // Subscribe to candles
          ws.send(JSON.stringify({
            candles: symbol,
            granularity: gran,
            subscribe: 1,
            req_id: 4
          }));
        }

        // Handle candle history
        if (data.msg_type === 'candles' && data.candles && data.req_id === 2) {
          const candleData: CandleData[] = data.candles.map((c: any) => ({
            time: c.epoch,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            volume: c.volume || 0,
          }));
          setCandles(candleData);
          if (candleData.length > 0) {
            setCurrentPrice(candleData[candleData.length - 1].close);
          }
        }

        // Handle tick
        if (data.msg_type === 'tick' && data.tick) {
          setCurrentPrice(data.tick.quote);
          setAssets(prev => prev.map(a =>
            a.symbol === symbol ? { ...a, price: data.tick.quote } : a
          ));
        }

        // Handle candle update
        if (data.msg_type === 'candle' && data.candle) {
          const c = data.candle;
          const newCandle: CandleData = {
            time: c.epoch,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            volume: c.volume || 0,
          };

          setCandles(prev => {
            const lastCandle = prev[prev.length - 1];
            if (lastCandle && lastCandle.time === newCandle.time) {
              return [...prev.slice(0, -1), newCandle];
            }
            return [...prev, newCandle].slice(-200);
          });

          setCurrentPrice(newCandle.close);
        }
      } catch (error) {
        console.error('Error parsing:', error);
      }
    };

    ws.onerror = () => setIsConnected(false);
    ws.onclose = () => {
      setIsConnected(false);
      setIsAuthorized(false);
    };
  }, []);

  useEffect(() => {
    const initialAssets = availableSymbols.map(s => ({
      ...s,
      price: 0,
      change: 0,
    }));
    setAssets(initialAssets);
    setSelectedAsset({ ...initialAssets[0] });
    connectToWebSocket(initialAssets[0].symbol, granularity);

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (selectedAsset) {
      connectToWebSocket(selectedAsset.symbol, granularity);
    }
  }, [selectedAsset?.symbol, granularity]);

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset({ ...asset });
    setCandles([]);
  };

  const numAmount = parseFloat(amount) || 0;
  const estimatedPayout = numAmount * 1.95;

  const granularities = [
    { value: 60, label: '1m' },
    { value: 300, label: '5m' },
    { value: 900, label: '15m' },
    { value: 3600, label: '1h' },
    { value: 14400, label: '4h' },
    { value: 86400, label: '1D' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trading</h1>
          <p className="text-gray-500 dark:text-gray-400">Negocie opcoes binarias com dados em tempo real</p>
        </div>
        <div className="flex items-center gap-2">
          {isAuthorized ? (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
              <Wifi className="w-4 h-4" /> Autorizado
            </span>
          ) : isConnected ? (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-medium">
              <Wifi className="w-4 h-4" /> Conectado
            </span>
          ) : (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-medium">
              <WifiOff className="w-4 h-4" /> Offline
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Granularity Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Timeframe:</span>
            {granularities.map((g) => (
              <button
                key={g.value}
                onClick={() => setGranularity(g.value)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  granularity === g.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Chart */}
          <PriceChart
            symbol={selectedAsset?.symbol || '1HZ100V'}
            candles={candles}
            granularity={granularity}
          />
        </div>

        {/* Order Panel */}
        <div className="space-y-4">
          {/* Asset Selector */}
          <Card padding="none">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Selecionar Ativo</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {assets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => handleAssetSelect(asset)}
                  className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                    selectedAsset?.symbol === asset.symbol
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-500'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{asset.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{asset.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {asset.price > 0 ? `$${asset.price.toFixed(2)}` : '---'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Amount & Duration */}
          <Card>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Configuracoes</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Valor (USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
                <div className="flex gap-2 mt-2">
                  {[10, 25, 50, 100, 250, 500].map((value) => (
                    <button
                      key={value}
                      onClick={() => setAmount(value.toString())}
                      className="flex-1 px-1 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      ${value}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Duracao</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Unidade</label>
                  <select
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="t">Ticks</option>
                    <option value="s">Segundos</option>
                    <option value="m">Minutos</option>
                    <option value="h">Horas</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Buy Buttons */}
          <div className="space-y-2">
            <Button variant="success" className="w-full" size="lg">
              <ArrowUpCircle className="w-5 h-5" />
              Comprar CALL
            </Button>
            <Button variant="danger" className="w-full" size="lg">
              <ArrowDownCircle className="w-5 h-5" />
              Comprar PUT
            </Button>
          </div>

          {/* Payout */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-700 dark:text-blue-300 font-medium">Payout estimado</p>
                <p className="text-blue-600 dark:text-blue-400">
                  {numAmount > 0 ? `$${estimatedPayout.toFixed(2)}` : '$0.00'}{' '}
                  <span className="text-blue-500">(95%)</span>
                </p>
              </div>
            </div>
          </Card>

          {/* Current Price */}
          {currentPrice > 0 && (
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Preco Atual</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">${currentPrice.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">{selectedAsset?.name}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
