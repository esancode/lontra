import React from 'react';
import { ChevronLeft, Zap } from 'lucide-react';
import Breadcrumbs from '../../../components/sidebar/Breadcrumbs';
import GlobalSearch from '../../../components/ui/GlobalSearch';

interface HomeTopBarProps {
  goBack: () => void;
  canGoBack: boolean;
  goToBox: (id: string | null) => void;
  theme: string;
  setTheme: (theme: string) => void;
  isInNote: boolean;
  creatingBox: boolean;
  setCreatingBox: (v: boolean) => void;
  newBoxName: string;
  setNewBoxName: (v: string) => void;
  handleCreateBox: (name: string) => void;
  creatingNote: boolean;
  setCreatingNote: (v: boolean) => void;
  newNoteName: string;
  setNewNoteName: (v: string) => void;
  handleCreateNote: (title: string) => void;
  onOpenQuickNote?: () => void;
}

const HomeTopBar: React.FC<HomeTopBarProps> = ({
  goBack, canGoBack, goToBox, theme, setTheme, isInNote,
  creatingBox, setCreatingBox, newBoxName, setNewBoxName, handleCreateBox,
  creatingNote, setCreatingNote, newNoteName, setNewNoteName, handleCreateNote,
  onOpenQuickNote
}) => {
  return (
    <div className='no-print sticky top-0 w-full flex-shrink-0 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] px-3 h-[var(--topbar-height)] flex items-center gap-2 z-[120] shadow-sm'>
      <button
        type="button"
        onClick={goBack}
        disabled={!canGoBack}
        className={`flex-shrink-0 flex items-center gap-1 text-[length:var(--text-sm)] font-[family:var(--font-ui)] transition-colors px-2 py-1 rounded-[var(--radius-sm)] ${canGoBack ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] cursor-pointer' : 'text-[var(--text-muted)] opacity-25 cursor-default'}`}
        title="Voltar"
      >
        <ChevronLeft size={15} strokeWidth={2} />
        <span className='hidden md:inline'>Voltar</span>
      </button>

      <div className='w-px h-5 bg-[var(--border-default)] flex-shrink-0' />

      <div className='flex-1 min-w-0 overflow-x-auto scrollbar-none'>
        <Breadcrumbs onNavigateBox={goToBox} />
      </div>

      <div className='w-px h-5 bg-[var(--border-default)] flex-shrink-0' />

      <GlobalSearch />

    

      {!isInNote && (
        <>
          <div className='w-px h-5 bg-[var(--border-default)] flex-shrink-0' />
          <div className='flex gap-1.5 flex-shrink-0 items-center'>
            {creatingBox ? (
              <form 
                className='flex gap-1 items-center' 
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  if (newBoxName.trim()) handleCreateBox(newBoxName.trim());
                }}
              >
                <input 
                  autoFocus 
                  type="text" 
                  placeholder="Nome..." 
                  value={newBoxName} 
                  onChange={(e) => setNewBoxName(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Escape' && setCreatingBox(false)} 
                  className='bg-[var(--bg-primary)] border border-[var(--accent-blue)] rounded-[var(--radius-sm)] text-[var(--text-primary)] text-[length:var(--text-sm)] h-[28px] px-2 focus:outline-none w-24 sm:w-36' 
                />
                <button type='submit' className='bg-[var(--accent-blue)] text-[var(--text-on-accent)] h-[28px] px-2 rounded-[var(--radius-sm)] text-[length:var(--text-xs)] hover:brightness-110'>OK</button>
                <button type='button' onClick={() => setCreatingBox(false)} className='text-[var(--text-muted)] h-[28px] w-[28px] flex items-center justify-center hover:text-[var(--text-primary)]'>✕</button>
              </form>
            ) : (
              <button 
                type="button" 
                onClick={() => { setCreatingBox(true); setCreatingNote(false) }} 
                className='bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-default)] h-[28px] px-2 sm:px-3 rounded-[var(--radius-sm)] text-[length:var(--text-xs)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all'
              >
                + Caixa
              </button>
            )}

            {creatingNote ? (
              <form 
                className='flex gap-1 items-center' 
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  if (newNoteName.trim()) handleCreateNote(newNoteName.trim());
                }}
              >
                <input 
                  autoFocus 
                  type="text" 
                  placeholder="Título..." 
                  value={newNoteName} 
                  onChange={(e) => setNewNoteName(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Escape' && setCreatingNote(false)} 
                  className='bg-[var(--bg-primary)] border border-[var(--accent-blue)] rounded-[var(--radius-sm)] text-[var(--text-primary)] text-[length:var(--text-sm)] h-[28px] px-2 focus:outline-none w-24 sm:w-36' 
                />
                <button type='submit' className='bg-[var(--accent-blue)] text-[var(--text-on-accent)] h-[28px] px-2 rounded-[var(--radius-sm)] text-[length:var(--text-xs)] hover:brightness-110'>OK</button>
                <button type='button' onClick={() => setCreatingNote(false)} className='text-[var(--text-muted)] h-[28px] w-[28px] flex items-center justify-center hover:text-[var(--text-primary)]'>✕</button>
              </form>
            ) : (
              <button 
                type="button" 
                onClick={() => { setCreatingNote(true); setCreatingBox(false) }} 
                className='bg-[var(--accent-blue)] text-[var(--text-on-accent)] h-[28px] px-2 sm:px-3 rounded-[var(--radius-sm)] text-[length:var(--text-xs)] hover:brightness-110 transition-all font-[var(--weight-medium)]'
              >
                + Cartão
              </button>
            )}

            <button
              type="button"
              onClick={onOpenQuickNote}
              className='hidden sm:flex items-center gap-1.5 border border-[var(--accent-blue)] bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] h-[28px] px-2 sm:px-3 rounded-[var(--radius-sm)] text-[length:var(--text-xs)] hover:bg-[var(--accent-blue)] hover:text-white transition-all font-[var(--weight-medium)] group'
              title="Lontra IA (Ctrl+Shift+K)"
            >
              <img src="/favicon.png" className="w-[14px] h-[14px] drop-shadow-sm filter brightness-110 saturate-[1.2] invert-[0.3]" style={{filter: 'brightness(0) saturate(100%) invert(35%) sepia(85%) saturate(1637%) hue-rotate(200deg) brightness(98%) contrast(92%)'}} alt="Lontra" />
              <span className="hidden sm:inline">Lontra IA</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default HomeTopBar;
