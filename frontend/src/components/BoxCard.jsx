import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatDate } from '../lib/utils.js';
import ConfirmDialog from './ui/ConfirmDialog.jsx';

const BoxCard = ({ box, onEnter, isDragOver = false, selected = false, onSelect }) => {
  const { deleteBox } = useAppStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = (e) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      e.preventDefault();
      onSelect && onSelect(box._id, e.shiftKey);
    } else {
      onEnter && onEnter();
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowConfirm(false);
    deleteBox(box._id);
  };

  const isOpen = isDragOver;

  return (
    <>
  <ConfirmDialog
    isOpen={showConfirm}
    title="Excluir caixa"
    message={`"${box.name}" e todo o seu conteúdo serão excluídos permanentemente.`}
    onConfirm={handleConfirmDelete}
    onCancel={() => setShowConfirm(false)}
  />

  <div
    onClick={handleClick}
    className={`group relative w-full h-[140px] mt-4 cursor-pointer select-none perspective-[1200px]
      ${selected ? 'scale-[1.01]' : 'hover:scale-[1.01] transition-transform duration-300'}`}
  >
    <div className={`absolute inset-0 z-10 bg-[var(--bg-secondary)] border transition-all duration-300 rounded-[var(--radius-md)] flex flex-col justify-end p-4
      ${selected 
        ? 'border-[var(--accent-blue)] ring-2 ring-[var(--accent-blue-subtle)]' 
        : isOpen
        ? 'border-[var(--accent-blue)] bg-[var(--bg-tertiary)] shadow-[0_0_15px_rgba(var(--accent-blue-rgb),0.2)]'
        : 'border-[var(--border-default)] group-hover:border-[var(--accent-blue)] group-hover:bg-[var(--bg-tertiary)]'
      }`}
    >
      <div className="z-10">
        <h3 className="font-[family:var(--font-mono)] text-[length:var(--text-sm)] font-[var(--weight-semibold)] text-[var(--text-primary)] truncate leading-snug pr-8">
          {box.name}
        </h3>
        <span className="font-[family:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--text-muted)] uppercase tracking-wider">
          {box.createdAt ? formatDate(new Date(box.createdAt)) : ''}
        </span>
      </div>
    </div>

    <div 
      className={`absolute top-0 left-0 right-0 z-20 h-[40px] border transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] origin-top rounded-t-[var(--radius-md)] -mb-[1px]
        ${selected 
          ? 'bg-[var(--bg-tertiary)] border-[var(--accent-blue)]' 
          : 'bg-[var(--bg-tertiary)] border-[var(--border-default)] group-hover:border-[var(--accent-blue)]'
        }
        ${isOpen 
          ? 'rotateX(-120deg) brightness-75 shadow-inner translate-z-10' 
          : 'rotateX(0deg)'
        }`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-black/5" />
      
      <div className={`absolute bottom-2.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full transition-colors duration-300
        ${selected || 'group-hover:bg-[var(--accent-blue)]'} bg-[var(--border-active)] opacity-30`} 
      />
    </div>

    <button
      onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
      className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 p-2 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--accent-red)] hover:bg-[var(--accent-red-subtle)] hover:scale-110 active:scale-90"
      title="Excluir Caixa"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
    </button>
  </div>
</>
  );
};

export default BoxCard;
