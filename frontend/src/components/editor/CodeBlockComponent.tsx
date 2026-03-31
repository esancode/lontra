import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';
import { Copy, Check, Terminal, ChevronDown, Maximize2, Minimize2, Search } from 'lucide-react';
import { Icon } from '@iconify/react';
import { codeLanguages } from '../../utils/languages';

const CodeBlockComponent: React.FC<NodeViewProps> = ({ node, updateAttributes, extension }) => {
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { language: defaultLang } = node.attrs;
  const textContent = node.content?.firstChild?.text || '';
  // Se o texto estiver vazio, teremos pelo menos 1 linha
  const lineCount = textContent ? textContent.split('\n').length : 1;
  const isLongCode = lineCount > 12;

  const currentLangObj = useMemo(() => codeLanguages.find(l => l.value === defaultLang), [defaultLang]);
  const availableLangs = useMemo(() => extension.options.lowlight.listLanguages() as string[], [extension]);

  const filteredLangs = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return availableLangs.filter((lang: string) => {
      const label = codeLanguages.find(l => l.value === lang)?.label || lang;
      return label.toLowerCase().includes(q) || lang.toLowerCase().includes(q);
    });
  }, [availableLangs, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showDropdown && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showDropdown]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [textContent]);

  return (
    <NodeViewWrapper className="code-block-container relative my-8 group rounded-[var(--radius-lg)] shadow-2xl border border-[#30363d] bg-[#0d1117] flex flex-col">
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#30363d] select-none rounded-t-[calc(var(--radius-lg)-1px)]" contentEditable={false}>
        
        <div className="flex items-center gap-6">
          {/* Mac OS Window Controls */}
          <div className="flex gap-2 items-center">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
          </div>
          
          {/* Custom Language Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="flex items-center gap-2 text-[#79c0ff] bg-[#0d1117] px-3 py-1.5 rounded-[var(--radius-sm)] border border-[#30363d] hover:border-[#8b949e] transition-colors"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {currentLangObj?.icon ? (
                <Icon icon={currentLangObj.icon} className="text-[14px]" />
              ) : (
                <Terminal size={14} className="opacity-70" />
              )}
              <span className="text-[12px] font-mono font-medium">{currentLangObj?.label || defaultLang || 'Auto-detect'}</span>
              <ChevronDown size={14} className={`opacity-70 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
              <div className="absolute top-full left-0 mt-2 w-60 max-h-[350px] overflow-y-auto bg-[#161b22] border border-[#30363d] rounded-[var(--radius-md)] shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 p-1 flex flex-col gap-0.5 custom-scrollbar">
                
                {/* Barra de Pesquisa */}
                <div className="p-2 sticky top-0 bg-[#161b22] z-10 border-b border-[#30363d] mb-1">
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8b949e]" />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Buscar linguagem..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDownCapture={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-[#0d1117] text-[#c9d1d9] text-[12px] font-mono pl-7 pr-2 py-1.5 rounded outline-none border border-[#30363d] focus:border-[#79c0ff] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className={`flex items-center gap-2 px-3 py-2.5 text-[12px] font-mono rounded-[var(--radius-sm)] text-left hover:bg-[#30363d] transition-colors ${!defaultLang || defaultLang === 'null' ? 'bg-[#30363d] text-white' : 'text-[#c9d1d9]'}`}
                  onClick={() => {
                    updateAttributes({ language: 'null' });
                    setShowDropdown(false);
                    setSearchQuery('');
                  }}
                >
                  <Terminal size={14} className="text-[#8b949e]" />
                  <span>Auto-detect</span>
                </button>
                
                {filteredLangs.length === 0 && (
                  <div className="px-3 py-4 text-center text-[11px] text-[#8b949e] font-mono">
                    Nenhuma linguagem encontrada
                  </div>
                )}

                {filteredLangs.map((lang: string) => {
                  const langObj = codeLanguages.find(l => l.value === lang);
                  const label = langObj?.label || lang;
                  const icon = langObj?.icon;
                  return (
                    <button
                      key={lang}
                      type="button"
                      className={`flex items-center gap-2 px-3 py-2.5 text-[12px] font-mono rounded-[var(--radius-sm)] text-left hover:bg-[#30363d] transition-colors ${defaultLang === lang ? 'bg-[#30363d] text-white' : 'text-[#c9d1d9]'}`}
                      onClick={() => {
                        updateAttributes({ language: lang });
                        setShowDropdown(false);
                        setSearchQuery('');
                      }}
                    >
                      {icon ? <Icon icon={icon} className="text-[14px]" /> : <Terminal size={14} className="text-[#8b949e]" />}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {isLongCode && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#30363d] transition-all active:scale-95 border border-transparent"
              title={isExpanded ? 'Recolher código' : 'Expandir código'}
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-[#c9d1d9] hover:text-white hover:bg-[#30363d] transition-all active:scale-95 text-xs font-mono border border-transparent"
            title="Copiar código"
          >
            {copied ? <Check size={14} className="text-[#238636]" /> : <Copy size={14} />}
            <span className="opacity-90 leading-none">{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {/* Code Editor Content */}
      <div 
        className={`flex bg-[#0d1117] transition-all duration-300 ease-in-out relative rounded-b-[calc(var(--radius-lg)-1px)] ${!isExpanded && isLongCode ? 'max-h-[350px] overflow-hidden' : ''}`}
        onWheel={(e) => {
          // Prevent scrolling if minimized
          if (!isExpanded && isLongCode) {
            e.stopPropagation();
          }
        }}
      >
        
        {/* Line Numbers */}
        <div 
          contentEditable={false} 
          style={{ paddingTop: '20px', paddingBottom: '20px' }}
          className="flex flex-col text-[#484f58] text-right pr-4 pl-4 font-mono text-[14px] leading-[1.6] select-none border-r border-[#30363d] bg-[#0d1117] sticky left-0 z-10 min-w-[3.5rem] m-0 rounded-bl-[calc(var(--radius-lg)-1px)]"
        >
          {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
            <span key={i + 1} className="inline-block h-[1.6em]">{i + 1}</span>
          ))}
        </div>

        {/* Actual Code */}
        <pre 
          spellCheck={false}
          style={{ padding: '20px 16px 20px 24px' }}
          className={`m-0 scrollbar-thin scrollbar-thumb-[#30363d] scrollbar-track-transparent flex-1 rounded-br-[calc(var(--radius-lg)-1px)] ${!isExpanded && isLongCode ? 'overflow-y-hidden overflow-x-auto' : 'overflow-x-auto'}`}
        >
          <NodeViewContent spellCheck={false} as="code" className={`language-${defaultLang} font-mono text-[14px] leading-[1.6] text-[#c9d1d9] block w-full min-w-max m-0 p-0`} />
        </pre>
      </div>

      {/* Expand overlay fade */}
      {!isExpanded && isLongCode && (
        <div 
          contentEditable={false}
          className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/80 to-transparent pointer-events-none flex items-end justify-center pb-6 z-20 rounded-b-[var(--radius-lg)]"
        >
          <button
             type="button"
             onClick={() => setIsExpanded(true)}
             className="pointer-events-auto flex items-center gap-2 px-6 py-2.5 bg-[#161b22] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white rounded-full text-[13px] font-medium border border-[#30363d] shadow-[0_4px_16px_rgba(0,0,0,0.6)] transition-all cursor-pointer active:scale-95"
          >
            <Maximize2 size={16} />
            Mostrar Código Completo
          </button>
        </div>
      )}
    </NodeViewWrapper>
  );
};

export default CodeBlockComponent;
