import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { useEditor, EditorContent, ReactRenderer, ReactNodeViewRenderer } from '@tiptap/react';
import { createPortal } from 'react-dom';
import tippy from 'tippy.js';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Focus from '@tiptap/extension-focus';
import CharacterCount from '@tiptap/extension-character-count';
import Mathematics from '@tiptap/extension-mathematics';
import UniqueId from '@tiptap/extension-unique-id';
import 'katex/dist/katex.min.css';

import { useAppStore } from '../../store/useAppStore';
import { 
  Bold, Italic, Code, LayoutTemplate, FileText, 
  Heading1, Heading2, Heading3, GripVertical
} from 'lucide-react';
import { Icon } from '@iconify/react';
import DragHandle from '@tiptap/extension-drag-handle-react';
import api from '../../lib/axios';
import IconPicker from '../ui/IconPicker';

import Commands from './Commands';
import SlashMenu from './SlashMenu';
import Callout from './Callout.jsx';
import Bookmark from './Bookmark.jsx';
import SelectionToolbar from './SelectionToolbar';
import CodeBlockComponent from './CodeBlockComponent.jsx';
import TableBubbleMenu from './TableBubbleMenu.jsx';

const lowlight = createLowlight(common);

const colors = [
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

const MenuBar = ({ editor, noteId, isSaving, note }) => {
  const { toggleSplitView, togglePresentationMode } = useAppStore();
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const colorMenuRef = useRef(null);
  const highlightMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorMenuRef.current && !colorMenuRef.current.contains(event.target)) {
        setShowColorMenu(false);
      }
      if (highlightMenuRef.current && !highlightMenuRef.current.contains(event.target)) {
        setShowHighlightMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!editor) return null;

  const exec = (chain) => chain.run();

  const handleIconSelect = async (iconId) => {
    try {
      await api.put(`/notes/${noteId}`, { icon: iconId });
      useAppStore.setState(state => ({
        notes: state.notes.map(n => n._id === noteId ? { ...n, icon: iconId } : n)
      }));
    } catch (err) { }
  };

  return (
    <>
      {showIconPicker && (
        <IconPicker
          currentIcon={note?.icon}
          onSelect={handleIconSelect}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    <div className='flex items-center justify-between h-[40px] bg-[var(--bg-secondary)] border-b border-[var(--border-muted)] px-[var(--space-4)] relative inset-x-0 z-[100]'>
      <div className='flex flex-wrap items-center gap-1'>
        <button
          onClick={() => setShowIconPicker(true)}
          className='flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent w-[28px] h-[28px] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors'
          title="Tipo de arquivo (ícone)"
        >
          {note?.icon ? <Icon icon={note.icon} className='size-4' /> : <FileText className='size-4' />}
        </button>

        <div className='w-[1px] h-4 bg-[var(--border-muted)] mx-1'></div>

        <button
          onClick={() => exec(editor.chain().focus().toggleBold())}
          className={`flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent w-[28px] h-[28px] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors ${editor.isActive('bold') ? 'text-[var(--accent-blue)] bg-[var(--accent-blue-subtle)]' : 'text-[var(--text-secondary)]'}`}
          title="Bold"
        >
          <Bold className='size-4' />
        </button>
        <button
          onClick={() => exec(editor.chain().focus().toggleItalic())}
          className={`flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent w-[28px] h-[28px] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors ${editor.isActive('italic') ? 'text-[var(--accent-blue)] bg-[var(--accent-blue-subtle)]' : 'text-[var(--text-secondary)]'}`}
          title="Italic"
        >
          <Italic className='size-4' />
        </button>
        <button
          onClick={() => exec(editor.chain().focus().toggleCodeBlock())}
          className={`flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent w-[28px] h-[28px] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors ${editor.isActive('codeBlock') ? 'text-[var(--accent-blue)] bg-[var(--accent-blue-subtle)]' : 'text-[var(--text-secondary)]'}`}
          title="Code Block"
        >
          <Code className='size-4' />
        </button>

        <div className='w-[1px] h-4 bg-[var(--border-muted)] mx-2'></div>

        <button
          onClick={() => exec(editor.chain().focus().toggleHeading({ level: 1 }))}
          className={`flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent w-[28px] h-[28px] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors ${editor.isActive('heading', { level: 1 }) ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]'}`}
          title="Heading 1"
        >
          <Heading1 className='size-4' />
        </button>
        <button
          onClick={() => exec(editor.chain().focus().toggleHeading({ level: 2 }))}
          className={`flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent w-[28px] h-[28px] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors ${editor.isActive('heading', { level: 2 }) ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]'}`}
          title="Heading 2"
        >
          <Heading2 className='size-4' />
        </button>
        <button
          onClick={() => exec(editor.chain().focus().toggleHeading({ level: 3 }))}
          className={`flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent w-[28px] h-[28px] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors ${editor.isActive('heading', { level: 3 }) ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]'}`}
          title="Heading 3"
        >
          <Heading3 className='size-4' />
        </button>

        <div className='w-[1px] h-4 bg-[var(--border-muted)] mx-2'></div>

        <div className="relative" ref={colorMenuRef}>
          <button
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
            <div className="absolute top-full left-0 mt-1 p-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-xl z-50 grid grid-cols-5 gap-1 min-w-[124px]">
              {colors.map(c => (
                <button
                  key={c.name}
                  className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center hover:scale-110 transition-transform"
                  style={{ backgroundColor: c.color }}
                  onClick={() => {
                    editor.chain().focus().setColor(c.color).run();
                    setShowColorMenu(false);
                  }}
                  title={c.name}
                />
              ))}
              <div 
                className="flex items-center justify-center col-span-5 mt-1 border-t border-[var(--border-muted)] pt-1"
                onClick={(e) => e.stopPropagation()}
              >
                <input 
                  type="color" 
                  className="w-full h-6 cursor-pointer rounded bg-transparent border-none p-0 outline-none"
                  onChange={(e) => {
                    editor.chain().focus().setColor(e.target.value).run();
                  }}
                  title="Cor personalizada"
                />
              </div>
              <button 
                className="col-span-5 text-[10px] py-1 mt-1 hover:bg-[var(--bg-tertiary)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] uppercase tracking-wider font-bold"
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
            onClick={() => { setShowHighlightMenu(!showHighlightMenu); setShowColorMenu(false); }}
            className={`flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent min-w-[28px] h-[28px] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors ${showHighlightMenu ? 'text-[var(--text-primary)] bg-[var(--bg-tertiary)]' : 'text-[var(--text-secondary)]'}`}
            title="Cor de Fundo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-highlighter"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>
          </button>
          {showHighlightMenu && (
            <div className="absolute top-full left-0 mt-1 p-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-xl z-50 grid grid-cols-5 gap-1 min-w-[124px]">
              {colors.map(c => (
                <button
                  key={c.name}
                  className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center hover:scale-110 transition-transform relative overflow-hidden"
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
              <div 
                className="flex items-center justify-center col-span-5 mt-1 border-t border-[var(--border-muted)] pt-1"
                onClick={(e) => e.stopPropagation()}
              >
                <input 
                  type="color" 
                  className="w-full h-6 cursor-pointer rounded bg-transparent border-none p-0 outline-none"
                  onChange={(e) => {
                    const hex = e.target.value;
                    editor.chain().focus().setHighlight({ color: hex + '33' }).run();
                  }}
                  title="Cor de fundo personalizada"
                />
              </div>
              <button 
                className="col-span-5 text-[10px] py-1 mt-1 hover:bg-[var(--bg-tertiary)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] uppercase tracking-wider font-bold"
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
          onClick={() => toggleSplitView(noteId)}
          className='flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent w-[28px] h-[28px] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors'
          title="Split View (Ctrl+\\)"
        >
          <LayoutTemplate className='size-4' />
        </button>
        <button
          onClick={togglePresentationMode}
          className='flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] bg-transparent w-[28px] h-[28px] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors'
          title="Modo Apresentação"
        >
          <Icon icon="lucide:maximize" className='size-4' />
        </button>
      </div>
    </div>
    </>
  );
};

const NoteEditor = ({ noteId, initialContent, onEditorCreated }) => {
  const { notes, updateNoteContent, setSaveStatus, selectedBlockIds, setBatchSelection, clearSelection, isPresentationMode, togglePresentationMode } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const note = notes.find(n => n._id === noteId);

  const [slashMenu, setSlashMenu] = useState(null);
  const slashMenuRef = useRef(null);
  const commandMenuRef = useRef(null);

  const handleTitleChangeLocal = useCallback(async (newTitle) => {
    useAppStore.setState(state => ({
      notes: state.notes.map(n => n._id === noteId ? { ...n, title: newTitle } : n)
    }));

    setIsSaving(true);
    setSaveStatus('saving');
    try {
      await api.put(`/notes/${noteId}`, { title: newTitle });
      setSaveStatus('saved');
    } catch (err) {
          setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }, [noteId, setSaveStatus]);




  const extensions = [
    UniqueId.configure({
      attributeName: 'id',
      types: ['paragraph', 'heading', 'taskList', 'taskItem', 'table', 'blockquote', 'codeBlock', 'image'],
      createId: () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
    }),
    StarterKit.configure({ codeBlock: false }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Typography,
    Image,
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === 'heading') return `Heading ${node.attrs.level}`
        return 'Digite / para comandos...'
      },
    }),
    TaskItem.configure({ nested: true }),
    TaskList,
    CodeBlockLowlight.extend({
      addNodeView() { return ReactNodeViewRenderer(CodeBlockComponent) },
    }).configure({ lowlight }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    CharacterCount.configure({ limit: null }),
    Mathematics,
    Commands.configure({ suggestionComponent: SlashMenu }),
    Bookmark,
    Callout,
    Focus,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
  ];

  const editor = useEditor({
    extensions,
    content: initialContent || '',
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      updateNoteContent(noteId, json);
      setIsSaving(true);
      setSaveStatus('saving');
      
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await api.put(`/notes/${noteId}`, { content: json });
          setSaveStatus('saved');
        } catch (err) {
          setSaveStatus('error');
        } finally {
          setIsSaving(false);
        }
      }, 1000);
    },
    editorProps: {
      attributes: {
        class: 'tiptap prose prose-invert prose-p:my-1 prose-headings:my-2 focus:outline-none w-full pb-32',
      },
      handleKeyDown: (view, event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;
          if ($from.parent.type.name === 'codeBlock') {
            const start = $from.start();
            const end = $from.end();
            const tr = state.tr.setSelection(selection.constructor.create(state.doc, start, end));
            view.dispatch(tr);
            return true;
          }
        }

        if (slashMenuRef.current) {
          if (event.key === 'Escape') {
            const { from } = slashMenuRef.current.range;
            view.dispatch(view.state.tr.delete(from, view.state.selection.from));
            setSlashMenu(null);
            slashMenuRef.current = null;
            return true;
          }
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter') {
            if (commandMenuRef.current && commandMenuRef.current.onKeyDown) {
              const handled = commandMenuRef.current.onKeyDown({ event });
              if (handled) {
                event.preventDefault();
                return true;
              }
            }
          }
          if (event.key === 'Backspace') {
            const { from } = slashMenuRef.current.range;
            if (view.state.selection.from <= from + 1) {
              setSlashMenu(null);
              slashMenuRef.current = null;
            }
          }
        }

        if (event.key === '/') {
          const { $from } = view.state.selection;
          const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc');
          const lastChar = textBefore[textBefore.length - 1];
          if (view.state.selection.$from.parent.type.name === 'codeBlock') return false;
          if (textBefore.length === 0 || lastChar === ' ' || lastChar === '\n') {
            requestAnimationFrame(() => {
              const coords = view.coordsAtPos(view.state.selection.from - 1);
              const range = { from: view.state.selection.from - 1, to: view.state.selection.from };
              const menuData = { range, coords: { top: coords.bottom + 4, left: coords.left }, query: '' };
              slashMenuRef.current = menuData;
              setSlashMenu(menuData);
            });
            return false;
          }
        }

        if (slashMenuRef.current && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          requestAnimationFrame(() => {
            if (!slashMenuRef.current) return;
            const { from } = slashMenuRef.current.range;
            const { to } = view.state.selection;
            const text = view.state.doc.textBetween(from, to, undefined, '\ufffc');
            if (text.startsWith('/')) {
              const query = text.slice(1);
              const updatedMenu = { ...slashMenuRef.current, query, range: { from, to } };
              slashMenuRef.current = updatedMenu;
              setSlashMenu(updatedMenu);
            } else {
              setSlashMenu(null);
              slashMenuRef.current = null;
            }
          });
        }
      },
    },
  });

  const handleGripClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!editor) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = editor.view.posAtCoords({ left: rect.right + 20, top: rect.top + rect.height / 2 });
    
    if (pos) {
      editor.chain().focus().setTextSelection(pos.pos).run();
    }

    setTimeout(() => {
      const { selection } = editor.state;
      const range = { from: selection.from, to: selection.from };
      const menuData = { range, coords: { top: rect.bottom + 4, left: rect.left }, query: '' };
      slashMenuRef.current = menuData;
      setSlashMenu(menuData);
    }, 10);
  }, [editor]);

  useEffect(() => {
    if (editor && onEditorCreated) onEditorCreated(editor);
  }, [editor, onEditorCreated]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape' && selectedBlockIds.size > 0) {
        clearSelection();
        e.preventDefault();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && document.activeElement?.closest('.tiptap')) {
        const selection = window.getSelection();
        if (selection.toString() === '') {
          const editorEl = containerRef.current?.querySelector('.tiptap');
          const ids = Array.from(editorEl?.children || []).map(b => b.getAttribute('id')).filter(Boolean);
          setBatchSelection(ids);
          e.preventDefault();
        }
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlockIds.size > 0) {
        if (!editor) return;
        const idsToDelete = Array.from(selectedBlockIds);
        editor.chain().focus();
        idsToDelete.forEach(id => {
          const blockEl = containerRef.current?.querySelector(`[id="${id}"]`);
          if (!blockEl) return;
          const pos = editor.view.posAtDOM(blockEl, 0);
          const node = editor.state.doc.nodeAt(pos);
          if (node) editor.chain().deleteRange({ from: pos, to: pos + node.nodeSize });
        });
        editor.chain().run();
        clearSelection();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedBlockIds, editor, clearSelection, setBatchSelection]);




  return (
    <div 
      ref={containerRef}
      className="flex flex-col flex-1 min-h-full text-[var(--text-primary)] cursor-text relative"
    >
      {!isPresentationMode && (
        <div className="sticky top-0 z-[100]" onClick={(e) => e.stopPropagation()}>
          <MenuBar editor={editor} noteId={noteId} isSaving={isSaving} note={note} />
        </div>
      )}

      {isPresentationMode && (
        <button 
          onClick={togglePresentationMode}
          className="fixed top-4 right-4 z-[1000] p-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] shadow-xl transition-all opacity-20 hover:opacity-100"
        >
          <Icon icon="lucide:minimize" className='size-5' />
        </button>
      )}

      <div className='flex-1 flex flex-col pt-14 pb-32 note-editor-clickable-area'>
        <div className='w-full max-w-[720px] mx-auto px-5 sm:px-10'>
          <div className='flex flex-col gap-2 mb-4'>
            <textarea 
              rows="1"
              className="w-full bg-transparent border-none text-3xl sm:text-4xl font-bold text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-0 px-0 py-2 leading-[1.2] tracking-tight resize-none overflow-hidden h-auto relative z-10"
              placeholder="Título do Cartão..."
              value={note?.title || ""}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              ref={(tag) => {
                if (tag) {
                  tag.style.height = 'auto';
                  tag.style.height = tag.scrollHeight + 'px';
                }
              }}
              onChange={(e) => handleTitleChangeLocal(e.target.value)}
            />
            {note?.updatedAt && (
              <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] font-[family:var(--font-ui)] opacity-70 mt-1">
                <Icon icon="lucide:clock" size={12} />
                <span>Última edição: {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(note.updatedAt))}</span>
              </div>
            )}
          </div>
          
          <div className='relative' style={{ fontFamily: 'var(--font-ui)', fontSize: '16px', lineHeight: '1.65' }}>
            {editor && (
              <div className="tiptap-wrapper w-full" onClick={(e) => {
                const block = e.target.closest('[id]');
                if (block && (e.ctrlKey || e.metaKey)) {
                  useAppStore.getState().toggleBlockSelection(block.getAttribute('id'));
                  e.stopPropagation();
                } else if (block && e.shiftKey) {
                  useAppStore.getState().addBlockToSelection(block.getAttribute('id'));
                  e.stopPropagation();
                }
              }}>
                <DragHandle editor={editor} tippyOptions={{ duration: 150, offset: [0, 20] }} className="drag-handle-container opacity-0">
                  <div 
                    className='p-1.5 hover:bg-[var(--bg-tertiary)] rounded-[var(--radius-sm)] cursor-grab active:cursor-grabbing text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all border border-transparent hover:border-[var(--border-muted)]' 
                    role="button" 
                    tabIndex={-1}
                    onMouseDown={handleGripClick}
                  >
                    <GripVertical size={14} />
                  </div>
                </DragHandle>
                <TableBubbleMenu editor={editor} />
                <SelectionToolbar editor={editor} containerRef={containerRef} />
                <EditorContent editor={editor} />
              </div>
            )}
          </div>
        </div>
      </div>

      {slashMenu && editor && createPortal(
        <div style={{ position: 'fixed', top: slashMenu.coords.top, left: slashMenu.coords.left, zIndex: 9999 }} onMouseDown={(e) => e.preventDefault()}>
          <SlashMenu ref={commandMenuRef} editor={editor} range={slashMenu.range} query={slashMenu.query} onClose={() => { setSlashMenu(null); slashMenuRef.current = null; }} />
        </div>,
        document.body
      )}
    </div>
  );
};

export default NoteEditor;
