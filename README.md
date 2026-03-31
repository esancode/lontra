# 🦦 Lontra

<div align="center">

**Context keeper for developers.**

_Capture ideias no meio do flow. A IA organiza enquanto você continua codando._

[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20MongoDB-blue?style=flat-square)](https://github.com/esancode/lontra)
[![IA](https://img.shields.io/badge/IA-Claude%20API%20(Anthropic)-purple?style=flat-square)](https://anthropic.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Editor](https://img.shields.io/badge/Editor-TipTap%20v3-orange?style=flat-square)](https://tiptap.dev)

</div>

---

## O que é o Lontra?

Todo desenvolvedor conhece esse momento: você está no meio de um problema complexo, resolve algo importante, percebe um bug crítico, descobre uma referência útil — e precisa anotar **agora**, sem perder o raciocínio.

O Lontra foi construído para esse momento.

É uma ferramenta de notas e organização de conhecimento pensada **do zero para desenvolvedores**: editor rico com suporte a código, IA que organiza suas anotações bagunçadas automaticamente, caixas aninhadas com ícones de linguagem, wiki links entre notas, flashcards com repetição espaçada, e muito mais.

Sem login. Seus dados ficam isolados por dispositivo automaticamente.

---

## Funcionalidades

### ⚡ Nota Rápida com IA

A funcionalidade principal do Lontra.

Você abre o painel com `Ctrl+Shift+N` (ou clica no botão flutuante), digita tudo de forma bagunçada — mistura de português, inglês, código e abreviações — e aperta **Organizar com IA**.

A IA (Claude da Anthropic) assume:

1. **Lê** o texto bruto
2. **Formata** usando os blocos reais do editor: títulos, código, checklists, callouts de erro/aviso/sucesso
3. **Corrige** ortografia e gramática
4. **Analisa** suas caixas existentes e decide onde arquivar a nota
5. **Cria** uma caixa nova se precisar, inclusive aninhada dentro de outra existente
6. **Salva** a nota formatada e te mostra o caminho exato onde ela foi parar

Se a IA falhar por qualquer motivo (sem créditos, rede, timeout), o texto bruto é **automaticamente salvo como rascunho** em uma caixa "Rascunhos" — zero perda de dados.

```
Fluxo:
  Texto bruto → Claude API → Nota formatada → Arquivo automático
                          ↘ (fallback)     → Rascunho salvo
```

---

### 📝 Editor Rico com Blocos

Editor estilo Notion construído com TipTap v3, com suporte completo a:

| Bloco | Atalho |
|---|---|
| Título H1, H2, H3 | `#`, `##`, `###` + espaço |
| Blocos de código com syntax highlight | `/code` ou `/código` |
| Tabelas | `/tabela` |
| Listas com checklist | `/tarefa` |
| Bullet list e Ordered list | `-` ou `1.` + espaço |
| Blockquote | `>` + espaço |
| Callout de aviso ⚠️ | `/aviso` |
| Callout de erro 🔴 | `/erro` |
| Callout de info ℹ️ | `/info` |
| Callout de sucesso ✅ | `/sucesso` |
| Divisor horizontal | `---` |
| Imagem | `/imagem` |
| Lousa (Excalidraw) | `/lousa` |

O slash menu (`/`) lista todos os blocos disponíveis com busca em tempo real.

O editor suporta **drag & drop de blocos** para reorganizar o conteúdo, seleção múltipla de blocos e atahos inline (`**bold**`, `` `code` ``, `_italic_`).

---

### 📁 Caixas Aninhadas com Ícones de Linguagem

As notas são organizadas em **Caixas** — pastas com ícones personalizáveis. As caixas podem ser aninhadas em qualquer profundidade:

```
📁 Backend
  📁 Node.js
    📄 Middleware de auth
    📄 Rate limiting com Redis
  📁 MongoDB
    📄 Query optimization
📁 Frontend
  📁 React
    📄 useCallback vs useMemo
```

Cada caixa e cada nota pode ter um **ícone de linguagem** do conjunto `vscode-icons` — os mesmos ícones que você já conhece do VS Code:

- JavaScript, TypeScript, React, Python, Rust, Go, Java, Kotlin, C#, C++
- HTML, CSS, SCSS, SQL, JSON, YAML, Docker, Markdown, Git, Shell, GraphQL, e mais

---

### 🔗 Wiki Links entre Notas

Digite `[[` em qualquer lugar do editor para abrir o menu de referências. Você pode linkar:

- Uma **nota** específica — cria um link interno clicável
- Uma **caixa** — navega diretamente para aquela pasta

Os links são bidirecionais e navegáveis: `Ctrl+Click` abre a nota referenciada diretamente no editor.

---

### 🔍 Busca Global Inteligente

`Ctrl+K` abre a paleta de busca global que pesquisa simultaneamente:

- **Títulos** de notas e caixas
- **Conteúdo** das notas (full-text indexing com MongoDB `$text`)
- **Tags** com prefixo `#`
- **Nomes de caixas**

O resultado mostra o fragmento de contexto onde o termo foi encontrado — título, tag ou trecho do conteúdo — e navega direto ao clicar.

---

### 🏷️ Tags com Filtro Global

Adicione `#tags` diretamente no texto das notas. As tags são indexadas automaticamente e aparecem como filtros clicáveis no card de cada nota.

A busca global entende `#tag` como filtro de tag — diferente de busca por texto normal.

---

### 🕐 Histórico de Versões

O editor salva **snapshots automáticos** enquanto você edita (a cada N segundos de inatividade) e permite salvar **versões manuais** com um clique.

O painel de histórico mostra todas as versões com timestamp, e você pode restaurar qualquer versão anterior com um clique — sem perder a versão atual.

---

### ✅ Multi-seleção e Ações em Massa

Selecione vários cartões (clique + arraste ou `Shift+Click`) para:

- **Mover** todos para outra caixa de uma vez
- **Deletar** em massa com confirmação

A barra de ações em massa aparece automaticamente na parte inferior da tela quando há seleção ativa.

---

### 📄 Exportar para PDF

O menu de opções de qualquer nota (`⋯`) oferece exportação direta para PDF com:

- Layout otimizado para leitura
- Dark mode preservado
- Blocos de código com syntax highlight
- Tabelas formatadas
- Sem elementos de interface (apenas o conteúdo)

---

### 🔒 Dados Isolados por Dispositivo

Sem login, sem cadastro, sem senhas.

Cada navegador/dispositivo recebe um **UUID único** gerado automaticamente e armazenado no `localStorage`. Esse ID é enviado em todas as requisições e garante que cada pessoa veja apenas seus próprios dados.

Funciona da mesma forma que ferramentas como Excalidraw ou Wordle — simples, privado por padrão.

---

### ⌨️ Atalhos de Teclado

| Atalho | Ação |
|---|---|
| `Ctrl+Shift+N` | Abrir Nota Rápida com IA |
| `Ctrl+K` | Busca global / Paleta de comandos |
| `Ctrl+Enter` | Enviar Nota Rápida (dentro do modal) |
| `Escape` | Fechar modal / paleta |
| `/` | Abrir slash menu de blocos (dentro do editor) |
| `[[` | Abrir menu de wiki links (dentro do editor) |

---

## Tecnologias

### Frontend
- **React 19** + **TypeScript** — UI principal
- **Vite 7** — build tool e dev server
- **TipTap v3** — editor de texto rico extensível
- **Excalidraw** — canvas de desenho embutido
- **Zustand** — gerenciamento de estado global
- **@dnd-kit** — drag & drop de cartões e blocos
- **@iconify/react** — ícones vscode-icons e lucide
- **axios** — cliente HTTP com interceptor automático de `deviceId`
- **date-fns** — formatação de datas
- **flexsearch** — busca full-text no frontend

### Backend
- **Node.js** + **Express** — servidor REST
- **Mongoose** + **MongoDB Atlas** — banco de dados
- **@anthropic-ai/sdk** — integração com Claude API
- **@upstash/ratelimit** + **@upstash/redis** — rate limiting global

---

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Conta no [MongoDB Atlas](https://cloud.mongodb.com) (gratuito)
- Chave de API da [Anthropic](https://console.anthropic.com) (para Nota Rápida com IA)

### Instalação

```bash
# Clonar
git clone https://github.com/esancode/lontra.git
cd lontra

# Dependências
npm install --prefix backend
npm install --prefix frontend

# Variáveis de ambiente
cp backend/.env.example backend/.env
# Editar backend/.env com suas credenciais
```

### Rodar

```bash
# Backend + Frontend juntos (na raiz)
npm run dev

# Ou em separado:
cd backend && npm run dev    # API em http://localhost:5000
cd frontend && npm run dev   # App em http://localhost:5173
```

### Migração (só na primeira vez se tiver dados antigos)

```bash
cd backend && npm run migrate
```

---

## Estrutura do projeto

```
lontra/
├── backend/
│   ├── scripts/
│   │   └── migrate.js              # Migração de dados legados
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/
│   │   │   ├── boxController.js
│   │   │   ├── notesController.js
│   │   │   └── searchController.js
│   │   ├── middleware/
│   │   │   ├── identify.js         # Extrai e valida deviceId
│   │   │   └── rateLimiter.js
│   │   ├── models/
│   │   │   ├── Box.js              # ownerId, parentId, color, order
│   │   │   ├── Note.js             # ownerId, content, tags, flashcards
│   │   │   └── NoteVersion.js      # Snapshots para histórico
│   │   ├── routes/
│   │   │   ├── boxRoutes.js
│   │   │   ├── notesRoutes.js
│   │   │   ├── quicknoteRoutes.js
│   │   │   └── searchRoutes.js
│   │   ├── services/
│   │   │   ├── aiService.js        # Prompt + chamada Claude API
│   │   │   └── archiveService.js   # Salvar nota / rascunho / caixas
│   │   └── server.js
│   └── .env.example
│
└── frontend/
    └── src/
        ├── components/
        │   ├── QuickNote/           # Modal de Nota Rápida
        │   ├── editor/              # NoteEditor + extensões TipTap
        │   ├── sidebar/
        │   └── ui/                  # CommandPalette, GlobalSearch, BulkBar
        ├── hooks/
        │   ├── useQuickNote.ts
        │   └── useKeyboardShortcuts.ts
        ├── lib/
        │   └── axios.ts             # Client HTTP com deviceId automático
        ├── pages/
        │   └── HomePage.tsx
        ├── store/
        │   └── useAppStore.ts       # Estado global Zustand
        └── utils/
            └── deviceId.ts          # UUID persistido no localStorage
```

---

## Roadmap

- [ ] Deploy na Vercel + Railway com CI/CD
- [ ] Sincronização entre dispositivos (conta opcional)
- [ ] Modo apresentação (slides gerados a partir de notas)
- [ ] Integração com GitHub (linkar notas a issues/PRs)
- [ ] App desktop com Electron (atalho global verdadeiro)
- [ ] Extensão para VS Code (captura de contexto direto do editor)
- [ ] API pública para integração com outras ferramentas

---

## Licença

MIT — © 2026 [esancode](https://github.com/esancode)

---

<div align="center">

Construído com foco, café e o desejo de nunca mais perder contexto no meio de um debug.

**[⭐ Star no GitHub](https://github.com/esancode/lontra)** se o projeto foi útil para você.

</div>
