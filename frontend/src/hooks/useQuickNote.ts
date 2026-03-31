import { useState, useCallback, useEffect } from 'react';
import api from '../lib/axios';
import { useAppStore } from '../store/useAppStore';

const HISTORY_KEY = 'lontra_quick_notes_history';
const MAX_HISTORY = 10;

export function useQuickNote() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalState, setModalState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      setHistory([]);
    }
  }, []);

  const addToHistory = useCallback((entry: any) => {
    setHistory((prev: any[]) => {
      const next = [{ ...entry, createdAt: new Date().toISOString() }, ...prev].slice(0, MAX_HISTORY);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [notesRes, boxesRes] = await Promise.all([api.get('/notes'), api.get('/boxes')]);
      useAppStore.setState({ notes: notesRes.data, boxes: boxesRes.data });
    } catch {}
  }, []);

  const open = useCallback(() => {
    setModalState('idle');
    setResult(null);
    setError(null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setModalState('idle');
      setResult(null);
      setError(null);
    }, 200);
  }, []);

  const process = useCallback(async (rawText: string) => {
    if (!rawText.trim()) return;
    setModalState('loading');
    setError(null);

    try {
      const { data } = await api.post('/quick-note', { rawText });

      if (data.fallback) {
        setError(data.error || 'IA indisponível. Sua anotação foi salva como rascunho.');
        setResult(data);
        setModalState('error');
        addToHistory({ noteId: data.noteId, noteTitle: data.noteTitle, noteIcon: data.noteIcon, notePath: data.notePath });
      } else {
        setResult(data);
        setModalState('success');
        addToHistory({ noteId: data.noteId, noteTitle: data.noteTitle, noteIcon: data.noteIcon, notePath: data.notePath });
      }
      await refreshData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro desconhecido ao processar a nota.';
      setError(msg);
      setModalState('error');
    }
  }, [addToHistory, refreshData]);

  return { isOpen, modalState, result, error, history, open, close, process };
}
