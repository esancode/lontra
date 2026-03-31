import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Icon } from '@iconify/react'
import { createPortal } from 'react-dom'

import { codeLanguages } from '../../utils/languages'

interface IconData {
  id: string;
  label: string;
}

const FILE_ICONS: IconData[] = codeLanguages
  .filter(l => l.value !== 'null')
  .map(l => ({ id: l.icon as string, label: l.label }))
  // Remover duplicatas baseadas no ID do ícone
  .filter((icon, index, self) => 
    index === self.findIndex((t) => t.id === icon.id)
  )

interface IconPickerProps {
  currentIcon: string | null;
  onSelect: (iconId: string | null) => void;
  onClose: () => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ currentIcon, onSelect, onClose }) => {
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [onClose])

  const filtered = useMemo(() => FILE_ICONS.filter(i => 
    i.label.toLowerCase().includes(search.toLowerCase()) || 
    i.id.toLowerCase().includes(search.toLowerCase())
  ), [search])

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 400,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 'calc(8vh + 40px)',
        pointerEvents: 'all',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      <div
        ref={modalRef}
        style={{ position: 'relative', zIndex: 1 }}
        className="w-full max-w-[480px] mx-4 bg-[var(--bg-elevated)]/95 backdrop-blur-xl border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden"
      >
        <div className="flex items-center px-4 h-[44px] border-b border-[var(--border-muted)] gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)] flex-shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar linguagem ou tipo de arquivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none text-[length:var(--text-sm)] font-[family:var(--font-mono)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] flex-shrink-0 p-1 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
            title="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-3 max-h-[340px] overflow-y-auto grid grid-cols-6 gap-1">
          <button
            type="button"
            onClick={() => { onSelect(null); onClose(); }}
            className={`flex flex-col items-center gap-1 p-2 rounded-[var(--radius-sm)] transition-colors hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] ${!currentIcon ? 'bg-[var(--accent-blue-subtle)]' : ''}`}
            title="Padrão"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span className="text-[10px] font-[family:var(--font-ui)] leading-none">Padrão</span>
          </button>

          {filtered.map(icon => (
            <button
              key={icon.id}
              type="button"
              onClick={() => { onSelect(icon.id); onClose(); }}
              className={`flex flex-col items-center gap-1 p-2 rounded-[var(--radius-sm)] transition-colors hover:bg-[var(--bg-tertiary)] ${currentIcon === icon.id ? 'bg-[var(--accent-blue-subtle)] ring-1 ring-[var(--accent-blue)]' : ''}`}
              title={icon.label}
            >
              <Icon icon={icon.id} className="size-[22px]" />
              <span className="text-[9px] font-[family:var(--font-ui)] text-[var(--text-muted)] leading-none truncate w-full text-center">{icon.label}</span>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-6 py-8 text-center text-[var(--text-muted)] text-[length:var(--text-sm)] font-[family:var(--font-ui)]">
              Nenhum ícone encontrado
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default IconPicker
