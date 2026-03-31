import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { FileText, Folder } from 'lucide-react';

interface WikiMenuProps {
  query: string;
  onSelect: (item: { id: string; title: string; type: 'note' | 'box' }) => void;
  onClose: () => void;
}

export interface WikiMenuHandle {
  onKeyDown: (props: { event: any }) => boolean;
}

const WikiMenu = forwardRef<WikiMenuHandle, WikiMenuProps>(({ query, onSelect, onClose }, ref) => {
  const { notes, boxes } = useAppStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const allItems = [
    ...boxes.map(b => ({ id: b._id, title: b.name || 'Nova Caixa', type: 'box' as const })),
    ...notes.map(n => ({ id: n._id, title: n.title || 'Novo Cartão', type: 'note' as const }))
  ];

  const filtered = allItems.filter(item => 
    (item.title || '').toLowerCase().includes((query || '').toLowerCase())
  ).slice(0, 25);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex(prev => (prev + filtered.length - 1) % filtered.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex(prev => (prev + 1) % filtered.length);
        return true;
      }
      if (event.key === 'Enter') {
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex]);
        }
        return true;
      }
      return false;
    }
  }));

  if (filtered.length === 0) return null;

  return (
    <div 
      ref={menuRef}
      className="wiki-menu bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[0_12px_40px_rgba(0,0,0,0.4)] w-[300px] max-h-[380px] overflow-y-auto scrollbar-none p-1.5 z-[1000] animate-in fade-in zoom-in-95 duration-150 relative"
    >
      <div className="sticky top-0 bg-[var(--bg-secondary)] pb-1.5 mb-1.5 px-2 py-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-muted)] flex items-center gap-2 z-10">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)] opacity-80" />
        Vincular a...
        <span className="ml-auto opacity-50 text-[10px] font-normal lowercase">Enter para selecionar</span>
      </div>
      {filtered.map((item, idx) => {
        const isSelected = idx === selectedIndex;
        return (
          <button
            key={`${item.type}-${item.id}`}
            type="button"
            onClick={() => onSelect(item)}
            className={`flex items-center w-full gap-3 px-3 py-2 text-left rounded-[var(--radius-md)] transition-all ${
              isSelected 
                ? 'bg-[var(--accent-blue-subtle)] border-l-2 border-[var(--accent-blue)]' 
                : 'hover:bg-[var(--bg-tertiary)] border-l-2 border-transparent'
            }`}
          >
            <div className={`flex items-center justify-center w-7 h-7 rounded-[var(--radius-sm)] flex-shrink-0 ${isSelected ? 'bg-blue-500/20 text-[var(--accent-blue)]' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] shadow-sm'}`}>
              {item.type === 'box' ? (
                <Folder size={14} className={isSelected ? 'text-[var(--accent-blue)]' : ''} />
              ) : (
                <FileText size={14} className={isSelected ? 'text-[var(--accent-blue)]' : ''} />
              )}
            </div>
            <span className={`text-[13px] truncate ${isSelected ? 'text-[var(--accent-blue)] font-medium' : 'text-[var(--text-primary)]'}`}>
              {item.title}
            </span>
          </button>
        );
      })}
    </div>
  );
});

export default WikiMenu;
