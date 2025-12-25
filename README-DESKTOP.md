# FoodDidDo - Aplicação Desktop

Aplicação desktop para gerenciamento de receitas, ingredientes, custos e estoque, funcionando completamente offline.

## 🏗️ Arquitetura

- **Frontend**: React + Vite
- **Backend**: Node.js + Fastify
- **Banco de Dados**: SQLite + Prisma
- **Desktop**: Tauri

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ 
- Rust (para compilar o Tauri)
- SQLite (já incluído no Prisma)

### Instalar dependências

```bash
npm install
```

### Configurar banco de dados

```bash
# Gerar Prisma Client
npm run db:generate

# Criar migrações (já executado na primeira vez)
npm run db:migrate
```

## 🚀 Executar em Desenvolvimento

### Opção 1: Tudo junto (Recomendado)

**Web (Frontend + Backend):**
```bash
npm run dev:all
```
Inicia backend (porta 3001) e frontend (porta 5173) simultaneamente.

**Desktop (Frontend + Backend + Tauri):**
```bash
npm run dev:desktop
```
Inicia backend, frontend e abre a janela desktop.

### Opção 2: Separado (mais controle)

**Frontend apenas:**
```bash
npm run frontend:dev
```

**Backend apenas:**
```bash
npm run backend:dev
```

**Desktop apenas (requer backend rodando):**
```bash
npm run desktop:dev
```

### Opção 3: Comandos Legados (compatibilidade)

```bash
# Frontend
npm run dev
npm start

# Backend
npm run server

# Desktop
npm run tauri:dev
```

## 🏗️ Build para Produção

### Build Desktop

```bash
npm run tauri:build
```

O executável será gerado em `src-tauri/target/release/`

### Build Web

```bash
npm run build
```

## 📁 Estrutura do Projeto

```
FoodDidDo/
├── src/              # Frontend React
│   ├── components/   # Componentes React
│   ├── pages/        # Páginas da aplicação
│   ├── stores/       # Zustand store
│   └── lib/          # Utilitários e API client
├── server/           # Backend Fastify
│   └── index.js     # Servidor API
├── prisma/           # Prisma ORM
│   ├── schema.prisma # Schema do banco
│   └── migrations/   # Migrações do banco
└── src-tauri/        # Configuração Tauri
    └── tauri.conf.json
```

## 🔌 API Endpoints

O servidor roda em `http://127.0.0.1:3001` por padrão.

### Principais endpoints:

- `GET /api/ingredients` - Listar ingredientes
- `POST /api/ingredients` - Criar ingrediente
- `GET /api/recipes` - Listar receitas
- `POST /api/recipes` - Criar receita
- `GET /api/budgets` - Listar orçamentos
- `GET /api/fixed-costs` - Listar custos fixos
- `GET /api/cashflow` - Listar fluxo de caixa
- `GET /api/warehouses` - Listar armazéns
- `GET /api/export` - Exportar todos os dados
- `POST /api/restore` - Restaurar dados de backup

## 💾 Banco de Dados

O banco SQLite está localizado em `prisma/dev.db`.

### Gerenciar banco:

```bash
# Abrir Prisma Studio (interface visual)
npm run db:studio

# Criar nova migração
npm run db:migrate

# Resetar banco (cuidado: apaga todos os dados)
npx prisma migrate reset
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL="file:./prisma/dev.db"
VITE_API_URL=http://127.0.0.1:3001
```

## 📝 Scripts Disponíveis

### 🎨 Frontend
- `npm run frontend:dev` - Inicia frontend em modo desenvolvimento
- `npm run frontend:build` - Build do frontend para produção
- `npm run frontend:preview` - Preview do build de produção
- `npm run frontend:lint` - Verifica código com ESLint

### ⚙️ Backend
- `npm run backend:dev` - Inicia servidor backend (porta 3001)
- `npm run backend:start` - Alias para backend:dev

### 💾 Banco de Dados
- `npm run db:generate` - Gera Prisma Client
- `npm run db:migrate` - Executa migrações do banco
- `npm run db:studio` - Abre Prisma Studio (interface visual)
- `npm run db:reset` - Reseta banco (⚠️ apaga todos os dados)

### 🖥️ Desktop (Tauri)
- `npm run desktop:dev` - Inicia aplicação desktop em desenvolvimento
- `npm run desktop:build` - Build da aplicação desktop

### 🚀 Desenvolvimento (Conveniência)
- `npm run dev:all` - Inicia backend + frontend juntos
- `npm run dev:desktop` - Inicia backend + frontend + desktop juntos
- `npm run dev` - Inicia apenas frontend (legado)
- `npm start` - Alias para frontend:dev (legado)

### 📦 Build
- `npm run build` - Build do frontend (legado)
- `npm run build:all` - Build frontend + desktop

## 🎯 Funcionalidades

- ✅ Gerenciamento de ingredientes
- ✅ Gerenciamento de receitas
- ✅ Cálculo de custos
- ✅ Controle de estoque
- ✅ Fluxo de caixa
- ✅ Orçamentos
- ✅ Custos fixos
- ✅ Backup e restauração de dados
- ✅ Funciona completamente offline

## 🐛 Troubleshooting

### Erro ao iniciar servidor

Certifique-se de que:
1. O Prisma Client foi gerado: `npm run db:generate`
2. As migrações foram executadas: `npm run db:migrate`
3. O banco de dados existe em `prisma/dev.db`

### Erro ao compilar Tauri

Certifique-se de que o Rust está instalado:
```bash
# Windows (PowerShell)
winget install Rustlang.Rustup

# Ou baixe de: https://www.rust-lang.org/tools/install
```

### Porta já em uso

Se a porta 3001 estiver em uso, altere no arquivo `server/index.js`:
```javascript
const port = process.env.PORT || 3001
```

E atualize `VITE_API_URL` no `.env`.

## 📄 Licença

Este projeto é privado.

