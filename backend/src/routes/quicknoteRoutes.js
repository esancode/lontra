import express from 'express';
import { processQuickNote } from '../services/aiService.js';
import { saveDraft, saveNote, getUserBoxStructure } from '../services/archiveService.js';
import Note from '../models/Note.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { rawText } = req.body;
  const ownerId = req.ownerId;

  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return res.status(400).json({ message: 'rawText é obrigatório e não pode ser vazio.' });
  }

  if (rawText.length > 4000) {
    return res.status(400).json({ message: 'Texto muito longo. Máximo 4000 caracteres.' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({
      message: 'A chave de API da Anthropic não está configurada. Adicione ANTHROPIC_API_KEY ao .env do servidor.',
      code: 'API_KEY_MISSING',
    });
  }

  let draftInfo = null;

  try {
    draftInfo = await saveDraft(rawText.trim(), ownerId);

    const userBoxStructure = await getUserBoxStructure(ownerId);

    const aiResult = await processQuickNote(rawText.trim(), userBoxStructure);

    const result = await saveNote(aiResult, ownerId);

    await Note.deleteOne({ _id: draftInfo.draftId, ownerId });

    return res.status(201).json(result);

  } catch (error) {
    console.error('[QuickNote] Erro:', error.message);

    if (draftInfo) {
      return res.status(200).json({
        fallback: true,
        noteId: draftInfo.draftId,
        noteTitle: 'Rascunho',
        noteIcon: 'vscode-icons:default-file',
        notePath: [
          { id: draftInfo.draftBoxId, name: 'Rascunhos', type: 'box' },
          { id: draftInfo.draftId, name: 'Rascunho', type: 'note' },
        ],
        error: error.message,
      });
    }

    return res.status(500).json({ message: 'Erro interno ao processar a nota rápida.', error: error.message });
  }
});

export default router;
