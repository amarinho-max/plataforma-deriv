'use client';

import { TrendingUp, TrendingDown, Activity, Target, Clock, Zap } from 'lucide-react';
import Card from '@/components/ui/Card';

interface StatItem {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface StatsGridProps {
  stats?: StatItem[];
}

const defaultStats: StatItem[] = [
  {
    label: 'Win Rate',
    value: '68.5%',
    change: '+2.1%',
    trend: 'up',
    icon: <Target className="w-5 h-5" />,
    color: 'blue',
  },
  {
    label: 'Trades Hoje',
    value: '12',
    change: '+3',
    trend: 'up',
    icon: <Activity className="w-5 h-5" />,
    color: 'purple',
  },
  {
    label: 'Melhor Trade',
    value: '+$450',
    change: '+15%',
    trend: 'up',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'green',
  },
  {
    label: 'Pior Trade',
    value: '-$100',
    change: '-5%',
    trend: 'down',
    icon: <TrendingDown className="w-5 h-5" />,
    color: 'red',
  },
  {
    label: 'Tempo Médio',
    value: '2m 30s',
    trend: 'neutral',
    icon: <Clock className="w-5 h-5" />,
    color: 'cyan',
  },
  {
    label: 'Sequência',
    value: '5 wins',
    change: '+2',
    trend: 'up',
    icon: <Zap className="w-5 h-5" />,
    color: 'yellow',
  },
];

const colorMap: Record<string, string> = {
  blue: 'from-blue-500 to-cyan-500 bg-blue-500/10',
  purple: 'from-purple-500 to-pink-500 bg-purple-500/10',
  green: 'from-green-500 to-emerald-500 bg-green-500/10',
  red: 'from-red-500 to-rose-500 bg-red-500/10',
  cyan: 'from-cyan-500 to-blue-500 bg-cyan-500/10',
  yellow: 'from-yellow-500 to-orange-500 bg-yellow-500/10',
};

export default function StatsGrid({ stats = defaultStats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} variant="gradient" padding="sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              {stat.change && (
                <div className="flex items-center gap-1 mt-1">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : stat.trend === 'down' ? (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  ) : null}
                  <span
                    className={`text-xs font-medium ${
                      stat.trend === 'up'
                        ? 'text-green-500'
                        : stat.trend === 'down'
                        ? 'text-red-500'
                        : 'text-gray-400'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              )}
            </div>
            <div
              className={`p-2 rounded-lg bg-gradient-to-br ${
                colorMap[stat.color] || colorMap.blue
              }`}
            >
              <div className="text-white">{stat.icon}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
