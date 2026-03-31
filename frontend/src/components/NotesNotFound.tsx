import React from 'react'
import { FolderOpen, StickyNote, Plus } from 'lucide-react'

const NotesNotFound = ({ onNoteCreate, onBoxCreate }) => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[55vh] px-4 text-center select-none'>
      {/* Icon cluster */}
      <div className='relative mb-6'>
        <div className='w-20 h-20 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-default)] flex items-center justify-center shadow-inner'>
          <FolderOpen strokeWidth={1.25} className='size-9 text-[var(--text-muted)] opacity-40' />
        </div>
        <div className='absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center'>
          <StickyNote strokeWidth={1.5} className='size-4 text-[var(--text-muted)] opacity-40' />
        </div>
      </div>

      {/* Text */}
      <p className='font-[family:var(--font-ui)] text-[length:var(--text-base)] font-[var(--weight-medium)] text-[var(--text-secondary)] opacity-60'>
        Nada por aqui ainda
      </p>
      <p className='font-[family:var(--font-ui)] text-[length:var(--text-sm)] text-[var(--text-muted)] opacity-40 mt-1.5 max-w-[240px] leading-relaxed'>
        Crie um cartão de notas ou organize em caixas
      </p>

      {/* CTAs */}
      {(onNoteCreate || onBoxCreate) && (
        <div className='flex items-center gap-2 mt-6 pointer-events-auto'>
          {onNoteCreate && (
            <button
              onClick={onNoteCreate}
              className='flex items-center gap-1.5 h-[32px] px-3 bg-[var(--accent-blue)] text-[var(--text-on-accent)] rounded-[var(--radius-md)] text-[length:var(--text-xs)] font-[var(--weight-medium)] hover:brightness-110 transition-all'
            >
              <Plus size={13} strokeWidth={2.5} />
              Novo Cartão
            </button>
          )}
          {onBoxCreate && (
            <button
              onClick={onBoxCreate}
              className='flex items-center gap-1.5 h-[32px] px-3 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[length:var(--text-xs)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all'
            >
              <Plus size={13} strokeWidth={2.5} />
              Nova Caixa
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default NotesNotFound
