# 🛡️ Facilities Travel

App de viagens com IA — busca de voos, hotéis e pacotes, acessível para todos.

---

## 🚀 Deploy rápido (30 minutos)

### Pré-requisitos

- Conta no GitHub ✅ (você já tem)
- Conta na Vercel (gratuita) — [vercel.com/signup](https://vercel.com/signup)
- Chave da API Anthropic — [console.anthropic.com](https://console.anthropic.com)

---

## Passo a Passo

### 1. Criar repositório PRIVADO no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Nome: `facilities-travel`
3. ⚠️ Marque **"Private"** — código não ficará público
4. Clique em **"Create repository"**

### 2. Subir o código

Abra o terminal na pasta do projeto e execute:

```bash
git init
git add .
git commit -m "🚀 Facilities Travel v1.0"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/facilities-travel.git
git push -u origin main
```

### 3. Conectar Vercel ao GitHub

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em **"Add New Project"**
3. Selecione o repositório `facilities-travel` (privado)
4. Framework: **Vite**
5. **Antes de clicar em Deploy**, vá em **"Environment Variables"** e adicione:

| Nome                     | Valor                   |
| ------------------------ | ----------------------- |
| `VITE_ANTHROPIC_API_KEY` | `sk-ant-SUA_CHAVE_AQUI` |

6. Clique em **"Deploy"**
7. Aguarde ~2 minutos ✅

### 4. Seu app está no ar!

Vercel vai gerar um link como:
`https://facilities-travel-seunome.vercel.app`

Compartilhe este link — qualquer pessoa acessa pelo celular.

---

## 📲 Instalar como PWA (app no celular)

**Android (Chrome):**

1. Abra o link no Chrome
2. Toque nos 3 pontos (menu)
3. "Adicionar à tela inicial"
4. Pronto — ícone na tela inicial ✅

**iPhone (Safari):**

1. Abra o link no Safari
2. Toque no ícone de compartilhar (quadrado com seta)
3. "Adicionar à Tela de Início"
4. Pronto ✅

---

## 🔧 Rodar localmente

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local e coloque sua chave da API

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build
```

---

## 📦 Distribuição — Baixar e usar

Quer disponibilizar o app pronto para outras pessoas baixarem e usarem localmente? Criei uma release contendo o build (`dist`) empacotado: você pode baixar o ZIP pré-compilado em

- Releases: https://github.com/lelotininho/facilities-travel/releases

Instruções rápidas após baixar o ZIP:

```bash
# Descompacte o arquivo baixado (ex: facilities-travel-v1.0.0-dist.zip)
unzip facilities-travel-v1.0.0-dist.zip

# Servir os arquivos estáticos localmente (recomendado: serve)
npx serve dist

# Ou abra dist/index.html em um navegador
```

Para executar a partir do código-fonte (clonar + build):

```bash
git clone https://github.com/lelotininho/facilities-travel.git
cd facilities-travel
npm install
npm run build
npx serve dist
```

### Rodar o agente de QA localmente

```bash
npm run qa
```

O projeto agora inclui um agente de QA automático que:

- executa testes de regressão com Playwright
- coleta métricas de desempenho do app
- gera relatórios em `qa/bug-report.md`
- aplica correções de formatação automáticas com Prettier

A pipeline de QA está configurada em `.github/workflows/qa.yml` e roda em pushes para `main` e em pull requests.

Para gerar apenas o relatório sem reiniciar os testes:

```bash
npm run qa:report
```

Observação: o repositório será tornado público para facilitar o download das releases.

## 🔐 Segurança

- O repositório é **privado** — ninguém vê seu código
- A chave da API fica nas variáveis de ambiente da Vercel — nunca exposta
- HTTPS automático com certificado SSL
- Headers de segurança configurados no `vercel.json`

---

## 📁 Estrutura do projeto

```
facilities-travel/
├── src/
│   ├── App.jsx          # Componente principal do app
│   └── main.jsx         # Ponto de entrada
├── public/
│   ├── favicon.ico
│   ├── icon-192.png     # Ícone PWA (192x192)
│   └── icon-512.png     # Ícone PWA (512x512)
├── index.html
├── vite.config.js       # Configuração Vite + PWA
├── vercel.json          # Configuração de deploy
├── package.json
├── .env.example         # Modelo de variáveis (não contém chaves reais)
└── .gitignore           # Protege .env.local de ser enviado ao GitHub
```

---

## 💡 Próximos passos

- [ ] Adicionar ícones personalizados em `public/`
- [ ] Configurar domínio próprio na Vercel (ex: facilitiestravel.com.br)
- [ ] Integrar Supabase para salvar dados de usuários
- [ ] Publicar na Google Play Store (US$25 taxa única)

---

Desenvolvido com ❤️ usando React + Vite + Claude AI
