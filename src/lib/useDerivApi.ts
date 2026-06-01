'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDerivApi, Account } from './deriv-api-rest';
import { getDerivClient } from './deriv-client';

const API_TOKEN = process.env.DERIV_API_TOKEN || '';

interface DerivApiState {
  accounts: Account[];
  selectedAccount: Account | null;
  wsUrl: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useDerivApi() {
  const [state, setState] = useState<DerivApiState>({
    accounts: [],
    selectedAccount: null,
    wsUrl: null,
    isConnected: false,
    isLoading: false,
    error: null,
  });

  // Carregar contas
  const loadAccounts = useCallback(async () => {
    if (!API_TOKEN) {
      setState(prev => ({ ...prev, error: 'API token não configurado' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const api = getDerivApi(API_TOKEN);
      const accounts = await api.getAccounts();
      
      setState(prev => ({
        ...prev,
        accounts,
        selectedAccount: accounts[0] || null,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Erro ao carregar contas',
        isLoading: false,
      }));
    }
  }, []);

  // Conectar WebSocket
  const connectWebSocket = useCallback(async (accountId?: string) => {
    if (!API_TOKEN) {
      setState(prev => ({ ...prev, error: 'API token não configurado' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const api = getDerivApi(API_TOKEN);
      const targetAccountId = accountId || state.selectedAccount?.account_id;

      if (!targetAccountId) {
        setState(prev => ({
          ...prev,
          error: 'Nenhuma conta selecionada',
          isLoading: false,
        }));
        return;
      }

      // Obter OTP
      const wsUrl = await api.getOtp(targetAccountId);
      
      if (!wsUrl) {
        setState(prev => ({
          ...prev,
          error: 'Erro ao obter OTP',
          isLoading: false,
        }));
        return;
      }

      setState(prev => ({ ...prev, wsUrl }));

      // Conectar WebSocket
      const client = getDerivClient();
      await client.connect(wsUrl);

      setState(prev => ({
        ...prev,
        isConnected: true,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Erro ao conectar WebSocket',
        isLoading: false,
      }));
    }
  }, [state.selectedAccount]);

  // Desconectar
  const disconnect = useCallback(() => {
    const client = getDerivClient();
    client.disconnect();
    
    setState(prev => ({
      ...prev,
      isConnected: false,
      wsUrl: null,
    }));
  }, []);

  // Conectar como público (sem auth)
  const connectPublic = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const client = getDerivClient();
      await client.connectPublic();

      setState(prev => ({
        ...prev,
        isConnected: true,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Erro ao conectar WebSocket público',
        isLoading: false,
      }));
    }
  }, []);

  // Carregar contas ao montar
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  return {
    ...state,
    loadAccounts,
    connectWebSocket,
    connectPublic,
    disconnect,
  };
}
