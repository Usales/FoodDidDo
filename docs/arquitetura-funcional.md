# 🧭 Arquitetura Funcional do FoodIDDO

## 1. Visão Geral

O FoodIDDO é uma aplicação web voltada para microempreendedores do setor alimentício. O objetivo é apoiar o controle de custos, formação de preço, planejamento de produção e análise de lucratividade com base em princípios de Engenharia de Custos. A solução será entregue como SPA (Single Page Application) desenvolvida em React (Vite) com backend BaaS via Supabase, privilegiando agilidade de entrega e baixo custo operacional.

## 2. Páginas, Rotas e Principais Funcionalidades

| Rota | Módulo | Objetivo | Componentes-chave |
| --- | --- | --- | --- |
| `/dashboard` | **Dashboard** | KPIs financeiros/produtivos e atalhos rápidos | `CardInfo`, `ChartLine`, `ChartBar`, `ButtonPrimary` |
| `/orcamento` | **Capital de Giro** | Definir limite de gasto e acompanhar saldo | `FormBudget`, `ProgressBudget`, `HistoryList` |
| `/ingredientes` | **Ingredientes** | Cadastro, custo unitário e alertas de estoque | `DataTable`, `FormModal`, `Alert` |
| `/receitas` | **Ficha Técnica** | Cadastro de receitas e composição | `RecipeForm`, `IngredientSelector`, `YieldCalculator` |
| `/custos` | **Custo Unitário** | Visualização detalhada dos custos de receitas | `DataTable`, `ChartBar`, `InfoCard` |
| `/simulador` | **Simulador de Produção** | Combinações possíveis dentro do orçamento | `ProductionSimulator`, `ResultList`, `SummaryCard` |
| `/lucratividade` | **Análise de Lucratividade** | Margens e lucro por receita | `PriceInput`, `ChartPie`, `CardInfo` |
| `/custos-fixos` | **Custos Fixos/Indiretos** | Rateio de despesas fixas e indiretas | `CostForm`, `AllocationSelector`, `DataTable` |
| `/pricing` | **Formação de Preço** | Sugestão de preço com markup | `MarginInput`, `SuggestionCard`, `ComparisonTable` |
| `/ponto-equilibrio` | **Ponto de Equilíbrio** | Quantidade mínima de vendas | `BreakEvenCalculator`, `ChartLine`, `CardInfo` |
| `/simulacao` | **Análise de Sensibilidade** | “E se...?” sobre custos e margens | `ScenarioForm`, `ScenarioResult`, `ChartLine` |
| `/estoque` | **Estoque** | Controle de consumo e reposição | `StockTable`, `Alert`, `FormModal` |
| `/financeiro` | **Fluxo de Caixa** | Entradas, saídas e saldo histórico | `CashflowForm`, `ChartArea`, `HistoryList` |
| `/relatorios` | **Relatórios** | Exportação consolidada | `ReportBuilder`, `ExportButtons`, `DataTable` |
| `/config` | **Configurações** | Preferências gerais | `CurrencyInput`, `Select`, `ToggleTheme`, `BackupManager` |

## 3. Componentes Reutilizáveis

- `CardInfo`: apresenta métricas e KPIs.
- `FormModal`: modal genérico para formulários (ingredientes, receitas, estoque).
- `DataTable`: tabela com filtros, paginação e exportação CSV/XLSX.
- `Chart` (wrapper): abstrai uso do Recharts/Chart.js para barras, linhas e pizza.
- `Alert`: mensagens de sucesso, erro, aviso e estoque baixo.
- `CurrencyInput` e `PercentageInput`: inputs com máscaras e validação.
- `ButtonPrimary`, `ButtonSecondary`, `IconButton`: padrões de ação.

## 4. Modelagem de Dados (Supabase/Postgres)

### Tabelas Principais

- `budgets` – campos: `id`, `user_id`, `period`, `amount`, `spent`, `created_at`.
- `ingredients` – `id`, `user_id`, `name`, `category`, `package_price`, `package_qty`, `unit_cost`, `stock_qty`, `low_stock_threshold`.
- `recipes` – `id`, `user_id`, `name`, `yield`, `prep_time`, `total_cost`, `unit_cost`.
- `recipe_ingredients` – `id`, `recipe_id`, `ingredient_id`, `quantity`, `unit_cost_total`.
- `fixed_costs` – `id`, `user_id`, `name`, `type`, `value`, `allocation_method`.
- `productions` – `id`, `user_id`, `budget_id`, `scenario_config`, `total_cost`, `estimated_profit`.
- `pricing` – `id`, `recipe_id`, `desired_margin`, `suggested_price`, `current_price`.
- `cashflow_entries` – `id`, `user_id`, `type`, `description`, `amount`, `date`.
- `stock_movements` – `id`, `ingredient_id`, `type`, `quantity`, `reference_id`, `created_at`.
- `reports` – `id`, `user_id`, `type`, `filters`, `generated_at`, `file_url`.

