# 🍽️ FoodDidDo - Aplicativo de Receitas, Gestão e PDV

## 📋 Sobre o Projeto

O **FoodDidDo** é uma aplicação moderna desenvolvida em React voltada para **gestão de alimentação e operação**, combinando organização de refeições/receitas com recursos de gestão (custos, precificação, estoque, orçamento/financeiro) e uma base para **PDV (caixa)**.

Atualmente o projeto está sendo conduzido por uma **empresa unipessoal**, com **apenas 1 funcionário** responsável pelo desenvolvimento e manutenção.

## 🎯 Funcionalidades Principais

### 🔐 Sistema de Autenticação
- **Login e Registro**: Sistema completo de autenticação com validação
- **Tela de Boas-vindas**: Interface elegante com animações de emojis flutuantes
- **Sessão Persistente**: Login mantido entre sessões do navegador
- **Logout Seguro**: Deslogar e retornar à tela inicial

### 🍽️ Gerenciamento de Refeições
- **Criar Refeições**: Adicionar refeições com título, calorias, ingredientes e tempo
- **Editar Refeições**: Modificar refeições existentes facilmente
- **Deletar Refeições**: Remover refeições com confirmação
- **Status de Refeições**: Marcar como "fazer", "fazendo" ou "feito"
- **Armazenamento**: Projeto evoluiu para suportar **backend local + banco SQLite (Prisma)**, além de configurações locais (ex.: moeda/idioma).

### 🥘 Busca Inteligente de Receitas
- **Busca Precisa**: Sistema inteligente que evita falsos positivos (ex: milho não encontra tomilho)
- **Integração Multi-API**: Consome dados do Spoonacular para receitas internacionais
- **Receitas Locais**: Base de dados própria com receitas brasileiras específicas
- **Busca por Relevância**: Ordenação automática por relevância dos ingredientes

### 🧾 Gerenciamento de Ingredientes
- **Seleção Visual**: Interface intuitiva com mais de 100 ingredientes disponíveis
- **Feedback Visual**: Indicação clara dos ingredientes selecionados
- **Categorização**: Ingredientes organizados por categorias (carnes, vegetais, laticínios, etc.)

### 📦 Estoque e Armazéns
- **Estoque**: Cadastro e edição de itens de estoque (quantidade, custo unitário, mínimo ideal, categoria e observações)
- **Armazéns**: Organização de itens por armazém

### 💰 Custos, Precificação e Orçamento
- **Custos de receitas**: Cálculo automático (custo total, custo de uso, custo unitário, sugestão de preço)
- **Custos fixos**: Rateio (mensal / por hora / por lote)
- **Orçamento**: Gastos do mês consolidados (receitas + custos fixos mensais + custo de compra do estoque real)

### 💵 Sistema de Caixa (PDV)
- **Abertura/Fechamento de Caixa**: Controle completo de sessões de caixa com saldo inicial e final
- **Suprimento**: Adicionar dinheiro ao caixa (ex: troco inicial, reposição)
- **Sangria**: Retirar dinheiro do caixa (ex: troco para cliente, saque)
- **Conferência**: Cálculo automático de saldo esperado vs. saldo real, com registro de diferenças
- **Histórico de Movimentações**: Registro completo de todas as operações de suprimento e sangria
- **Integração com Fluxo de Caixa**: Saldo calculado automaticamente considerando vendas, entradas e saídas

### 🧾 Backup e Restauração
- **Exportação**: Backup JSON com todos os dados
- **Restauração**: Importa backup e recria as entidades no banco

### 📊 Sistema de Relatórios
- **8 Tipos de Relatórios Disponíveis**:
  - **Custos e Lucros por Receita**: Consolidação de fichas técnicas com custos, preços sugeridos e lucratividade
  - **Desempenho Mensal**: Resumo consolidado de receitas, gastos, lucro e orçamentos por mês
  - **Análise de Sensibilidade**: Comparativo de cenários de variação de preços e impacto nas margens
  - **Produção vs Orçamento**: Comparação entre planejamento orçamentário e execução real
  - **Relatório de Vendas**: Análise detalhada de vendas, pedidos, receita, lucro e ticket médio
  - **Estoque e Movimentações**: Situação atual do estoque, movimentações e alertas de estoque baixo
  - **Fluxo de Caixa Detalhado**: Todas as movimentações financeiras com entradas, saídas, custos e lucros
  - **Ingredientes e Custos**: Inventário completo de ingredientes, custos unitários e valor total em estoque
