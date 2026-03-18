import React, { useState, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { createPortal } from 'react-dom'

const FILE_ICONS = [
  { id: 'logos:javascript', label: 'JavaScript' },
  { id: 'logos:typescript-icon', label: 'TypeScript' },
  { id: 'logos:python', label: 'Python' },
  { id: 'logos:java', label: 'Java' },
  { id: 'logos:rust', label: 'Rust' },
  { id: 'logos:go', label: 'Go' },
  { id: 'logos:c-plusplus', label: 'C++' },
  { id: 'logos:c', label: 'C' },
  { id: 'logos:c-sharp', label: 'C#' },
  { id: 'logos:php', label: 'PHP' },
  { id: 'logos:ruby', label: 'Ruby' },
  { id: 'logos:swift', label: 'Swift' },
  { id: 'logos:kotlin-icon', label: 'Kotlin' },
  { id: 'logos:dart', label: 'Dart' },
  { id: 'logos:html-5', label: 'HTML' },
  { id: 'logos:css-3', label: 'CSS' },
  { id: 'logos:sass', label: 'Sass' },
  { id: 'logos:react', label: 'React' },
  { id: 'logos:vue', label: 'Vue' },
  { id: 'logos:svelte-icon', label: 'Svelte' },
  { id: 'logos:nodejs-icon', label: 'Node.js' },
  { id: 'vscode-icons:file-type-json', label: 'JSON' },
  { id: 'vscode-icons:file-type-yaml', label: 'YAML' },
  { id: 'vscode-icons:file-type-xml', label: 'XML' },
  { id: 'vscode-icons:file-type-markdown', label: 'Markdown' },
  { id: 'logos:mysql', label: 'MySQL' },
  { id: 'logos:postgresql', label: 'PostgreSQL' },
  { id: 'logos:mongodb-icon', label: 'MongoDB' },
  { id: 'logos:docker-icon', label: 'Docker' },
  { id: 'logos:github-icon', label: 'GitHub' },
  { id: 'logos:git-icon', label: 'Git' },
  { id: 'logos:bash-icon', label: 'Terminal / Bash' },
  { id: 'vscode-icons:file-type-powershell', label: 'PowerShell' },
  { id: 'logos:graphql', label: 'GraphQL' },
  { id: 'logos:prisma', label: 'Prisma' },
  { id: 'logos:terraform-icon', label: 'Terraform' },
  { id: 'logos:lua', label: 'Lua' },
  { id: 'logos:elixir', label: 'Elixir' },
  { id: 'logos:haskell-icon', label: 'Haskell' },
  { id: 'logos:r-lang', label: 'R' },
  { id: 'logos:scala', label: 'Scala' },
  { id: 'logos:jest', label: 'Testes / Jest' },
  { id: 'logos:npm-icon', label: 'NPM' },
  
  { id: 'vscode-icons:file-type-pdf2', label: 'PDF' },
  { id: 'vscode-icons:file-type-word', label: 'Word' },
  { id: 'vscode-icons:file-type-excel', label: 'Excel' },
  { id: 'vscode-icons:file-type-powerpoint', label: 'PowerPoint' },
  { id: 'vscode-icons:file-type-image', label: 'Imagem' },
  { id: 'vscode-icons:file-type-video', label: 'Vídeo' },
  { id: 'vscode-icons:file-type-audio', label: 'Áudio' },
  { id: 'noto:notebook-with-decorative-cover', label: 'Cartões' },

  { id: 'noto:books', label: 'Livros' },
  { id: 'noto:blue-book', label: 'Manual' },
  { id: 'noto:briefcase', label: 'Trabalho' },
  { id: 'noto:light-bulb', label: 'Ideia' },
  { id: 'noto:rocket', label: 'Lançamento' },
  { id: 'noto:star', label: 'Favorito' },
  { id: 'noto:fire', label: 'Urgente' },
  { id: 'noto:check-mark-button', label: 'Concluído' },
  { id: 'noto:spiral-calendar', label: 'Agenda' },
  { id: 'noto:chart-increasing', label: 'Métricas' },
  { id: 'noto:game-die', label: 'Jogos' },
  { id: 'noto:clapper-board', label: 'Filmes' },
  { id: 'noto:musical-note', label: 'Música' },
  { id: 'noto:money-bag', label: 'Finanças' },
  { id: 'noto:globe-showing-americas', label: 'Global' },
  { id: 'noto:brain', label: 'Estudos' },
  { id: 'noto:artist-palette', label: 'Design' },
  { id: 'noto:hammer-and-wrench', label: 'Ferramentas' },
]

const IconPicker = ({ currentIcon, onSelect, onClose }) => {
  const [search, setSearch] = useState('')
  const inputRef = useRef(null)
  const modalRef = useRef(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80)

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    const handleMouseDown = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
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

  const filtered = FILE_ICONS.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))

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
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
      />

      <div
        ref={modalRef}
        style={{ position: 'relative', zIndex: 1 }}
        className="w-full max-w-[480px] mx-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden"
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
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] flex-shrink-0 p-1 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
            title="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-3 max-h-[340px] overflow-y-auto grid grid-cols-6 gap-1">
          <button
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
