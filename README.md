# 🦦 Lontra

> Context keeper for developers.

Lontra é uma ferramenta de notas e organização de conhecimento focada em desenvolvedores. Capture ideias rapidamente, organize automaticamente com IA e nunca perca o contexto dos seus projetos.

## Funcionalidades

- 📝 **Editor rico** com blocos estilo Notion (código, tabelas, callouts, checklists, LaTeX)
- ⚡ **Nota Rápida com IA** — anota bagunçado, a IA formata e arquiva automaticamente
- 📁 **Organização em caixas aninhadas** com ícones de linguagem (vscode-icons)
- 🔗 **Wiki links** entre notas e caixas com `[[nome]]`
- 🎨 **Lousa digital** integrada (Excalidraw)
- 📌 **Flashcards** com repetição espaçada dentro das notas
- 🕐 **Histórico de versões** com restauração de snapshots
- 🔍 **Busca global** com full-text indexing, tags e conteúdo
- 🏷️ **Tags** com filtros globais (`#tag`)
- ✅ **Multi-seleção** e ações em massa (mover, deletar)
- 📄 **Exportar para PDF** com layout dark mode
- 🔒 **Dados isolados por dispositivo** via `deviceId` — sem login necessário

## Tecnologias

**Frontend:** React 19, TypeScript, Vite, TipTap 3, Excalidraw, Zustand, @dnd-kit  
**Backend:** Node.js, Express, Mongoose  
**Banco:** MongoDB Atlas  
**IA:** Claude API (Anthropic)  
**Rate Limiting:** Upstash Redis

## Estrutura do projeto

```
lontra/
├── backend/
│   ├── scripts/
│   │   └── migrate.js          # Migração de dados legados
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── boxController.js
│   │   │   ├── notesController.js
│   │   │   └── searchController.js
│   │   ├── middleware/
│   │   │   ├── identify.js     # Identificação por deviceId
│   │   │   └── rateLimiter.js
│   │   ├── models/
│   │   │   ├── Box.js
│   │   │   ├── Note.js
│   │   │   └── NoteVersion.js
│   │   ├── routes/
│   │   │   ├── boxRoutes.js
│   │   │   ├── notesRoutes.js
│   │   │   ├── quicknoteRoutes.js
│   │   │   └── searchRoutes.js
│   │   ├── services/
│   │   │   ├── aiService.js    # Claude API
│   │   │   └── archiveService.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    └── src/
        ├── components/
        │   ├── QuickNote/      # Modal de Nota Rápida
        │   ├── editor/         # NoteEditor + extensões TipTap
        │   ├── sidebar/
        │   └── ui/             # CommandPalette, GlobalSearch, etc.
        ├── hooks/              # useQuickNote, useKeyboardShortcuts
        ├── lib/
        │   └── axios.ts        # Client HTTP com deviceId automático
        ├── pages/
        │   ├── HomePage.tsx
        │   └── HomePage/       # Subcomponentes e hooks da home
        ├── shortcuts/
        ├── store/
        │   └── useAppStore.ts  # Estado global (Zustand)
        ├── types/
        └── utils/
            └── deviceId.ts     # Identificador único do dispositivo
```

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- MongoDB rodando localmente ou URI do MongoDB Atlas
- Chave de API da Anthropic (https://console.anthropic.com)

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/esancode/lontra.git
cd lontra

# Instalar dependências de ambos
npm install --prefix backend
npm install --prefix frontend

# Configurar variáveis de ambiente do backend
cp backend/.env.example backend/.env
# Editar backend/.env com suas credenciais reais

# Rodar backend e frontend juntos
npm run dev
```

O app estará disponível em: `http://localhost:5173`  
A API estará em: `http://localhost:5000/api`

### Rodar em separado

```bash
# Backend
cd backend && npm run dev

# Frontend (outro terminal)
cd frontend && npm run dev
```

## Isolamento de dados

Cada dispositivo/navegador recebe um **UUID único** gerado automaticamente no `localStorage`. Esse ID é enviado em todas as requisições via header `x-device-id`, garantindo que cada pessoa veja apenas suas próprias notas. Não é necessário criar conta ou fazer login.

## Variáveis de ambiente

Veja `backend/.env.example` para a lista completa de variáveis necessárias.

## Licença

MIT — © 2026 esancode