- **Exportação em PDF e Excel (CSV)**: Todos os relatórios podem ser exportados em ambos os formatos
- **Filtros por Categoria**: Organização por categorias (Financeiro, Análise, Operacional, Vendas, Estoque)
- **Interface Moderna**: Cards visuais com ícones, categorias e descrições detalhadas

### 📖 Visualização Detalhada de Receitas
- **Modal Completo**: Visualização detalhada com todos os ingredientes e instruções
- **Passo a Passo**: Instruções de preparo organizadas e numeradas
- **Informações Nutricionais**: Categoria, origem e tempo de preparo
- **Imagens**: Visualização das receitas com imagens de alta qualidade

### 🌍 Seção de Receitas
- **Catálogo Completo**: Mais de 100 receitas de diferentes APIs
- **Paginação**: Navegação fácil através de todas as receitas disponíveis
- **Filtros Inteligentes**: Receitas filtradas por qualidade de instruções

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19** - Biblioteca principal para interface
- **Vite** - Build tool e servidor de desenvolvimento
- **CSS3** - Estilização com variáveis CSS e gradientes
- **JavaScript ES6+** - Lógica da aplicação
- **Zustand** - Gerenciamento de estado global
- **React Router** - Rotas e navegação

### Backend e Banco (modo local/offline)
- **Node.js + Fastify** - API local
- **SQLite + Prisma** - Banco local

### Desktop
- **Tauri** - Aplicação desktop (offline)

### APIs Integradas
- **Spoonacular** - API principal com receitas internacionais
- **Receitas Locais** - Base de dados própria com receitas brasileiras
- **MyMemory** - API de tradução para localização

### Funcionalidades Avançadas
- **Cache Local** - Armazenamento de traduções para performance
- **Filtros Inteligentes** - Validação de qualidade das receitas
- **Responsive Design** - Interface adaptável a diferentes telas
- **Animações CSS** - Transições suaves e feedback visual
- **Sistema de Fallback** - Funcionamento offline com localStorage

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone [URL_DO_REPOSITORIO]

# Navegue até o diretório
cd FoodDidDo

# Instale as dependências
npm install

# (Opcional) Gerar Prisma Client e aplicar migrações (necessário para backend/banco)
npm run db:generate
npm run db:migrate

# Rodar frontend + backend (recomendado)
npm run dev:all
```

### Acesso
Abra seu navegador e acesse: `http://localhost:5173`

Backend local: `http://127.0.0.1:3001`

### Desktop (Tauri)
Consulte `README-DESKTOP.md`.

## 📱 Como Usar

### 1. Autenticação
- **Primeiro Acesso**: Clique em "Cadastrar" para criar uma conta
- **Login**: Use suas credenciais para acessar o sistema
- **Logout**: Clique no botão "🚪 Sair" na sidebar

### 2. Gerenciar Refeições
- **Criar**: Clique em "+ Nova Refeição" e preencha os dados
- **Editar**: Clique no ícone de lápis na refeição desejada
- **Deletar**: Clique no ícone de lixeira na refeição desejada
- **Status**: Use o dropdown para marcar o status da refeição

### 3. Buscar Receitas
- Na seção "Minha Geladeira", clique nos ingredientes disponíveis
- Clique em "Buscar Receitas" para encontrar opções
- O sistema busca automaticamente receitas relevantes aos ingredientes selecionados

### 4. Explorar Receitas
- Acesse a seção "Receitas" na sidebar
- Navegue pelas páginas para ver todas as opções
- Clique em "Ver Receita Completa" para detalhes

## 🎨 Design e Interface

### Paleta de Cores
- **Vermelho Principal**: `#dc2626` (Red-600) - Tema principal
- **Verde Secundário**: `#2dd4bf` (Teal-400) - Botões e destaques
- **Cinza Escuro**: `#374151` (Gray-700) - Textos
- **Branco**: `#ffffff` - Fundos

