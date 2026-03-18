import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  Type, Heading1, Heading2, Heading3, Quote, 
  Megaphone, List, ListOrdered, CheckSquare, 
  ChevronRight, Code, Sigma, Minus, Table, 
  Link2, Image as ImageIcon, File, Palette, 
  Pin, Link
} from 'lucide-react';

const SlashMenu = forwardRef(({ editor, range, onClose, query = '' }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const items = [
    {
      group: 'BLOCOS DE TEXTO',
      items: [
        { title: 'Texto', desc: 'Parágrafo simples', shortcut: '/txt', icon: <Type size={16} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setParagraph().run() },
        { title: 'Título 1', desc: 'Título de seção', shortcut: '/h1', icon: <Heading1 size={16} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run() },
        { title: 'Título 2', desc: 'Subtítulo', shortcut: '/h2', icon: <Heading2 size={16} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run() },
        { title: 'Título 3', desc: 'Título menor', shortcut: '/h3', icon: <Heading3 size={16} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run() },
        { title: 'Citação', desc: 'Bloco de citação', shortcut: '/q', icon: <Quote size={16} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run() },
        { title: 'Aviso', desc: 'Bloco de destaque', shortcut: '/call', icon: <Megaphone size={16} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).insertContent({ type: 'callout', attrs: { type: 'info' } }).run() },
        { title: 'Link Favorito', desc: 'Prévia de link', shortcut: '/link', icon: <Pin size={16} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).insertContent({ type: 'bookmark', attrs: { url: null } }).run() },
      ]
    },
    {
      group: 'LISTAS',
      items: [
        { title: 'Lista', desc: 'Lista com marcadores', shortcut: '/ul', icon: <List size={16} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run() },
        { title: 'Numerada', desc: 'Lista ordenada', shortcut: '/ol', icon: <ListOrdered size={16} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run() },
        { title: 'Checklist', desc: 'Lista de tarefas', shortcut: '/todo', icon: <CheckSquare size={16} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleTaskList().run() },
      ]
    },
    {
      group: 'DEVELOPER',
      items: [
        { title: 'Código', desc: 'Bloco de código', shortcut: '/cod', icon: <Code size={16} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run() },
        { title: 'Tabela', desc: 'Grade editável', shortcut: '/tab', icon: <Table size={16} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
        { title: 'Divisor', desc: 'Linha separadora', shortcut: '/div', icon: <Minus size={16} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run() },
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

  const selectItem = (index) => {
    const item = allItems[index];
    if (item && editor) {
      const execRange = range || { from: editor.state.selection.from, to: editor.state.selection.to };
      item.command({ editor, range: execRange });
      onClose?.();
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
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.slash-menu')) {
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  return (
    <div 
      className="slash-menu bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-[320px] max-h-[400px] overflow-y-auto scrollbar-none p-1 z-50"
      tabIndex={-1}
      onMouseDown={(e) => e.preventDefault()}
    >
      {filteredGroups.length === 0 && (
        <div className="p-4 text-center text-[12px] text-[var(--text-muted)]">Nenhum resultado</div>
      )}
      {filteredGroups.map((group, gIdx) => (
        <div key={group.group}>
          <div className="px-3 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            {group.group}
          </div>
          {group.items.map((item, iIdx) => {
            const globalIndex = allItems.indexOf(item);
            const isSelected = globalIndex === selectedIndex;
            return (
              <button
                key={item.title}
                className={`flex items-center w-full gap-3 px-3 py-2 text-left transition-colors rounded-[var(--radius-sm)] ${
                  isSelected ? 'bg-[var(--bg-tertiary)]' : 'hover:bg-[var(--bg-tertiary)]'
                }`}
                onClick={() => selectItem(globalIndex)}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                  {item.icon}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-[13px] font-medium text-[var(--text-primary)] truncate">{item.title}</div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate">{item.desc}</div>
                </div>
                <div className="text-[10px] font-mono text-[var(--text-muted)] opacity-50">
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
