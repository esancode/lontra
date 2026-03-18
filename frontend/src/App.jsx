import React from 'react';
import { Routes, Route } from "react-router"
import HomePage from "./pages/HomePage"
import CommandPalette from "./components/ui/CommandPalette"
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts"

const App = () => {
  useKeyboardShortcuts();

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen text-[var(--text-primary)]">
      <CommandPalette />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/box/:boxId" element={<HomePage />} />
        <Route path="/note/:noteId" element={<HomePage />} />
      </Routes>
    </div>
  );
};

export default App;
