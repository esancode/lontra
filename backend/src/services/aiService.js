import Anthropic from '@anthropic-ai/sdk';

const VALID_ICONS = [
  'vscode-icons:file-type-js-official',
  'vscode-icons:file-type-typescript',
  'vscode-icons:file-type-reactjs',
  'vscode-icons:file-type-reactts',
  'vscode-icons:file-type-python',
  'vscode-icons:file-type-rust',
  'vscode-icons:file-type-go',
  'vscode-icons:file-type-java',
  'vscode-icons:file-type-kotlin',
  'vscode-icons:file-type-csharp',
  'vscode-icons:file-type-cpp',
  'vscode-icons:file-type-html',
  'vscode-icons:file-type-css',
  'vscode-icons:file-type-scss',
  'vscode-icons:file-type-json',
  'vscode-icons:file-type-yaml',
  'vscode-icons:file-type-docker',
  'vscode-icons:file-type-markdown',
  'vscode-icons:file-type-git',
  'vscode-icons:file-type-shell',
  'vscode-icons:file-type-sql',
  'vscode-icons:file-type-graphql',
  'vscode-icons:file-type-dart',
  'vscode-icons:file-type-lua',
  'vscode-icons:default-file',
];

const SYSTEM_PROMPT = `Você é o assistente de organização de notas do app Lontra, uma ferramenta para desenvolvedores.

Sua função é receber texto bruto de um desenvolvedor e transformá-lo numa nota bem organizada, escolher onde arquivá-la e definir seu ícone de linguagem.

REGRAS ABSOLUTAS:
1. Responda SOMENTE com JSON válido. Nenhum texto antes ou depois. Nenhum bloco de markdown. JSON puro.
2. O campo "content" deve ser um documento TipTap válido
3. Use os blocos TipTap exatos listados abaixo
4. Corrija TODOS os erros ortográficos e gramaticais
5. Mantenha 100% do conteúdo original — não invente informações, apenas organize o que existe
6. O título deve ser curto, técnico e preciso

BLOCOS TIPTAP DISPONÍVEIS (use apenas estes):

Parágrafo:
{ "type": "paragraph", "content": [{ "type": "text", "text": "..." }] }

Título H2:
{ "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "..." }] }

Título H3:
{ "type": "heading", "attrs": { "level": 3 }, "content": [{ "type": "text", "text": "..." }] }

Bloco de código:
{ "type": "codeBlock", "attrs": { "language": "javascript" }, "content": [{ "type": "text", "text": "..." }] }

Bullet list:
{ "type": "bulletList", "content": [{ "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "..." }] }] }] }

Numbered list:
{ "type": "orderedList", "content": [{ "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "..." }] }] }] }

Task list (checklist):
{ "type": "taskList", "content": [{ "type": "taskItem", "attrs": { "checked": false }, "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "..." }] }] }] }

Blockquote:
{ "type": "blockquote", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "..." }] }] }

Callout de aviso:
{ "type": "callout", "attrs": { "type": "warning" }, "content": [{ "type": "text", "text": "..." }] }

Callout de informação:
{ "type": "callout", "attrs": { "type": "info" }, "content": [{ "type": "text", "text": "..." }] }

Callout de erro/bug:
{ "type": "callout", "attrs": { "type": "error" }, "content": [{ "type": "text", "text": "..." }] }

Callout de sucesso:
{ "type": "callout", "attrs": { "type": "success" }, "content": [{ "type": "text", "text": "..." }] }

Divisor:
{ "type": "horizontalRule" }

Texto com formatação inline (bold, italic, code):
{ "type": "text", "text": "...", "marks": [{ "type": "bold" }] }
{ "type": "text", "text": "...", "marks": [{ "type": "code" }] }
{ "type": "text", "text": "...", "marks": [{ "type": "italic" }] }

ÍCONES DISPONÍVEIS (usar exatamente este formato):
"vscode-icons:file-type-js-official"   → JavaScript
"vscode-icons:file-type-typescript"    → TypeScript
"vscode-icons:file-type-reactjs"       → React / JSX
"vscode-icons:file-type-reactts"       → React TypeScript
"vscode-icons:file-type-python"        → Python
"vscode-icons:file-type-rust"          → Rust
"vscode-icons:file-type-go"            → Go / Golang
"vscode-icons:file-type-java"          → Java
"vscode-icons:file-type-kotlin"        → Kotlin
"vscode-icons:file-type-csharp"        → C#
"vscode-icons:file-type-cpp"           → C++
"vscode-icons:file-type-html"          → HTML
"vscode-icons:file-type-css"           → CSS
"vscode-icons:file-type-scss"          → SCSS / Sass
"vscode-icons:file-type-sql"           → SQL / Banco de dados
"vscode-icons:file-type-json"          → JSON / Config
"vscode-icons:file-type-yaml"          → YAML / Docker Compose
"vscode-icons:file-type-docker"        → Docker / Container
"vscode-icons:file-type-markdown"      → Markdown / Docs
"vscode-icons:file-type-git"           → Git / Versionamento
"vscode-icons:file-type-shell"         → Shell / Bash / Terminal
"vscode-icons:file-type-graphql"       → GraphQL
"vscode-icons:file-type-dart"          → Dart / Flutter
"vscode-icons:file-type-lua"           → Lua
"vscode-icons:default-file"            → Geral / Outro

CRITÉRIOS DE FORMATAÇÃO:
- Use callout "error" para erros, bugs e problemas
- Use callout "warning" para avisos e pontos de atenção
- Use callout "info" para dicas e observações gerais
- Use callout "success" para soluções e conquistas
- Use bloco de código para qualquer trecho de código ou referências a arquivos/funções/variáveis
- Use checklist para tarefas a fazer ou itens a revisar
- Use bullet list para listas de conceitos ou observações sem ordem lógica
- Use numbered list para etapas sequenciais ou prioridades
- Use tabela quando houver comparações ou múltiplos campos estruturados
- Use títulos H2 para separar seções distintas dentro de um mesmo tema
- Use títulos H3 para subseções
- Textos curtos (< 3 itens) não precisam de lista — use parágrafo com inline bold/italic
- Código inline (nome de função, variável) → mark "code", não bloco de código

CRITÉRIOS DE ARQUIVAMENTO:
Analise o conteúdo e o nome de cada caixa disponível.
Escolha a caixa cujo nome e contexto mais se relaciona com o assunto da nota.
Se nenhuma caixa existente for adequada, sugira criar uma nova.
Pode sugerir criar caixa dentro de caixa existente quando fizer sentido contextual.
Se não há caixas disponíveis, criar uma nova baseada no contexto do conteúdo.`;

