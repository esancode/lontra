import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, RotateCcw, X, History } from 'lucide-react';
import api from '../../lib/axios';

interface Version {
  _id: string;
  createdAt: string;
  title: string;
  content: any;
}

interface VersionHistoryDrawerProps {
  noteId: string;
  onRestore: (content: any) => void;
  onClose: () => void;
}

const VersionHistoryDrawer: React.FC<VersionHistoryDrawerProps> = ({ noteId, onRestore, onClose }) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const res = await api.get(`/notes/${noteId}/history`);
        setVersions(res.data);
      } catch (err) {
        console.error('Falha ao buscar versões', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVersions();
  }, [noteId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  };

  const formatRelative = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}min atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-[4px] z-[1999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-y-0 right-0 w-[340px] bg-[var(--bg-secondary)]/95 backdrop-blur-xl border-l border-[var(--border-default)] shadow-[0_0_60px_rgba(0,0,0,0.4)] z-[2000] flex flex-col"
        initial={{ x: 340 }}
        animate={{ x: 0 }}
        exit={{ x: 340 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="flex items-center justify-between px-5 h-[56px] border-b border-[var(--border-muted)]">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-[var(--radius-md)] bg-[var(--accent-blue-subtle)]">
              <History size={14} className="text-[var(--accent-blue)]" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-[var(--text-primary)]">Histórico</h2>
              <p className="text-[10px] text-[var(--text-muted)]">{versions.length} versões salvas</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-[var(--radius-md)] hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
          {loading ? (
            <div className="py-20 text-center">
              <span className="loading loading-spinner loading-md text-[var(--accent-blue)]"></span>
              <p className="text-[12px] text-[var(--text-muted)] mt-4">Buscando versões...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="py-20 text-center px-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--bg-tertiary)] mx-auto mb-4">
                <Clock size={24} className="text-[var(--text-muted)] opacity-40" />
              </div>
              <p className="text-[13px] text-[var(--text-muted)] font-medium">Nenhuma versão anterior</p>
              <p className="text-[11px] text-[var(--text-muted)] opacity-60 mt-1">Versões são criadas automaticamente ao editar.</p>
            </div>
          ) : (
            versions.map((v, i) => (
              <motion.div 
                key={v._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                className="group p-3.5 bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-[var(--radius-lg)] hover:border-[var(--accent-blue)] transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)] opacity-60" />
                    <span className="text-[11px] font-[family:var(--font-mono)] text-[var(--text-secondary)]">
                      {formatDate(v.createdAt)}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] opacity-60">
                    {formatRelative(v.createdAt)}
                  </span>
                </div>
                <div className="text-[13px] text-[var(--text-primary)] font-medium truncate mb-3">
                  {v.title || 'Sem título'}
                </div>
                <button
                  type="button"
                  onClick={() => onRestore(v.content)}
                  className="flex items-center gap-1.5 px-3 py-1.5 w-full justify-center bg-[var(--bg-tertiary)] hover:bg-[var(--accent-blue)] text-[var(--text-secondary)] hover:text-white rounded-[var(--radius-md)] text-[11px] font-semibold transition-all opacity-0 group-hover:opacity-100"
                >
                  <RotateCcw size={11} /> Restaurar esta versão
                </button>
              </motion.div>
            ))
          )}
        </div>

        <div className="px-5 py-3 border-t border-[var(--border-muted)] text-[10px] text-[var(--text-muted)] text-center opacity-60">
          Snapshots criados automaticamente
        </div>
      </motion.div>
    </>
  );
};

export default VersionHistoryDrawer;
