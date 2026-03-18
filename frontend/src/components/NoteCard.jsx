import React, { useState } from 'react'
import { FileTextIcon } from 'lucide-react'
import { Icon } from '@iconify/react'
import { formatDate } from '../lib/utils.js'
import { useAppStore } from '../store/useAppStore.js'
import ConfirmDialog from './ui/ConfirmDialog.jsx'

const NoteCard = ({ note, onOpen, selected = false, onSelect }) => {
  const { deleteNote } = useAppStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      onSelect && onSelect(note._id);
    } else {
      onOpen && onOpen();
    }
  };

  const handleConfirmDelete = () => {
    setShowConfirm(false);
    deleteNote(note._id);
  };

  return (
    <>
      <ConfirmDialog
        isOpen={showConfirm}
        title="Excluir cartão"
        message={`"${note.title}" será excluída permanentemente.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />

      <div 
        className={`group relative cursor-pointer w-full h-[140px] rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-secondary)] border transition-all duration-200 mt-4 ${selected ? 'border-[var(--accent-blue)] ring-2 ring-[var(--accent-blue-subtle)]' : 'border-[var(--border-default)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--border-active)]'}`}
        onClick={(e) => {
          if (e.ctrlKey || e.metaKey || e.shiftKey) {
            onSelect && onSelect(note._id, e.shiftKey)
          } else {
            onOpen()
          }
        }}
      >
        <div className="absolute top-3 right-3 pointer-events-none">
          {note.icon ? (
            <Icon icon={note.icon} className="size-6 opacity-60 group-hover:opacity-90 transition-opacity" />
          ) : (
            <FileTextIcon className="size-5 text-[var(--accent-blue)] opacity-25 group-hover:opacity-50 transition-opacity duration-200" />
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-6">
          <h3 className="font-[family:var(--font-mono)] text-[length:var(--text-sm)] font-[var(--weight-semibold)] text-[var(--text-primary)] truncate leading-snug pr-8">
            {note.title}
          </h3>
          <span className="font-[family:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--text-muted)] uppercase tracking-wider">
            {note.createdAt ? formatDate(new Date(note.createdAt)) : ''}
          </span>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
          className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 p-2 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--accent-red)] hover:bg-[var(--accent-red-subtle)] hover:scale-110 active:scale-90"
          title="Excluir Cartão"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>
    </>
  )
}

export default NoteCard
