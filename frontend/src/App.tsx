import React, { useEffect } from 'react';
import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import CommandPalette from "./components/ui/CommandPalette"
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts"
import QuickNoteModal from "./components/QuickNote/QuickNoteModal"
import QuickNoteButton from "./components/QuickNote/QuickNoteButton"
import { useQuickNote } from "./hooks/useQuickNote"

const App: React.FC = () => {
  useKeyboardShortcuts();
  const { isOpen, modalState, result, error, history, open, close, process } = useQuickNote();

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        open();
      }
    };
    const eventHandler = () => open();
    window.addEventListener('keydown', keyHandler);
    window.addEventListener('open-quick-note', eventHandler);
    return () => {
      window.removeEventListener('keydown', keyHandler);
      window.removeEventListener('open-quick-note', eventHandler);
    };
  }, [open]);

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen text-[var(--text-primary)]">
      <CommandPalette />
      <QuickNoteModal
        isOpen={isOpen}
        modalState={modalState}
        result={result}
        error={error}
        history={history}
        onClose={close}
        onProcess={process}
      />
      <QuickNoteButton onClick={open} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/box/:boxId" element={<HomePage />} />
        <Route path="/note/:noteId" element={<HomePage />} />
      </Routes>
    </div>
  );
};

export default App;
