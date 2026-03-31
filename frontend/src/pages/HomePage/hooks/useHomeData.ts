import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../../../lib/axios';
import { useAppStore } from '../../../store/useAppStore';

export const useHomeData = (selectedBoxId: string | null) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const { notes, boxes, createBox, createNote } = useAppStore();

  const [creatingBox, setCreatingBox] = useState(false);
  const [creatingNote, setCreatingNote] = useState(false);
  const [newBoxName, setNewBoxName] = useState('');
  const [newNoteName, setNewNoteName] = useState('');

  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      try {
        const [notesRes, boxesRes] = await Promise.all([
          api.get('/notes'),
          api.get('/boxes')
        ]);
        useAppStore.setState({ notes: notesRes.data, boxes: boxesRes.data });
        setIsRateLimited(false);
      } catch (error: any) {
        if (error.response?.status === 429) {
          setIsRateLimited(true);
        }
      } finally {
        setLoading(false);
      }
    };
    initFetch();
  }, []);

  const handleCreateBox = async (name: string) => {
    const currentBoxCount = boxes.filter(b => b.parentId === selectedBoxId).length;
    await createBox(name, selectedBoxId, currentBoxCount);
    setCreatingBox(false);
    setNewBoxName('');
  };

  const handleCreateNote = async (title: string) => {
    const newNote = await createNote(title, selectedBoxId, { type: 'doc', content: [] });
    if (newNote) {
      navigate(`/note/${newNote._id}`);
    }
    setCreatingNote(false);
    setNewNoteName('');
  };

  return {
    loading,
    isRateLimited,
    creatingBox,
    setCreatingBox,
    creatingNote,
    setCreatingNote,
    newBoxName,
    setNewBoxName,
    newNoteName,
    setNewNoteName,
    handleCreateBox,
    handleCreateNote
  };
};
