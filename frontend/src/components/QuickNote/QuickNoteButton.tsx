import React from 'react';
import { Zap } from 'lucide-react';

interface QuickNoteButtonProps {
  onClick: () => void;
}

const QuickNoteButton: React.FC<QuickNoteButtonProps> = ({ onClick }) => {
  return (
    <button
      id="quick-note-fab"
      onClick={onClick}
      title="Nota Rápida · Ctrl+Shift+N"
      className="hidden sm:flex fixed items-center justify-center z-[500] transition-all duration-120 active:scale-95"
      style={{
        bottom: 24,
        right: 24,
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'var(--accent-blue)',
        boxShadow: '0 4px 16px rgba(56,139,253,0.45)',
        color: '#fff',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
      }}
    >
      <Zap size={20} />
    </button>
  );
};

export default QuickNoteButton;
