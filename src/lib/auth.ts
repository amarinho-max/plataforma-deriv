import { generateCodeVerifier, generateCodeChallenge, generateState } from './utils';

const DERIV_AUTH_URL = process.env.NEXT_PUBLIC_DERIV_AUTH_URL || 'https://auth.deriv.com/oauth2/auth';
const DERIV_TOKEN_URL = process.env.NEXT_PUBLIC_DERIV_TOKEN_URL || 'https://auth.deriv.com/oauth2/token';
const CLIENT_ID = process.env.DERIV_CLIENT_ID || '';
const REDIRECT_URI = process.env.DERIV_REDIRECT_URI || 'https://plataforma-deriv.vercel.app/callback';

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

export async function initiateLogin(): Promise<void> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  sessionStorage.setItem('pkce_code_verifier', codeVerifier);
  sessionStorage.setItem('oauth_state', state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'trade account_manage',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  window.location.href = `${DERIV_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string
): Promise<AuthTokens> {
  const response = await fetch(DERIV_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code,
      code_verifier: codeVerifier,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  };
}

export function storeToken(token: AuthTokens): void {
  document.cookie = `deriv_token=${token.accessToken}; path=/; max-age=${token.expiresIn}; SameSite=Lax; Secure`;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith('deriv_token=')
  );

  return tokenCookie ? tokenCookie.split('=')[1] : null;
}

export function removeToken(): void {
  document.cookie = 'deriv_token=; path=/; max-age=0';
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}
