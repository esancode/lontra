import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { FileText, Download } from 'lucide-react';

interface AttachmentProps {
  node: {
    attrs: {
      url: string;
      filename: string;
    };
  };
  selected: boolean;
}

const AttachmentComponent: React.FC<AttachmentProps> = ({ node, selected }) => {
  const { url, filename } = node.attrs;

  return (
    <NodeViewWrapper 
      className={`attachment-block flex items-center gap-3 p-3 border border-[var(--border-default)] rounded-[var(--radius-md)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] cursor-pointer transition-colors shadow-sm my-2 max-w-sm group ${selected ? 'ring-2 ring-[var(--accent-blue)]' : ''}`} 
      onClick={() => window.open(url, '_blank')}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] shrink-0 group-hover:bg-[var(--accent-blue)] group-hover:text-white transition-colors">
        <FileText size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-[var(--text-primary)] truncate" title={filename}>
          {filename}
        </div>
        <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
          Clique para abrir ou baixar
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-[var(--text-muted)] hover:text-[var(--accent-blue)]">
        <Download size={16} />
      </div>
    </NodeViewWrapper>
  );
};

export default Node.create({
  name: 'attachment',
  group: 'block',
  selectable: true,
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      url: { default: null },
      filename: { default: 'Documento anexado' }
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="attachment"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'attachment' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AttachmentComponent);
  },
});
