import React from 'react';
import { Trash2, Copy, MoveUp, MoveDown, Type, CheckSquare, List, ListOrdered, Quote, Code, Command, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const SelectionToolbar = ({ editor, containerRef }) => {
  const { selectedBlockIds, clearSelection } = useAppStore();
  
  if (selectedBlockIds.size === 0) return null;

  const handleClear = (e) => {
    e.stopPropagation();
    clearSelection();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
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
  };

  const handleDuplicate = (e) => {
    e.stopPropagation();
    if (!editor) return;
    
    const ids = Array.from(selectedBlockIds);
    editor.chain().focus();
    
    const nodesToDuplicate = ids.map(id => {
       const blockEl = containerRef.current?.querySelector(`[id="${id}"]`);
       if (!blockEl) return null;
       const pos = editor.view.posAtDOM(blockEl, 0);
       return editor.state.doc.nodeAt(pos)?.toJSON();
    }).filter(Boolean);

    if (nodesToDuplicate.length === 0) return;

    const lastId = ids[ids.length - 1];
    const lastEl = containerRef.current?.querySelector(`[id="${lastId}"]`);
    if (!lastEl) return;
    
    const lastPos = editor.view.posAtDOM(lastEl, 0);
    const lastNode = editor.state.doc.nodeAt(lastPos);
    const insertPos = lastPos + (lastNode?.nodeSize || 0);

    editor.chain().insertContentAt(insertPos, nodesToDuplicate).run();
  };

  const firstId = Array.from(selectedBlockIds)[0];
  const firstEl = containerRef.current?.querySelector(`[id="${firstId}"]`);
  const rect = firstEl?.getBoundingClientRect();

  if (!rect) return null;

  return (
    <div 
      className="fixed z-[1000] flex items-center bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-[0_8px_24px_rgba(0,0,0,0.35)] h-9 px-2 gap-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200"
      style={{
        top: Math.max(50, rect.top - 48),
        left: '50%',
        transform: 'translateX(-50%)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1 text-[var(--text-muted)] text-[11px] font-mono pr-2 border-r border-[var(--border-default)] mr-1">
        <Command size={10} />
        <span>{selectedBlockIds.size} {selectedBlockIds.size === 1 ? 'bloco' : 'blocos'}</span>
      </div>

      <button onClick={handleDelete} className="p-1.5 hover:bg-[var(--accent-red-subtle)] hover:text-[var(--accent-red)] rounded text-[var(--text-secondary)] transition-colors" title="Deletar">
        <Trash2 size={14} />
      </button>

      <button onClick={handleDuplicate} className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded text-[var(--text-secondary)] transition-colors" title="Duplicar">
        <Copy size={14} />
      </button>

      <div className="w-[1px] h-4 bg-[var(--border-default)] mx-1" />

      <div className="w-[1px] h-4 bg-[var(--border-default)] mx-1" />

      <button onClick={handleClear} className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded text-[var(--text-secondary)] transition-colors" title="Limpar Seleção">
        <X size={14} />
      </button>
    </div>
  );
};

export default SelectionToolbar;
