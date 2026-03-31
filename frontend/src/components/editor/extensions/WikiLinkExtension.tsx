import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { FileText, Folder } from 'lucide-react';

export interface WikiLinkOptions {
  id: string | null;
  type: 'note' | 'box';
  title: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    wikiLink: {
      /**
       * Inserir um link interno estilo Wiki [[Título]]
       */
      insertWikiLink: (options: WikiLinkOptions) => ReturnType;
    }
  }
}

const WikiLinkComponent = (props: any) => {
  const { node } = props;
  const { id, type, title } = node.attrs;
  const { setActiveNote, setSelectedBoxId } = useAppStore();

  const handleClick = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'note') {
      setActiveNote(id);
      window.dispatchEvent(new CustomEvent('app-navigate', { detail: { path: `/note/${id}` } }));
    } else if (type === 'box') {
      setSelectedBoxId(id);
      setActiveNote(null);
      window.dispatchEvent(new CustomEvent('app-navigate', { detail: { path: `/box/${id}` } }));
    }
  };

  return (
    <NodeViewWrapper
      as="span"
      className="inline-flex items-center gap-1.5 px-2 py-[2px] mx-0.5 text-[12px] font-medium rounded-[var(--radius-sm)] cursor-pointer transition-all bg-[var(--bg-tertiary)] hover:bg-[var(--accent-blue-subtle)] hover:shadow-sm text-[var(--text-secondary)] hover:text-[var(--accent-blue)] border border-[var(--border-muted)] hover:border-[var(--accent-blue)]/30 align-baseline leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
      onPointerDown={(e: React.PointerEvent) => {
        // Usa onPointerDown no Tiptap porque o onClick as vezes é evitado pelo contentEditable
        e.preventDefault();
        e.stopPropagation();
        handleClick(e);
      }}
      contentEditable={false}
      data-wiki-link="true"
    >
      {type === 'box' ? <Folder size={12} className="opacity-70 flex-shrink-0" /> : <FileText size={12} className="opacity-70 flex-shrink-0" />}
      <span className="truncate max-w-[180px] leading-tight mt-[1px]">{title}</span>
    </NodeViewWrapper>
  );
};

export const WikiLinkExtension = Node.create({
  name: 'wikiLink',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      id: { default: null },
      type: { default: 'note' },
      title: { default: '' }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-wiki-link]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span', 
      mergeAttributes(HTMLAttributes, { 
        'data-wiki-link': 'true', 
        'data-id': HTMLAttributes.id,
        'data-type': HTMLAttributes.type,
      }), 
      `[[${HTMLAttributes.title}]]`
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(WikiLinkComponent);
  },

  addCommands() {
    return {
      insertWikiLink: options => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options
        });
      }
    };
  }
});
