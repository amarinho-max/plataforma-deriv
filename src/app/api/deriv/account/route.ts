import { NextResponse } from 'next/server';

const API_BASE = 'https://api.derivws.com';

export async function GET() {
  const token = process.env.DERIV_API_TOKEN;

  if (!token || token === 'your_api_token_here') {
    return NextResponse.json(
      { error: 'Token não configurado' },
      { status: 401 }
    );
  }

  try {
    // Try multiple approaches to get account info
    // Approach 1: POST with Bearer token
    let response = await fetch(`${API_BASE}/trading/v1/options/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    let text = await response.text();

    // If response starts with "Deriv-App-", it's an error page
    if (text.startsWith('Deriv-App-') || !text.startsWith('{')) {
      // Approach 2: Try GET with token in header
      response = await fetch(`${API_BASE}/trading/v1/options/accounts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      text = await response.text();
    }

    if (text.startsWith('Deriv-App-') || !text.startsWith('{')) {
      // Approach 3: Try POST without auth header, token in body
      response = await fetch(`${API_BASE}/trading/v1/options/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
        }),
      });
      text = await response.text();
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('API response not JSON:', text.substring(0, 300));
      return NextResponse.json(
        { error: 'Resposta inválida da API Deriv', raw: text.substring(0, 200) },
        { status: 502 }
      );
    }

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message || JSON.stringify(data.error) },
        { status: 400 }
      );
    }

    // Extract account info
    const accounts = data.accounts || data.data || (Array.isArray(data) ? data : [data]);
    const account = accounts?.[0] || {};

    return NextResponse.json({
      account_id: account.loginid || account.account_id || '---',
      balance: account.balance || 0,
      currency: account.currency || 'USD',
      account_type: account.account_type || 'demo',
      email: account.email || '---',
      name: account.name || '---',
      status: account.status || 'active',
    });
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: 'Erro ao conectar com a API Deriv' },
      { status: 500 }
    );
  }
}
