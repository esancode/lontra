import React from 'react';
import { Icon } from '@iconify/react';

interface HomeEmptyStateProps {
  onBoxCreate: () => void;
  onNoteCreate: () => void;
}

const HomeEmptyState: React.FC<HomeEmptyStateProps> = ({ onBoxCreate, onNoteCreate }) => {
  return (
    <div className='absolute inset-0 flex flex-col items-center justify-center opacity-40 select-none'>
      <div className='w-24 h-24 mb-6 rounded-3xl bg-[var(--bg-tertiary)] flex items-center justify-center shadow-inner border border-[var(--border-default)]'>
        <Icon icon="lucide:folder-open" className='w-10 h-10 text-[var(--text-muted)]' />
      </div>
      <p className='text-[length:var(--text-lg)] font-medium text-[var(--text-secondary)] tracking-tight'>Nada por aqui</p>
      <p className='text-[length:var(--text-sm)] text-[var(--text-muted)] mt-1 max-w-xs text-center leading-relaxed'>
        Comece criando uma nova caixa ou escreva um cartão de nota livremente
      </p>
      <div className="mt-6 flex gap-3">
        <button 
          onClick={onBoxCreate}
          className="text-[length:var(--text-xs)] px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border-default)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          + Nova Caixa
        </button>
        <button 
          onClick={onNoteCreate}
          className="text-[length:var(--text-xs)] px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--accent-blue)] text-[var(--text-on-accent)] hover:brightness-110 transition-colors"
        >
          + Novo Cartão
        </button>
      </div>
    </div>
  );
};

export default HomeEmptyState;
