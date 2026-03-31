import React from 'react';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { 
  Trash2, 
  PlusSquare, 
  MinusSquare,
  Columns,
  Rows,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface TableBubbleMenuProps {
  editor: Editor;
}

const TableBubbleMenu: React.FC<TableBubbleMenuProps> = ({ editor }) => {
  if (!editor) return null;

  const shouldShow = ({ editor }: { editor: Editor }) => {
    return editor.isActive('table');
  };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      tippyOptions={{ duration: 100, placement: 'top-start', offset: [0, 10] }}
      className="flex items-center bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-xl p-1 gap-0.5 z-[1001]"
    >
      <div className="flex items-center gap-0.5 border-r border-[var(--border-muted)] pr-1 mr-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          title="Adicionar coluna antes"
        >
          <div className="relative">
            <Columns size={14} />
            <ChevronLeft size={8} className="absolute -left-1 top-1/2 -translate-y-1/2" />
          </div>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          title="Adicionar coluna depois"
        >
          <div className="relative">
            <Columns size={14} />
            <ChevronRight size={8} className="absolute -right-1 top-1/2 -translate-y-1/2" />
          </div>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().deleteColumn().run()}
          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--accent-red)] hover:bg-[var(--accent-red-subtle)] transition-colors"
          title="Deletar coluna"
        >
          <MinusSquare size={14} />
        </button>
      </div>

      <div className="flex items-center gap-0.5 border-r border-[var(--border-muted)] pr-1 mr-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().addRowBefore().run()}
          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          title="Adicionar linha antes"
        >
          <div className="relative">
            <Rows size={14} />
            <ChevronUp size={8} className="absolute left-1/2 -translate-x-1/2 -top-1" />
          </div>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().addRowAfter().run()}
          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          title="Adicionar linha depois"
        >
          <div className="relative">
            <Rows size={14} />
            <ChevronDown size={8} className="absolute left-1/2 -translate-x-1/2 -bottom-1" />
          </div>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().deleteRow().run()}
          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--accent-red)] hover:bg-[var(--accent-red-subtle)] transition-colors"
          title="Deletar linha"
        >
          <MinusSquare size={14} className="rotate-90" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => editor.chain().focus().deleteTable().run()}
        className="flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-sm)] text-[var(--accent-red)] hover:bg-[var(--accent-red-subtle)] transition-colors text-[12px] font-medium"
        title="Deletar tabela"
      >
        <Trash2 size={14} />
        <span>Tabela</span>
      </button>
    </BubbleMenu>
  );
};

export default TableBubbleMenu;
