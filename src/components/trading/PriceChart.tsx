'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, HistogramData } from 'lightweight-charts';
import Card from '@/components/ui/Card';

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface PriceChartProps {
  symbol?: string;
  candles?: CandleData[];
  onCandleUpdate?: (candle: CandleData) => void;
  granularity?: number;
}

export default function PriceChart({
  symbol = '1HZ100V',
  candles = [],
  onCandleUpdate,
  granularity = 60,
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastPrice, setLastPrice] = useState<number | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#e2e8f0' },
        horzLines: { color: '#e2e8f0' },
      },
      crosshair: {
        vertLine: { color: '#3b82f6', width: 1, style: 0 },
        horzLine: { color: '#3b82f6', width: 1, style: 0 },
      },
      rightPriceScale: {
        borderColor: '#e2e8f0',
      },
      timeScale: {
        borderColor: '#e2e8f0',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#3b82f6',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;
    chartRef.current = chart;

    // Set initial data if available
    if (candles.length > 0) {
      const chartData: CandlestickData[] = candles.map(c => ({
        time: c.time as any,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      candlestickSeries.setData(chartData);

      const volumeData: HistogramData[] = candles.map(c => ({
        time: c.time as any,
        value: c.volume || 0,
        color: c.close >= c.open ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
      }));
      volumeSeries.setData(volumeData);

      setLastPrice(candles[candles.length - 1].close);
    }

    chart.timeScale().fitContent();
    setIsLoading(false);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      candlestickSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [symbol, granularity]);

  // Update chart when candles change
  useEffect(() => {
    if (!candlestickSeriesRef.current || candles.length === 0) return;

    const chartData: CandlestickData[] = candles.map(c => ({
      time: c.time as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    candlestickSeriesRef.current.setData(chartData);

    if (volumeSeriesRef.current) {
      const volumeData: HistogramData[] = candles.map(c => ({
        time: c.time as any,
        value: c.volume || 0,
        color: c.close >= c.open ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
      }));
      volumeSeriesRef.current.setData(volumeData);
    }

    setLastPrice(candles[candles.length - 1].close);
  }, [candles]);

  // Update single candle in real-time
  const updateCandle = (candle: CandleData) => {
    if (!candlestickSeriesRef.current) return;

    candlestickSeriesRef.current.update({
      time: candle.time as any,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    });

    if (volumeSeriesRef.current && candle.volume !== undefined) {
      volumeSeriesRef.current.update({
        time: candle.time as any,
        value: candle.volume,
        color: candle.close >= candle.open ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
      });
    }

    setLastPrice(candle.close);
  };

  // Expose updateCandle via ref for parent components
  useEffect(() => {
    if (onCandleUpdate) {
      (window as any).__priceChartUpdate = updateCandle;
    }
    return () => {
      delete (window as any).__priceChartUpdate;
    };
  }, [onCandleUpdate]);

  const formatTimeframe = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${seconds / 60}m`;
    if (seconds < 86400) return `${seconds / 3600}h`;
    return `${seconds / 86400}D`;
  };

  return (
    <Card variant="gradient" padding="none" className="overflow-hidden">
      {/* Chart Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {symbol}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Candlestick • {formatTimeframe(granularity)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastPrice && (
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ${lastPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Carregando gráfico...
              </p>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full" />
      </div>

      {/* Chart Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          {candles.length > 0 && (
            <>
              <span className="text-gray-500 dark:text-gray-400">
                Abertura: <span className="text-gray-900 dark:text-white">{candles[candles.length - 1].open.toFixed(2)}</span>
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                Máxima: <span className="text-green-500">{candles[candles.length - 1].high.toFixed(2)}</span>
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                Mínima: <span className="text-red-500">{candles[candles.length - 1].low.toFixed(2)}</span>
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                Fechamento: <span className="text-gray-900 dark:text-white">{candles[candles.length - 1].close.toFixed(2)}</span>
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {candles.length} candles
          </span>
        </div>
      </div>
    </Card>
  );
}
