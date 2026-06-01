'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  LineChart,
  Briefcase,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TestTube,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useAuthStore } from '@/stores/authStore';

const menuItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Trading',
    href: '/trading',
    icon: LineChart,
  },
  {
    label: 'Portfolio',
    href: '/portfolio',
    icon: Briefcase,
  },
  {
    label: 'Configurações',
    href: '/settings',
    icon: Settings,
  },
  {
    label: 'Teste WebSocket',
    href: '/test-websocket',
    icon: TestTube,
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside
      className={cn(
        'h-screen fixed left-0 top-0 z-40 flex flex-col',
        'bg-white dark:bg-gray-900',
        'border-r border-gray-200 dark:border-gray-800',
        'transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
          <LineChart className="w-6 h-6 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg gradient-text">Deriv Trading</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn('flex-shrink-0', isActive ? 'text-blue-500' : '')} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <ThemeToggle className="w-full" />

        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full',
            'text-red-600 dark:text-red-400',
            'hover:bg-red-50 dark:hover:bg-red-900/30',
            'transition-all duration-200'
          )}
          title={collapsed ? 'Sair' : undefined}
        >
          <LogOut className="flex-shrink-0" />
          {!collapsed && <span className="font-medium">Sair</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg w-full',
            'text-gray-600 dark:text-gray-400',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'transition-all duration-200'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
