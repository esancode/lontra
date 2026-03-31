import React, { useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { DndContext, DragOverlay } from '@dnd-kit/core';

import { useAppStore } from '../store/useAppStore';
import { useHomeData } from './HomePage/hooks/useHomeData';
import { useHomeDnd } from './HomePage/hooks/useHomeDnd';

import HomeTopBar from './HomePage/subcomponents/HomeTopBar';
import HomeEmptyState from './HomePage/subcomponents/HomeEmptyState';
import GridBoard from '../components/GridBoard';
import NoteEditor from '../components/editor/NoteEditor';
import RateLimitedUi from '../components/RateLimitedUi';
import NotesNotFound from '../components/NotesNotFound';
import BoxCard from '../components/BoxCard';
import NoteCard from '../components/NoteCard';
import { Box, Note } from '../types/app.types';

const HomePage: React.FC = () => {
  const { boxId, noteId } = useParams<{ boxId?: string, noteId?: string }>();
  const navigate = useNavigate();
  const selectedBoxId = boxId || null;
  const activeNoteId = noteId || null;

  useEffect(() => {
    const handleAppNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.path) {
        navigate(customEvent.detail.path);
      }
    };
    window.addEventListener('app-navigate', handleAppNavigate);
    return () => window.removeEventListener('app-navigate', handleAppNavigate);
  }, [navigate]);

  const { 
    notes, boxes, isPresentationMode
  } = useAppStore();
  const theme = 'dark';
  const setTheme = () => {};

  const goToBox = useCallback((id: string | null) => { 
    if (!id) navigate('/'); 
    else navigate(`/box/${id}`);
  }, [navigate]);

  const goToNote = useCallback((id: string) => navigate(`/note/${id}`), [navigate]);
  const goBack = useCallback(() => navigate(-1), [navigate]);

  const {
    loading, isRateLimited,
    creatingBox, setCreatingBox,
    creatingNote, setCreatingNote,
    newBoxName, setNewBoxName,
    newNoteName, setNewNoteName,
    handleCreateBox, handleCreateNote
  } = useHomeData(selectedBoxId);

  const {
    activeId, overId, itemsOrder, isCtrlPressed,
    sensors, customCollisionDetection,
    onDragStart, onDragOver, onDragEnd
  } = useHomeDnd(selectedBoxId, goToBox);

  const activeNote = notes.find(n => n._id === activeNoteId);
  const currentBoxes = boxes.filter(b => (b.parentId ?? null) === selectedBoxId);
  const currentNotes = notes.filter(n => (n.boxId ?? null) === selectedBoxId);
  const isEmpty = currentBoxes.length === 0 && currentNotes.length === 0;
  
  const isInNote = Boolean(activeNoteId);
  const isInBox = Boolean(selectedBoxId) && !isInNote;
  const canGoBack = isInNote || isInBox;

  const activeItem = activeId
    ? activeId.startsWith('box-')
      ? boxes.find(b => `box-${b._id}` === activeId)
      : notes.find(n => `note-${n._id}` === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className='h-screen flex flex-col overflow-hidden bg-[var(--bg-primary)]'>
        {!isPresentationMode && (
          <HomeTopBar 
            goBack={goBack}
            canGoBack={canGoBack}
            goToBox={goToBox}
            theme={theme}
            setTheme={setTheme}
            isInNote={isInNote}
            creatingBox={creatingBox}
            setCreatingBox={setCreatingBox}
            newBoxName={newBoxName}
            setNewBoxName={setNewBoxName}
            handleCreateBox={handleCreateBox}
            creatingNote={creatingNote}
            setCreatingNote={setCreatingNote}
            newNoteName={newNoteName}
            setNewNoteName={setNewNoteName}
            handleCreateNote={handleCreateNote}
            onOpenQuickNote={() => window.dispatchEvent(new CustomEvent('open-quick-note'))}
          />
        )}

        <div className="flex w-full flex-col flex-1">
          <main
            id="main-scroll-container"
            className={`overflow-y-auto overflow-x-hidden bg-[var(--bg-primary)] ${isInNote ? 'editor-scroll-container' : ''}`}
            style={{
              height: isInNote 
                ? (isPresentationMode ? '100dvh' : 'calc(100dvh - var(--topbar-height))') 
                : undefined, 
              flex: isInNote ? 'none' : 1 
            }}
          >
            {isRateLimited && <RateLimitedUi />}

            {isInNote && (
              loading ? (
                <div className='flex justify-center flex-1 py-20 min-h-[50vh] items-center'>
                  <span className="loading loading-spinner loading-md text-[var(--accent-blue)]"></span>
                </div>
              ) : (
                <NoteEditor 
                  key={`editor-${activeNoteId}`} 
                  noteId={activeNoteId as string} 
                  initialContent={activeNote?.content} 
                />
              )
            )}

            {!isInNote && (
              <div className='relative w-full h-full min-h-[calc(100vh-200px)]'>
                {isEmpty && !isRateLimited && !loading && (
                  <HomeEmptyState 
                    onBoxCreate={() => setCreatingBox(true)}
                    onNoteCreate={() => setCreatingNote(true)}
                  />
                )}
                
                <div className='w-full'>
                  <div className='max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-12'>
                    {loading && <div className='flex justify-center py-10'><span className="loading loading-spinner loading-md text-[var(--accent-blue)]"></span></div>}
                    {!isEmpty && !isRateLimited && !loading && (
                      <GridBoard
                        boxes={activeId && activeId.startsWith('box-') && !currentBoxes.find(b => `box-${b._id}` === activeId) 
                          ? [...currentBoxes, boxes.find(b => `box-${b._id}` === activeId) as Box] 
                          : currentBoxes}
                        notes={activeId && activeId.startsWith('note-') && !currentNotes.find(n => `note-${n._id}` === activeId) 
                          ? [...currentNotes, notes.find(n => `note-${n._id}` === activeId) as Note] 
                          : currentNotes}
                        onGoToBox={goToBox}
                        onGoToNote={goToNote}
                        selectedBoxId={selectedBoxId}
                        activeId={activeId}
                        overId={overId}
                        itemsOrder={itemsOrder}
                        isCtrlPressed={isCtrlPressed}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 150 }}>
        {activeId && activeItem ? (
          <div className='pointer-events-none scale-[1.02] transition-transform duration-200'>
            {activeId.startsWith('box-') ? (
              <BoxCard box={activeItem as Box} isDragging={true} />
            ) : (
              <NoteCard note={activeItem as Note} isDragging={true} />
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default HomePage;
