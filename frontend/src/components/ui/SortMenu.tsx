import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, Clock, CalendarHeart, ArrowDownAZ, ArrowUpZA, LucideIcon } from 'lucide-react';

interface SortOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface SortMenuProps {
  currentSort: string;
  onSortChange: (val: string) => void;
}

const SortMenu: React.FC<SortMenuProps> = ({ currentSort, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
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
    }
  }, [isOpen]);

  const selectSort = (val: string) => {
    onSortChange(val);
    setIsOpen(false);
  };

  const options: SortOption[] = [
    { value: 'created_desc', label: 'Último criado', icon: CalendarHeart },
    { value: 'updated_desc', label: 'Último modificado', icon: Clock },
    { value: 'name_asc', label: 'Nome A → Z', icon: ArrowDownAZ },
    { value: 'name_desc', label: 'Nome Z → A', icon: ArrowUpZA },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-1.5 bg-transparent text-[var(--text-secondary)] border border-[var(--border-default)] h-[28px] px-2 sm:px-3 text-[length:var(--text-sm)] rounded-[var(--radius-sm)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all'
        title="Ordenar listagem"
      >
         <ArrowUpDown size={14} />
         <span className="text-xs hidden sm:inline">Ordenar</span>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-[calc(100%+8px)] w-[200px] bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-[0_8px_24px_rgba(0,0,0,0.3)] z-[1000] py-1 pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-[var(--border-default)] mb-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] font-bold">Classificar por</span>
          </div>

          {options.map(opt => (
            <button 
              key={opt.value}
              onClick={() => selectSort(opt.value)}
              className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors relative"
            >
              <opt.icon size={14} className={currentSort === opt.value ? 'text-[var(--accent-blue)]' : 'opacity-70'} />
              <span className={currentSort === opt.value ? 'font-medium text-[var(--accent-blue)]' : ''}>
                {opt.label}
              </span>
              {currentSort === opt.value && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--accent-blue)] rounded-r" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortMenu;
