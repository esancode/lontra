import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';

interface InlineSearchProps {
  editor: any;
  onClose: () => void;
}

const InlineSearch: React.FC<InlineSearchProps> = ({ editor, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }

    // Heurística simples de busca no texto do editor
    const text = editor.getText();
    const regex = new RegExp(q, 'gi');
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push(match.index);
    }
    setResults(matches);
    setCurrentIndex(0);
  };

  return (
    <div className="absolute top-4 right-4 z-[1100] bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-2xl flex items-center p-1 gap-1 min-w-[320px] animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center flex-1 gap-2 px-2">
        <Search size={16} className="text-[var(--text-muted)]" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Pesquisar na nota..."
          className="flex-1 bg-transparent border-none outline-none text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] h-8"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-1 border-l border-[var(--border-muted)] pl-1">
        <div className="text-[11px] text-[var(--text-muted)] px-1 font-medium tabular-nums">
          {results.length > 0 ? `${currentIndex + 1}/${results.length}` : '0/0'}
        </div>
        
        <button 
          type="button"
          className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          onClick={() => setCurrentIndex(prev => (prev - 1 + results.length) % results.length)}
          disabled={results.length === 0}
        >
          <ChevronUp size={16} />
        </button>
        <button 
          type="button"
          className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          onClick={() => setCurrentIndex(prev => (prev + 1) % results.length)}
          disabled={results.length === 0}
        >
          <ChevronDown size={16} />
        </button>
        <button 
          type="button"
          className="p-1.5 rounded hover:bg-[var(--accent-red-subtle)] text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default InlineSearch;
