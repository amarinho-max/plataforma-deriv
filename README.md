# Deriv Trading Platform

Plataforma de negociação profissional para a corretora Deriv.

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn
- Conta na Deriv (demo ou real)
- Token de API Deriv

### Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd Plataforma_Deriv
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Edite `.env.local` com suas credenciais:
```env
DERIV_API_TOKEN=seu_token_aqui
DERIV_ACCOUNT_EMAIL=seu_email_aqui
DERIV_CLIENT_ID=seu_client_id_aqui
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

6. Acesse: http://localhost:3000

## 📁 Estrutura do Projeto

```
src/
├── app/              # App Router (rotas)
├── components/       # Componentes React
├── lib/              # Utilitários e configs
├── stores/           # Estado global (Zustand)
└── types/            # TypeScript types
```

## 🎨 Funcionalidades

- ✅ Tema claro/escuro
- ✅ Dashboard com saldo e estatísticas
- ✅ Trading com gráfico em tempo real
- ✅ Conexão com API Deriv
- ✅ Autenticação OAuth2
- ✅ Responsivo (mobile/desktop)

## 📚 Documentação

- [CONTEXT.md](./CONTEXT.md) - Contexto do projeto
- [API Deriv](https://developers.deriv.com/docs/)
- [Next.js Docs](https://nextjs.org/docs)

## 🔐 Segurança

- Nunca commite `.env.local`
- Tokens armazenados em cookies httpOnly
- Validação de inputs
- Rate limiting implementado

## 📝 Licença

MIT
