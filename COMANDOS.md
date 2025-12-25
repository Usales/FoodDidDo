# 🚀 Guia Rápido de Comandos

## 📋 Índice Rápido

- [Frontend](#-frontend)
- [Backend](#-backend)
- [Banco de Dados](#-banco-de-dados)
- [Desktop](#-desktop)
- [Comandos Combinados](#-comandos-combinados)

---

## 🎨 Frontend

### Desenvolvimento
```bash
npm run frontend:dev
```
Inicia o servidor Vite na porta 5173

### Build
```bash
npm run frontend:build
```
Gera build de produção na pasta `dist/`

### Preview
```bash
npm run frontend:preview
```
Visualiza o build de produção

### Lint
```bash
npm run frontend:lint
```
Verifica código com ESLint

---

## ⚙️ Backend

### Desenvolvimento
```bash
npm run backend:dev
```
ou
```bash
npm run backend:start
```

Inicia servidor Fastify na porta 3001

---

## 💾 Banco de Dados

### Gerar Prisma Client
```bash
npm run db:generate
```
Gera o cliente Prisma após mudanças no schema

### Criar/Executar Migrações
```bash
npm run db:migrate
```
Cria e aplica migrações do banco

### Prisma Studio (Interface Visual)
```bash
npm run db:studio
```
Abre interface web para visualizar/editar dados

### Resetar Banco ⚠️
```bash
npm run db:reset
```
**CUIDADO:** Apaga todos os dados e recria o banco

---

## 🖥️ Desktop

### Desenvolvimento
```bash
npm run desktop:dev
```
Inicia aplicação desktop (requer backend rodando)

### Build
```bash
npm run desktop:build
```
Gera executável em `src-tauri/target/release/`

---

## 🚀 Comandos Combinados

### Desenvolvimento Web (Frontend + Backend)
```bash
npm run dev:all
```
Inicia backend e frontend simultaneamente

### Desenvolvimento Desktop (Frontend + Backend + Tauri)
```bash
npm run dev:desktop
```
Inicia tudo junto e abre janela desktop

### Build Completo
```bash
npm run build:all
```
Build frontend + desktop

---

## 📝 Comandos Legados (Compatibilidade)

Estes comandos ainda funcionam, mas use os novos quando possível:

```bash
npm run dev          # → frontend:dev
npm start            # → frontend:dev
npm run server       # → backend:dev
npm run build        # → frontend:build
npm run tauri:dev    # → desktop:dev
npm run tauri:build  # → desktop:build
```

---

## 🎯 Fluxo de Trabalho Recomendado

### Primeira vez
```bash
# 1. Instalar dependências
npm install

# 2. Gerar Prisma Client
npm run db:generate

# 3. Criar banco de dados
npm run db:migrate
```

### Desenvolvimento Diário

**Opção 1: Web**
```bash
npm run dev:all
```

**Opção 2: Desktop**
```bash
npm run dev:desktop
```

**Opção 3: Separado (mais controle)**
```bash
# Terminal 1
npm run backend:dev

# Terminal 2
npm run frontend:dev

# Terminal 3 (se desktop)
npm run desktop:dev
```

---

## 🔍 Verificar Status

- **Frontend:** http://localhost:5173
- **Backend:** http://127.0.0.1:3001
- **Prisma Studio:** http://localhost:5555 (quando rodando)

---

## ⚠️ Troubleshooting

### Porta já em uso
```bash
# Verificar processos
netstat -ano | findstr :3001  # Windows
lsof -i :3001                 # Linux/Mac

# Matar processo (Windows)
taskkill /PID <PID> /F
```

### Banco não encontrado
```bash
npm run db:migrate
```

### Prisma Client desatualizado
```bash
npm run db:generate
```

