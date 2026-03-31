import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Search, Folder, Home, X } from 'lucide-react';

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName?: string;
  itemType?: 'note' | 'box';
  itemId: string;
  currentParentId?: string | null;
}

const MoveModal: React.FC<MoveModalProps> = ({ 
  isOpen, 
  onClose, 
  itemName, 
  itemType, 
  itemId, 
  currentParentId 
}) => {
  const { boxes, moveNote, moveBox } = useAppStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredBoxes = boxes.filter(box => {
    if (itemType === 'box' && box._id === itemId) return false;
    if (!box.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleMove = async (targetId: string | null) => {
    if (itemType === 'note') {
      await moveNote(itemId, targetId);
    } else if (itemType === 'box') {
      await moveBox(itemId, targetId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-[6px]"
         onClick={onClose}>
      <div 
        className="w-[360px] max-h-[80vh] flex flex-col bg-[var(--bg-elevated)]/95 backdrop-blur-xl border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[0_24px_64px_rgba(0,0,0,0.5)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-default)]">
          <div>
            <h2 className="text-[var(--text-primary)] font-[var(--weight-semibold)] text-sm">Mover para...</h2>
            <p className="text-[var(--text-muted)] text-xs mt-0.5 truncate max-w-[280px]">Mover "{itemName}"</p>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        <div className="p-3 border-b border-[var(--border-default)]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 text-[var(--text-muted)] size-4" />
            <input 
              autoFocus
              type="text" 
              placeholder="Buscar caixas..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-muted)] rounded-[var(--radius-md)] h-8 pl-8 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {(!search || "home".includes(search.toLowerCase()) || "raiz".includes(search.toLowerCase())) && (
             <button 
                onClick={() => handleMove(null)}
                className="w-full flex items-center gap-3 p-2 rounded-[var(--radius-sm)] hover:bg-[var(--bg-tertiary)] transition-colors group text-left"
             >
               <div className="bg-[var(--accent-blue-subtle)] p-1.5 rounded-md text-[var(--accent-blue)]">
                 <Home size={16} />
               </div>
               <span className="text-[var(--text-primary)] text-sm font-[var(--weight-medium)] flex-1">Home (raiz)</span>
               {currentParentId === null && <span className="text-[var(--text-muted)] text-[10px] uppercase font-mono tracking-wider">Atual</span>}
             </button>
          )}

          {filteredBoxes.map(box => (
            <button 
              key={box._id}
              onClick={() => handleMove(box._id)}
              className="w-full flex items-center gap-3 p-2 rounded-[var(--radius-sm)] hover:bg-[var(--bg-tertiary)] transition-colors group text-left mt-1"
            >
              <div className="text-[var(--accent-orange)] opacity-80 group-hover:opacity-100">
                <Folder size={18} />
              </div>
              <span className="text-[var(--text-primary)] text-sm flex-1 truncate">{box.name}</span>
              {currentParentId === box._id && <span className="text-[var(--text-muted)] text-[10px] uppercase font-mono tracking-wider">Atual</span>}
            </button>
          ))}

          {filteredBoxes.length === 0 && search && (
            <div className="text-center p-4 text-[var(--text-muted)] text-sm">
              Nenhuma caixa encontrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoveModal;
