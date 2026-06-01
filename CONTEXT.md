# Contexto do Projeto - Deriv Trading Platform

## 🎯 Objetivo
Criar uma plataforma de negociação profissional para a corretora Deriv, permitindo que usuários conectem suas contas e realizem operações de trading em tempo real.

## 🛠️ Stack Tecnológica
- **Framework**: Next.js 14+ (App Router)
- **Estilo**: Tailwind CSS
- **Linguagem**: TypeScript
- **Estado**: Zustand
- **WebSocket**: Socket.io (ou nativo)
- **Gráficos**: Lightweight Charts (TradingView)
- **Ícones**: Lucide React
- **Tema**: next-themes

## 📋 Regras Fundamentais
1. **SEMPRE** ler este CONTEXT.md antes de começar a trabalhar
2. **NUNCA** hardcoded secrets - usar .env.local
3. **SEMPRE** validar autenticação antes de acessar rotas protegidas
4. **TRATAR** TODOS os erros da API Deriv
5. **IMPLEMENTAR** reconexão automática do WebSocket
6. **USAR** componentes reutilizáveis
7. **SEGUIR** o design system existente

## 🔐 Fluxo de Autenticação
1. Usuário clica "Conectar com Deriv" na página de login
2. Frontend chama `/api/auth/login` para gerar URL OAuth2
3. API gera code_verifier, code_challenge e state
4. Dados são salvos no sessionStorage
5. Usuário é redirecionado para auth.deriv.com
6. Usuário faz login na Deriv
7. Deriv redireciona com ?code=XXX&state=YYY
8. Frontend chama `/api/deriv/auth` para trocar code por token
9. Backend troca code por access_token
10. Token é armazenado em cookie httpOnly
11. Store de autenticação é atualizado
12. Usuário é redirecionado para /dashboard

### Alternativa: API Token (Desenvolvimento Local)
1. Usuário configura `DERIV_API_TOKEN` no `.env.local`
2. Plataforma usa token para acessar REST API
3. WebSocket conecta via OTP (One-Time Password)
4. Não requer OAuth2 para desenvolvimento local

## 🌐 Endpoints Deriv
- **Auth**: https://auth.deriv.com/oauth2/auth
- **Token**: https://auth.deriv.com/oauth2/token
- **WebSocket Public**: wss://api.derivws.com/trading/v1/options/ws/public
- **WebSocket Demo**: wss://api.derivws.com/trading/v1/options/ws/demo
- **WebSocket Real**: wss://api.derivws.com/trading/v1/options/ws/real
- **REST API**: https://api.derivws.com/trading/v1/options

## 📊 Contratos Disponíveis
| Tipo | Categoria | Descrição |
|------|-----------|-----------|
| CALL | Rise/Fall | Ganha se preço subir |
| PUT | Rise/Fall | Ganha se preço cair |
| HIGHER | Rise/Fall | Ganha se preço > barreira |
| LOWER | Rise/Fall | Ganha se preço < barreira |
| DIGITEVEN | Digits | Ganha se último dígito par |
| DIGITODD | Digits | Ganha se último dígio ímpar |
| ONETOUCH | Touch | Ganha se tocar barreira |
| NOTOUCH | Touch | Ganha se NÃO tocar barreira |
| MULTUP | Multipliers | Multiplicador para cima |
| MULTDOWN | Multipliers | Multiplicador para baixo |
| ACCU | Accumulators | Contrato acumulador |

## 📈 Status do Projeto
- [x] Fase 1: Setup inicial
- [x] Fase 2: Agentes e skills
- [x] Fase 3: Layout base
- [x] Fase 4: Rotas
- [x] Fase 5: Lógica de negócio
- [x] Fase 6: Componentes de trading
- [x] Fase 7: Integração API Deriv (cliente WebSocket pronto)
- [x] Fase 8: Revisão e correções
- [x] Fase 9: Autenticação OAuth2 com Deriv
- [x] Fase 10: Teste WebSocket (diagnóstico)
- [x] Fase 11: Dados reais em tempo real (ticks)
- [x] Fase 12: Saldo real da conta (REST API)
- [x] Fase 13: Gráficos candlestick reais

## 🎨 Decisões de Design
- **Tema**: Claro + Escuro (alternância)
- **Sidebar**: Fixa à esquerda
- **Cores**: Multi-cores (azul, roxo, cyan)
- **Dashboard**: Cards de informações
- **Trading**: Gráfico centralizado + painel de ordens
- **Responsivo**: Mobile-first

## ⚠️ Notas Importantes
- API Deriv usa WebSocket para dados em tempo real
- REST API para operações de conta
- Rate limits: 100 req/s (WS), 60 req/min (REST)
- Máximo 100 assinaturas por conexão WebSocket
- Máximo 5 conexões WebSocket simultâneas

## 🔄 Sempre Atualizar
Após cada fase concluída, atualizar este arquivo marcando a fase como concluída.
