import React, { useCallback, useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import api from '../../../lib/axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EditorHeaderProps {
  noteId: string;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({ noteId }) => {
  const { notes, setSaveStatus } = useAppStore();
  const note = notes.find(n => n._id === noteId);
  const [isSaving, setIsSaving] = useState(false);

  const handleTitleChange = useCallback(async (newTitle: string) => {
    // Update local store immediately for responsiveness
    useAppStore.setState(state => ({
      notes: state.notes.map(n => n._id === noteId ? { ...n, title: newTitle } : n)
    }));

    setIsSaving(true);
    setSaveStatus('saving');
    try {
      await api.put(`/notes/${noteId}`, { title: newTitle });
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }, [noteId, setSaveStatus]);

  const formattedDate = note?.updatedAt 
    ? format(new Date(note.updatedAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
    : '';

  return (
    <div className="w-full pt-2 pb-2 relative group mb-4">
      <textarea
        ref={(el) => {
          if (el) {
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
          }
        }}
        rows={1}
        className="w-full text-5xl font-black bg-transparent border-none outline-none text-[var(--text-primary)] mb-3 placeholder:text-[var(--text-muted)] placeholder:opacity-30 tracking-tight resize-none break-words overflow-hidden"
        placeholder="Título..."
        value={note?.title || ''}
        onChange={(e) => {
          e.target.style.height = 'auto';
          e.target.style.height = `${e.target.scrollHeight}px`;
          handleTitleChange(e.target.value.replace(/\n/g, ' '));
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
      />
      {formattedDate && (
        <div className="text-[13px] text-[var(--text-muted)] flex items-center gap-2 mb-4 opacity-60 font-medium">
          Editado em {formattedDate}
        </div>
      )}
    </div>
  );
};

export default EditorHeader;
