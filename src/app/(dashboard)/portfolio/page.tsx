'use client';

import { Briefcase, TrendingUp, TrendingDown, Clock, Eye } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const openPositions = [
  {
    id: 1,
    contractId: 12345678,
    type: 'CALL',
    asset: 'Volatility 100 Index',
    amount: 100,
    payout: 195,
    currentPrice: 5125.22,
    entryPrice: 5120.15,
    startTime: '2 min atrás',
    expiry: '3 ticks',
    profit: 45.5,
  },
  {
    id: 2,
    contractId: 12345679,
    type: 'DIGITEVEN',
    asset: 'Volatility 75 Index',
    amount: 50,
    payout: 97.5,
    currentPrice: 4522.1,
    entryPrice: 4521.87,
    startTime: '5 min atrás',
    expiry: '1 tick',
    profit: -12.3,
  },
  {
    id: 3,
    contractId: 12345680,
    type: 'HIGHER',
    asset: 'Boom 100 Index',
    amount: 75,
    payout: 146.25,
    currentPrice: 1234.56,
    entryPrice: 1230.00,
    startTime: '8 min atrás',
    expiry: '5 ticks',
    profit: 28.75,
  },
];

export default function PortfolioPage() {
  const totalInvested = openPositions.reduce((sum, pos) => sum + pos.amount, 0);
  const totalProfit = openPositions.reduce((sum, pos) => sum + pos.profit, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Portfolio
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Suas posições abertas e investimentos
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="gradient">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Briefcase className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Posições Abertas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {openPositions.length}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="gradient">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Investido</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalInvested.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="gradient">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${
                totalProfit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}
            >
              {totalProfit >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-500" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-500" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Lucro/Prejuízo</p>
              <p
                className={`text-2xl font-bold ${
                  totalProfit >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Open Positions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Posições Abertas
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {openPositions.length} contratos ativos
          </span>
        </div>

        {openPositions.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma posição aberta no momento
            </p>
            <Button variant="primary" className="mt-4">
              Começar a Negociar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {openPositions.map((position) => (
              <div
                key={position.id}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  position.profit >= 0
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        position.profit >= 0
                          ? 'bg-green-100 dark:bg-green-900/50'
                          : 'bg-red-100 dark:bg-red-900/50'
                      }`}
                    >
                      {position.profit >= 0 ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            position.type === 'CALL' || position.type === 'HIGHER'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {position.type}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {position.asset}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>Investido: ${position.amount}</span>
                        <span>Payout: ${position.payout}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {position.startTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-xl font-bold ${
                        position.profit >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {position.profit >= 0 ? '+' : ''}${position.profit.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {((position.profit / position.amount) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Preço entrada: ${position.entryPrice}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      Preço atual: ${position.currentPrice}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      Expira: {position.expiry}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                      Detalhes
                    </Button>
                    <Button variant="danger" size="sm">
                      Vender
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
