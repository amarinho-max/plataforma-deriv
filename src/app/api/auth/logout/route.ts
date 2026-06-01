import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Limpar cookie do token
  response.cookies.set('deriv_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  // Limpar cookie do state
  response.cookies.set('oauth_state', '', {
    maxAge: 0,
    path: '/',
  });

  return response;
}