### Views e Funções

- View `v_recipe_cost_detail` para composições de receita com custo total e unitário.
- Função `fn_calculate_break_even(fixed_costs numeric, contribution_margin numeric)` → retorna unidades e valor.
- Função `fn_simulate_production(budget_id uuid)` → JSON com combinações possíveis.

## 5. Estado e Fluxo de Dados

- **State global**: React Context + Zustand (ou Redux Toolkit) para dados persistentes (`user`, `budgets`, `ingredients`, `recipes`, `settings`).
- **Data fetching**: React Query para caching, sincronização e invalidação automática ao cadastrar/editar.
- **Formulários**: React Hook Form com Zod para validação.
- **Autenticação**: Supabase Auth (e-mail/senha, magic link). `AuthProvider` provê contexto para rotas protegidas via `PrivateRoute`.
- **Sincronização**: Listener em `stock_movements` para atualizar dashboards em tempo real.

## 6. Casos de Uso Essenciais

1. **Definir orçamento**: Usuário informa valor → `budgets.insert` → `dashboard` atualiza card “Orçamento disponível”.
2. **Cadastrar ingrediente**: Abre `FormModal`, calcula `unit_cost` automaticamente → salva em `ingredients`.
3. **Montar receita**: Seleciona ingredientes → soma custos → atualiza `recipes` e `recipe_ingredients`.
4. **Analisar custo unitário**: `DataTable` consome view `v_recipe_cost_detail`.
5. **Simular produção**: Usuário escolhe orçamento → função serverless gera cenários → exibe combinações e exporta relatório.
6. **Formar preço**: Define margem → calcula `suggested_price` com markup → salva histórico.
7. **Controlar estoque**: Ao registrar produção, baixa ingredientes automaticamente via `stock_movements`.
8. **Fluxo de caixa**: Registra entradas/saídas → gráfico mensal e saldo acumulado.
9. **Relatórios**: API gera PDF/Excel (via worker/serverless) e armazena URL pública.

## 7. Integrações e Serviços

- **Supabase**: Auth, Postgres, Functions, Storage para relatórios.
- **Email**: Supabase Functions + Resend (ou similar) para envio opcional de relatórios.
- **PDF/Excel**: uso de `pdfmake` e `exceljs` em functions para exportação.

## 8. Requisitos Não Funcionais

- **UX**: interface responsiva, acessibilidade (WCAG nível AA).
- **Segurança**: RBAC via Supabase Policies, criptografia TLS (HTTPS), logs de auditoria.
- **Performance**: lazy loading das rotas, code splitting e caching de dados com React Query.
- **Observabilidade**: monitoramento de eventos críticos via Supabase Logflare.
- **Backup**: rotina automatizada via Supabase (scripts diários) + export manual em `/config`.

## 9. Jornada do Usuário (Resumo)

1. Define orçamento inicial em `/orcamento`.
2. Cadastra ingredientes e custos em `/ingredientes`.
3. Cria receitas com rendimentos em `/receitas`.
4. Consulta custos unitários em `/custos`.
5. Define preço de venda em `/lucratividade` ou `/pricing`.
6. Planeja produção no `/simulador`.
7. Analisa ponto de equilíbrio e cenários avançados em `/ponto-equilibrio` e `/simulacao`.
8. Controla estoque e fluxo financeiro em `/estoque` e `/financeiro`.
9. Gera relatórios em `/relatorios`.

## 10. Roadmap Inicial

1. **MVP 1**: Autenticação, `budget`, `ingredients`, `recipes`, cálculo de custo unitário.
2. **MVP 2**: Simulador de produção, formação de preço, análise de lucratividade.
3. **Módulos avançados**: ponto de equilíbrio, sensibilidade, fluxo de caixa, relatórios, configurações.

---

Este documento orienta o desenvolvimento incremental do FoodIDDO, alinhando visão funcional, modelagem de dados e reuso de componentes front-end.

