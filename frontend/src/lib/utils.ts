export function formatDate(data: string | number | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(data));
}

/**
 * Extracts plain text preview from a TipTap JSON document.
 * @param {any} doc - TipTap JSON content object
 * @param {number} maxLength - Maximum characters to return
 * @returns {string}
 */
export function extractPreview(doc: any, maxLength: number = 110): string {
  if (!doc || !doc.content) return '';
  const texts: string[] = [];

  const traverse = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.type === 'text' && node.text) {
        texts.push(node.text);
      }
      if (node.content && node.content.length > 0) {
        traverse(node.content);
      }
      if (texts.join('').length >= maxLength) break;
    }
  };

  traverse(doc.content);
  const full = texts.join(' ').replace(/\s+/g, ' ').trim();
  return full.length > maxLength ? full.slice(0, maxLength) + '…' : full;
}