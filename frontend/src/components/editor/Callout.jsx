import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React, { useState } from 'react';

const CalloutComponent = ({ node, updateAttributes, selected }) => {
  const { type, icon } = node.attrs;
  const [showOptions, setShowOptions] = useState(false);

  const calloutTypes = [
    { type: 'info', icon: '💡', label: 'Informação', color: 'bg-blue-500/10 border-blue-500/50 text-blue-400' },
    { type: 'warning', icon: '⚠️', label: 'Aviso', color: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400' },
    { type: 'error', icon: '🚨', label: 'Erro', color: 'bg-red-500/10 border-red-500/50 text-red-400' },
    { type: 'success', icon: '✅', label: 'Sucesso', color: 'bg-green-500/10 border-green-500/50 text-green-400' },
  ];

  const currentConfig = calloutTypes.find(t => t.type === type) || calloutTypes[0];

  return (
    <NodeViewWrapper 
      className={`callout-block relative my-4 group ${selected ? 'ring-2 ring-[var(--accent-blue)] rounded-[var(--radius-md)]' : ''}`}
    >
      <div className={`flex gap-3 p-4 rounded-[var(--radius-md)] border-l-4 transition-colors ${currentConfig.color}`}>
        <div 
          className="callout-icon shrink-0 select-none cursor-pointer relative"
          onClick={() => setShowOptions(!showOptions)}
          title="Mudar tipo de aviso"
        >
          <span className="text-xl">{icon}</span>
          
          {showOptions && (
            <div className="absolute top-full left-0 mt-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-xl z-50 p-1 flex flex-col gap-1 min-w-[120px]">
              {calloutTypes.map(t => (
                <button
                  key={t.type}
                  className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-[var(--radius-sm)] hover:bg-[var(--bg-tertiary)] transition-colors ${t.type === type ? 'bg-[var(--bg-tertiary)]' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateAttributes({ type: t.type, icon: t.icon });
                    setShowOptions(false);
                  }}
                >
                  <span>{t.icon}</span>
                  <span className="text-[var(--text-primary)]">{t.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <NodeViewContent className="callout-content flex-1 outline-none text-[var(--text-primary)]" />
      </div>
    </NodeViewWrapper>
  );
};

export default Node.create({
  name: 'callout',
  group: 'block',
  content: 'inline*',
  draggable: true,

  addAttributes() {
    return {
      type: { default: 'info' },
      icon: { default: '💡' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'callout' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutComponent);
  },
});
