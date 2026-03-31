import { create } from 'zustand';
import api from '../lib/axios';
import { Box, Note, SaveStatus } from '../types/app.types';

interface AppState {
  boxes: Box[];
  notes: Note[];
  selectedBoxId: string | null;
  activeNoteId: string | null;
  commandPaletteOpen: boolean;
  isPresentationMode: boolean;
  saveStatus: SaveStatus;
  selectedBlockIds: Set<string>;
  isSelecting: boolean;
  selectionRect: any;

  createBox: (name?: string, parentId?: string | null, order?: number) => Promise<Box | undefined>;
  createNote: (title?: string, boxId?: string | null, content?: any) => Promise<Note | undefined>;
  deleteBox: (id: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  moveNote: (noteId: string, targetBoxId: string | null) => Promise<void>;
  moveBox: (boxId: string, targetParentId: string | null) => Promise<void>;
  renameNote: (noteId: string, title: string) => Promise<void>;
  renameBox: (boxId: string, name: string) => Promise<void>;
  setActiveNote: (noteId: string | null) => void;
  setSelectedBoxId: (boxId: string | null) => void;
  updateNoteContent: (noteId: string, content: any, tags?: string[]) => void;
  toggleCommandPalette: () => void;
  togglePresentationMode: () => void;
  reorderItems: (orderedIds: string[]) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setIsSelecting: (bool: boolean) => void;
  setSelectionRect: (rect: any) => void;
  selectBlock: (blockId: string) => void;
  addBlockToSelection: (blockId: string) => void;
  removeBlockFromSelection: (blockId: string) => void;
  toggleBlockSelection: (blockId: string) => void;
  setBatchSelection: (blockIds: string[]) => void;
  clearSelection: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  boxes: [],
  notes: [],
  selectedBoxId: null,
  activeNoteId: null,
  commandPaletteOpen: false,
  isPresentationMode: false,
  saveStatus: 'saved',
  selectedBlockIds: new Set<string>(),
  isSelecting: false,
  selectionRect: null,

  createBox: async (name, parentId, order) => {
    try {
      const parent = parentId !== undefined ? parentId : get().selectedBoxId;
      const res = await api.post('/boxes', { 
         name: name || 'Nova Caixa', 
         parentId: parent,
         order: order !== undefined ? order : get().boxes.filter(b => b.parentId === parent).length 
      });
      set((state) => ({ boxes: [...state.boxes, res.data] }));
      return res.data;
    } catch (error) {
      console.error('Error creating box:', error);
    }
  },
  
  createNote: async (title, boxId, content) => {
    try {
      const parent = boxId !== undefined ? boxId : get().selectedBoxId;
      const noteContent = content || { type: 'doc', content: [] };
      const res = await api.post('/notes', { 
        title: title || 'Novo Cartão', 
        boxId: parent,
        content: noteContent
      });
      set((state) => ({ 
        notes: [...state.notes, res.data],
        activeNoteId: res.data._id
      }));
      return res.data;
    } catch (error) {
      console.error('Error creating note:', error);
    }
  },

  deleteBox: async (id) => {
    try {
       await api.delete(`/boxes/${id}`);
       set((state) => ({ 
           boxes: state.boxes.filter(box => box._id !== id),
           selectedBoxId: state.selectedBoxId === id ? null : state.selectedBoxId
       }));
    } catch (err) { console.error(err); }
  },

  deleteNote: async (id) => {
    try {
        await api.delete(`/notes/${id}`);
        set((state) => ({ 
            notes: state.notes.filter(note => note._id !== id),
            activeNoteId: state.activeNoteId === id ? null : state.activeNoteId
        }));
    } catch (err) { console.error(err); }
  },

  moveNote: async (noteId, targetBoxId) => {
    try {
       await api.put(`/notes/${noteId}`, { boxId: targetBoxId });
       set((state) => ({
         notes: state.notes.map(note => note._id === noteId ? { ...note, boxId: targetBoxId } : note)
       }));
    } catch (err) { console.error(err); }
  },

  moveBox: async (boxId, targetParentId) => {
    try {
       await api.put(`/boxes/${boxId}`, { parentId: targetParentId });
       set((state) => ({
         boxes: state.boxes.map(box => box._id === boxId ? { ...box, parentId: targetParentId } : box)
       }));
    } catch (err) { console.error(err); }
  },

  renameNote: async (noteId, title) => {
    try {
      await api.put(`/notes/${noteId}`, { title });
      set((state) => ({
        notes: state.notes.map(note => note._id === noteId ? { ...note, title } : note)
      }));
    } catch (err) { console.error(err); }
  },

  renameBox: async (boxId, name) => {
    try {
      await api.put(`/boxes/${boxId}`, { name });
      set((state) => ({
        boxes: state.boxes.map(box => box._id === boxId ? { ...box, name } : box)
      }));
    } catch (err) { console.error(err); }
  },

  setActiveNote: (noteId) => set({ activeNoteId: noteId }),
  
  setSelectedBoxId: (boxId) => set({ selectedBoxId: boxId, activeNoteId: null }),

  updateNoteContent: (noteId, content, tags) => {
    set((state) => ({
      notes: state.notes.map(note =>
        note._id === noteId ? { ...note, content, ...(tags ? { tags } : {}) } : note
      ),
      saveStatus: 'unsaved'
    }));
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
