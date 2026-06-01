'use client';

import { Wallet, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import { formatCurrency, formatPercent } from '@/lib/utils';

interface BalanceCardProps {
  balance?: number;
  currency?: string;
  change?: number;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function BalanceCard({
  balance = 10000,
  currency = 'USD',
  change = 2.5,
  isLoading = false,
  onRefresh,
}: BalanceCardProps) {
  const isPositive = change >= 0;

  return (
    <Card variant="gradient" className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Saldo Total
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isLoading ? (
                  <span className="inline-block w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ) : (
                  formatCurrency(balance, currency)
                )}
              </h2>
            </div>

            {/* Change indicator */}
            <div className="flex items-center gap-2 mt-2">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  isPositive ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {formatPercent(change)}
              </span>
              <span className="text-sm text-gray-400">hoje</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 text-gray-400 ${
                    isLoading ? 'animate-spin' : ''
                  }`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Disponível</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatCurrency(balance * 0.85, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Em trades</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatCurrency(balance * 0.15, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Lucro hoje</p>
            <p className="text-sm font-semibold text-green-500">
              {formatCurrency(250, currency)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
