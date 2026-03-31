import React, { useState } from 'react'
import { FileTextIcon } from 'lucide-react'
import { Icon } from '@iconify/react'
import { formatDate, extractPreview } from '../lib/utils'
import { useAppStore } from '../store/useAppStore'
import { Note } from '../types/app.types'
import ConfirmDialog from './ui/ConfirmDialog'
import CardMenu from './ui/CardMenu'
import MoveModal from './ui/MoveModal'

interface NoteCardProps {
  note: Note;
  onOpen?: () => void;
  selected?: boolean;
  onSelect?: (id: string, isShift: boolean) => void;
  isDragging?: boolean;
  hasActiveSelection?: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onOpen, selected = false, onSelect, isDragging = false, hasActiveSelection = false }) => {
  const { deleteNote, renameNote } = useAppStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [showMove, setShowMove] = useState(false);

  const preview = extractPreview(note.content);

  const handleConfirmDelete = () => {
    setShowConfirm(false);
    deleteNote(note._id);
  };

  const handleRenameSubmit = async () => {
    if (editTitle.trim() && editTitle !== note.title) {
      await renameNote(note._id, editTitle.trim());
    } else {
      setEditTitle(note.title);
    }
    setIsRenaming(false);
  };

  return (
    <>
      <ConfirmDialog
        isOpen={showConfirm}
        title="Excluir cartão"
        description={`"${note.title}" será excluída permanentemente.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />

      <MoveModal 
        isOpen={showMove}
        onClose={() => setShowMove(false)}
        itemName={note.title}
        itemType="note"
        itemId={note._id}
        currentParentId={note.boxId}
      />

      <div 
        className={`group relative cursor-pointer w-full rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-secondary)] border transition-all duration-200 shadow-sm ${selected ? 'border-[var(--accent-blue)] ring-2 ring-[var(--accent-blue-subtle)] shadow-md' : 'border-[var(--border-default)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--border-active)] hover:shadow-md'}`}
        onClick={(e) => {
          e.stopPropagation()
          if (e.ctrlKey || e.metaKey || e.shiftKey) {
            onSelect && onSelect(note._id, e.shiftKey)
          } else if (hasActiveSelection) {
            onSelect && onSelect(note._id, false)
          } else {
            onOpen && onOpen()
          }
        }}
      >
        <div className="absolute top-3 right-3 pointer-events-none z-20">
          {note.icon ? (
            <Icon icon={note.icon} className="size-5 opacity-80 group-hover:opacity-100 transition-opacity" />
          ) : (
            <FileTextIcon className="size-4 text-[var(--accent-blue)] opacity-50 group-hover:opacity-80 transition-opacity duration-200" />
          )}
        </div>

        <div className="flex flex-col justify-end h-[148px] px-4 py-3">
          <div className="pointer-events-none">
            {isRenaming ? (
              <input 
                autoFocus
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleRenameSubmit();
                  if (e.key === 'Escape') { setEditTitle(note.title); setIsRenaming(false); }
                }}
                onBlur={handleRenameSubmit}
                className="w-full bg-transparent border-b border-[var(--accent-blue)] font-[family:var(--font-mono)] text-[length:var(--text-sm)] font-[var(--weight-semibold)] text-[var(--text-primary)] focus:outline-none pointer-events-auto"
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <h3 className="font-[family:var(--font-mono)] text-[length:var(--text-sm)] font-[var(--weight-semibold)] text-[var(--text-primary)] truncate leading-snug pr-8 pointer-events-auto" title={note.title}>
                {note.title}
              </h3>
            )}
            <span className="font-[family:var(--font-mono)] text-[length:var(--text-2xs)] text-[var(--text-muted)] uppercase tracking-wider block mt-0.5">
              {note.createdAt ? formatDate(new Date(note.createdAt)) : ''}
            </span>
            
            {(note.tags && note.tags.length > 0) && (
              <div className="flex flex-wrap gap-1 mt-2 pointer-events-auto max-h-[24px] overflow-hidden relative">
                {note.tags.slice(0, 3).map((tag: string, idx: number) => (
                  <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[9px] font-[family:var(--font-mono)] font-medium bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] border border-[var(--accent-blue)]/20 truncate max-w-[80px]">
                    #{tag}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[9px] font-[family:var(--font-mono)] font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-muted)]">
                    +{note.tags.length - 3}
                  </span>
                )}
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[var(--bg-secondary)] to-transparent pointer-events-none group-hover:from-[var(--bg-tertiary)]"></div>
              </div>
            )}
          </div>
        </div>

        {!isDragging && (
          <CardMenu 
            onRename={() => setIsRenaming(true)}
            onMove={() => setShowMove(true)}
            onDelete={() => setShowConfirm(true)}
            isBox={false}
          />
        )}
      </div>
    </>
  )
}

export default NoteCard
