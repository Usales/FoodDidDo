# 🔧 Solução de Problemas - npm install

## Problemas Comuns e Soluções

### 1. ❌ Erro: "npm ERR! code EACCES" ou Problemas de Permissão

**Solução:**
```powershell
# Execute o PowerShell como Administrador e tente:
cd C:\Users\GABRIEL-SUP\Desktop\Projetos\FoodDidDo
npm install
```

### 2. ❌ Erro: "better-sqlite3" não compila no Windows

**Causa:** `better-sqlite3` é uma dependência nativa que precisa ser compilada. No Windows, isso requer ferramentas de build.

**Soluções:**

#### Opção A: Instalar ferramentas de build do Windows
```powershell
# Instale o Visual Studio Build Tools ou o Visual Studio Community
# Inclua "Desktop development with C++" durante a instalação

# Depois, tente novamente:
npm install
```

#### Opção B: Usar versão pré-compilada
```powershell
# Limpe o cache e reinstale
npm cache clean --force
Remove-Item -Path node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path package-lock.json -Force -ErrorAction SilentlyContinue
npm install
```

#### Opção C: Instalar dependências de build manualmente
```powershell
# Instale o windows-build-tools globalmente (pode demorar)
npm install --global windows-build-tools

# Ou use o pacote alternativo:
npm install --global node-gyp
```

### 3. ❌ Erro: "npm ERR! code ELIFECYCLE"

**Solução:**
```powershell
# Limpe tudo e reinstale
npm cache clean --force
Remove-Item -Path node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path package-lock.json -Force -ErrorAction SilentlyContinue
npm install
```

### 4. ❌ Erro: "npm ERR! network" ou problemas de conexão

**Soluções:**
```powershell
# Verifique sua conexão com a internet
# Tente usar um registry diferente temporariamente:
npm config set registry https://registry.npmjs.org/

# Ou limpe o cache e tente novamente:
npm cache clean --force
npm install
```

### 5. ❌ Erro: "lockfileVersion" incompatível

**Causa:** O `package-lock.json` usa `lockfileVersion: 3`, que requer npm 7+.

**Solução:**
```powershell
# Verifique sua versão do npm:
npm --version

# Se for menor que 7, atualize o npm:
npm install -g npm@latest

# Depois tente novamente:
npm install
```

### 6. ❌ Antivírus bloqueando a instalação

**Solução:**
- Adicione a pasta `node_modules` às exceções do seu antivírus
- Ou desative temporariamente o antivírus durante a instalação

### 7. ✅ Solução Completa (Recomendada)

Execute estes comandos na ordem:

```powershell
# 1. Navegue até o diretório do projeto
cd C:\Users\GABRIEL-SUP\Desktop\Projetos\FoodDidDo

# 2. Limpe o cache do npm
npm cache clean --force

# 3. Remova node_modules e package-lock.json
Remove-Item -Path node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path package-lock.json -Force -ErrorAction SilentlyContinue

# 4. Verifique as versões
node --version  # Deve ser 16+ (você tem v24.11.1 ✅)
npm --version   # Deve ser 7+ (você tem 11.6.2 ✅)

# 5. Instale as dependências
npm install

# 6. Se ainda houver problemas com better-sqlite3, tente:
npm install --ignore-scripts
npm rebuild better-sqlite3
```

## 📋 Verificações Pré-Instalação

Antes de executar `npm install`, verifique:

1. ✅ **Node.js instalado**: `node --version` (você tem v24.11.1 ✅)
2. ✅ **npm instalado**: `npm --version` (você tem 11.6.2 ✅)
3. ✅ **Conexão com internet**: Necessária para baixar pacotes
4. ⚠️ **Ferramentas de build**: Necessárias para `better-sqlite3` no Windows

## 🛠️ Ferramentas Necessárias para better-sqlite3

No Windows, `better-sqlite3` precisa de:
- **Python 3.x** (geralmente já instalado)
- **Visual Studio Build Tools** ou **Visual Studio Community**
  - Componente: "Desktop development with C++"
  - Ou instale: `npm install -g windows-build-tools`

## 📞 Se Nada Funcionar

1. Verifique os logs completos do erro:
   ```powershell
   npm install --verbose > npm-install-log.txt
   ```

2. Tente instalar sem scripts (pode funcionar, mas algumas funcionalidades podem não estar disponíveis):
   ```powershell
   npm install --ignore-scripts
   ```

3. Verifique se há problemas conhecidos no GitHub:
   - [better-sqlite3 issues](https://github.com/WiseLibs/better-sqlite3/issues)
   - [npm issues](https://github.com/npm/cli/issues)

## ✅ Status Atual do Projeto

- ✅ Node.js: v24.11.1 (compatível)
- ✅ npm: 11.6.2 (compatível)
- ✅ package-lock.json: lockfileVersion 3 (compatível)
- ✅ Cache do npm: verificado e limpo
- ✅ Dependências: 324 pacotes instalados com sucesso

**O projeto está configurado corretamente e o npm install deve funcionar!**
