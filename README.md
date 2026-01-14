# 🍽️ FoodDidDo - Aplicativo de Receitas e Gestão de Refeições

## 📋 Sobre o Projeto

O **FoodDidDo** é uma aplicação web moderna desenvolvida em React voltada para **gestão de alimentação e operação**, combinando organização de refeições/receitas com recursos de gestão (custos, precificação, estoque e rotinas financeiras).

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
- **Armazenamento Local**: Dados salvos no localStorage do navegador

### 🥘 Busca Inteligente de Receitas
- **Busca Precisa**: Sistema inteligente que evita falsos positivos (ex: milho não encontra tomilho)
- **Integração Multi-API**: Consome dados do Spoonacular para receitas internacionais
- **Receitas Locais**: Base de dados própria com receitas brasileiras específicas
- **Busca por Relevância**: Ordenação automática por relevância dos ingredientes

### 🧾 Gerenciamento de Ingredientes
- **Seleção Visual**: Interface intuitiva com mais de 100 ingredientes disponíveis
- **Feedback Visual**: Indicação clara dos ingredientes selecionados
- **Categorização**: Ingredientes organizados por categorias (carnes, vegetais, laticínios, etc.)

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
- **React 18** - Biblioteca principal para interface
- **Vite** - Build tool e servidor de desenvolvimento
- **CSS3** - Estilização com variáveis CSS e gradientes
- **JavaScript ES6+** - Lógica da aplicação
- **Context API** - Gerenciamento de estado global

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
- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone [URL_DO_REPOSITORIO]

# Navegue até o diretório
cd FoodDidDo

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev
```

### Acesso
Abra seu navegador e acesse: `http://localhost:5173`

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
│   ├── App.jsx                 # Componente principal
│   ├── App.css                 # Estilos globais
│   ├── main.jsx                # Ponto de entrada
│   └── index.css               # Reset CSS
├── package.json                # Dependências e scripts
├── vite.config.js              # Configuração do Vite
└── README.md                   # Este arquivo
```

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

### 🔧 Sistema Robusto
- **Funcionamento Offline**: Dados salvos localmente
- **Validação Completa**: Verificação de dados em tempo real
- **Feedback Visual**: Alertas e confirmações claras
- **Navegação Intuitiva**: Interface fácil de usar

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
