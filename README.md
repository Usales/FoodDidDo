# 🍽️ FoodDidDo - Aplicativo de Receitas Inteligente

## 📋 Sobre o Projeto

O **FoodDidDo** é uma aplicação web moderna desenvolvida em React que permite aos usuários descobrir receitas baseadas nos ingredientes disponíveis em sua geladeira. O aplicativo utiliza múltiplas APIs de receitas para fornecer uma experiência rica e diversificada.

## 🎯 Funcionalidades Principais

### 🥘 Busca Inteligente de Receitas
- **Modo Relevante**: Busca receitas que contenham pelo menos um dos ingredientes selecionados
- **Modo Estrito**: Busca receitas que contenham todos os ingredientes selecionados
- **Integração Multi-API**: Consome dados de TheMealDB e Spoonacular para máxima variedade

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

### 🔐 Sistema de Login
- **Modal de Autenticação**: Interface moderna para login
- **Design Responsivo**: Funciona perfeitamente em desktop e mobile

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca principal para interface
- **Vite** - Build tool e servidor de desenvolvimento
- **CSS3** - Estilização com variáveis CSS e gradientes
- **JavaScript ES6+** - Lógica da aplicação

### APIs Integradas
- **TheMealDB** - API gratuita com receitas internacionais
- **Spoonacular** - API premium com receitas diversificadas
- **MyMemory** - API de tradução para localização

### Funcionalidades Avançadas
- **Cache Local** - Armazenamento de traduções para performance
- **Filtros Inteligentes** - Validação de qualidade das receitas
- **Responsive Design** - Interface adaptável a diferentes telas
- **Animações CSS** - Transições suaves e feedback visual

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

### 1. Seleção de Ingredientes
- Na seção "Minha Geladeira", clique nos ingredientes disponíveis
- Os ingredientes selecionados aparecerão destacados
- Escolha entre "Relevante" ou "Estrito" para o tipo de busca

### 2. Busca de Receitas
- Clique em "Buscar Receitas" para encontrar opções
- As receitas aparecerão em cards organizados
- Cada card mostra ingredientes, categoria e origem

### 3. Visualização Detalhada
- Clique em "Ver Receita Completa" para abrir o modal
- Navegue pelas instruções passo a passo
- Feche o modal clicando no "X" ou fora da área

### 4. Explorar Receitas
- Acesse a seção "Receitas" na sidebar
- Navegue pelas páginas para ver todas as opções
- Use a paginação para explorar o catálogo completo

## 🎨 Design e Interface

### Paleta de Cores
- **Verde Principal**: `#2dd4bf` (Teal-400)
- **Vermelho Vivido**: `#dc2626` (Red-600)
- **Cinza Escuro**: `#374151` (Gray-700)
- **Branco**: `#ffffff`

### Componentes Principais
- **Header**: Navegação principal com botão de login
- **Sidebar**: Menu lateral com seções do app
- **Cards de Receitas**: Exibição visual das receitas
- **Modal de Detalhes**: Visualização completa das receitas
- **Sistema de Paginação**: Navegação através das receitas

## 🔧 Estrutura do Projeto

```
FoodDidDo/
├── public/
│   ├── images_/          # Imagens das receitas
│   └── vite.svg
├── src/
│   ├── App.jsx           # Componente principal
│   ├── App.css           # Estilos globais
│   ├── main.jsx          # Ponto de entrada
│   └── index.css         # Reset CSS
├── package.json          # Dependências e scripts
├── vite.config.js        # Configuração do Vite
└── README.md            # Este arquivo
```

## 🌟 Características Técnicas

### Performance
- **Lazy Loading**: Carregamento otimizado de imagens
- **Cache Inteligente**: Armazenamento local de traduções
- **Filtros Eficientes**: Validação rápida de qualidade das receitas

### Acessibilidade
- **Navegação por Teclado**: Suporte completo a navegação
- **Contraste Adequado**: Cores que atendem padrões de acessibilidade
- **Responsive Design**: Funciona em todos os dispositivos

### Manutenibilidade
- **Código Modular**: Funções bem organizadas e reutilizáveis
- **Comentários Detalhados**: Documentação inline do código
- **Estrutura Clara**: Organização lógica dos componentes

## 📚 Desenvolvimento e Contexto Acadêmico

### ⚠️ Importante - Desenvolvimento Anterior
Este projeto foi desenvolvido **anteriormente** à produção da atividade do professor **Ujverson** na faculdade **SENAI FATESG** (Faculdade de Tecnologia Senai de Desenvolvimento Gerencial do Estado de Goiás).

### 🎓 Contexto Educacional
- **Instituição**: SENAI FATESG
- **Curso**: Desenvolvimento Gerencial
- **Professor**: Ujverson
- **Status**: Desenvolvimento independente anterior à atividade acadêmica

### 🔄 Evolução do Projeto
O FoodDidDo representa um projeto pessoal de desenvolvimento web que demonstra:
- Conhecimento em React e JavaScript moderno
- Integração com APIs externas
- Design responsivo e UX/UI
- Gerenciamento de estado complexo
- Implementação de funcionalidades avançadas

## 🤝 Contribuições

Este é um projeto pessoal, mas sugestões e melhorias são sempre bem-vindas!

## 📄 Licença

Este projeto é de uso pessoal e educacional.

## 👨‍💻 Desenvolvedor

**Gabriel** - Desenvolvimento Frontend e Integração de APIs

---

*Desenvolvido com ❤️ usando React e Vite*