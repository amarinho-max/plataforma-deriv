import type {
  WSRequest,
  WSResponse,
  ActiveSymbol,
  ContractType,
  ProposalResponse,
  BuyResponse,
  SellResponse,
  OpenContract,
  DerivBalance,
  Portfolio,
  DerivTick,
  DerivCandle,
} from '@/types/deriv';

const WS_URL = process.env.NEXT_PUBLIC_DERIV_WS_URL || 'wss://api.derivws.com/trading/v1/options/ws';
const WS_PUBLIC_URL = `${WS_URL}/public`;

type MessageHandler = (data: WSResponse) => void;
type ConnectionHandler = () => void;

export class DerivClient {
  private ws: WebSocket | null = null;
  private wsPublic: WebSocket | null = null;
  private requestId: number = 0;
  private handlers: Map<number, MessageHandler> = new Map();
  private tickHandlers: Map<string, MessageHandler> = new Map();
  private onConnectHandlers: ConnectionHandler[] = [];
  private onDisconnectHandlers: ConnectionHandler[] = [];
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 1000;
  private otpUrl: string | null = null;

  constructor() {
    this.handleMessage = this.handleMessage.bind(this);
    this.handlePublicMessage = this.handlePublicMessage.bind(this);
  }

  // Connection Management
  async connect(otpUrl?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = otpUrl || WS_PUBLIC_URL;

      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.onConnectHandlers.forEach((handler) => handler());
          resolve();
        };

        this.ws.onmessage = this.handleMessage;

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.onDisconnectHandlers.forEach((handler) => handler());
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async connectPublic(): Promise<void> {
    return this.connect(WS_PUBLIC_URL);
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data: WSResponse = JSON.parse(event.data);

      if (data.req_id && this.handlers.has(data.req_id)) {
        const handler = this.handlers.get(data.req_id);
        if (handler) {
          handler(data);
          this.handlers.delete(data.req_id);
        }
      }

      if (data.msg_type === 'tick' && data.tick) {
        const symbol = data.tick.symbol;
        const handler = this.tickHandlers.get(symbol);
        if (handler) {
          handler(data);
        }
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }

  private handlePublicMessage(event: MessageEvent): void {
    this.handleMessage(event);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (this.otpUrl) {
        this.connect(this.otpUrl);
      } else {
        this.connectPublic();
      }
    }, delay);
  }

  onConnect(handler: ConnectionHandler): void {
    this.onConnectHandlers.push(handler);
  }

  onDisconnect(handler: ConnectionHandler): void {
    this.onDisconnectHandlers.push(handler);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.wsPublic) {
      this.wsPublic.close();
      this.wsPublic = null;
    }
  }

  // Request Methods
  private async sendRequest(request: WSRequest): Promise<WSResponse> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const reqId = ++this.requestId;
      const fullRequest = { ...request, req_id: reqId };

      this.handlers.set(reqId, resolve);

      this.ws.send(JSON.stringify(fullRequest));

      setTimeout(() => {
        if (this.handlers.has(reqId)) {
          this.handlers.delete(reqId);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  // System
  async ping(): Promise<string> {
    const response = await this.sendRequest({ ping: 1 });
    return response.ping || '';
  }

  async getTime(): Promise<number> {
    const response = await this.sendRequest({ time: 1 });
    return response.time?.time || 0;
  }

  // Market Data
  async getActiveSymbols(type: 'brief' | 'full' = 'brief'): Promise<ActiveSymbol[]> {
    const response = await this.sendRequest({ active_symbols: type });
    return response.active_symbols || [];
  }

  async getContractsFor(symbol: string): Promise<ContractType[]> {
    const response = await this.sendRequest({ contracts_for: symbol });
    return response.contracts_for?.available || [];
  }

  async getContractsList(): Promise<ContractType[]> {
    const response = await this.sendRequest({ contracts_list: 1 });
    return response.contracts_list || [];
  }

  // Ticks
  async subscribeTicks(
    symbol: string,
    callback: (tick: DerivTick) => void
  ): Promise<void> {
    this.tickHandlers.set(symbol, (data) => {
      if (data.tick) {
        callback(data.tick);
      }
    });

    await this.sendRequest({
      ticks: symbol,
      subscribe: 1,
    });
  }

  async unsubscribeTicks(symbol: string): Promise<void> {
    this.tickHandlers.delete(symbol);
    await this.sendRequest({ forget: `ticks-${symbol}` });
  }

  async getTicksHistory(
    symbol: string,
    count: number = 100
  ): Promise<{ prices: number[]; times: number[] }> {
    const response = await this.sendRequest({
      ticks_history: symbol,
      end: 'latest',
      count,
      style: 'ticks',
    });
    return response.history || { prices: [], times: [] };
  }

  async getCandles(
    symbol: string,
    count: number = 100,
    granularity: number = 60
  ): Promise<DerivCandle[]> {
    const response = await this.sendRequest({
      ticks_history: symbol,
      end: 'latest',
      count,
      style: 'candles',
      granularity,
    });
    return response.candles || [];
  }

  // Trading
  async getProposal(params: {
    contractType: string;
    symbol: string;
    amount: number;
    duration?: number;
    durationUnit?: string;
    currency?: string;
    subscribe?: boolean;
  }): Promise<ProposalResponse> {
    const response = await this.sendRequest({
      proposal: 1,
      contract_type: params.contractType,
      underlying_symbol: params.symbol,
      amount: params.amount,
      basis: 'stake',
      currency: params.currency || 'USD',
      duration: params.duration,
      duration_unit: params.durationUnit as 's' | 'm' | 'h' | 'd' | 't',
      subscribe: params.subscribe ? 1 : 0,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.proposal!;
  }

  async buy(proposalId: string, price: number): Promise<BuyResponse> {
    const response = await this.sendRequest({
      buy: proposalId,
      price,
      subscribe: 1,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.buy!;
  }

  async sell(contractId: number, price: number = 0): Promise<SellResponse> {
    const response = await this.sendRequest({
      sell: contractId,
      price,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.sell!;
  }

  async getOpenContract(
    contractId: number,
    callback?: (contract: OpenContract) => void
  ): Promise<OpenContract> {
    if (callback) {
      this.handlers.set(contractId, (data) => {
        if (data.proposal_open_contract) {
          callback(data.proposal_open_contract);
        }
      });
    }

    const response = await this.sendRequest({
      proposal_open_contract: 1,
      contract_id: contractId,
      subscribe: callback ? 1 : 0,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.proposal_open_contract!;
  }

  // Account
  async getBalance(): Promise<DerivBalance> {
    const response = await this.sendRequest({ balance: 1, subscribe: 1 });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.balance!;
  }

  async getPortfolio(): Promise<Portfolio> {
    const response = await this.sendRequest({ portfolio: 1 });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.portfolio!;
  }

  // Subscriptions
  async forget(subscriptionId: string): Promise<void> {
    await this.sendRequest({ forget: subscriptionId });
  }

  async forgetAll(types: string[]): Promise<void> {
    await this.sendRequest({ forget_all: types });
  }
}

// Singleton instance
let clientInstance: DerivClient | null = null;

export function getDerivClient(): DerivClient {
  if (!clientInstance) {
    clientInstance = new DerivClient();
  }
  return clientInstance;
}
