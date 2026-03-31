import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Editor } from '@tiptap/react';
import {
  Type, Heading1, Heading2, Heading3, Quote, 
  Megaphone, List, ListOrdered, CheckSquare, 
  Code, Minus, Table, 
  Image as ImageIcon, File, 
  Pin, Columns, LayoutGrid, Printer
} from 'lucide-react';

interface CommandProps {
  editor: Editor;
  range: { from: number; to: number };
}

interface SlashMenuItem {
  title: string;
  desc: string;
  shortcut: string;
  icon: React.ReactNode;
  color: string;
  command: (props: CommandProps) => void;
}

interface SlashMenuGroup {
  group: string;
  items: SlashMenuItem[];
}

interface SlashMenuProps {
  editor: any;
  range: { from: number; to: number } | null;
  onClose: () => void;
  query?: string;
}

export interface SlashMenuHandle {
  onKeyDown: (props: { event: any }) => boolean;
}

const SlashMenu = forwardRef<SlashMenuHandle, SlashMenuProps>(({ editor, range, onClose, query = '' }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const items: SlashMenuGroup[] = [
    {
      group: 'Texto',
      items: [
        { title: 'Texto', desc: 'Parágrafo simples', shortcut: '/txt', color: 'text-[var(--text-secondary)]', icon: <Type size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setParagraph().run() },
        { title: 'Título 1', desc: 'Título de seção', shortcut: '/h1', color: 'text-[var(--accent-blue)]', icon: <Heading1 size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run() },
        { title: 'Título 2', desc: 'Subtítulo', shortcut: '/h2', color: 'text-[var(--accent-blue)]', icon: <Heading2 size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run() },
        { title: 'Título 3', desc: 'Título menor', shortcut: '/h3', color: 'text-[var(--accent-blue)]', icon: <Heading3 size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run() },
      ]
    },
    {
      group: 'Listas',
      items: [
        { title: 'Lista', desc: 'Lista com marcadores', shortcut: '/ul', color: 'text-[var(--accent-orange)]', icon: <List size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run() },
        { title: 'Numerada', desc: 'Lista ordenada', shortcut: '/ol', color: 'text-[var(--accent-orange)]', icon: <ListOrdered size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run() },
        { title: 'Checklist', desc: 'Lista de tarefas', shortcut: '/todo', color: 'text-[var(--accent-green)]', icon: <CheckSquare size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleTaskList().run() },
      ]
    },
    {
      group: 'Blocos',
      items: [
        { title: 'Citação', desc: 'Bloco de citação', shortcut: '/q', color: 'text-[var(--accent-purple)]', icon: <Quote size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run() },
        { title: 'Aviso', desc: 'Bloco de destaque', shortcut: '/call', color: 'text-[var(--accent-orange)]', icon: <Megaphone size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).insertContent({ type: 'callout', attrs: { type: 'info' } }).run() },
        { title: 'Código', desc: 'Bloco de código', shortcut: '/cod', color: 'text-[var(--accent-green)]', icon: <Code size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run() },
        { title: 'Tabela', desc: 'Grade 3×3 editável', shortcut: '/tab', color: 'text-[var(--accent-blue)]', icon: <LayoutGrid size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
        { title: 'Divisor', desc: 'Linha separadora', shortcut: '/div', color: 'text-[var(--text-muted)]', icon: <Minus size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run() },
        { title: 'Link Favorito', desc: 'Prévia de link', shortcut: '/link', color: 'text-[var(--accent-red)]', icon: <Pin size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).insertContent({ type: 'bookmark', attrs: { url: null } }).run() },
      ]
    },
    {
      group: 'Mídia',
      items: [
        { title: 'Imagem', desc: 'Inserir do computador', shortcut: '/img', color: 'text-[var(--accent-purple)]', icon: <ImageIcon size={18} />, command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).run();
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e: any) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const base64 = ev.target?.result as string;
                  editor.chain().focus().setImage({ src: base64 }).run();
                };
                reader.readAsDataURL(file);
              }
            };
            input.click();
          } 
        },
        { title: 'Documento', desc: 'Anexar arquivo', shortcut: '/doc', color: 'text-[var(--accent-blue)]', icon: <File size={18} />, command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).run();
            const input = document.createElement('input');
            input.type = 'file';
            input.onchange = (e: any) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const base64 = ev.target?.result as string;
                  editor.chain().focus().insertContent({
                    type: 'attachment',
                    attrs: { url: base64, filename: file.name }
                  }).run();
                };
                reader.readAsDataURL(file);
              }
            };
            input.click();
          } 
        },
      ]
    },
    {
      group: 'Ações',
      items: [
        { 
          title: 'Exportar PDF', 
          desc: 'Imprimir nota ou salvar em documento', 
          shortcut: '/pdf', 
          color: 'text-[var(--text-primary)]', 
          icon: <Printer size={18} />, 
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).run();
            // Dá um tempo curto para o menu desaparecer antes de imprimir
            setTimeout(() => {
              window.print();
            }, 100);
          } 
        }
      ]
    }
  ];

  const filteredGroups = items.map(group => ({
    ...group,
    items: group.items.filter(item => 
      !query || 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.desc.toLowerCase().includes(query.toLowerCase()) ||
      item.shortcut.toLowerCase().includes(query.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  const allItems = filteredGroups.flatMap(g => g.items);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const selectItem = (index: number) => {
    const item = allItems[index];
    if (item && editor) {
      const execRange = range || { from: editor.state.selection.from, to: editor.state.selection.to };
      onClose?.(); 
      item.command({ editor, range: execRange });
    }
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + allItems.length - 1) % allItems.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % allItems.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.slash-menu')) {
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  return (
    <div 
      className="slash-menu bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[0_12px_40px_rgba(0,0,0,0.4)] w-[300px] max-h-[380px] overflow-y-auto scrollbar-none p-1.5 z-50"
      tabIndex={-1}
      onMouseDown={(e) => e.preventDefault()}
    >
      {filteredGroups.length === 0 && (
        <div className="p-6 text-center text-[12px] text-[var(--text-muted)] font-medium">Nenhum resultado encontrado</div>
      )}
      {filteredGroups.map((group) => (
        <div key={group.group}>
          <div className="px-2.5 pt-3 pb-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.1em]">
            {group.group}
          </div>
          {group.items.map((item) => {
            const globalIndex = allItems.indexOf(item);
            const isSelected = globalIndex === selectedIndex;
            return (
              <button
                key={item.title}
                type="button"
                className={`flex items-center w-full gap-3 px-2.5 py-2 text-left transition-all duration-100 rounded-[var(--radius-md)] ${
                  isSelected 
                    ? 'bg-[var(--accent-blue-subtle)] shadow-sm' 
                    : 'hover:bg-[var(--bg-tertiary)]'
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectItem(globalIndex);
                }}
                onMouseEnter={() => setSelectedIndex(globalIndex)}
              >
                <div className={`flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] ${item.color} transition-colors ${isSelected ? 'bg-[var(--accent-blue-subtle)] scale-105' : ''}`}>
                  {item.icon}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className={`text-[13px] font-medium truncate transition-colors ${isSelected ? 'text-[var(--accent-blue)]' : 'text-[var(--text-primary)]'}`}>{item.title}</div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate">{item.desc}</div>
                </div>
                <div className={`text-[10px] font-mono transition-opacity ${isSelected ? 'opacity-80 text-[var(--accent-blue)]' : 'opacity-30 text-[var(--text-muted)]'}`}>
                  {item.shortcut}
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
});

export default SlashMenu;
