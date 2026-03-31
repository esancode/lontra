import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { EditorContent, Editor } from '@tiptap/react';
import { useAppStore } from '../../store/useAppStore';
import { useNoteEditor } from './hooks/useNoteEditor';
import MenuBar from './subcomponents/MenuBar';
import EditorHeader from './subcomponents/EditorHeader';
import SlashMenu, { SlashMenuHandle } from './SlashMenu';
import WikiMenu, { WikiMenuHandle } from './WikiMenu';
import TableBubbleMenu from './TableBubbleMenu';
import InlineSearch from './InlineSearch';
import VersionHistoryDrawer from './VersionHistoryDrawer';
import ConfirmDialog from '../ui/ConfirmDialog';
import MoveModal from '../ui/MoveModal';
import { DragHandle } from '@tiptap/extension-drag-handle-react';
import { Plus, GripVertical } from 'lucide-react';

const MemoizedDragHandle = React.memo(({ editor, onSlashTrigger, isHidden }: { editor: any, onSlashTrigger: (e: React.MouseEvent) => void, isHidden: boolean }) => {
  return (
    <DragHandle editor={editor}>
      <div className={`flex items-center opacity-60 hover:opacity-100 transition-opacity duration-300 bg-transparent pr-1 rounded-md -mt-[3px] ${isHidden ? 'hidden' : ''}`}>
        <button
          type="button"
          onMouseDown={onSlashTrigger}
          className="p-1 hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--accent-blue)] rounded cursor-grab active:cursor-grabbing transition-colors duration-200"
          title="Clique para comandos ou segure para arrastar"
        >
          <GripVertical size={17} />
        </button>
      </div>
    </DragHandle>
  );
});
MemoizedDragHandle.displayName = 'MemoizedDragHandle';

