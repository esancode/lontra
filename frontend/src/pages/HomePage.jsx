import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import Breadcrumbs from '../components/sidebar/Breadcrumbs'
import GridBoard from '../components/GridBoard'
import NoteEditor from '../components/editor/NoteEditor'
import StatusBar from '../components/layout/StatusBar'
import api from '../lib/axios'
import NotesNotFound from '../components/NotesNotFound'
import RateLimitedUi from '../components/RateLimitedUi'
import { useAppStore } from '../store/useAppStore'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import BoxCard from '../components/BoxCard'
import NoteCard from '../components/NoteCard'

const HomePage = () => {
  const { boxId, noteId } = useParams()
  const navigate = useNavigate()
  const [isRateLimited, setIsRateLimited] = useState(false)
  const notes = useAppStore(state => state.notes)
  const boxes = useAppStore(state => state.boxes)
  const moveNote = useAppStore(state => state.moveNote)
  const moveBox = useAppStore(state => state.moveBox)
  const reorderItems = useAppStore(state => state.reorderItems)
  const isPresentationMode = useAppStore(state => state.isPresentationMode)

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('editor')

  const [creatingBox, setCreatingBox] = useState(false)
  const [creatingNote, setCreatingNote] = useState(false)
  const [newBoxName, setNewBoxName] = useState('')
  const [newNoteName, setNewNoteName] = useState('')

  const [activeId, setActiveId] = useState(null)
  const [overId, setOverId] = useState(null)
  const [itemsOrder, setItemsOrder] = useState([])
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)
  const hoverTimer = React.useRef(null)

  const selectedBoxId = boxId || null
  const activeNoteId = noteId || null

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Control') setIsCtrlPressed(true) }
    const handleKeyUp = (e) => { if (e.key === 'Control') setIsCtrlPressed(false) }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
  
  useEffect(() => {
    const currentBoxItems = boxes.filter(b => (b.parentId ?? null) === selectedBoxId)
    const currentNoteItems = notes.filter(n => (n.boxId ?? null) === selectedBoxId)

    const unified = [
      ...currentBoxItems.map(b => ({ id: `box-${b._id}`, order: b.order || 0 })),
      ...currentNoteItems.map(n => ({ id: `note-${n._id}`, order: n.order || 0 }))
    ].sort((a, b) => a.order - b.order)

    let newOrder = unified.map(item => item.id)
    
    if (activeId && !newOrder.includes(activeId)) {
      newOrder.push(activeId)
    }
    
    setItemsOrder(prev => {
      if (prev.length === newOrder.length && prev.every((v, i) => v === newOrder[i])) {
        return prev
      }
      return newOrder
    })
  }, [boxes, notes, selectedBoxId, activeId])

  const isInNote = Boolean(activeNoteId)
  const isInBox = Boolean(selectedBoxId) && !isInNote
  const canGoBack = isInNote || isInBox

  useEffect(() => {
    const initFetch = async () => {
      try {
        const res = await api.get('/notes')
        useAppStore.setState({ notes: res.data })
        setIsRateLimited(false)
      } catch (error) {
        if (error.response?.status === 429) setIsRateLimited(true)
      } finally {
        setLoading(false)
      }
      try {
        const boxRes = await api.get('/boxes')
        useAppStore.setState({ boxes: boxRes.data })
      } catch (boxError) {
      }
    }
    initFetch()
  }, [])

  const goToBox = (id) => { if (!id) navigate('/'); else navigate(`/box/${id}`) }
  const goToNote = (id) => navigate(`/note/${id}`)
  const goBack = () => navigate(-1)

  const handleCreateBox = async (name) => {
    try {
      const res = await api.post('/boxes', { name, parentId: selectedBoxId, order: boxes.filter(b => b.parentId === selectedBoxId).length })
      useAppStore.setState(state => ({ boxes: [...state.boxes, res.data] }))
    } catch (e) { }
  }

  const handleCreateNote = async (title) => {
    try {
      const res = await api.post('/notes', { title, boxId: selectedBoxId, content: { type: 'doc', content: [] } })
      useAppStore.setState(state => ({ notes: [...state.notes, res.data] }))
      navigate(`/note/${res.data._id}`)
    } catch (e) { }
  }

  const activeNote = notes.find(n => n._id === activeNoteId)
  const currentBoxes = boxes.filter(b => (b.parentId ?? null) === selectedBoxId)
  const currentNotes = notes.filter(n => (n.boxId ?? null) === selectedBoxId)
  const isEmpty = currentBoxes.length === 0 && currentNotes.length === 0

  const sensorOptions = React.useMemo(() => ({
    pointer: { activationConstraint: { distance: 3 } },
    keyboard: { coordinateGetter: sortableKeyboardCoordinates }
  }), [])

  const pointerSensor = useSensor(PointerSensor, sensorOptions.pointer)
  const keyboardSensor = useSensor(KeyboardSensor, sensorOptions.keyboard)
  const sensors = useSensors(pointerSensor, keyboardSensor)

  const onDragStart = ({ active }) => {
    setActiveId(active.id)
  }

  const onDragOver = ({ over, active }) => {
    const overIdStr = over?.id?.toString() || ''
    setOverId(over?.id || null)
    
    if (overIdStr.startsWith('breadcrumb-')) {
      if (hoverTimer.current) clearTimeout(hoverTimer.current)
      hoverTimer.current = setTimeout(() => {
        const targetBoxId = overIdStr.replace('breadcrumb-', '')
        const actualBoxId = targetBoxId === 'root' ? null : targetBoxId
        if (actualBoxId !== selectedBoxId) {
          goToBox(actualBoxId)
        }
      }, 600)
      return
    } else {
      if (hoverTimer.current) clearTimeout(hoverTimer.current)
    }

    const isOverSortableItem = overIdStr.startsWith('box-') || overIdStr.startsWith('note-')
    
    if (over && active.id !== over.id && isOverSortableItem && !overIdStr.startsWith('drop-box-') && !isCtrlPressed) {
      setItemsOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(items, oldIndex, newIndex);
        }
        return items;
      });
    }
  }

  const customCollisionDetection = React.useCallback((args) => {
    const { pointerCoordinates, droppableContainers } = args;
    
    if (pointerCoordinates && pointerCoordinates.y < 100) {
      const breadcrumbContainers = droppableContainers.filter(c => c.id.toString().startsWith('breadcrumb-'));
      
      const collisions = breadcrumbContainers
        .filter(container => {
          const rect = container.rect.current;
          if (!rect) return false;
          return (
            pointerCoordinates.x >= rect.left &&
            pointerCoordinates.x <= rect.right &&
            pointerCoordinates.y >= rect.top &&
            pointerCoordinates.y <= rect.bottom
          );
        })
        .map(container => ({ id: container.id }));

      if (collisions.length > 0) return collisions;
    }

    let containers = droppableContainers;
    if (!isCtrlPressed) {
      containers = droppableContainers.filter(c => !c.id.toString().startsWith('drop-box-'));
    } else {
      const dropZones = droppableContainers.filter(c => 
        c.id.toString().startsWith('drop-box-') || c.id.toString().startsWith('breadcrumb-')
      );
      if (dropZones.length > 0) {
        const collisions = closestCenter({ ...args, droppableContainers: dropZones });
        if (collisions.length > 0) return collisions;
      }
    }

    return closestCenter({ ...args, droppableContainers: containers });
  }, [isCtrlPressed])

  const onDragEnd = async ({ active, over }) => {
    const activeData = active.data.current
    setActiveId(null)
    setOverId(null)
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    if (!over) return

    const overIdStr = over.id.toString()

    let targetBoxId = null
    const isOverBoxDropzone = overIdStr.startsWith('drop-box-')
    const isOverBreadcrumb = overIdStr.startsWith('breadcrumb-')

    if (isOverBreadcrumb) {
      const id = overIdStr.replace('breadcrumb-', '')
      targetBoxId = id === 'root' ? null : id
    } else if (isOverBoxDropzone) {
      targetBoxId = overIdStr.replace('drop-box-', '')
    }

    if (targetBoxId !== null) {
      if (targetBoxId === selectedBoxId) return
      const itemId = activeData.id
      if (activeData.type === 'note') await moveNote(itemId, targetBoxId)
      else if (activeData.type === 'box') {
        if (itemId !== targetBoxId) await moveBox(itemId, targetBoxId)
      }
      return
    }

    const itemId = activeData.id
    const originBoxId = activeData.type === 'note' ? activeData.boxId : activeData.parentId
    const currentBoxId = selectedBoxId
    
    if (originBoxId !== currentBoxId) {
      if (activeData.type === 'note') await moveNote(itemId, currentBoxId)
      else if (activeData.type === 'box') await moveBox(itemId, currentBoxId)
      return
    }

    const finalOrder = [...itemsOrder]
    reorderItems(finalOrder)

    finalOrder.forEach((itemId, idx) => {
      const type = itemId.startsWith('box-') ? 'box' : 'note'
      const id = itemId.replace(`${type}-`, '')
      const endpoint = type === 'box' ? '/boxes' : '/notes'
      api.put(`${endpoint}/${id}`, { order: idx }).catch(err => {
      })
    })
  }

  const activeItem = activeId
    ? activeId.startsWith('box-')
      ? boxes.find(b => `box-${b._id}` === activeId)
      : notes.find(n => `note-${n._id}` === activeId)
    : null

  const [activeNoteEditor, setActiveNoteEditor] = useState(null)
  
  const handleEditorCreated = React.useCallback((editor) => {
    setActiveNoteEditor(prev => prev === editor ? prev : editor)
  }, [])

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
          <div className='sticky top-0 w-full flex-shrink-0 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] px-4 h-[40px] flex items-center gap-3 z-[60]'>
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className={`flex-shrink-0 flex items-center gap-1 text-[length:var(--text-sm)] font-[family:var(--font-ui)] transition-colors px-2 py-1 rounded-[var(--radius-sm)] ${canGoBack ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] cursor-pointer' : 'text-[var(--text-muted)] opacity-30 cursor-default'}`}
            title="Voltar"
          >
            <span>←</span>
            <span className='hidden md:inline'>Voltar</span>
          </button>

          <span className='text-[var(--border-default)] flex-shrink-0 text-xs'>|</span>

          <div className='flex-1 min-w-0 overflow-x-auto scrollbar-none'>
            <Breadcrumbs onNavigateBox={goToBox} />
          </div>

          <span className='text-[var(--border-default)] flex-shrink-0 text-xs'>|</span>

          {isInNote && (
            <>
              <div className='flex flex-shrink-0 bg-[var(--bg-tertiary)] p-0.5 rounded-[var(--radius-sm)] border border-[var(--border-default)] h-[28px]'>
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 h-full rounded-[var(--radius-sm)] text-[length:var(--text-xs)] font-[family:var(--font-ui)] font-[var(--weight-medium)] transition-colors ${activeTab === 'editor' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                >Cartão</button>
                <button
                  onClick={() => setActiveTab('whiteboard')}
                  className={`px-3 h-full rounded-[var(--radius-sm)] text-[length:var(--text-xs)] font-[family:var(--font-ui)] font-[var(--weight-medium)] transition-colors ${activeTab === 'whiteboard' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                >Lousa</button>
              </div>
              <span className='text-[var(--border-default)] flex-shrink-0 text-xs hidden sm:inline'>|</span>
            </>
          )}

          {!isInNote && (
          <div className='flex gap-2 flex-shrink-0 items-center scale-90 sm:scale-100 origin-right'>
            {creatingBox ? (
              <form className='flex gap-1 items-center' onSubmit={(e) => { e.preventDefault(); if (newBoxName.trim()) { handleCreateBox(newBoxName.trim()); setNewBoxName(''); setCreatingBox(false) } }}>
                <input autoFocus type="text" placeholder="Nome..." value={newBoxName} onChange={(e) => setNewBoxName(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && setCreatingBox(false)} className='bg-[var(--bg-primary)] border border-[var(--accent-blue)] rounded-[var(--radius-sm)] text-[var(--text-primary)] text-[length:var(--text-sm)] h-[28px] px-2 focus:outline-none w-24 sm:w-36' />
                <button type='submit' className='bg-[var(--accent-blue)] text-[var(--text-on-accent)] h-[28px] px-2 rounded-[var(--radius-sm)] text-[length:var(--text-xs)] hover:brightness-110'>OK</button>
                <button type='button' onClick={() => setCreatingBox(false)} className='text-[var(--text-muted)] h-[28px] w-[28px] flex items-center justify-center text-[length:var(--text-sm)] hover:text-[var(--text-primary)]'>✕</button>
              </form>
            ) : (
              <button onClick={() => { setCreatingBox(true); setCreatingNote(false) }} className='bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-default)] h-[28px] px-2 sm:px-3 rounded-[var(--radius-sm)] text-[length:var(--text-xs)] hover:border-[var(--border-active)] hover:bg-[var(--bg-elevated)] transition-all'>
                 + Caixa
              </button>
            )}

            {creatingNote ? (
              <form className='flex gap-1 items-center' onSubmit={(e) => { e.preventDefault(); if (newNoteName.trim()) { handleCreateNote(newNoteName.trim()); setNewNoteName(''); setCreatingNote(false) } }}>
                <input autoFocus type="text" placeholder="Título..." value={newNoteName} onChange={(e) => setNewNoteName(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && setCreatingNote(false)} className='bg-[var(--bg-primary)] border border-[var(--accent-blue)] rounded-[var(--radius-sm)] text-[var(--text-primary)] text-[length:var(--text-sm)] h-[28px] px-2 focus:outline-none w-24 sm:w-36' />
                <button type='submit' className='bg-[var(--accent-blue)] text-[var(--text-on-accent)] h-[28px] px-2 rounded-[var(--radius-sm)] text-[length:var(--text-xs)] hover:brightness-110'>OK</button>
                <button type='button' onClick={() => setCreatingNote(false)} className='text-[var(--text-muted)] h-[28px] w-[28px] flex items-center justify-center text-[length:var(--text-sm)] hover:text-[var(--text-primary)]'>✕</button>
              </form>
            ) : (
              <button onClick={() => { setCreatingNote(true); setCreatingBox(false) }} className='bg-[var(--accent-blue)] text-[var(--text-on-accent)] h-[28px] px-2 sm:px-3 rounded-[var(--radius-sm)] text-[length:var(--text-xs)] hover:brightness-110 transition-all'>
                 + Cartão
              </button>
            )}
          </div>
          )}
        </div>
        )}

        <main
          id="main-scroll-container"
          className={`overflow-y-auto overflow-x-hidden bg-[var(--bg-primary)]${isInNote ? ' editor-scroll-container' : ''}`}
          style={{ 
            height: isInNote 
              ? (isPresentationMode ? '100dvh' : 'calc(100dvh - 40px - 36px)') 
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
              <>
                {activeTab === 'editor' ? (
                  <NoteEditor key={`editor-${activeNoteId}`} noteId={activeNoteId} initialContent={activeNote?.content} onEditorCreated={handleEditorCreated} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] font-[family:var(--font-ui)]">
                    <div className="text-4xl mb-4 opacity-50">🚧</div>
                    <h2 className="text-xl font-medium text-[var(--text-primary)] mb-2">Lousa</h2>
                    <p>Disponível em breve.</p>
                  </div>
                )}
              </>
            )
          )}

          {!isInNote && (
            <div className='w-full'>
              <div className='max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-12'>
                {loading && <div className='flex justify-center py-10'><span className="loading loading-spinner loading-md text-[var(--accent-blue)]"></span></div>}
                {isEmpty && !isRateLimited && !loading && <NotesNotFound onNoteCreate={() => setCreatingNote(true)} />}
                {!isEmpty && !isRateLimited && !loading && (
                   <GridBoard
                    boxes={activeId && activeId.startsWith('box-') && !currentBoxes.find(b => `box-${b._id}` === activeId) 
                      ? [...currentBoxes, boxes.find(b => `box-${b._id}` === activeId)] 
                      : currentBoxes}
                    notes={activeId && activeId.startsWith('note-') && !currentNotes.find(n => `note-${n._id}` === activeId) 
                      ? [...currentNotes, notes.find(n => `note-${n._id}` === activeId)] 
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
          )}
        </main>
        
        {isInNote && !isPresentationMode && (
          <StatusBar editor={activeNoteEditor} />
        )}
      </div>

      <DragOverlay dropAnimation={{ duration: 150 }}>
        {activeId && activeItem ? (
          <div className='opacity-95 shadow-xl pointer-events-none'>
            {activeId.startsWith('box-') ? (
              <div className='w-64'><BoxCard box={activeItem} /></div>
            ) : (
              <div className='w-64'><NoteCard note={activeItem} /></div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default HomePage
