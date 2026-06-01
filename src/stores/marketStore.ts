import { create } from 'zustand';
import type { ActiveSymbol, DerivTick, DerivCandle, ProposalResponse } from '@/types/deriv';

interface MarketState {
  symbols: ActiveSymbol[];
  selectedSymbol: ActiveSymbol | null;
  currentTick: DerivTick | null;
  tickHistory: DerivTick[];
  candles: DerivCandle[];
  currentProposal: ProposalResponse | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  setSymbols: (symbols: ActiveSymbol[]) => void;
  setSelectedSymbol: (symbol: ActiveSymbol | null) => void;
  setCurrentTick: (tick: DerivTick) => void;
  addTick: (tick: DerivTick) => void;
  setCandles: (candles: DerivCandle[]) => void;
  setCurrentProposal: (proposal: ProposalResponse | null) => void;
  setConnected: (isConnected: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  symbols: [],
  selectedSymbol: null,
  currentTick: null,
  tickHistory: [],
  candles: [],
  currentProposal: null,
  isConnected: false,
  isLoading: false,
  error: null,

  setSymbols: (symbols) => set({ symbols }),
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  setCurrentTick: (tick) =>
    set((state) => ({
      currentTick: tick,
      tickHistory: [...state.tickHistory.slice(-99), tick],
    })),
  addTick: (tick) =>
    set((state) => ({
      tickHistory: [...state.tickHistory.slice(-99), tick],
    })),
  setCandles: (candles) => set({ candles }),
  setCurrentProposal: (proposal) => set({ currentProposal: proposal }),
  setConnected: (isConnected) => set({ isConnected }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      symbols: [],
      selectedSymbol: null,
      currentTick: null,
      tickHistory: [],
      candles: [],
      currentProposal: null,
      isConnected: false,
      isLoading: false,
      error: null,
    }),
}));
