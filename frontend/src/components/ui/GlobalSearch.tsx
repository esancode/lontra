import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, FileText, Folder } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Icon } from '@iconify/react';
import api from '../../lib/axios';

interface SearchResult {
  _id: string;
  title: string;
  type: 'note' | 'box';
  icon?: string;
  matchFragment?: string;
}

const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.get(`/search?q=${encodeURIComponent(searchTerm)}`);
      setResults(res.data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(val);
    }, 400);
  };

  const handleResultClick = (item: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    if (item.type === 'note') navigate(`/note/${item._id}`);
    else if (item.type === 'box') navigate(`/box/${item._id}`);
  };

  return (
    <div className="relative flex items-center" ref={containerRef}>
      <div className="relative group/search">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within/search:text-[var(--accent-blue)] transition-colors size-3.5" />
        <input 
          type="text" 
          placeholder="Buscar (Global)..." 
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim() && setIsOpen(true)}
          className="w-40 sm:w-60 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-[var(--radius-md)] h-7 pl-8 pr-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)] focus:ring-1 focus:ring-[var(--accent-blue-subtle)] transition-all bg-opacity-70"
        />
        {isLoading && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--accent-blue)] size-3.5 animate-spin" />}
      </div>

      {isOpen && query.trim() !== '' && (
        <div 
          className="absolute right-0 sm:left-auto w-[250px] sm:w-[320px] top-[calc(100%+8px)] bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-[0_12px_36px_rgba(0,0,0,0.4)] z-[9999] py-2 max-h-[60vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {results.length === 0 && !isLoading && (
            <div className="px-4 py-3 text-sm text-[var(--text-muted)] text-center">Nenhum resultado para "{query}"</div>
          )}
          
          {results.length > 0 && results.map(item => (
            <button
              key={`${item.type}-${item._id}`}
              onClick={() => handleResultClick(item)}
              className="w-full text-left px-3 py-2 flex items-start gap-3 hover:bg-[var(--bg-tertiary)] transition-colors border-l-2 border-transparent hover:border-[var(--accent-blue)] group"
            >
              <div className="mt-0.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors flex-shrink-0">
                {item.type === 'box' ? (
                  <Folder size={16} className="text-[var(--accent-orange)] opacity-80" />
                ) : (
                  item.icon ? (
                    <Icon icon={item.icon} width={16} />
                  ) : (
                    <FileText size={16} />
                  )
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-[var(--text-primary)] font-medium truncate leading-tight">
                  {item.title}
                </div>
                {item.matchFragment && (
                  <div className="text-[11px] text-[var(--text-muted)] opacity-80 truncate font-mono mt-0.5 max-w-full">
                    {item.matchFragment}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
