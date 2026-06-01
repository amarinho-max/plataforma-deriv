'use client';

import { useState } from 'react';
import { Search, Star, TrendingUp, TrendingDown } from 'lucide-react';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  isFavorite?: boolean;
}

interface AssetSelectorProps {
  assets?: Asset[];
  selectedAsset?: Asset | null;
  onSelect?: (asset: Asset) => void;
  onToggleFavorite?: (symbol: string) => void;
}

const defaultAssets: Asset[] = [
  { symbol: '1HZ100V', name: 'Volatility 100 Index', price: 5123.44, change: 2.3, isFavorite: true },
  { symbol: '1HZ75V', name: 'Volatility 75 Index', price: 4521.87, change: -1.2 },
  { symbol: '1HZ50V', name: 'Volatility 50 Index', price: 3892.15, change: 0.8, isFavorite: true },
  { symbol: '1HZ25V', name: 'Volatility 25 Index', price: 2156.33, change: 1.5 },
  { symbol: '1HZ10V', name: 'Volatility 10 Index', price: 987.65, change: -0.5 },
  { symbol: 'frxEURUSD', name: 'EUR/USD', price: 1.0842, change: -0.3, isFavorite: true },
  { symbol: 'frxGBPUSD', name: 'GBP/USD', price: 1.2654, change: 0.2 },
  { symbol: 'frxUSDJPY', name: 'USD/JPY', price: 149.82, change: 0.4 },
  { symbol: 'R_100', name: 'Boom 100 Index', price: 1234.56, change: 1.8 },
  { symbol: 'R_75', name: 'Boom 75 Index', price: 987.65, change: -0.9 },
];

export default function AssetSelector({
  assets = defaultAssets,
  selectedAsset,
  onSelect,
  onToggleFavorite,
}: AssetSelectorProps) {
  const [search, setSearch] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(search.toLowerCase());
    const matchesFavorites = !showFavoritesOnly || asset.isFavorite;
    return matchesSearch && matchesFavorites;
  });

  return (
    <Card padding="none">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar ativo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              showFavoritesOnly
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            <Star className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Asset List */}
      <div className="max-h-[400px] overflow-y-auto">
        {filteredAssets.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            Nenhum ativo encontrado
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <button
              key={asset.symbol}
              onClick={() => onSelect?.(asset)}
              className={cn(
                'w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0',
                selectedAsset?.symbol === asset.symbol &&
                  'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-500'
              )}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite?.(asset.symbol);
                  }}
                  className={cn(
                    'transition-colors',
                    asset.isFavorite
                      ? 'text-yellow-500'
                      : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'
                  )}
                >
                  <Star className="w-4 h-4" fill={asset.isFavorite ? 'currentColor' : 'none'} />
                </button>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {asset.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {asset.symbol}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {asset.price.toFixed(2)}
                </p>
                <div className="flex items-center gap-1 justify-end">
                  {asset.change >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span
                    className={cn(
                      'text-xs font-medium',
                      asset.change >= 0 ? 'text-green-500' : 'text-red-500'
                    )}
                  >
                    {asset.change >= 0 ? '+' : ''}
                    {asset.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </Card>
  );
}