### Componentes Principais
- **AuthScreen**: Tela de boas-vindas com animações
- **Login/Register**: Modais de autenticação elegantes
- **Sidebar**: Menu lateral com navegação
- **Cards de Refeições**: Exibição das refeições do usuário
- **Cards de Receitas**: Exibição visual das receitas
- **Modal de Detalhes**: Visualização completa das receitas

## 🔧 Estrutura do Projeto

```
FoodDidDo/
├── public/
│   ├── images_/          # Imagens e logos
│   └── vite.svg
├── server/               # Backend Fastify (API local)
├── prisma/               # Prisma + SQLite + migrações
├── src-tauri/            # App desktop (Tauri)
├── src/
│   ├── components/
│   │   ├── AuthProvider.jsx    # Context de autenticação
│   │   ├── AuthScreen.jsx      # Tela de boas-vindas
│   │   ├── Login.jsx           # Modal de login
│   │   ├── Register.jsx        # Modal de registro
│   │   ├── Auth.css            # Estilos de autenticação
│   │   └── AuthScreen.css      # Estilos da tela de boas-vindas
│   ├── lib/
│   │   └── supabase.js         # Configuração do Supabase
│   │   └── api.js              # Client para API local (quando usado)
│   ├── App.jsx                 # Componente principal
│   ├── App.css                 # Estilos globais
│   ├── main.jsx                # Ponto de entrada
│   └── index.css               # Reset CSS
├── package.json                # Dependências e scripts
├── vite.config.js              # Configuração do Vite
└── README.md                   # Este arquivo
```

## 🔌 API local (Fastify)

Quando rodando com backend, a API fica em `http://127.0.0.1:3001`.

### Endpoints principais
- `GET /api/ingredients`
- `POST /api/ingredients`
- `GET /api/recipes`
- `POST /api/recipes`
- `GET /api/budgets`
- `GET /api/fixed-costs`
- `GET /api/cashflow`
- `GET /api/warehouses`
- `GET /api/export` (backup)
- `POST /api/restore` (restauração)

## 🧾 Configurações de app (moeda/idioma)

O app possui configurações persistidas (ex.: **moeda** e **idioma**), usadas inclusive no `CurrencyInput` para formatar valores corretamente (ex.: `pt-BR` usa vírgula como separador decimal).

## 🌟 Características Técnicas

### Performance
- **Lazy Loading**: Carregamento otimizado de imagens
- **Cache Inteligente**: Armazenamento local de traduções
- **Filtros Eficientes**: Validação rápida de qualidade das receitas
- **Sistema Híbrido**: Funcionamento offline com localStorage

### Acessibilidade
- **Navegação por Teclado**: Suporte completo a navegação
- **Contraste Adequado**: Cores que atendem padrões de acessibilidade
- **Responsive Design**: Funciona em todos os dispositivos
- **Feedback Visual**: Indicações claras de ações do usuário

### Manutenibilidade
- **Código Modular**: Funções bem organizadas e reutilizáveis
- **Context API**: Gerenciamento de estado global eficiente
- **Comentários Detalhados**: Documentação inline do código
- **Estrutura Clara**: Organização lógica dos componentes

## 🔐 Sistema de Autenticação

### Funcionalidades
- **Registro de Usuários**: Criação de contas com validação
- **Login Seguro**: Autenticação com email e senha
- **Sessão Persistente**: Login mantido entre sessões
- **Logout Completo**: Limpeza de dados e redirecionamento

### Armazenamento
- **localStorage**: Dados de usuário e refeições
- **Validação**: Verificação de dados antes do salvamento
- **Fallback**: Sistema robusto de recuperação de dados

## 📚 Desenvolvimento e Contexto Acadêmico

### ⚠️ Importante - Desenvolvimento Anterior
Este projeto foi desenvolvido **anteriormente** à produção da atividade do professor **Ujverson** na faculdade **SENAI FATESG** (**Faculdade de Tecnologia SENAI de Desenvolvimento Gerencial**).

### 🎓 Contexto Educacional
- **Instituição**: SENAI FATESG
- **Curso**: Engenharia de Software 8* Período.
- **Professor**: Ujverson
- **Status**: Desenvolvimento independente anterior à atividade acadêmica

