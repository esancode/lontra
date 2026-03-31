import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Trash, X, FolderTree } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import BulkMoveModal from './BulkMoveModal';

interface BulkActionBarProps {
  selectedIds: Set<string>;
  onClear: () => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({ selectedIds, onClear }) => {
  const { notes, boxes, deleteNote, deleteBox } = useAppStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showMove, setShowMove] = useState(false);

  if (selectedIds.size === 0) return null;

  const handleBulkDelete = () => {
    selectedIds.forEach(id => {
      if (notes.find(n => n._id === id)) {
        deleteNote(id);
      } else if (boxes.find(b => b._id === id)) {
        deleteBox(id);
      }
    });
    setShowConfirm(false);
    onClear();
  };

    return (
    <>
      <div className="bulk-action-bar fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-200">
        <div className="flex items-center gap-2 bg-[var(--bg-elevated)]/75 backdrop-blur-xl border border-[var(--border-muted)] px-3 py-1.5 rounded-[var(--radius-lg)] shadow-2xl ring-1 ring-[var(--border-subtle)]/50">
          <div className="flex items-center gap-2 pr-3 border-r border-[var(--border-muted)]">
            <div className="flex items-center justify-center bg-[var(--accent-blue)] text-white text-xs font-medium size-5 rounded-full">
              {selectedIds.size}
            </div>
            <span className="text-sm font-[var(--weight-medium)] text-[var(--text-secondary)]">
              itens
            </span>
          </div>

          <button
            onClick={() => setShowMove(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-[var(--weight-medium)] rounded-[var(--radius-sm)] text-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/15 transition-colors"
          >
            <FolderTree size={16} />
            <span className="hidden sm:inline">Mover</span>
          </button>

          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-[var(--weight-medium)] rounded-[var(--radius-sm)] text-[var(--accent-red)] hover:bg-[var(--accent-red)]/15 transition-colors"
          >
            <Trash size={16} />
            <span className="hidden sm:inline">Excluir</span>
          </button>

          <button
            onClick={onClear}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-full transition-colors ml-1"
            title="Deselecionar"
          >
            <X size={16} />
          </button>
        </div>
      </div>

        <ConfirmDialog
        isOpen={showConfirm}
        title={`Excluir ${selectedIds.size} itens`}
        description="Tem certeza? Todos os cartões e caixas selecionados serão removidos permanentemente."
        onConfirm={handleBulkDelete}
        onCancel={() => setShowConfirm(false)}
      />

      <BulkMoveModal 
        isOpen={showMove}
        onClose={() => setShowMove(false)}
        selectedIds={selectedIds}
        onClear={onClear}
      />
    </>
  );
};

export default BulkActionBar;
