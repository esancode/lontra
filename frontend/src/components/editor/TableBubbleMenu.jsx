import React from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Trash2, Plus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Grid3x3 } from 'lucide-react';

const TableBubbleMenu = ({ editor }) => {
  if (!editor) return null;

  return (
    <BubbleMenu 
      editor={editor} 
      tippyoptions={{ duration: 100, placement: 'top' }}
      shouldShow={({ editor, state }) => {
        return editor.isActive('table');
      }}
      className="flex items-center gap-1 p-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-lg animate-in zoom-in-95"
    >
      <div className="flex items-center gap-1 px-1 border-r border-[var(--border-muted)] mr-1 text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-wider">
        <Grid3x3 size={12} className="mr-1" />
        Mesa
      </div>

      <button 
        onClick={() => editor.chain().focus().addColumnBefore().run()}
        className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        title="Adicionar coluna antes"
      >
        <ArrowLeft size={14} />
      </button>
      <button 
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        title="Adicionar coluna depois"
      >
        <ArrowRight size={14} />
      </button>
      <button 
        onClick={() => editor.chain().focus().deleteColumn().run()}
        className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        title="Excluir coluna"
      >
        <span className="text-[10px] font-bold text-[#f85149]">C-</span>
      </button>

      <div className="w-[1px] h-4 bg-[var(--border-muted)] mx-1" />

      <button 
        onClick={() => editor.chain().focus().addRowBefore().run()}
        className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        title="Adicionar linha acima"
      >
        <ArrowUp size={14} />
      </button>
      <button 
        onClick={() => editor.chain().focus().addRowAfter().run()}
        className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        title="Adicionar linha abaixo"
      >
        <ArrowDown size={14} />
      </button>
      <button 
        onClick={() => editor.chain().focus().deleteRow().run()}
        className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        title="Excluir linha"
      >
        <span className="text-[10px] font-bold text-[#f85149]">L-</span>
      </button>

      <div className="w-[1px] h-4 bg-[var(--border-muted)] mx-1" />

      <button 
        onClick={() => editor.chain().focus().deleteTable().run()}
        className="p-1.5 bg-[#f85149]/10 hover:bg-[#f85149]/20 rounded-[var(--radius-sm)] text-[#f85149] transition-colors flex items-center gap-1"
        title="Excluir Tabela Inteira"
      >
        <Trash2 size={14} />
      </button>
    </BubbleMenu>
  );
};

export default TableBubbleMenu;
