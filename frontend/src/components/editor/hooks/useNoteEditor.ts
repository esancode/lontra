import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { useEditor, ReactNodeViewRenderer, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Focus from '@tiptap/extension-focus';
import CharacterCount from '@tiptap/extension-character-count';
import Mathematics from '@tiptap/extension-mathematics';
import UniqueId from '@tiptap/extension-unique-id';
import Gapcursor from '@tiptap/extension-gapcursor';
import Dropcursor from '@tiptap/extension-dropcursor';
import { useAppStore } from '../../../store/useAppStore';
import api from '../../../lib/axios';

import Commands from '../extensions/CommandsExtension';
import SlashMenu, { SlashMenuHandle } from '../SlashMenu';
import Callout from '../extensions/CalloutExtension';
import Bookmark from '../extensions/BookmarkExtension';
import AttachmentBlock from '../extensions/AttachmentExtension';
import CodeBlockComponent from '../CodeBlockComponent';
import { WikiLinkExtension } from '../extensions/WikiLinkExtension';
import { extractTextFromJSON, extractTagsFromText } from '../../../utils/editorUtils';

const lowlight = createLowlight(common);

interface UseNoteEditorProps {
  noteId: string;
  initialContent: any;
  onFocus?: (editor: Editor) => void;
  setSlashMenu: (data: any) => void;
  setWikiMenu: (data: any) => void;
  slashMenuRef: React.MutableRefObject<any>;
  wikiMenuRef: React.MutableRefObject<any>;
  commandMenuRef: React.RefObject<SlashMenuHandle | null>;
  wikiMenuComponentRef: React.RefObject<any>;
}

export const useNoteEditor = ({
  noteId,
  initialContent,
  onFocus,
  setSlashMenu,
  setWikiMenu,
  slashMenuRef,
  wikiMenuRef,
  commandMenuRef,
  wikiMenuComponentRef,
}: UseNoteEditorProps) => {
  const { updateNoteContent, setSaveStatus } = useAppStore();
  const saveTimeoutRef = useRef<any>(null);

  const getIntelligentMenuCoords = (coords: { top: number, bottom: number, left: number }) => {
    const spaceBelow = typeof window !== 'undefined' ? window.innerHeight - coords.bottom : 500;
    const menuMaxHeight = 350;
    
    // Se não há espaço em baixo, e tem espaço em cima, joga pra cima
    if (spaceBelow < menuMaxHeight && coords.top > menuMaxHeight) {
      return { top: 'auto', bottom: window.innerHeight - coords.top + 4, left: coords.left };
    }
    return { top: coords.bottom + 4, bottom: 'auto', left: coords.left };
  };

  const extensions = useMemo(() => [
    // UniqueId.configure({
    //   attributeName: 'id',
    //   types: ['paragraph', 'heading', 'taskList', 'taskItem', 'table', 'blockquote', 'codeBlock', 'image'],
    //   generateID: () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
    // }),
    StarterKit.configure({ 
      codeBlock: false, 
      gapcursor: false, 
      dropcursor: false, 
      link: false,
      underline: false,
    }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Typography,
    Image.configure({ allowBase64: true }),
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === 'heading') return `Heading ${node.attrs.level}`
        return 'Digite / para comandos...'
      },
    }),
    TaskItem.configure({ nested: true }),
    TaskList,
    CodeBlockLowlight.extend({
      addNodeView() { return ReactNodeViewRenderer(CodeBlockComponent) },
    }).configure({ lowlight }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    CharacterCount.configure({ limit: null }),
    Mathematics,
    Commands.configure({ suggestionComponent: SlashMenu }),
    Bookmark,
    AttachmentBlock,
    Callout,
    Focus,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    WikiLinkExtension,
    Link.configure({ openOnClick: false }),
    Gapcursor,
    Dropcursor.configure({ color: 'var(--accent-blue)', width: 2 }),
  ], []);

  const editor = useEditor({
    extensions,
    content: initialContent || '',
    onFocus: ({ editor }) => {
      if (onFocus) onFocus(editor);
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      
      const textRaw = extractTextFromJSON(json);
      const extractedTags = extractTagsFromText(textRaw);

      updateNoteContent(noteId, json, extractedTags);
      setSaveStatus('saving');
      
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await api.put(`/notes/${noteId}`, { content: json, tags: extractedTags });
          setSaveStatus('saved');
        } catch (err) {
          setSaveStatus('error');
        }
      }, 1000);
    },
    editorProps: {
      attributes: {
        class: 'tiptap prose prose-invert prose-p:leading-[1.5] prose-h1:leading-[1.2] prose-h2:leading-[1.3] prose-h3:leading-[1.3] prose-p:my-1 prose-headings:my-2 focus:outline-none w-full pb-32',
      },
      handleKeyDown: (view, event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;
          if ($from.parent.type.name === 'codeBlock') {
            const start = $from.start();
            const end = $from.end();
            const tr = state.tr.setSelection((selection.constructor as any).create(state.doc, start, end));
            view.dispatch(tr);
            return true;
          }
        }

        if (event.key === 'Tab' && view.state.selection.$from.parent.type.name === 'codeBlock') {
          event.preventDefault();
          const { state, dispatch } = view;
          const { selection } = state;
          const { tr } = state;

          if (event.shiftKey) {
            const { $from } = selection;
            const pos = $from.pos;
            const lineStart = $from.start();
            const textBefore = $from.parent.textContent.slice(0, pos - lineStart);
            if (textBefore.endsWith('  ')) {
              dispatch(tr.delete(pos - 2, pos));
            } else if (textBefore.endsWith(' ')) {
              dispatch(tr.delete(pos - 1, pos));
            }
          } else {
            dispatch(tr.insertText('  '));
          }
          return true;
        }

        if (view.state.selection.$from.parent.type.name === 'codeBlock') {
          if (event.key === 'Backspace') {
             const { state, dispatch } = view;
             const { tr, selection } = state;
             if (selection.empty && selection.from > 0) {
                const textBefore = state.doc.textBetween(selection.from - 1, selection.from);
                const textAfter = state.doc.textBetween(selection.from, selection.from + 1);
                if (
                  (textBefore === '(' && textAfter === ')') ||
                  (textBefore === '{' && textAfter === '}') ||
                  (textBefore === '[' && textAfter === ']') ||
                  (textBefore === '"' && textAfter === '"') ||
                  (textBefore === "'" && textAfter === "'")
                ) {
                   event.preventDefault();
                   dispatch(tr.delete(selection.from - 1, selection.from + 1));
                   return true;
                }
             }
          }
        }

        if (slashMenuRef.current) {
          if (event.key === 'Escape') {
            const { from } = slashMenuRef.current.range;
            view.dispatch(view.state.tr.delete(from, view.state.selection.from));
            setSlashMenu(null);
            slashMenuRef.current = null;
            return true;
          }
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter') {
            if (commandMenuRef.current && commandMenuRef.current.onKeyDown) {
              const handled = commandMenuRef.current.onKeyDown({ event });
              if (handled) {
                event.preventDefault();
                return true;
              }
            }
          }
          if (event.key === 'Backspace') {
            const { from } = slashMenuRef.current.range;
            if (view.state.selection.from <= from + 1) {
              setSlashMenu(null);
              slashMenuRef.current = null;
            }
          }
        }

        if (wikiMenuRef.current) {
          if (event.key === 'Escape') {
            const { from } = wikiMenuRef.current.range;
            view.dispatch(view.state.tr.delete(from, view.state.selection.from));
            setWikiMenu(null);
            wikiMenuRef.current = null;
            return true;
          }
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter') {
            if (wikiMenuComponentRef.current && wikiMenuComponentRef.current.onKeyDown) {
              const handled = wikiMenuComponentRef.current.onKeyDown({ event });
              if (handled) {
                event.preventDefault();
                return true;
              }
            }
          }
          if (event.key === 'Backspace') {
            const { from } = wikiMenuRef.current.range;
            if (view.state.selection.from <= from + 1) {
              setWikiMenu(null);
              wikiMenuRef.current = null;
            }
          }
        }

        if (event.key === '/') {
          const { $from } = view.state.selection;
          const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc');
          const lastChar = textBefore[textBefore.length - 1];
          if (view.state.selection.$from.parent.type.name === 'codeBlock') return false;
          if (textBefore.length === 0 || lastChar === ' ' || lastChar === '\n') {
            requestAnimationFrame(() => {
              const coords = view.coordsAtPos(view.state.selection.from - 1);
              const range = { from: view.state.selection.from - 1, to: view.state.selection.from };
              const menuData = { range, coords: getIntelligentMenuCoords(coords), query: '' };
              slashMenuRef.current = menuData;
              setSlashMenu(menuData);
            });
            return false;
          }
        }

        if (slashMenuRef.current && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          requestAnimationFrame(() => {
            if (!slashMenuRef.current) return;
            const { from } = slashMenuRef.current.range;
            const { to } = view.state.selection;
            const text = view.state.doc.textBetween(from, to, undefined, '\ufffc');
            if (text.startsWith('/')) {
              const query = text.slice(1);
              const updatedMenu = { ...slashMenuRef.current, query, range: { from, to } };
              slashMenuRef.current = updatedMenu;
              setSlashMenu(updatedMenu);
            } else {
              setSlashMenu(null);
              slashMenuRef.current = null;
            }
          });
        }

        if (event.key === '[') {
          const { $from } = view.state.selection;
          const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc');
          const lastChar = textBefore[textBefore.length - 1];
          if (view.state.selection.$from.parent.type.name === 'codeBlock') return false;
          
          if (lastChar === '[') {
            requestAnimationFrame(() => {
              const coords = view.coordsAtPos(view.state.selection.from - 2);
              const range = { from: view.state.selection.from - 2, to: view.state.selection.from };
              const menuData = { range, coords: getIntelligentMenuCoords(coords), query: '' };
              wikiMenuRef.current = menuData;
              setWikiMenu(menuData);
            });
          }
        }

        if (wikiMenuRef.current && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          requestAnimationFrame(() => {
            if (!wikiMenuRef.current) return;
            const { from } = wikiMenuRef.current.range;
            const { to } = view.state.selection;
            const text = view.state.doc.textBetween(from, to, undefined, '\ufffc');
            if (text.startsWith('[[')) {
              const query = text.slice(2);
              const updatedMenu = { ...wikiMenuRef.current, query, range: { from, to } };
              wikiMenuRef.current = updatedMenu;
              setWikiMenu(updatedMenu);
            } else {
              setWikiMenu(null);
              wikiMenuRef.current = null;
            }
          });
        }
        return false;
      },
      handleTextInput: (view, from, to, text) => {
        if (view.state.selection.$from.parent.type.name === 'codeBlock') {
          const pairs: Record<string, string> = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'" };
          if (pairs[text]) {
            const { state, dispatch } = view;
            const tr = state.tr.insertText(text + pairs[text], from, to);
            const newSelection = (state.selection.constructor as any).create(tr.doc, from + 1);
            dispatch(tr.setSelection(newSelection));
            return true;
          }
        }
        return false;
      },
    },
  });

  return { editor };
};