function buildUserPrompt(rawText, userBoxStructure) {
  return `TEXTO BRUTO DO USUÁRIO:
${rawText}

CAIXAS DISPONÍVEIS DO USUÁRIO:
${userBoxStructure.length > 0 
  ? JSON.stringify(userBoxStructure, null, 2) 
  : '[] (usuário não tem caixas criadas — crie uma nova adequada ao conteúdo)'}

Retorne um JSON com esta estrutura exata (nenhum texto fora do JSON):
{
  "title": "título curto e técnico da nota",
  "icon": "vscode-icons:file-type-...",
  "content": {
    "type": "doc",
    "content": [ ...blocos TipTap... ]
  },
  "archiveDecision": {
    "type": "existing",
    "boxId": "id-da-caixa-existente"
  }
}

OU se precisar criar caixa nova na raiz:
{
  ...
  "archiveDecision": {
    "type": "new",
    "boxName": "Nome da Nova Caixa"
  }
}

OU se precisar criar sub-caixa dentro de uma caixa existente:
{
  ...
  "archiveDecision": {
    "type": "nested-new",
    "parentBoxId": "id-da-caixa-pai-existente",
    "boxName": "Nome da Sub-Caixa"
  }
}`;
}

function validateAiResult(parsed) {
  if (!parsed || typeof parsed !== 'object') throw new Error('Resultado não é um objeto');
  if (!parsed.title || typeof parsed.title !== 'string' || !parsed.title.trim()) throw new Error('Campo title inválido');
  if (!parsed.icon || typeof parsed.icon !== 'string') throw new Error('Campo icon inválido');
  if (!VALID_ICONS.includes(parsed.icon)) parsed.icon = 'vscode-icons:default-file';
  if (!parsed.content || parsed.content.type !== 'doc' || !Array.isArray(parsed.content.content)) throw new Error('Campo content inválido');
  if (!parsed.archiveDecision || !['existing', 'new', 'nested-new'].includes(parsed.archiveDecision.type)) throw new Error('archiveDecision inválido');
  return parsed;
}

function tryParseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const cleaned = raw
      .replace(/^```json\n?/i, '')
      .replace(/^```\n?/, '')
      .replace(/```\n?$/, '')
      .trim();
    return JSON.parse(cleaned);
  }
}

export async function processQuickNote(rawText, userBoxStructure) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY não configurada. Acesse https://console.anthropic.com para obter sua chave.');
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(rawText, userBoxStructure) }],
  });

  const raw = response.content[0].text;
  let parsed;

  try {
    parsed = tryParseJson(raw);
  } catch (parseErr) {
    throw new Error(`IA retornou JSON inválido: ${parseErr.message}`);
  }

  return validateAiResult(parsed);
}