interface NoteEditorProps {
  noteId: string;
  initialContent: any;
  onEditorCreated?: (editor: Editor) => void;
  hideToolbar?: boolean;
  onFocus?: (editor: Editor) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ 
  noteId, 
  initialContent, 
  onEditorCreated, 
  hideToolbar = false,
  onFocus
}) => {
  const { notes, deleteNote, isPresentationMode, togglePresentationMode, saveStatus } = useAppStore();
  const note = notes.find(n => n._id === noteId);

  if (!note) {
    return (
      <div className='flex justify-center flex-1 py-20 min-h-[50vh] items-center'>
        <span className="loading loading-spinner loading-md text-[var(--accent-blue)]"></span>
      </div>
    );
  }

  // States for modals and menus
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showInlineSearch, setShowInlineSearch] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  // Menu data states
  const [slashMenu, setSlashMenu] = useState<any>(null);
  const [wikiMenu, setWikiMenu] = useState<any>(null);

  // Refs for menu handling
  const slashMenuRef = useRef<any>(null);
  const wikiMenuRef = useRef<any>(null);
  const commandMenuRef = useRef<SlashMenuHandle | null>(null);
  const wikiMenuComponentRef = useRef<WikiMenuHandle | null>(null);

  const { editor } = useNoteEditor({
    noteId,
    initialContent,
    onFocus,
    setSlashMenu,
    setWikiMenu,
    slashMenuRef,
    wikiMenuRef,
    commandMenuRef,
    wikiMenuComponentRef,
  });

  useEffect(() => {
    if (editor && onEditorCreated) onEditorCreated(editor);
  }, [editor, onEditorCreated]);


  const handleWikiSelect = (item: { id: string, title: string, type: 'note' | 'box' }) => {
    if (editor && wikiMenuRef.current) {
      const { from, to } = wikiMenuRef.current.range;
      editor.chain().focus().deleteRange({ from, to }).insertWikiLink({
        id: item.id,
        type: item.type,
        title: item.title
      }).run();
      setWikiMenu(null);
      wikiMenuRef.current = null;
    }
  };

  return (
    <div 
      className={`editor-container flex flex-col h-full bg-[var(--bg-primary)] ${isPresentationMode ? 'presentation-active overflow-hidden fixed inset-0 z-[5000] p-12' : ''}`}
    >
      {isPresentationMode && (
         <button 
           onClick={() => togglePresentationMode()}
           className="fixed top-6 right-6 z-[6000] bg-[var(--bg-primary)]/80 backdrop-blur-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-[var(--border-subtle)] transition-all text-[13px] font-medium hover:shadow-xl hover:border-[var(--border-default)]"
         >
           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
           Sair da Apresentação
         </button>
      )}

      {!hideToolbar && !isPresentationMode && (
        <MenuBar 
          editor={editor} 
          noteId={noteId} 
          isSaving={saveStatus === 'saving'}
          note={note}
          onRenameRequest={() => {}}
          onMoveRequest={() => setShowMoveModal(true)}
          onDeleteRequest={() => setShowConfirmDelete(true)}
          onSearchRequest={() => setShowInlineSearch(true)}
          onHistoryRequest={() => setShowHistoryDrawer(true)}
        />
      )}

      <div 
        className={`editor-content-wrapper relative flex-1 overflow-y-auto cursor-text ${isPresentationMode ? 'max-w-4xl mx-auto w-full p-12 my-8 scrollbar-none' : 'scrollbar-thin'}`}
        onScroll={() => {
          if (slashMenuRef.current) {
            setSlashMenu(null);
            slashMenuRef.current = null;
          }
          if (wikiMenuRef.current) {
            setWikiMenu(null);
            wikiMenuRef.current = null;
          }
        }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (
            target.closest('.ProseMirror') || 
            target.closest('button') || 
            target.closest('input') ||
            target.closest('a')
          ) {
            return;
          }
          if (editor) {
            const pos = editor.view.posAtCoords({ left: e.clientX, top: e.clientY });
            if (pos && pos.pos !== null) {
              try {
                editor.chain().focus().setTextSelection(pos.pos).run();
              } catch (err) {
                editor.chain().focus('end').run();
              }
            } else {
              editor.chain().focus('end').run();
            }
          }
        }}
      >
        <div className={!isPresentationMode ? 'max-w-[800px] mx-auto w-full px-12 pt-[11vh] pb-32 cursor-text' : 'cursor-text'}>
          <EditorHeader noteId={noteId} />
          
          <EditorContent editor={editor} />
          
          {editor && <TableBubbleMenu editor={editor} />}

          {editor && (
            <MemoizedDragHandle 
              editor={editor}
              isHidden={isPresentationMode}
              onSlashTrigger={(e) => {
                e.preventDefault();
                e.stopPropagation();
                editor.commands.focus();
                editor.commands.insertContent('/');
                setTimeout(() => {
                  try {
                    const { from } = editor.state.selection;
                    const validFrom = Math.max(0, from - 1);
                    const coords = editor.view.coordsAtPos(validFrom);
                    const spaceBelow = typeof window !== 'undefined' ? window.innerHeight - coords.bottom : 500;
                    const menuMaxHeight = 350;
                    let position: any = { top: coords.bottom + 4, bottom: 'auto', left: coords.left };
                    if (spaceBelow < menuMaxHeight && coords.top > menuMaxHeight) {
                      position = { top: 'auto', bottom: window.innerHeight - coords.top + 4, left: coords.left };
                    }
                    const menuData = { 
                      range: { from: validFrom, to: from }, 
                      coords: position, 
                      query: '' 
                    };
                    slashMenuRef.current = menuData;
                    setSlashMenu(menuData);
                  } catch (err) {
                    console.error(err);
                  }
                }, 50);
              }}
            />
          )}
        </div>
        
        {slashMenu && (
          <div 
            className="fixed z-[9999]" 
            style={{ 
              top: slashMenu.coords.top, 
              left: slashMenu.coords.left,
              bottom: slashMenu.coords.bottom 
            }}
          >
            <SlashMenu
              ref={commandMenuRef}
              query={slashMenu.query}
              range={slashMenu.range}
              editor={editor}
              onClose={() => {
                setSlashMenu(null);
                slashMenuRef.current = null;
              }}
            />
          </div>
        )}

        {wikiMenu && (
          <div 
            className="fixed z-[9999]" 
            style={{ 
              top: wikiMenu.coords.top, 
              left: wikiMenu.coords.left,
              bottom: wikiMenu.coords.bottom 
            }}
          >
            <WikiMenu
              ref={wikiMenuComponentRef}
              query={wikiMenu.query}
              onSelect={handleWikiSelect}
              onClose={() => {
                setWikiMenu(null);
                wikiMenuRef.current = null;
              }}
            />
          </div>
        )}
      </div>

      {showInlineSearch && editor && (
        <InlineSearch 
          editor={editor} 
          onClose={() => setShowInlineSearch(false)} 
        />
      )}

      <AnimatePresence>
        {showHistoryDrawer && (
          <VersionHistoryDrawer 
            noteId={noteId} 
            onClose={() => setShowHistoryDrawer(false)} 
            onRestore={(content) => editor?.commands.setContent(content)}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Deletar nota"
        description="Tem certeza que deseja deletar esta nota? Esta ação não pode ser desfeita."
        onConfirm={async () => {
          await deleteNote(noteId);
          setShowConfirmDelete(false);
        }}
        onCancel={() => setShowConfirmDelete(false)}
      />

      <MoveModal
        isOpen={showMoveModal}
        itemId={noteId}
        itemName={note.title}
        itemType="note"
        currentParentId={note.boxId}
        onClose={() => setShowMoveModal(false)}
      />
    </div>
  );
};

export default NoteEditor;
