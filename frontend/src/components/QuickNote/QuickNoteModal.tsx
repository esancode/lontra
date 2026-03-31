import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Zap, X, Sparkles, CheckCircle, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router';
import { useAppStore } from '../../store/useAppStore';

const LOADING_STEPS = [
  'Lendo sua anotação...',
  'Formatando o conteúdo...',
  'Escolhendo o melhor lugar para salvar...',
  'Salvando a nota...',
];

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'agora mesmo';
  if (minutes < 60) return `há ${minutes} min`;
  if (hours < 24) return `há ${hours}h`;
  if (days === 1) return 'ontem';
  return `há ${days} dias`;
}

interface QuickNoteModalProps {
  isOpen: boolean;
  modalState: 'idle' | 'loading' | 'success' | 'error';
  result: any;
  error: string | null;
  history: any[];
  onClose: () => void;
  onProcess: (text: string) => void;
}

const QuickNoteModal: React.FC<QuickNoteModalProps> = ({
  isOpen,
  modalState,
  result,
  error,
  history,
  onClose,
  onProcess,
}) => {
  const navigate = useNavigate();
  const { setSelectedBoxId } = useAppStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [rawText, setRawText] = useState('');
  const [activeTab, setActiveTab] = useState<'write' | 'recent'>('write');
  const [countdown, setCountdown] = useState(5);
  const [loadingStep, setLoadingStep] = useState(0);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalState === 'idle') {
      setRawText('');
      setActiveTab('write');
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [isOpen, modalState]);

  useEffect(() => {
    if (modalState !== 'loading') { setLoadingStep(0); return; }
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, [modalState]);

  useEffect(() => {
    if (modalState !== 'success') { setCountdown(5); return; }
    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { onClose(); return 5; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [modalState, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && modalState === 'idle') {
        e.preventDefault();
        if (rawText.trim()) onProcess(rawText);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose, modalState, rawText, onProcess]);

  const goToNote = useCallback((noteId: string, notePath: any[]) => {
    const boxes = notePath.filter(p => p.type === 'box');
    if (boxes.length > 0) {
      setSelectedBoxId(boxes[boxes.length - 1].id);
    } else {
      setSelectedBoxId(null);
    }
    navigate(`/note/${noteId}`);
    onClose();
  }, [navigate, setSelectedBoxId, onClose]);

  if (!isOpen) return null;

  const charCount = rawText.length;
  const charColor = charCount > 3800 ? 'var(--accent-red)' : 'var(--text-muted)';

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div
        className="w-full max-w-[600px] animate-in fade-in zoom-in-95 duration-150"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-muted)]">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[var(--accent-blue)]" />
            <span className="font-mono text-sm text-[var(--text-primary)] font-medium">Nota Rápida</span>
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--accent-blue-subtle)', color: 'var(--accent-blue)' }}
            >
              IA
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-[var(--bg-tertiary)] rounded-[var(--radius-sm)] p-0.5">
              <button
                className={`text-xs px-2.5 py-1 rounded-[var(--radius-sm)] transition-colors font-mono ${activeTab === 'write' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                onClick={() => setActiveTab('write')}
              >
                Escrever
              </button>
              <button
                className={`text-xs px-2.5 py-1 rounded-[var(--radius-sm)] transition-colors font-mono flex items-center gap-1 ${activeTab === 'recent' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                onClick={() => setActiveTab('recent')}
              >
                <Clock size={11} />
                Recentes
                {history.length > 0 && (
                  <span className="text-[9px] bg-[var(--accent-blue)] text-white rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                    {Math.min(history.length, 9)}
                  </span>
                )}
              </button>
            </div>
            <button
              onClick={onClose}
              className="size-6 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {activeTab === 'recent' ? (
          <div className="p-3 min-h-[200px]">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] gap-2">
                <Clock size={24} className="text-[var(--text-muted)]" />
                <p className="text-sm text-[var(--text-muted)]">Nenhuma nota rápida ainda</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {history.map((item: any, idx: number) => (
                  <button
                    key={idx}
                    className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-[var(--radius-sm)] hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                    onClick={() => goToNote(item.noteId, item.notePath)}
                  >
                    {item.noteIcon && (
                      <Icon icon={item.noteIcon} width={18} height={18} className="shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--text-primary)] truncate font-medium">{item.noteTitle}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        {item.notePath?.filter((p: any) => p.type === 'box').map((p: any) => p.name).join(' / ')}
                      </p>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] shrink-0 font-mono">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                    <ChevronRight size={12} className="text-[var(--text-muted)] shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : modalState === 'idle' ? (
          <>
            <div className="p-4">
              <textarea
                ref={textareaRef}
                value={rawText}
                onChange={e => setRawText(e.target.value.slice(0, 4000))}
                placeholder={`Joga tudo aqui. Pode ser bagunçado.\n\nex: bug no middleware de auth linha 47, token expira\nantes do esperado talvez o refresh nao ta funcionando\nno controller de usuarios tem um forEach que deveria\nser um map, revisar depois. relacionado com o PR #234`}
                className="w-full resize-y text-sm leading-relaxed outline-none"
                style={{
                  minHeight: 200,
                  maxHeight: 400,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                  fontFamily: 'var(--font-ui)',
                  color: 'var(--text-primary)',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent-blue)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-muted)')}
              />
            </div>
            <div
              className="flex items-center justify-between px-4 pb-3"
              style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '12px' }}
            >
              <span className="text-xs font-mono" style={{ color: charColor }}>
                {charCount} / 4000
                {charCount > 3800 && <span className="ml-1">— limite próximo!</span>}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="text-sm px-3 py-1.5 rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => onProcess(rawText)}
                  disabled={!rawText.trim()}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-[var(--radius-sm)] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'var(--accent-blue)', color: '#fff' }}
                  title="Ctrl+Enter"
                >
                  <Sparkles size={14} />
                  Organizar com IA
                </button>
              </div>
            </div>
          </>
        ) : modalState === 'loading' ? (
          <div
            className="flex flex-col items-center justify-center gap-4 m-4"
            style={{
              minHeight: 200,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-muted)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <Sparkles
              size={32}
              className="text-[var(--accent-blue)]"
              style={{ animation: 'spin 2s linear infinite' }}
            />
            <div className="flex flex-col items-center gap-1">
              <p
                className="text-sm font-mono text-[var(--text-primary)] transition-all duration-500"
                key={loadingStep}
              >
                {LOADING_STEPS[loadingStep]}
              </p>
              <div className="flex gap-1 mt-2">
                {LOADING_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="h-1 rounded-full transition-all duration-500"
                    style={{
                      width: i <= loadingStep ? 20 : 6,
                      background: i <= loadingStep ? 'var(--accent-blue)' : 'var(--border-muted)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : modalState === 'success' && result ? (
          <div className="p-6 flex flex-col items-center gap-4">
            <CheckCircle size={40} className="text-[var(--accent-green)]" />
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="font-mono text-lg font-semibold text-[var(--text-primary)]">Nota organizada!</p>
              <p className="text-xs text-[var(--text-muted)]">Salva em:</p>
              <div className="flex items-center flex-wrap justify-center gap-1 text-xs max-w-[420px]">
                {result.notePath.map((item: any, idx: number) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <ChevronRight size={12} className="text-[var(--text-muted)]" />}
                    <button
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
                      style={{ color: item.type === 'note' ? 'var(--accent-blue)' : 'var(--text-secondary)' }}
                      onClick={() => item.type === 'note' && goToNote(item.id, result.notePath)}
                    >
                      {result.noteIcon && item.type === 'note' && (
                        <Icon icon={result.noteIcon} width={14} height={14} />
                      )}
                      {item.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => goToNote(result.noteId, result.notePath)}
                className="flex items-center gap-2 text-sm px-4 py-1.5 rounded-[var(--radius-sm)] font-medium"
                style={{ background: 'var(--accent-blue)', color: '#fff' }}
              >
                Ver nota
              </button>
              <button onClick={onClose} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                Fechar
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-mono">Fechando em {countdown}s</p>
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center gap-3 text-center">
            <AlertCircle size={32} className="text-[var(--accent-red)]" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Não foi possível organizar agora.</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {result ? 'Sua anotação foi salva como rascunho em "Rascunhos".' : (error || 'Erro desconhecido.')}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {result && (
                <button
                  onClick={() => goToNote(result.noteId, result.notePath)}
                  className="text-sm px-3 py-1.5 rounded-[var(--radius-sm)]"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  Ver rascunho
                </button>
              )}
              <button
                onClick={() => setActiveTab('write')}
                className="text-sm px-3 py-1.5 rounded-[var(--radius-sm)] font-medium"
                style={{ background: 'var(--accent-blue)', color: '#fff' }}
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default QuickNoteModal;
