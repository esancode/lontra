import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Box } from '../types/app.types';
import { formatDate } from '../lib/utils';
import ConfirmDialog from './ui/ConfirmDialog';
import CardMenu from './ui/CardMenu';
import MoveModal from './ui/MoveModal';

interface BoxCardProps {
  box: Box;
  onEnter?: () => void;
  isDragOver?: boolean;
  selected?: boolean;
  onSelect?: (id: string, isShift: boolean) => void;
  isDragging?: boolean;
  hasActiveSelection?: boolean;
}

const BoxCard: React.FC<BoxCardProps> = ({ 
  box, 
  onEnter, 
  isDragOver = false, 
  selected = false, 
  onSelect, 
  isDragging = false,
  hasActiveSelection = false
}) => {
  const { deleteBox, renameBox, notes, boxes } = useAppStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [editName, setEditName] = useState(box.name);
  const [showMove, setShowMove] = useState(false);

  const childNoteCount = notes.filter(n => n.boxId === box._id).length;
  const childBoxCount = boxes.filter(b => b.parentId === box._id).length;
  const totalChildren = childNoteCount + childBoxCount;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      e.preventDefault();
      onSelect && onSelect(box._id, e.shiftKey);
    } else if (hasActiveSelection) {
      onSelect && onSelect(box._id, false);
    } else {
      onEnter && onEnter();
    }
  };

  const handleConfirmDelete = () => {
    setShowConfirm(false);
    deleteBox(box._id);
  };

  const handleRenameSubmit = async () => {
    if (editName.trim() && editName !== box.name) {
      await renameBox(box._id, editName.trim());
    } else {
      setEditName(box.name);
    }
    setIsRenaming(false);
  };

  return (
    <>
      <ConfirmDialog
        isOpen={showConfirm}
        title="Excluir caixa"
        description={`"${box.name}" e todo o seu conteúdo serão excluídos permanentemente.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />

      <MoveModal 
        isOpen={showMove}
        onClose={() => setShowMove(false)}
        itemName={box.name}
        itemType="box"
        itemId={box._id}
        currentParentId={box.parentId}
      />

      <div
        onClick={handleClick}
        className={`group relative w-full h-[148px] cursor-pointer select-none perspective-[1200px]
          ${selected ? 'scale-[1.01]' : 'hover:scale-[1.01] transition-transform duration-300'}`}
      >
        <div className={`absolute inset-0 z-10 bg-[var(--bg-secondary)] border transition-all duration-300 rounded-[var(--radius-md)] flex flex-col justify-end p-4
          ${selected 
            ? 'border-[var(--accent-blue)] ring-2 ring-[var(--accent-blue-subtle)] shadow-md' 
            : isDragOver
            ? `border-[var(--accent-blue)] bg-[var(--bg-tertiary)] shadow-lg`
            : 'border-[var(--border-default)] group-hover:border-[var(--accent-blue)] group-hover:bg-[var(--bg-tertiary)] group-hover:shadow-md'
          }`}
        >
          <div className="z-10 pointer-events-none">
            {totalChildren > 0 && (
              <span className="inline-flex items-center gap-1 font-[family:var(--font-mono)] text-[length:var(--text-2xs)] text-[var(--text-muted)] uppercase tracking-wider mb-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                {childBoxCount > 0 && `${childBoxCount} caixa${childBoxCount !== 1 ? 's' : ''}`}
                {childBoxCount > 0 && childNoteCount > 0 && ' · '}
                {childNoteCount > 0 && `${childNoteCount} cart${childNoteCount !== 1 ? 'ões' : 'ão'}`}
              </span>
            )}

            {isRenaming ? (
              <input 
                autoFocus
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleRenameSubmit();
                  if (e.key === 'Escape') { setEditName(box.name); setIsRenaming(false); }
                }}
                onBlur={handleRenameSubmit}
                className="w-full bg-transparent border-b border-[var(--accent-blue)] font-[family:var(--font-mono)] text-[length:var(--text-sm)] font-[var(--weight-semibold)] text-[var(--text-primary)] focus:outline-none pointer-events-auto"
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <h3 className="font-[family:var(--font-mono)] text-[length:var(--text-sm)] font-[var(--weight-semibold)] text-[var(--text-primary)] truncate leading-snug pr-8 pointer-events-auto" title={box.name}>
                {box.name}
              </h3>
            )}
            <span className="font-[family:var(--font-mono)] text-[length:var(--text-2xs)] text-[var(--text-muted)] uppercase tracking-wider">
              {box.createdAt ? formatDate(new Date(box.createdAt)) : ''}
            </span>
          </div>
        </div>

        <div 
          className={`absolute top-0 left-0 right-0 z-20 h-[40px] border transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] origin-top rounded-t-[var(--radius-md)] -mb-[1px]
            ${selected 
              ? 'bg-[var(--bg-tertiary)] border-[var(--accent-blue)]' 
              : 'bg-[var(--bg-tertiary)] border-[var(--border-default)] group-hover:border-[var(--accent-blue)]'
            }
            ${isDragOver ? 'brightness-75 shadow-inner' : ''}`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-black/5" />
          <div className={`absolute bottom-2.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full transition-colors duration-300
            ${selected ? 'bg-[var(--accent-blue)] opacity-40' : 'bg-[var(--border-active)] opacity-20 group-hover:bg-[var(--accent-blue)] group-hover:opacity-40'}`}
          />
        </div>

        {!isDragging && (
          <CardMenu 
            onRename={() => setIsRenaming(true)}
            onMove={() => setShowMove(true)}
            onDelete={() => setShowConfirm(true)}
            isBox={true}
            className="absolute bottom-3 right-3"
          />
        )}
      </div>
    </>
  );
};

export default BoxCard;
