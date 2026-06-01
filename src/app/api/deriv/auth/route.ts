import { NextRequest, NextResponse } from 'next/server';

const DERIV_TOKEN_URL = 'https://auth.deriv.com/oauth2/token';
const CLIENT_ID = process.env.DERIV_CLIENT_ID || '';
const REDIRECT_URI = process.env.DERIV_REDIRECT_URI || 'http://localhost:3001/callback';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, state, codeVerifier } = body;

    if (!code || !state || !codeVerifier) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Exchange code for token
    const tokenResponse = await fetch(DERIV_TOKEN_URL, {
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

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      console.error('Token exchange error:', tokenData);
      return NextResponse.json(
        { success: false, error: tokenData.error_description || tokenData.error || 'Token exchange failed' },
        { status: tokenResponse.status || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      token: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
    });
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
