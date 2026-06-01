'use client';

import { Bell, Search, User, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const { balance } = useAuthStore();

  return (
    <header
      className={cn(
        'h-16 flex items-center justify-between px-6',
        'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl',
        'border-b border-gray-200 dark:border-gray-800',
        className
      )}
    >
      {/* Left - Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar ativos, contratos..."
            className={cn(
              'w-full pl-10 pr-4 py-2 rounded-lg',
              'bg-gray-100 dark:bg-gray-800',
              'border border-transparent',
              'text-gray-900 dark:text-gray-100',
              'placeholder-gray-500 dark:placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'transition-all duration-200'
            )}
          />
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-4">
        {/* Balance */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <Wallet className="w-4 h-4 text-green-500" />
          <span className="font-semibold text-green-600 dark:text-green-400">
            ${(balance?.balance || 10000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Notifications */}
        <button
          className={cn(
            'relative p-2 rounded-lg',
            'text-gray-600 dark:text-gray-400',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'transition-all duration-200'
          )}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User */}
        <button
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            'text-gray-600 dark:text-gray-400',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'transition-all duration-200'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium hidden sm:block">Aron</span>
        </button>
      </div>
    </header>
  );
}
