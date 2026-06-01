---
name: deriv-api
description: Use quando precisar trabalhar com a API da Deriv, incluindo WebSocket, REST, autenticação OAuth2, tipos de contrato ou operações de trading.
---

# Deriv API Skill

## Visão Geral
Esta skill fornece instruções detalhadas para trabalhar com a API da Deriv.

## Autenticação

### OAuth2 + PKCE Flow
1. Gerar `code_verifier` (43-128 caracteres aleatórios)
2. Gerar `code_challenge` = BASE64URL(SHA256(code_verifier))
3. Gerar `state` aleatório para CSRF
4. Redirecionar para: `https://auth.deriv.com/oauth2/auth`
5. Receber callback com `code` e `state`
6. Trocar code por token em: `https://auth.deriv.com/oauth2/token`

### Parâmetros de Login
```
response_type=code
client_id=YOUR_CLIENT_ID
redirect_uri=YOUR_REDIRECT_URI
scope=trade
state=RANDOM_STATE
code_challenge=PKCE_CHALLENGE
code_challenge_method=S256
```

## WebSocket Endpoints

### Conexão Pública (sem auth)
```
wss://api.derivws.com/trading/v1/options/ws/public
```

### Conexão Autenticada (com OTP)
1. POST para `/trading/v1/options/accounts/{accountId}/otp`
2. Usar URL retornada: `wss://...?otp=xxx`

## Comandos WebSocket Comuns

### Obter Tempo do Servidor
```json
{ "time": 1 }
```

### Listar Símbolos Ativos
```json
{ "active_symbols": "brief" }
```

### Obter Proposta
```json
{
  "proposal": 1,
  "amount": 100,
  "basis": "stake",
  "contract_type": "CALL",
  "currency": "USD",
  "duration": 5,
  "duration_unit": "t",
  "underlying_symbol": "1HZ100V",
  "subscribe": 1
}
```

### Comprar Contrato
```json
{
  "buy": "proposal_id",
  "price": 10.50
}
```

### Vender Contrato
```json
{
  "sell": 12345678,
  "price": 15.00
}
```

### Acompanhar Contrato Aberto
```json
{
  "proposal_open_contract": 1,
  "contract_id": 12345678,
  "subscribe": 1
}
```

## REST Endpoints

### Listar Contas
```
GET /trading/v1/options/accounts
Headers: Authorization: Bearer TOKEN
```

### Criar Conta
```
POST /trading/v1/options/accounts
Body: { "currency": "USD", "group": "row", "account_type": "demo" }
```

### Gerar OTP
```
POST /trading/v1/options/accounts/{accountId}/otp
```

## Rate Limits
- WebSocket: 100 req/s por conexão
- REST: 60 req/min por token
- Máximo 100 assinaturas por conexão
- Máximo 5 conexões simultâneas

## Tratamento de Erros
```json
{
  "error": {
    "code": "AuthorizationRequired",
    "message": "Please log in."
  }
}
```

Erros comuns:
- `AuthorizationRequired` → Reconectar
- `InvalidToken` → Refazer auth
- `RateLimit` → Aguardar e retry
- `InsufficientBalance` → Alertar usuário
