import { create } from 'zustand';
import api from '../lib/axios';

export const useAppStore = create((set, get) => ({
  boxes: [],
  notes: [],
  selectedBoxId: null,

  activeNoteId: null,
  splitView: false,
  splitNoteId: null,

  theme: localStorage.getItem('devnotes-theme') || 'dark',
  commandPaletteOpen: false,
  isPresentationMode: false,

  saveStatus: 'saved',

  selectedBlockIds: new Set(),
  isSelecting: false,
  selectionRect: null,

  createBox: async (name) => {
    try {
      const selectedBoxId = get().selectedBoxId;
      const res = await api.post('/boxes', { 
         name: name || 'Nova Caixa', 
         parentId: selectedBoxId,
         order: get().boxes.filter(b => b.parentId === selectedBoxId).length 
      });
      set((state) => ({ boxes: [...state.boxes, res.data] }));
    } catch (error) {
    }
  },
  
  createNote: async (title) => {
    try {
      const selectedBoxId = get().selectedBoxId;
      const res = await api.post('/notes', { 
        title: title || 'Novo Cartão', 
        boxId: selectedBoxId,
        content: { type: 'doc', content: [] }
      });
      set((state) => ({ 
        notes: [...state.notes, res.data],
        activeNoteId: res.data._id
      }));
    } catch (error) {
    }
  },

  deleteBox: async (id) => {
    try {
       await api.delete(`/boxes/${id}`);
       set((state) => ({ 
           boxes: state.boxes.filter(box => box._id !== id),
           selectedBoxId: state.selectedBoxId === id ? null : state.selectedBoxId
       }));
    } catch (err) { }
  },

  deleteNote: async (id) => {
    try {
        await api.delete(`/notes/${id}`);
        set((state) => ({ 
            notes: state.notes.filter(note => note._id !== id),
            activeNoteId: state.activeNoteId === id ? null : state.activeNoteId,
            splitNoteId: state.splitNoteId === id ? null : state.splitNoteId
        }));
    } catch (err) { }
  },

  moveNote: async (noteId, targetBoxId) => {
    try {
       await api.put(`/notes/${noteId}`, { boxId: targetBoxId });
       set((state) => ({
         notes: state.notes.map(note => note._id === noteId ? { ...note, boxId: targetBoxId } : note)
       }));
    } catch (err) { }
  },

  moveBox: async (boxId, targetParentId) => {
    try {
       await api.put(`/boxes/${boxId}`, { parentId: targetParentId });
       set((state) => ({
         boxes: state.boxes.map(box => box._id === boxId ? { ...box, parentId: targetParentId } : box)
       }));
    } catch (err) { }
  },

  setActiveNote: (noteId) => set({ activeNoteId: noteId }),
  
  setSelectedBoxId: (boxId) => set({ selectedBoxId: boxId, activeNoteId: null }),

  updateNoteContent: (noteId, content) => {
    set((state) => ({
      notes: state.notes.map(note =>
        note._id === noteId ? { ...note, content } : note
      ),
      saveStatus: 'unsaved'
    }));
  },

  toggleSplitView: (noteId = null) => set((state) => ({
      splitView: !state.splitView,
      splitNoteId: noteId || state.splitNoteId
  })),

  setTheme: (theme) => {
    localStorage.setItem('devnotes-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },

  toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  togglePresentationMode: () => set((state) => ({ isPresentationMode: !state.isPresentationMode })),

  reorderItems: (orderedIds) => {
    set((state) => {
      const updatedNotes = [...state.notes];
      const updatedBoxes = [...state.boxes];
      
      orderedIds.forEach((itemId, idx) => {
        const type = itemId.startsWith('box-') ? 'box' : 'note';
        const id = itemId.replace(`${type}-`, '');
        
        if (type === 'note') {
          const nIdx = updatedNotes.findIndex(n => n._id === id);
          if (nIdx !== -1) updatedNotes[nIdx] = { ...updatedNotes[nIdx], order: idx };
        } else if (type === 'box') {
          const bIdx = updatedBoxes.findIndex(b => b._id === id);
          if (bIdx !== -1) updatedBoxes[bIdx] = { ...updatedBoxes[bIdx], order: idx };
        }
      });

      return {
        notes: updatedNotes.sort((a, b) => (a.order || 0) - (b.order || 0)),
        boxes: updatedBoxes.sort((a, b) => (a.order || 0) - (b.order || 0))
      };
    });
  },

  setSaveStatus: (status) => set({ saveStatus: status }),

  setIsSelecting: (bool) => set({ isSelecting: bool }),
  setSelectionRect: (rect) => set({ selectionRect: rect }),
  
  selectBlock: (blockId) => set({ selectedBlockIds: new Set([blockId]) }),
  addBlockToSelection: (blockId) => set((state) => {
    const newSet = new Set(state.selectedBlockIds);
    newSet.add(blockId);
    return { selectedBlockIds: newSet };
  }),
  removeBlockFromSelection: (blockId) => set((state) => {
    const newSet = new Set(state.selectedBlockIds);
    newSet.delete(blockId);
    return { selectedBlockIds: newSet };
  }),
  toggleBlockSelection: (blockId) => set((state) => {
    const newSet = new Set(state.selectedBlockIds);
    if (newSet.has(blockId)) newSet.delete(blockId);
    else newSet.add(blockId);
    return { selectedBlockIds: newSet };
  }),
  setBatchSelection: (blockIds) => set({ selectedBlockIds: new Set(blockIds) }),
  clearSelection: () => set({ selectedBlockIds: new Set(), selectionRect: null, isSelecting: false }),
}));
