import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Icon } from '@iconify/react';

const StatusBar = ({ editor }) => {
  const { saveStatus } = useAppStore();

  if (!editor) return null;

  const stats = editor.storage.characterCount || { characters: () => 0, words: () => 0 };
  const characters = stats.characters();
  const words = stats.words();

  const getStatusIcon = () => {
    switch (saveStatus) {
      case 'saving': return <Icon icon="lucide:loader-2" className="animate-spin text-[var(--accent-blue)]" />;
      case 'saved': return <Icon icon="lucide:check-circle-2" className="text-[var(--accent-green)]" />;
      case 'error': return <Icon icon="lucide:alert-circle" className="text-[var(--accent-red)]" />;
      default: return null;
    }
  };

  const getStatusText = () => {
    switch (saveStatus) {
      case 'saving': return 'Salvando...';
      case 'saved': return 'Salvo';
      case 'error': return 'Erro ao salvar';
      default: return '';
    }
  };

  return (
    <div className="status-bar-container h-[36px] bg-[var(--bg-secondary)] border-t border-[var(--border-default)] px-4 flex items-center justify-between text-[11px] font-[family:var(--font-ui)] text-[var(--text-muted)] select-none z-[60]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-[var(--text-secondary)]">{words}</span>
          <span>palavras</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-[var(--text-secondary)]">{characters}</span>
          <span>caracteres</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {getStatusIcon()}
          <span className={`font-medium transition-colors ${saveStatus === 'error' ? 'text-[var(--accent-red)]' : 'text-[var(--text-secondary)]'}`}>
            {getStatusText()}
          </span>
        </div>
        <div className="w-[1px] h-3 bg-[var(--border-muted)]" />
        <div className="flex items-center gap-1.5">
          <Icon icon="lucide:keyboard" className="text-[var(--text-muted)] mt-0.5" />
          <span>Markdown Ativo</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
