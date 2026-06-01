'use client';

import { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Zap, Clock, AlertTriangle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface OrderPanelProps {
  symbol?: string;
  currentPrice?: number;
  onBuy?: (type: 'CALL' | 'PUT', amount: number, duration: number, durationUnit: string) => void;
  isLoading?: boolean;
}

export default function OrderPanel({
  symbol = '1HZ100V',
  currentPrice = 5123.44,
  onBuy,
  isLoading = false,
}: OrderPanelProps) {
  const [contractType, setContractType] = useState<'CALL' | 'PUT'>('CALL');
  const [amount, setAmount] = useState('100');
  const [duration, setDuration] = useState('5');
  const [durationUnit, setDurationUnit] = useState('t');
  const [prediction, setPrediction] = useState<number | null>(null);

  const numAmount = parseFloat(amount) || 0;
  const payoutRate = 1.95;
  const estimatedPayout = numAmount * payoutRate;
  const potentialProfit = estimatedPayout - numAmount;

  const handleBuy = () => {
    onBuy?.(contractType, numAmount, parseInt(duration), durationUnit);
  };

  return (
    <Card>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
        Painel de Ordens
      </h3>

      {/* Contract Type Selector */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setContractType('CALL')}
          className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all duration-200 ${
            contractType === 'CALL'
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
              : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40'
          }`}
        >
          <ArrowUpCircle className="w-8 h-8" />
          <span className="font-semibold">CALL</span>
          <span className="text-xs opacity-80">Rise</span>
        </button>

        <button
          onClick={() => setContractType('PUT')}
          className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all duration-200 ${
            contractType === 'PUT'
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'
          }`}
        >
          <ArrowDownCircle className="w-8 h-8" />
          <span className="font-semibold">PUT</span>
          <span className="text-xs opacity-80">Fall</span>
        </button>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <Input
          label="Valor (USD)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
          icon={<span className="text-sm font-medium">$</span>}
        />
        <div className="flex gap-2 mt-2">
          {[10, 25, 50, 100, 250, 500].map((value) => (
            <button
              key={value}
              onClick={() => setAmount(value.toString())}
              className="flex-1 px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              ${value}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="mb-4">
        <div className="grid grid-cols-3 gap-2">
          <Input
            label="Duração"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
            icon={<Clock className="w-4 h-4" />}
          />
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Unidade
            </label>
            <select
              value={durationUnit}
              onChange={(e) => setDurationUnit(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="t">Ticks</option>
              <option value="s">Segundos</option>
              <option value="m">Minutos</option>
              <option value="h">Horas</option>
              <option value="d">Dias</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          {[
            { value: '5', unit: 't', label: '5 ticks' },
            { value: '1', unit: 'm', label: '1 min' },
            { value: '5', unit: 'm', label: '5 min' },
            { value: '15', unit: 'm', label: '15 min' },
            { value: '1', unit: 'h', label: '1 hora' },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setDuration(preset.value);
                setDurationUnit(preset.unit);
              }}
              className="flex-1 px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prediction (for DIGIT contracts) */}
      <div className="mb-4">
        <Input
          label="Previsão (0-9)"
          type="number"
          value={prediction?.toString() || ''}
          onChange={(e) => setPrediction(parseInt(e.target.value) || null)}
          min={0}
          max={9}
          placeholder="Apenas para contratos DIGIT"
          helperText="Obrigatório para DIGITMATCH/DIGITDIFF"
        />
      </div>

      {/* Payout Info */}
      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Resumo da Ordem
          </span>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-600 dark:text-blue-400">Valor:</span>
            <span className="font-medium text-blue-700 dark:text-blue-300">
              ${numAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-600 dark:text-blue-400">Payout estimado:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              ${estimatedPayout.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-600 dark:text-blue-400">Lucro potencial:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              +${potentialProfit.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
        <p className="text-xs text-yellow-700 dark:text-yellow-300">
          Operações envolvem risco. Você pode perder todo o investimento.
        </p>
      </div>

      {/* Buy Button */}
      <Button
        variant={contractType === 'CALL' ? 'success' : 'danger'}
        className="w-full"
        size="lg"
        loading={isLoading}
        onClick={handleBuy}
      >
        {contractType === 'CALL' ? (
          <>
            <ArrowUpCircle className="w-5 h-5" />
            Comprar CALL
          </>
        ) : (
          <>
            <ArrowDownCircle className="w-5 h-5" />
            Comprar PUT
          </>
        )}
      </Button>

      {/* Quick Info */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Preço atual:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {currentPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-500 dark:text-gray-400">Ativo:</span>
          <span className="font-medium text-gray-900 dark:text-white">{symbol}</span>
        </div>
      </div>
    </Card>
  );
}
