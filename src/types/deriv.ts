// Deriv API Types

export interface DerivAccount {
  account_id: string;
  balance: number;
  currency: string;
  group: string;
  status: string;
  account_type: 'demo' | 'real';
  created_at: string;
  email: string;
  last_access_at: string;
  name: string;
  server_id: string;
  rights: Record<string, unknown>;
}

export interface DerivBalance {
  balance: number;
  currency: string;
  id: string;
  loginid: string;
}

export interface DerivTick {
  ask: number;
  bid: number;
  epoch: number;
  id: string;
  pip_size: number;
  quote: number;
  symbol: string;
}

export interface DerivCandle {
  close: number;
  epoch: number;
  high: number;
  low: number;
  open: number;
  volume: number;
}

export interface ActiveSymbol {
  underlying_symbol: string;
  underlying_symbol_name: string;
  underlying_symbol_type: string;
  market: string;
  submarket: string;
  subgroup: string;
  pip_size: number;
  exchange_is_open: number;
  is_trading_suspended: number;
  trade_count: number;
}

export interface ContractType {
  contract_category: string;
  contract_types: string[];
  display_name: string;
}

export interface ProposalParams {
  proposal: 1;
  amount: number;
  basis: 'stake' | 'payout';
  contract_type: string;
  currency: string;
  duration?: number;
  duration_unit?: 's' | 'm' | 'h' | 'd' | 't';
  date_expiry?: number;
  underlying_symbol: string;
  subscribe?: 0 | 1;
  barrier?: string;
  barrier2?: string;
  req_id?: number;
}

export interface ProposalResponse {
  id: string;
  ask_price: number;
  date_start: number;
  longcode: string;
  payout: number;
  spot: number;
  spot_time: number;
  date_expiry?: number;
  contract_details?: {
    tick_size_barrier?: number;
    maximum_payout?: number;
    maximum_ticks?: number;
    ticks_stayed_in?: number;
  };
  validation_params?: {
    min_stake?: number;
    max_stake?: number;
    min_payout?: number;
    max_payout?: number;
  };
}

export interface BuyParams {
  buy: string;
  price: number;
  parameters?: Record<string, unknown>;
  subscribe?: 0 | 1;
  req_id?: number;
}

export interface BuyResponse {
  balance_after: number;
  buy_price: number;
  contract_id: number;
  longcode: string;
  payout: number;
  purchase_time: number;
  start_time: number;
  transaction_id: number;
}

export interface SellParams {
  sell: number;
  price: number;
  req_id?: number;
}

export interface SellResponse {
  balance_after: number;
  contract_id: number;
  reference_id: number;
  sold_for: number;
  transaction_id: number;
}

export interface OpenContract {
  contract_id: number;
  contract_type: string;
  currency: string;
  buy_price: number;
  payout: number;
  current_spot: number;
  current_spot_time: number;
  entry_spot: number;
  entry_spot_time: number;
  expiry_time: number;
  is_sold: boolean;
  is_settled: boolean;
  profit: number;
  bid_price: number;
  sell_price?: number;
  status: 'open' | 'sold' | 'settled' | 'expired';
}

export interface Portfolio {
  contracts: {
    contract_id: number;
    contract_type: string;
    currency: string;
    buy_price: number;
    payout: number;
  }[];
}

export interface ProfitTableEntry {
  contract_id: number;
  contract_type: string;
  currency: string;
  buy_price: number;
  payout: number;
  profit: number;
  sell_time?: number;
  sell_price?: number;
  entry_time: number;
  expiry_time: number;
}

export interface Transaction {
  transaction_id: number;
  amount: number;
  balance: number;
  contract_id?: number;
  currency: string;
  description: string;
  epoch: number;
  action_type: string;
}

// WebSocket Messages
export interface WSRequest {
  time?: 1;
  active_symbols?: 'brief' | 'full';
  contracts_for?: string;
  contracts_list?: 1;
  ticks?: string | string[];
  ticks_history?: string;
  proposal?: 1;
  buy?: string;
  sell?: number;
  proposal_open_contract?: 1;
  contract_update?: 1;
  balance?: 1;
  portfolio?: 1;
  profit_table?: 1;
  statement?: 1;
  transaction?: 1;
  forget?: string;
  forget_all?: string[];
  ping?: 1;
  subscribe?: 0 | 1;
  req_id?: number;
  end?: string;
  start?: number;
  count?: number;
  style?: 'ticks' | 'candles';
  granularity?: number;
  amount?: number;
  basis?: 'stake' | 'payout';
  contract_type?: string;
  currency?: string;
  duration?: number;
  duration_unit?: string;
  underlying_symbol?: string;
  barrier?: string;
  barrier2?: string;
  price?: number;
  contract_id?: number;
  limit_order?: {
    stop_loss?: number;
    take_profit?: number;
  };
  description?: 0 | 1;
  limit?: number;
  offset?: number;
}

export interface WSResponse {
  msg_type: string;
  req_id?: number;
  error?: {
    code: string;
    message: string;
  };
  time?: {
    time: number;
  };
  active_symbols?: ActiveSymbol[];
  contracts_for?: {
    available: ContractType[];
    symbol: string;
  };
  contracts_list?: ContractType[];
  tick?: DerivTick;
  history?: {
    prices: number[];
    times: number[];
  };
  candles?: DerivCandle[];
  proposal?: ProposalResponse;
  buy?: BuyResponse;
  sell?: SellResponse;
  proposal_open_contract?: OpenContract;
  balance?: DerivBalance;
  portfolio?: Portfolio;
  profit_table?: {
    profit_table: ProfitTableEntry[];
    count: number;
  };
  statement?: {
    transactions: Transaction[];
  };
  transaction?: Transaction;
  ping?: string;
}
