import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const DERIV_AUTH_URL = 'https://auth.deriv.com/oauth2/auth';
const CLIENT_ID = process.env.DERIV_CLIENT_ID || '';
const REDIRECT_URI = process.env.DERIV_REDIRECT_URI || 'https://plataforma-deriv.vercel.app/callback';

function generateCodeVerifier(length: number = 64): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((v) => chars[v % chars.length])
    .join('');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function GET() {
  try {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();

    const params = new URLSearchParams({
      app_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    const url = `${DERIV_AUTH_URL}?${params.toString()}`;

    // Store code_verifier and state in cookies for later verification
    const cookieStore = await cookies();
    cookieStore.set('oauth_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 300, // 5 minutes
      path: '/',
    });
    cookieStore.set('oauth_state', state, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 300,
      path: '/',
    });

    return NextResponse.json({ url, codeVerifier, state });
  } catch (error) {
    console.error('Error generating login URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate login URL' },
      { status: 500 }
    );
  }
}
