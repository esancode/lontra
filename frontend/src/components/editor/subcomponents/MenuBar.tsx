import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Code, FileText, Heading1, Heading2, Heading3, Search, MoreHorizontal, Edit2, FolderInput, Clock, Trash2, Play } from 'lucide-react';
import { Icon } from '@iconify/react';
import { useAppStore } from '../../../store/useAppStore';
import { Note } from '../../../types/app.types';
import api from '../../../lib/axios';
import IconPicker from '../../ui/IconPicker';

export const COLORS = [
  { name: 'Padrão', color: 'var(--text-primary)' },
  { name: 'Azul', color: '#388bfd' },
  { name: 'Verde', color: '#3fb950' },
  { name: 'Amarelo', color: '#d29922' },
  { name: 'Vermelho', color: '#f85149' },
  { name: 'Roxo', color: '#a371f7' },
  { name: 'Cinza', color: '#8b949e' },
  { name: 'Ciano', color: '#2dd4bf' },
  { name: 'Rosa', color: '#f472b6' },
  { name: 'Laranja', color: '#fb923c' },
];

interface MenuBarProps {
  editor: any;
  noteId: string;
  isSaving: boolean;
  note: Note | undefined;
  onRenameRequest?: () => void;
  onMoveRequest?: () => void;
  onDeleteRequest?: () => void;
  onSearchRequest?: () => void;
  onHistoryRequest?: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ 
  editor, 
  noteId, 
  isSaving, 
  note, 
  onRenameRequest, 
  onMoveRequest, 
  onDeleteRequest, 
  onSearchRequest, 
  onHistoryRequest 
}) => {
  const { togglePresentationMode } = useAppStore();
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  const colorMenuRef = useRef<HTMLDivElement>(null);
  const highlightMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (colorMenuRef.current && !colorMenuRef.current.contains(target)) setShowColorMenu(false);
      if (highlightMenuRef.current && !highlightMenuRef.current.contains(target)) setShowHighlightMenu(false);
      if (moreMenuRef.current && !moreMenuRef.current.contains(target)) setShowMoreMenu(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowColorMenu(false);
        setShowHighlightMenu(false);
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    }
  }, []);

  if (!editor) return null;

  const exec = (chain: any) => chain.run();

  const handleIconSelect = async (iconId: string | null) => {
    try {
      await api.put(`/notes/${noteId}`, { icon: iconId });
      useAppStore.setState(state => ({
        notes: state.notes.map(n => n._id === noteId ? { ...n, icon: iconId || undefined } : n)
      }));
    } catch (err) { console.error(err); }
  };

  return (
    <>
      {showIconPicker && (
        <IconPicker
          currentIcon={note?.icon || null}
          onSelect={handleIconSelect}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    <div className='flex items-center justify-between h-[40px] bg-[var(--bg-secondary)] border-b border-[var(--border-muted)] px-[var(--space-4)] relative inset-x-0 z-[100] w-full shadow-sm'>
      <div className='flex flex-wrap items-center gap-1'>
        <button
          type="button"
          onClick={() => setShowIconPicker(true)}
          className='flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent w-[28px] h-[28px] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors'
          title="Tipo de arquivo (ícone)"
        >
          {note?.icon ? <Icon icon={note.icon} className='size-4' /> : <FileText className='size-4' />}
        </button>

        <div className='w-[1px] h-4 bg-[var(--border-muted)] mx-1'></div>

        <button
          type="button"
          onClick={() => exec(editor.chain().focus().toggleBold())}
          className={`flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent w-[28px] h-[28px] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors ${editor.isActive('bold') ? 'text-[var(--accent-blue)] bg-[var(--accent-blue-subtle)]' : 'text-[var(--text-secondary)]'}`}
          title="Bold"
        >
          <Bold className='size-4' />
        </button>
        <button
          type="button"
          onClick={() => exec(editor.chain().focus().toggleItalic())}
          className={`flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent w-[28px] h-[28px] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors ${editor.isActive('italic') ? 'text-[var(--accent-blue)] bg-[var(--accent-blue-subtle)]' : 'text-[var(--text-secondary)]'}`}
          title="Italic"
        >
          <Italic className='size-4' />
        </button>
        <button
          type="button"
          onClick={() => exec(editor.chain().focus().toggleCodeBlock())}
          className={`flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent w-[28px] h-[28px] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors ${editor.isActive('codeBlock') ? 'text-[var(--accent-blue)] bg-[var(--accent-blue-subtle)]' : 'text-[var(--text-secondary)]'}`}
          title="Code Block"
        >
          <Code className='size-4' />
        </button>

        <div className='w-[1px] h-4 bg-[var(--border-muted)] mx-2'></div>

        <button
          type="button"
          onClick={() => exec(editor.chain().focus().toggleHeading({ level: 1 }))}
          className={`flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent w-[28px] h-[28px] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors ${editor.isActive('heading', { level: 1 }) ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]'}`}
          title="Heading 1"
        >
          <Heading1 className='size-4' />
        </button>
        <button
          type="button"
          onClick={() => exec(editor.chain().focus().toggleHeading({ level: 2 }))}
          className={`flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent w-[28px] h-[28px] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors ${editor.isActive('heading', { level: 2 }) ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]'}`}
          title="Heading 2"
        >
          <Heading2 className='size-4' />
        </button>
        <button
          type="button"
          onClick={() => exec(editor.chain().focus().toggleHeading({ level: 3 }))}
          className={`flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent w-[28px] h-[28px] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors ${editor.isActive('heading', { level: 3 }) ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]'}`}
          title="Heading 3"
        >
          <Heading3 className='size-4' />
        </button>

        <div className='w-[1px] h-4 bg-[var(--border-muted)] mx-2'></div>

        <div className="relative" ref={colorMenuRef}>
          <button
            type="button"
            onClick={() => { setShowColorMenu(!showColorMenu); setShowHighlightMenu(false); }}
            className={`flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent min-w-[36px] h-[28px] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors ${showColorMenu ? 'text-[var(--text-primary)] bg-[var(--bg-tertiary)]' : 'text-[var(--text-secondary)]'}`}
            title="Cor do Texto"
          >
            <div className="flex items-center gap-0.5">
              A
              <div 
                className="w-2.5 h-0.5 mt-2 rounded-full absolute bottom-1" 
                style={{ backgroundColor: editor.getAttributes('textStyle').color || 'var(--text-primary)' }} 
              />
            </div>
          </button>
          {showColorMenu && (
            <div className="absolute top-full left-0 mt-2 p-1.5 bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[0_12px_40px_rgba(0,0,0,0.4)] z-50 min-w-[160px]">
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.1em] px-2 py-1.5">Cor do texto</div>
              <div className="grid grid-cols-5 gap-1 px-1">
                {COLORS.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    className="w-7 h-7 rounded-[var(--radius-sm)] border border-white/10 flex items-center justify-center hover:scale-110 hover:ring-2 hover:ring-[var(--accent-blue)] transition-all"
                    style={{ backgroundColor: c.color }}
                    onClick={() => {
                      editor.chain().focus().setColor(c.color).run();
                      setShowColorMenu(false);
                    }}
                    title={c.name}
                  />
                ))}
              </div>
              <div 
                className="flex items-center justify-center mt-2 border-t border-[var(--border-muted)] pt-2 px-1"
                onClick={(e) => e.stopPropagation()}
              >
                <input 
                  type="color" 
                  className="w-full h-7 cursor-pointer rounded-[var(--radius-sm)] bg-transparent border border-[var(--border-muted)] p-0 outline-none"
                  onChange={(e) => {
                    editor.chain().focus().setColor(e.target.value).run();
                  }}
                  title="Cor personalizada"
                />
              </div>
              <button 
                type="button"
                className="w-full text-[10px] py-1.5 mt-1.5 hover:bg-[var(--bg-tertiary)] rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] uppercase tracking-wider font-bold transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  editor.chain().focus().unsetColor().run();
                  setShowColorMenu(false);
                }}
              >
                Resetar
              </button>
            </div>
          )}
        </div>

        <div className="relative" ref={highlightMenuRef}>
          <button
            type="button"
            onClick={() => { setShowHighlightMenu(!showHighlightMenu); setShowColorMenu(false); }}
            className={`flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent min-w-[28px] h-[28px] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors ${showHighlightMenu ? 'text-[var(--text-primary)] bg-[var(--bg-tertiary)]' : 'text-[var(--text-secondary)]'}`}
            title="Cor de Fundo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-highlighter"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>
          </button>
          {showHighlightMenu && (
            <div className="absolute top-full left-0 mt-2 p-1.5 bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[0_12px_40px_rgba(0,0,0,0.4)] z-50 min-w-[160px]">
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.1em] px-2 py-1.5">Cor de fundo</div>
              <div className="grid grid-cols-5 gap-1 px-1">
                {COLORS.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    className="w-7 h-7 rounded-[var(--radius-sm)] border border-white/10 flex items-center justify-center hover:scale-110 hover:ring-2 hover:ring-[var(--accent-blue)] transition-all relative overflow-hidden"
                    style={{ backgroundColor: c.color }}
                    onClick={() => {
                      editor.chain().focus().setHighlight({ color: c.color + '33' }).run();
                      setShowHighlightMenu(false);
                    }}
                    title={c.name}
                  >
                    <div className="absolute inset-0 bg-[var(--bg-primary)] opacity-80" />
                    <div className="absolute inset-0" style={{ backgroundColor: c.color + '33' }} />
                  </button>
                ))}
              </div>
              <div 
                className="flex items-center justify-center mt-2 border-t border-[var(--border-muted)] pt-2 px-1"
                onClick={(e) => e.stopPropagation()}
              >
                <input 
                  type="color" 
                  className="w-full h-7 cursor-pointer rounded-[var(--radius-sm)] bg-transparent border border-[var(--border-muted)] p-0 outline-none"
                  onChange={(e) => {
                    const hex = e.target.value;
                    editor.chain().focus().setHighlight({ color: hex + '33' }).run();
                  }}
                  title="Cor de fundo personalizada"
                />
              </div>
              <button 
                type="button"
                className="w-full text-[10px] py-1.5 mt-1.5 hover:bg-[var(--bg-tertiary)] rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] uppercase tracking-wider font-bold transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  editor.chain().focus().unsetHighlight().run();
                  setShowHighlightMenu(false);
                }}
              >
                Resetar Fundo
              </button>
            </div>
          )}
        </div>

      </div>

      <div className='flex items-center gap-[var(--space-2)]'>
        {isSaving && (
           <div className='flex items-center gap-1 text-[var(--text-muted)] text-[length:var(--text-xs)] uppercase tracking-wider font-[family:var(--font-mono)] mr-2'>
              <span className="loading loading-spinner loading-xs text-[var(--text-muted)]"></span> Salvando...
           </div>
        )}
        <button
          type="button"
          onClick={togglePresentationMode}
          className='flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent w-[28px] h-[28px] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors'
          title="Modo Apresentação"
        >
          <Play className='size-4' />
        </button>

        <div className="relative" ref={moreMenuRef}>
          <button
            type="button"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent w-[28px] h-[28px] transition-colors ${showMoreMenu ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'}`}
            title="Mais opções"
          >
            <MoreHorizontal className='size-5' />
          </button>

          {showMoreMenu && (
            <div 
              className="absolute right-0 top-[calc(100%+8px)] w-[240px] bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[0_12px_40px_rgba(0,0,0,0.4)] z-[1000] py-1.5"
              onClick={e => e.stopPropagation()}
            >
              <button 
                type="button"
                onClick={() => { setShowMoreMenu(false); onRenameRequest && onRenameRequest(); }}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <Edit2 size={14} className="opacity-70" />
                Renomear nota
              </button>
              <button 
                type="button"
                onClick={() => { setShowMoreMenu(false); onMoveRequest && onMoveRequest(); }}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <FolderInput size={14} className="opacity-70" />
                Mover para...
              </button>
              
              <div className="h-[1px] bg-[var(--border-active)] opacity-50 my-1 mx-1" />

              <button 
                type="button"
                onClick={() => { setShowMoreMenu(false); onSearchRequest && onSearchRequest(); }}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <Search size={14} className="opacity-70" />
                Pesquisar (Ctrl+F)
              </button>
              
              <div className="h-[1px] bg-[var(--border-active)] opacity-50 my-1 mx-1" />

              <button 
                type="button"
                onClick={() => { setShowMoreMenu(false); onHistoryRequest && onHistoryRequest(); }}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <Clock size={14} className="opacity-70" />
                Histórico de Versões
              </button>
              
              <div className="h-[1px] bg-[var(--border-active)] opacity-50 my-1 mx-1" />

              <button 
                type="button"
                onClick={() => { setShowMoreMenu(false); onDeleteRequest && onDeleteRequest(); }}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-sm text-[var(--text-primary)] hover:bg-[var(--accent-red-subtle)] hover:text-[var(--accent-red)] transition-colors group/delete"
              >
                <Trash2 size={14} className="opacity-70 group-hover/delete:opacity-100" />
                Deletar nota
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default MenuBar;
