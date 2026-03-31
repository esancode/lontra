import React, { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import BoxCard from './BoxCard'
import NoteCard from './NoteCard'
import BulkActionBar from './ui/BulkActionBar'
import { Box, Note } from '../types/app.types'

interface SortableBoxCardProps {
  box: Box;
  onAction: (id: string | null) => void;
  isDragOver: boolean;
  selected: boolean;
  onSelect: (id: string, isShift: boolean) => void;
  hasActiveSelection: boolean;
}

const SortableBoxCard = React.memo<SortableBoxCardProps>(({ box, onAction, isDragOver, selected, onSelect, hasActiveSelection }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `box-${box._id}`,
    data: { type: 'box', id: box._id, parentId: box.parentId },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  const handleEnter = useCallback(() => {
    if (onAction) onAction(box._id)
  }, [box._id, onAction])

  const handleSelect = useCallback((id: string, isShift: boolean) => {
    onSelect(id, isShift)
  }, [onSelect])

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <BoxCard
        box={box}
        onEnter={handleEnter}
        isDragOver={isDragOver}
        selected={selected}
        onSelect={handleSelect}
        hasActiveSelection={hasActiveSelection}
      />
    </div>
  )
})

interface SortableNoteCardProps {
  note: Note;
  onAction: (id: string) => void;
  selected: boolean;
  onSelect: (id: string, isShift: boolean) => void;
  hasActiveSelection: boolean;
}

const SortableNoteCard = React.memo<SortableNoteCardProps>(({ note, onAction, selected, onSelect, hasActiveSelection }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `note-${note._id}`,
    data: { type: 'note', id: note._id, boxId: note.boxId },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  const handleOpen = useCallback(() => {
    if (onAction) onAction(note._id)
  }, [note._id, onAction])

  const handleSelect = useCallback((id: string, isShift: boolean) => {
    onSelect(id, isShift)
  }, [onSelect])

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <NoteCard note={note} onOpen={handleOpen} selected={selected} onSelect={handleSelect} hasActiveSelection={hasActiveSelection} />
    </div>
  )
})

interface BoxDropZoneProps {
  boxId: string;
  children: React.ReactNode;
  isOver: boolean;
  isCtrlActive: boolean;
}

const BoxDropZone = React.memo<BoxDropZoneProps>(({ boxId, children, isOver, isCtrlActive }) => {
  const { setNodeRef } = useDroppable({ 
    id: `drop-box-${boxId}`,
    data: { type: 'box-dropzone', boxId }
  })
  
  return (
    <div className="relative group">
      {children}
      <div 
        ref={setNodeRef} 
        className={`absolute inset-0 z-30 pointer-events-none transition-all duration-300 rounded-[var(--radius-md)]
          ${isOver ? 'bg-[var(--accent-blue-subtle)] border-2 border-[var(--accent-blue)] opacity-40 scale-100' : 
            isCtrlActive ? 'bg-[var(--accent-blue-subtle)] border border-dashed border-[var(--accent-blue)] opacity-10 scale-95' : 'opacity-0'}`}
        style={{ margin: '15% 10%' }}
      />
    </div>
  )
})

interface GridBoardProps {
  boxes: Box[];
  notes: Note[];
  onGoToBox: (id: string | null) => void;
  onGoToNote: (id: string) => void;
  selectedBoxId: string | null;
  activeId: string | null;
  overId: string | null;
  itemsOrder: string[];
  isCtrlPressed: boolean;
}

const GridBoard = React.memo<GridBoardProps>(({ boxes, notes, onGoToBox, onGoToNote, activeId, overId, itemsOrder = [], isCtrlPressed, selectedBoxId }) => {
  const itemsOrderRef = React.useRef(itemsOrder)
  React.useEffect(() => {
    itemsOrderRef.current = itemsOrder
  }, [itemsOrder])

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  React.useEffect(() => {
    setSelectedIds(new Set())
  }, [selectedBoxId])

  const handleSelect = useCallback((id: string, isShift: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (isShift && prev.size > 0) {
        const allIds = itemsOrderRef.current.map(itemId => itemId.split('-')[1])
        const lastSelected = Array.from(prev).pop()
        const startIdx = allIds.indexOf(lastSelected!)
        const endIdx = allIds.indexOf(id)
        const [min, max] = [Math.min(startIdx, endIdx), Math.max(startIdx, endIdx)]
        for (let i = min; i <= max; i++) next.add(allIds[i])
      } else {
        if (next.has(id)) next.delete(id)
        else next.add(id)
      }
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(prev => prev.size > 0 ? new Set() : prev)
  }, [])

  React.useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isInsideCard = target.closest('.card-container')
      const isInsideBulkBar = target.closest('.bulk-action-bar')
      const isInsideModal = target.closest('[role="dialog"]') || target.closest('.fixed')
      if (!isInsideCard && !isInsideBulkBar && !isInsideModal) {
        clearSelection()
      }
    }
    window.addEventListener('mousedown', handleGlobalClick)
    return () => window.removeEventListener('mousedown', handleGlobalClick)
  }, [clearSelection])

  const boxMap = useMemo(() => {
    const map = new Map<string, Box>()
    boxes.forEach(b => map.set(b._id, b))
    return map
  }, [boxes])

  const noteMap = useMemo(() => {
    const map = new Map<string, Note>()
    notes.forEach(n => map.set(n._id, n))
    return map
  }, [notes])

  return (
    <SortableContext items={itemsOrder} strategy={rectSortingStrategy}>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
        {itemsOrder.map(itemId => {
          if (itemId.startsWith('box-')) {
            const id = itemId.replace('box-', '')
            const box = boxMap.get(id)
            if (!box) return null
            const isOver = isCtrlPressed && overId?.toString() === `drop-box-${id}` && activeId?.toString() !== itemId
            return (
              <motion.div
                key={itemId}
                className="card-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <BoxDropZone boxId={id} isOver={isOver} isCtrlActive={isCtrlPressed && activeId !== null}>
                  <SortableBoxCard
                    box={box}
                    onAction={onGoToBox}
                    isDragOver={isOver}
                    selected={selectedIds.has(box._id)}
                    onSelect={handleSelect}
                    hasActiveSelection={selectedIds.size > 0}
                  />
                </BoxDropZone>
              </motion.div>
            )
          } else {
            const id = itemId.replace('note-', '')
            const note = noteMap.get(id)
            if (!note) return null
            return (
              <motion.div
                key={itemId}
                className="card-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <SortableNoteCard
                  note={note}
                  onAction={onGoToNote}
                  selected={selectedIds.has(note._id)}
                  onSelect={handleSelect}
                  hasActiveSelection={selectedIds.size > 0}
                />
              </motion.div>
            )
          }
        })}
      </div>
      
      {selectedIds.size > 0 && (
        <BulkActionBar 
          selectedIds={selectedIds} 
          onClear={() => setSelectedIds(new Set())} 
        />
      )}
    </SortableContext>
  )
})

export default GridBoard
