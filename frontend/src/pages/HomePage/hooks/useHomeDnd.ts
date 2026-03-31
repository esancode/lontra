import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  useSensor, useSensors, PointerSensor, KeyboardSensor, 
  DragStartEvent, DragOverEvent, DragEndEvent, CollisionDetection,
  pointerWithin, closestCenter
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useAppStore } from '../../../store/useAppStore';
import api from '../../../lib/axios';

export const useHomeDnd = (selectedBoxId: string | null, goToBox: (id: string | null) => void) => {
  const { notes, boxes, moveNote, moveBox, reorderItems } = useAppStore();
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [itemsOrder, setItemsOrder] = useState<string[]>([]);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const hoverTimer = useRef<any>(null);

  // Ctrl Key detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Control') setIsCtrlPressed(true) };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.key === 'Control') setIsCtrlPressed(false) };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Sync itemsOrder when notes or boxes change
  useEffect(() => {
    const currentBoxItems = boxes.filter(b => (b.parentId ?? null) === selectedBoxId);
    const currentNoteItems = notes.filter(n => (n.boxId ?? null) === selectedBoxId);

    const unified = [
      ...currentBoxItems.map(b => ({ id: `box-${b._id}`, order: b.order || 0 })),
      ...currentNoteItems.map(n => ({ id: `note-${n._id}`, order: n.order || 0 }))
    ];

    unified.sort((a, b) => a.order - b.order);
    const newOrder = unified.map(item => item.id);
    
    setItemsOrder(prev => {
      let finalOrder = [...newOrder];
      // Se estamos arrastando e fomos para outra página via breadcrumb,
      // injetamos o card temporalmente na lista alvo para criar a "sombra"!
      if (activeId && !finalOrder.includes(activeId)) {
        finalOrder.push(activeId);
      }

      if (prev.length === finalOrder.length && prev.every((v, i) => v === finalOrder[i])) {
        return prev;
      }
      return finalOrder;
    });
  }, [boxes, notes, selectedBoxId, activeId]);

  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 3 } });
  const keyboardSensor = useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates });
  const sensors = useSensors(pointerSensor, keyboardSensor);

  const customCollisionDetection: CollisionDetection = useCallback((args) => {
    const { droppableContainers } = args;
    const pointerCollisions = pointerWithin(args);
    const breadcrumbCollisions = pointerCollisions.filter(c => c.id.toString().startsWith('breadcrumb-'));
    
    if (breadcrumbCollisions.length > 0) {
      return breadcrumbCollisions;
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
  }, [isCtrlPressed]);

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
  };

  const onDragOver = ({ over, active }: DragOverEvent) => {
    const overIdStr = over?.id?.toString() || '';
    setOverId((over?.id as string) || null);
    
    if (overIdStr.startsWith('breadcrumb-')) {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      hoverTimer.current = setTimeout(() => {
        const targetBoxId = overIdStr.replace('breadcrumb-', '');
        const actualBoxId = targetBoxId === 'root' ? null : targetBoxId;
        if (actualBoxId !== selectedBoxId) {
          goToBox(actualBoxId);
        }
      }, 600);
      return;
    } else {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    }

    const isOverSortableItem = overIdStr.startsWith('box-') || overIdStr.startsWith('note-');
    
    if (over && active.id !== over.id && isOverSortableItem && !isCtrlPressed) {
      setItemsOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(items, oldIndex, newIndex);
        }
        return items;
      });
    }
  };

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    const activeData = active.data.current as any;
    setActiveId(null);
    setOverId(null);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (!over) return;

    const overIdStr = over.id.toString();
    let targetBoxId: string | null = null;
    const isOverBoxDropzone = overIdStr.startsWith('drop-box-');
    const isOverBreadcrumb = overIdStr.startsWith('breadcrumb-');

    if (isOverBreadcrumb) {
      const id = overIdStr.replace('breadcrumb-', '');
      targetBoxId = id === 'root' ? null : id;
    } else if (isOverBoxDropzone) {
      targetBoxId = overIdStr.replace('drop-box-', '');
    }

    if (isOverBreadcrumb || isOverBoxDropzone) {
      if (targetBoxId === selectedBoxId) return;
      
      const itemId = activeData.id;
      if (activeData.type === 'note') await moveNote(itemId, targetBoxId);
      else if (activeData.type === 'box') {
        if (itemId !== targetBoxId) await moveBox(itemId, targetBoxId);
      }
      return;
    }

    const itemId = activeData.id;
    const originBoxId = activeData.type === 'note' ? activeData.boxId : activeData.parentId;
    const currentBoxId = selectedBoxId;
    
    if (originBoxId !== currentBoxId) {
      if (activeData.type === 'note') await moveNote(itemId, currentBoxId);
      else if (activeData.type === 'box') await moveBox(itemId, currentBoxId);
      
      // Sem return aqui! Deixamos fluir para reordenar os itens, 
      // assim o card salva exatamente na posição que o usuário soltou!
    }

    const finalOrder = [...itemsOrder];
    reorderItems(finalOrder);

    finalOrder.forEach((itemId, idx) => {
      const type = itemId.startsWith('box-') ? 'box' : 'note';
      const id = itemId.replace(`${type}-`, '');
      const endpoint = type === 'box' ? '/boxes' : '/notes';
      api.put(`${endpoint}/${id}`, { order: idx }).catch(() => {});
    });
  };

  return {
    activeId,
    overId,
    itemsOrder,
    isCtrlPressed,
    sensors,
    customCollisionDetection,
    onDragStart,
    onDragOver,
    onDragEnd
  };
};
