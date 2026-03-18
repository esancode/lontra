import React from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';

const CodeBlockComponent = ({ node, updateAttributes, extension }) => {
  const lineCount = node.textContent.split('\n').length || 1;
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <NodeViewWrapper className="code-block-wrapper relative group my-6 overflow-hidden bg-[#0d1117] border border-[#30363d] rounded-[8px] shadow-2xl transition-all hover:border-[#6e7681]">
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] select-none" contentEditable={false}>
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
           <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
           <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
        </div>
        <select 
          className="bg-transparent text-[11px] text-[#8b949e] font-mono outline-none cursor-pointer hover:text-[#c9d1d9] transition-colors border-none p-0 uppercase tracking-widest"
          defaultValue={node.attrs.language || 'javascript'} 
          onChange={e => updateAttributes({ language: e.target.value })}
        >
          <option value="null">PLAIN TEXT</option>
          <option value="javascript">JAVASCRIPT</option>
          <option value="typescript">TYPESCRIPT</option>
          <option value="python">PYTHON</option>
          <option value="java">JAVA</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          <option value="csharp">C#</option>
          <option value="php">PHP</option>
          <option value="ruby">RUBY</option>
          <option value="swift">SWIFT</option>
          <option value="go">GO</option>
          <option value="rust">RUST</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="json">JSON</option>
          <option value="yaml">YAML</option>
          <option value="xml">XML</option>
          <option value="sql">SQL</option>
          <option value="bash">BASH</option>
        </select>
      </div>
      
      <div className="relative flex p-4 overflow-x-auto code-scroll">
         <div className="flex flex-col text-right pr-4 border-r border-[#30363d] mr-4 text-[#484f58] select-none font-[family:var(--font-mono)] text-[13px] leading-[1.6] min-w-[2rem]" contentEditable={false}>
            {lines.map(l => <span key={l}>{l}</span>)}
         </div>
         <NodeViewContent 
            as="code" 
            className="flex-1 font-[family:var(--font-mono)] text-[13px] text-[#c9d1d9] leading-[1.6] min-w-max outline-none" 
         />
      </div>
    </NodeViewWrapper>
  );
};

export default CodeBlockComponent;
