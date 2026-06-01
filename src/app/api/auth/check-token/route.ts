import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.DERIV_API_TOKEN;

  if (token && token !== 'your_api_token_here') {
    return NextResponse.json({
      configured: true,
      tokenPreview: `${token.substring(0, 10)}...`,
    });
  }

  return NextResponse.json({
    configured: false,
    message: 'API token não configurado',
  });
}
