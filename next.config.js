/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.derivws.com'],
  },
  env: {
    NEXT_PUBLIC_DERIV_WS_URL: 'wss://api.derivws.com/trading/v1/options/ws',
    NEXT_PUBLIC_DERIV_API_URL: 'https://api.derivws.com',
    NEXT_PUBLIC_DERIV_AUTH_URL: 'https://auth.deriv.com/oauth2/auth',
    NEXT_PUBLIC_DERIV_TOKEN_URL: 'https://auth.deriv.com/oauth2/token',
  },
};

module.exports = nextConfig;
