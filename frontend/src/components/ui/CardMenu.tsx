import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, FolderInput, Trash2 } from 'lucide-react';

interface CardMenuProps {
  onRename?: () => void;
  onMove?: () => void;
  onDelete?: () => void;
  isBox?: boolean;
  className?: string;
}

const CardMenu: React.FC<CardMenuProps> = ({ 
  onRename, 
  onMove, 
  onDelete, 
  isBox = false, 
  className = "absolute bottom-3 right-3" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const closeAndCall = (fn?: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    fn && fn();
  };

  return (
    <div className={`${className} z-[50]`} ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`p-1.5 rounded-[var(--radius-sm)] transition-all duration-200 hover:bg-[var(--bg-tertiary)] hover:shadow-sm hover:scale-110 active:scale-95
          ${isOpen ? 'bg-[var(--bg-tertiary)] opacity-100 shadow-sm scale-110' : 'opacity-0 group-hover:opacity-100'} 
          text-[var(--text-secondary)] hover:text-[var(--text-primary)]`}
        title="Opções"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 bottom-full mb-1 min-w-[180px] bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-[0_8px_24px_rgba(0,0,0,0.3)] z-[1000] py-1 pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          <button 
            type="button"
            onClick={closeAndCall(onRename)}
            className="w-full text-left px-3 py-1 flex items-center gap-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <Edit2 size={14} className="opacity-70" />
            Renomear
          </button>
          
          <button 
            type="button"
            onClick={closeAndCall(onMove)}
            className="w-full text-left px-3 py-1 flex items-center gap-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <FolderInput size={14} className="opacity-70" />
            Mover para...
          </button>
          
          <div className="h-[1px] bg-[var(--border-active)] opacity-50 my-1 mx-1" />
          
          <button 
            type="button"
            onClick={closeAndCall(onDelete)}
            className="w-full text-left px-3 py-1 flex items-center gap-2 text-sm text-[var(--text-primary)] hover:bg-[var(--accent-red-subtle)] hover:text-[var(--accent-red)] transition-colors group/delete"
          >
            <Trash2 size={14} className="opacity-70 group-hover/delete:opacity-100" />
            {isBox ? 'Deletar caixa' : 'Deletar'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CardMenu;
