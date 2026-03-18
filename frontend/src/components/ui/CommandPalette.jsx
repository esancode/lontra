import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SearchIcon, FileIcon, SettingsIcon, PlusIcon, FolderPlusIcon, ColumnsIcon, MoonIcon, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router';

const CommandPalette = () => {
    const { commandPaletteOpen, toggleCommandPalette, notes, boxes, createNote, createBox, setTheme, toggleSplitView } = useAppStore();
    const [searchQuery, setSearchQuery] = useState('');
    const inputRef = useRef(null);
    const modalRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (commandPaletteOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setSearchQuery('');
        }
    }, [commandPaletteOpen]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                toggleCommandPalette();
            }
        };
        
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                toggleCommandPalette();
            }
        };

        if (commandPaletteOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [commandPaletteOpen, toggleCommandPalette]);

    if (!commandPaletteOpen) return null;

    const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);

    const commands = [
      { id: 'c1', name: 'Novo Cartão', icon: <PlusIcon className='size-4'/>, action: () => { createNote('Cartão Sem Título'); toggleCommandPalette(); } },
      { id: 'c2', name: 'Nova Caixa', icon: <FolderPlusIcon className='size-4'/>, action: () => { createBox('Nova Caixa'); toggleCommandPalette(); } },
      { id: 'c3', name: 'Alternar Tema', icon: <MoonIcon className='size-4'/>, action: () => { setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); toggleCommandPalette(); } },
      { id: 'c4', name: 'Split View', icon: <ColumnsIcon className='size-4'/>, action: () => { toggleSplitView(); toggleCommandPalette(); } }
    ].filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));


    return (
        <div className='fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]'>
            <div className='fixed inset-0 bg-black/50 backdrop-blur-[4px]' aria-hidden="true"></div>

            <div 
                ref={modalRef}
                className='relative w-full max-w-[560px] mx-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[0_16px_48px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150'
            >
                <div className='flex items-center px-[var(--space-4)] border-b border-[var(--border-muted)] h-[48px]'>
                    <SearchIcon className='size-4 text-[var(--text-muted)] mr-[var(--space-3)]' />
                    <input 
                        ref={inputRef}
                        type="text" 
                        className='flex-1 bg-transparent border-none text-[length:var(--text-base)] font-[family:var(--font-mono)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-0'
                        placeholder="Buscar cartões, executar comandos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className='max-h-[360px] overflow-y-auto py-[var(--space-2)]'>
                    
                    {filteredNotes.length > 0 && (
                        <div className='mb-2'>
                            <div className='px-[var(--space-4)] py-1 text-[length:var(--text-2xs)] font-[family:var(--font-mono)] font-[var(--weight-semibold)] text-[var(--text-muted)] uppercase tracking-wider'>
                                Resultados / Cartões
                            </div>
                            {filteredNotes.map(note => (
                                <button 
                                  key={note._id}
                                  onClick={() => { navigate(`/note/${note._id}`); toggleCommandPalette(); }}
                                  className='w-full flex items-center px-[var(--space-4)] h-[36px] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] text-[var(--text-secondary)] transition-colors group'
                                >
                                    <FileIcon className='size-4 mr-[var(--space-3)] group-hover:text-[var(--accent-blue)] transition-colors' />
                                    <span className='font-[family:var(--font-ui)] text-[length:var(--text-sm)] truncate flex-1 text-left'>{note.title}</span>
                                    {note.boxId && (
                                        <span className='text-[length:var(--text-xs)] font-[family:var(--font-mono)] text-[var(--text-muted)]'>
                                            {boxes.find(b => b._id === note.boxId)?.name || ''}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {commands.length > 0 && (
                        <div>
                            <div className='px-[var(--space-4)] py-1 text-[length:var(--text-2xs)] font-[family:var(--font-mono)] font-[var(--weight-semibold)] text-[var(--text-muted)] uppercase tracking-wider'>
                                Comandos
                            </div>
                            {commands.map(cmd => (
                                <button 
                                  key={cmd.id}
                                  onClick={cmd.action}
                                  className='w-full flex items-center px-[var(--space-4)] h-[36px] hover:bg-[var(--accent-blue-subtle)] hover:text-[var(--accent-blue)] text-[var(--text-secondary)] transition-colors group'
                                >
                                    <div className='mr-[var(--space-3)] group-hover:text-[var(--accent-blue)] transition-colors'>{cmd.icon}</div>
                                    <span className='font-[family:var(--font-ui)] text-[length:var(--text-sm)] flex-1 text-left'>{cmd.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {filteredNotes.length === 0 && commands.length === 0 && (
                        <div className='px-[var(--space-4)] py-[var(--space-4)] text-center text-[length:var(--text-sm)] text-[var(--text-muted)] font-[family:var(--font-ui)]'>
                            Nenhum resultado encontrado para "{searchQuery}"
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
