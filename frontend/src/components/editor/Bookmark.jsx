import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState } from 'react';
import { Pin, ExternalLink } from 'lucide-react';

const BookmarkComponent = ({ node, updateAttributes, selected }) => {
  const { url, title, description, icon, image } = node.attrs;
  const [isEditing, setIsEditing] = useState(!url);
  const [inputUrl, setInputUrl] = useState(url || '');

  const handleSave = () => {
    if (inputUrl.trim()) {
      let finalUrl = inputUrl.trim();
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
      }
      try {
        const urlObj = new URL(finalUrl);
        updateAttributes({
          url: finalUrl,
          title: urlObj.hostname.replace('www.', ''),
          description: `Link salvo: ${finalUrl}`,
          icon: `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`
        });
        setIsEditing(false);
      } catch (e) {
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      if (url) setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <NodeViewWrapper className={`bookmark-block my-4 ${selected ? 'ring-2 ring-[var(--accent-blue)] rounded-[var(--radius-md)]' : ''}`}>
        <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-[var(--radius-md)]">
          <Pin size={16} className="text-[var(--text-muted)] shrink-0" />
          <input
            type="url"
            autoFocus
            placeholder="Cole o link e pressione Enter..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none text-[13px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-muted)]"
          />
          <button 
             onClick={handleSave}
             className="px-3 py-1 bg-[var(--bg-elevated)] border border-[var(--border-muted)] hover:bg-[var(--border-active)] text-[12px] rounded-[var(--radius-sm)] transition-colors"
          >
            Salvar
          </button>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className={`bookmark-block flex items-stretch border border-[var(--border-default)] rounded-[var(--radius-md)] overflow-hidden my-4 hover:bg-[var(--bg-tertiary)] cursor-pointer transition-colors max-w-full group ${selected ? 'ring-2 ring-[var(--accent-blue)]' : ''}`} onClick={() => window.open(url, '_blank')}>
      <div className="bookmark-info flex-1 flex flex-col p-4 min-w-0">
        <div className="bookmark-title text-[14px] font-semibold text-[var(--text-primary)] truncate mb-1 pr-4 relative">
          {title}
          <ExternalLink size={14} className="absolute right-0 top-0.5 opacity-0 group-hover:opacity-100 text-[var(--text-muted)] transition-opacity" />
        </div>
        <div className="bookmark-description text-[12px] text-[var(--text-muted)] line-clamp-2 mb-2">{description}</div>
        <div className="bookmark-meta flex items-center gap-2 mt-auto text-[11px] text-[var(--text-secondary)]">
          {icon ? <img src={icon} alt="" className="w-4 h-4 rounded-sm" /> : <Pin size={12} />}
          <span className="truncate opacity-70 hover:opacity-100 transition-opacity">{url}</span>
        </div>
      </div>
      {image && (
        <div className="bookmark-image w-1/4 min-w-[120px] bg-cover bg-center border-l border-[var(--border-default)]" style={{ backgroundImage: `url(${image})` }} />
      )}
    </NodeViewWrapper>
  );
};

export default Node.create({
  name: 'bookmark',
  group: 'block',
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      url: { default: null },
      title: { default: 'Website' },
      description: { default: '' },
      icon: { default: null },
      image: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="bookmark"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'bookmark' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BookmarkComponent);
  },
});
