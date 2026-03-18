import React, { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import BoxCard from './BoxCard'
import NoteCard from './NoteCard'
import { useAppStore } from '../store/useAppStore'
import api from '../lib/axios'

const SortableBoxCard = ({ box, onEnter, isDragOver, selected, onSelect, isFixed }) => {
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

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <BoxCard box={box} onEnter={onEnter} isDragOver={isDragOver} selected={selected} onSelect={onSelect} />
    </div>
  )
}

const SortableNoteCard = ({ note, onOpen, selected, onSelect, isFixed }) => {
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

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <NoteCard note={note} onOpen={onOpen} selected={selected} onSelect={onSelect} />
    </div>
  )
}

const BoxDropZone = ({ boxId, children, isOver, isCtrlActive }) => {
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
}

const GridBoard = ({ boxes, notes, onGoToBox, onGoToNote, selectedBoxId, activeId, overId, itemsOrder = [], isCtrlPressed }) => {
  const [selectedIds, setSelectedIds] = useState(new Set())

  const handleSelect = useCallback((id, isShift) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (isShift && prev.size > 0) {
        const allIds = itemsOrder.map(itemId => itemId.split('-')[1])
        const lastSelected = Array.from(prev).pop()
        const startIdx = allIds.indexOf(lastSelected)
        const endIdx = allIds.indexOf(id)
        const [min, max] = [Math.min(startIdx, endIdx), Math.max(startIdx, endIdx)]
        for (let i = min; i <= max; i++) next.add(allIds[i])
      } else {
        if (next.has(id)) next.delete(id)
        else next.add(id)
      }
      return next
    })
  }, [itemsOrder])

  return (
    <SortableContext items={itemsOrder} strategy={rectSortingStrategy}>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10'>
        {itemsOrder.map(itemId => {
          if (itemId.startsWith('box-')) {
            const id = itemId.replace('box-', '')
            const box = boxes.find(b => b._id === id)
            if (!box) return null
            const isOver = isCtrlPressed && overId?.toString() === `drop-box-${id}` && activeId?.toString() !== itemId
            return (
              <BoxDropZone key={itemId} boxId={id} isOver={isOver} isCtrlActive={isCtrlPressed && activeId}>
                <SortableBoxCard
                  box={box}
                  onEnter={() => onGoToBox(box._id)}
                  isDragOver={isOver}
                  selected={selectedIds.has(box._id)}
                  onSelect={(id, shift) => handleSelect(id, shift)}
                  isFixed={isCtrlPressed}
                />
              </BoxDropZone>
            )
          } else {
            const id = itemId.replace('note-', '')
            const note = notes.find(n => n._id === id)
            if (!note) return null
            return (
              <SortableNoteCard
                key={itemId}
                note={note}
                onOpen={() => onGoToNote(note._id)}
                selected={selectedIds.has(note._id)}
                onSelect={(id, shift) => handleSelect(id, shift)}
                isFixed={isCtrlPressed}
              />
            )
          }
        })}
      </div>
    </SortableContext>
  )
}

export default GridBoard
