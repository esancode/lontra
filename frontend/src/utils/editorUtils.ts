/**
 * Conta iterativamente o texto de uma Tiptap JSON Document
 */
export function extractTextFromJSON(json: any): string {
  if (!json) return '';
  let text = '';

  if (json.type === 'text' && json.text) {
    text += json.text;
  }

  if (json.attrs && json.attrs.title) {
    text += ' ' + json.attrs.title; // For WikiLinks
  }

  if (json.content && Array.isArray(json.content)) {
    json.content.forEach((child: any) => {
      text += ' ' + extractTextFromJSON(child);
    });
  }

  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Extrai hashtags válidas do conteúdo de texto extraído
 * Retorna tags minúsculas e exclusivas (sem o #)
 */
export function extractTagsFromText(text: string): string[] {
  // Regex match words starting with #, followed by alphanumerics/hyphens
  // Lookbehind for whitespace or start of string to avoid matching URLs or mid-word hashes
  const tagRegex = /(?:^|\s)#([\w-]+)(?=\s|$)/g;
  const matches = [...text.matchAll(tagRegex)];
  
  const tags = matches.map(m => m[1].toLowerCase());
  return Array.from(new Set(tags));
}
