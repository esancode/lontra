import Note from '../models/Note.js';
import Box from '../models/Box.js';

export const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json({ results: [] });
    }

    const term = q.trim();
    const cleanTerm = term.replace(/#/g, '');
    const regex = new RegExp(cleanTerm, 'i');
    const ownerId = req.ownerId;

    const notesByTitle = await Note.find({
      ownerId,
      $or: [
        { title: { $regex: regex } },
        { tags: { $regex: regex } }
      ]
    }).limit(10).lean();

    let notesByContent = [];
    try {
      notesByContent = await Note.find(
        { ownerId, $text: { $search: term } },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } }).limit(10).lean();
    } catch (e) {
      console.warn('Índice $text não pronto ainda, usando fallback regex.', e.code);
    }

    const noteMap = new Map();
    notesByTitle.forEach(n => noteMap.set(n._id.toString(), n));
    notesByContent.forEach(n => noteMap.set(n._id.toString(), n));

    const boxesByName = await Box.find({ ownerId, name: { $regex: regex } }).limit(5).lean();

    const results = [];

    boxesByName.forEach(b => {
      results.push({
        _id: b._id.toString(),
        type: 'box',
        title: b.name,
        matchFragment: 'Pasta / Caixa'
      });
    });

    const extractTextPreview = (note, searchTerm) => {
      if (!note.content) return 'Cartão com correspondência de pesquisa...';
      try {
        const flatText = JSON.stringify(note.content).replace(/["'{}[\]:a-zA-Z_$0-9]*text["':\s]+/g, '').substring(0, 1000);
        const idx = flatText.toLowerCase().indexOf(searchTerm.toLowerCase());
        if (idx !== -1) {
          const start = Math.max(0, idx - 20);
          const end = Math.min(flatText.length, idx + searchTerm.length + 20);
          const snippet = flatText.substring(start, end);
          return (start > 0 ? '...' : '') + snippet.replace(/\\/g, '') + '...';
        }
        return 'Correspondência encontrada no conteúdo...';
      } catch (e) {
        return 'Correspondência encontrada...';
      }
    };

    Array.from(noteMap.values()).forEach(n => {
      const matchInTitle = regex.test(n.title);
      const matchInTag = n.tags && n.tags.some(tag => regex.test(tag));

      const snippet = matchInTitle ? 'Correspondência no Título'
        : (matchInTag ? 'Correspondência nas Tags' : extractTextPreview(n, term));

      results.push({
        _id: n._id.toString(),
        type: 'note',
        title: n.title,
        icon: n.icon || 'lucide:file-text',
        matchFragment: snippet
      });
    });

    res.json({ results });
  } catch (error) {
    console.error('Global Search Error:', error);
    res.status(500).json({ message: 'Erro de servidor na pesquisa.' });
  }
};
