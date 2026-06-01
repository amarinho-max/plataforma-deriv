const API_BASE = 'https://api.derivws.com';

interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    endpoint: string;
    method: string;
    timing: number;
  };
}

interface Account {
  account_id: string;
  balance: number;
  currency: string;
  group: string;
  status: string;
  account_type: string;
  created_at: string;
  email: string;
  last_access_at: string;
  name: string;
  server_id: string;
}

interface OtpResponse {
  url: string;
}

class DerivApiRest {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request error:', error);
      return {
        error: {
          code: 'NetworkError',
          message: 'Failed to connect to Deriv API',
        },
      };
    }
  }

  // Obter todas as contas
  async getAccounts(): Promise<Account[]> {
    const response = await this.request<Account[]>('/trading/v1/options/accounts');
    return response.data || [];
  }

  // Obter OTP para WebSocket
  async getOtp(accountId: string): Promise<string | null> {
    const response = await this.request<OtpResponse>(
      `/trading/v1/options/accounts/${accountId}/otp`,
      { method: 'POST' }
    );
    
    if (response.data?.url) {
      return response.data.url;
    }
    return null;
  }

  // Criar conta demo
  async createDemoAccount(currency: string = 'USD'): Promise<Account | null> {
    const response = await this.request<Account>(
      '/trading/v1/options/accounts',
      {
        method: 'POST',
        body: JSON.stringify({
          currency,
          group: 'row',
          account_type: 'demo',
        }),
      }
    );
    return response.data || null;
  }

  // Reset saldo demo
  async resetDemoBalance(accountId: string): Promise<boolean> {
    const response = await this.request<Account>(
      `/trading/v1/options/accounts/${accountId}/reset-demo-balance`,
      { method: 'POST' }
    );
    return !!response.data;
  }
}

// Instância singleton
let apiInstance: DerivApiRest | null = null;

export function getDerivApi(token?: string): DerivApiRest {
  if (!apiInstance && token) {
    apiInstance = new DerivApiRest(token);
  }
  return apiInstance!;
}

export type { Account, OtpResponse };
export { DerivApiRest };