### 🔄 Evolução do Projeto
O FoodDidDo representa a evolução de um projeto que hoje segue em direção a um produto de uma **empresa unipessoal**, demonstrando:
- Conhecimento em React e JavaScript moderno
- Integração com APIs externas
- Design responsivo e UX/UI
- Gerenciamento de estado complexo
- Sistema de autenticação completo
- Implementação de funcionalidades avançadas

## 🚀 Funcionalidades em Destaque

### ✨ Interface Moderna
- **Tema Vermelho**: Design elegante e moderno
- **Animações Suaves**: Emojis flutuantes e transições
- **Cards Responsivos**: Layout adaptável para todos os dispositivos
- **Modais Elegantes**: Interface de login/registro profissional

### 🔧 Melhorias Recentes
- **Busca Precisa**: Sistema inteligente que evita falsos positivos na busca de ingredientes
- **Interface Simplificada**: Remoção do sistema de modos de busca para maior clareza
- **Otimização de Performance**: Remoção de APIs desnecessárias e código simplificado
- **Suporte Específico**: Verificações especiais para ingredientes como tomate, milho, ovos, etc.
- **Moeda pt-BR**: `CurrencyInput` com vírgula e formatação de Real (R$) quando configurado
- **Modal**: Scroll do fundo bloqueado quando o modal está aberto e scrollbars estilizadas
- **Orçamento**: Gastos consideram custos fixos mensais e custo de compra do estoque real
- **Custos/Ingredientes**: Edição de ingredientes melhorada (mover da direita para a esquerda e cancelar retorna)

### 🔧 Sistema Robusto
- **Funcionamento Offline**: Dados salvos localmente
- **Validação Completa**: Verificação de dados em tempo real
- **Feedback Visual**: Alertas e confirmações claras
- **Navegação Intuitiva**: Interface fácil de usar

## 🧾 Roadmap do PDV (para funcionamento completo no caixa)

### Operação de caixa (MVP)
- [x] **Abertura/fechamento de caixa** (suprimento, sangria, conferência) ✅
- [x] **Vendas persistidas** (pedido/itens) e vínculo com **fluxo de caixa** ✅
- [x] **Baixa de estoque automática** ao finalizar venda (por receita/insumo) ✅
- [ ] **Descontos** por item e por venda com regras
- [x] **Cancelamento/estorno** com justificativa e permissões ✅

### Pagamentos
- [ ] Integração com **PIX / cartão** (Mercado Pago / PagSeguro / Asaas)
- [ ] Webhooks e **status do pagamento** (pendente/processando/pago/estornado)
- [ ] Conciliação (pagamento ↔ venda ↔ fluxo de caixa ↔ CMV)

### Fiscal (Brasil)
- [ ] Emissão de **NFC-e/NFe** (Focus NFe / TecnoSpeed / Bling)
- [ ] Armazenar **XML/PDF**, chave de acesso, cancelamento
- [ ] Parametrização fiscal (CFOP/NCM/tributação) por produto

### Hardware / UX de PDV
- [ ] Leitor de **código de barras** (atalhos + foco inteligente)
- [ ] **Impressão térmica** de comprovante/cupom
- [ ] Atalhos (finalizar, cancelar, buscar produto)
- [ ] Modo “touch”

### Segurança e auditoria
- [ ] Perfis e permissões (operador/gerente/admin)
- [ ] Auditoria (quem alterou preço, cancelou venda, etc.)
- [ ] Backup automático e histórico de restauração

## 🤝 Contribuições

Sugestões e melhorias são bem-vindas!

- **Bugs e melhorias**: abra uma issue com o máximo de detalhes possível.
- **Pull Requests**: podem ser aceitos conforme alinhamento prévio (escopo, padrão de código e prioridade), já que o projeto é mantido por **empresa unipessoal**.

## 📄 Licença

© FoodDidDo. **Todos os direitos reservados.**

Este repositório faz parte de um projeto conduzido por uma **empresa unipessoal** (1 funcionário). O uso, cópia, modificação e distribuição do código e/ou marca **não são permitidos sem autorização prévia e expressa** do responsável pelo projeto.

## 👨‍💻 Responsável (empresa unipessoal)

**Gabriel Henriques Sales** — Responsável pelo desenvolvimento e manutenção (único colaborador)

---
