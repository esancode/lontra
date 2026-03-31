import React from 'react';
import { HomeIcon } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

import { useDroppable } from '@dnd-kit/core';

const BreadcrumbSegment = ({ segment, index, isLast, onNavigateBox, overId }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `breadcrumb-${segment.id}`,
    data: { type: 'breadcrumb', boxId: segment.boxId }
  });

  return (
    <div ref={setNodeRef} className='flex items-center flex-shrink-0'>
      {index > 0 && <span className='mx-1 text-[var(--text-muted)] text-[length:var(--text-xs)]'>/</span>}

      {isLast ? (
        <span className={`font-[family:var(--font-ui)] text-[length:var(--text-sm)] truncate max-w-[180px] flex items-center gap-1 transition-all px-1.5 py-2 rounded-[var(--radius-sm)] ${isOver ? 'bg-[var(--accent-blue)] text-[var(--text-on-accent)] scale-105 shadow-lg' : 'text-[var(--text-primary)]'}`}>
          {segment.isHome && <HomeIcon className={`size-3 flex-shrink-0 ${isOver ? 'text-current' : ''}`} />}
          <span>{segment.name}</span>
        </span>
      ) : (
        <button
          onClick={() => onNavigateBox && onNavigateBox(segment.boxId)}
          className={`font-[family:var(--font-ui)] text-[length:var(--text-sm)] transition-all truncate max-w-[150px] flex items-center gap-1 px-1.5 py-2 rounded-[var(--radius-sm)] ${isOver ? 'bg-[var(--accent-blue)] text-[var(--text-on-accent)] scale-105 shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--accent-blue)] hover:bg-[var(--bg-tertiary)] cursor-pointer'}`}
          title={segment.name}
        >
          {segment.isHome && <HomeIcon className={`size-3 flex-shrink-0 ${isOver ? 'text-current' : ''}`} />}
          <span>{segment.name}</span>
        </button>
      )}
    </div>
  );
};

const Breadcrumbs = ({ onNavigateBox }) => {
  const { boxes, notes } = useAppStore();

  const getCurrentState = () => {
    const url = window.location.pathname;
    const boxMatch = url.match(/\/box\/([^/]+)/);
    const noteMatch = url.match(/\/note\/([^/]+)/);
    return {
      selectedBoxId: boxMatch ? boxMatch[1] : null,
      activeNoteId: noteMatch ? noteMatch[1] : null,
    };
  };

  const { selectedBoxId, activeNoteId } = getCurrentState();

  const getPath = () => {
    const path = [];
    let currentBoxId = selectedBoxId;
    let leafNoteName = null;

    if (activeNoteId) {
      const activeNote = notes.find(n => n._id === activeNoteId);
      if (activeNote) {
        leafNoteName = activeNote.title;
        currentBoxId = activeNote.boxId;
      }
    }

    while (currentBoxId) {
      const box = boxes.find(b => b._id === currentBoxId);
      if (box) {
        path.unshift({ id: box._id, name: box.name, boxId: box._id });
        currentBoxId = box.parentId;
      } else {
        break;
      }
    }

    path.unshift({ id: 'root', name: 'Home', boxId: null, isHome: true });

    if (leafNoteName) {
      path.push({ id: 'note-leaf', name: leafNoteName, isLeaf: true });
    }

    return path;
  };

  const pathSegments = getPath();

  return (
    <div className='flex items-center gap-1 flex-nowrap overflow-x-auto scrollbar-none py-1 max-w-full min-h-[32px]'>
      {pathSegments.map((segment, index) => (
        <BreadcrumbSegment
          key={segment.id}
          segment={segment}
          index={index}
          isLast={index === pathSegments.length - 1}
          onNavigateBox={onNavigateBox}
        />
      ))}
    </div>
  );
};

export default Breadcrumbs;
