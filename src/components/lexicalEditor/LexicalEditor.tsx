import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import {
  $isTextNode,
  DOMConversionMap,
  DOMExportOutput,
  DOMExportOutputMap,
  isHTMLElement,
  Klass,
  LexicalEditor,
  LexicalNode,
  ParagraphNode,
  TextNode,
} from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';

import { theme } from './ExampleTheme';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { parseAllowedColor, parseAllowedFontSize } from './styleConfig';
import './styles.css';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { EditorState } from 'lexical';
import { useState, useCallback, useMemo } from 'react';
import debounce from 'lodash/debounce';
import LoadContentPlugin from './plugins/LoadContentPlugin';
import { Note } from '@/lib/noteManagement';
import { formatDate } from '@/utils/handleTime';

const placeholder = 'Enter some rich text...';

const removeStylesExportDOM = (
  editor: LexicalEditor,
  target: LexicalNode
): DOMExportOutput => {
  const output = target.exportDOM(editor);
  if (output && isHTMLElement(output.element)) {
    for (const el of [
      output.element,
      ...output.element.querySelectorAll('[style],[class]'),
    ]) {
      el.removeAttribute('class');
      el.removeAttribute('style');
    }
  }
  return output;
};

const exportMap: DOMExportOutputMap = new Map<
  Klass<LexicalNode>,
  (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput
>([
  [ParagraphNode, removeStylesExportDOM],
  [TextNode, removeStylesExportDOM],
]);

const getExtraStyles = (element: HTMLElement): string => {
  let extraStyles = '';
  const fontSize = parseAllowedFontSize(element.style.fontSize);
  const backgroundColor = parseAllowedColor(element.style.backgroundColor);
  const color = parseAllowedColor(element.style.color);
  if (fontSize !== '' && fontSize !== '15px') {
    extraStyles += `font-size: ${fontSize};`;
  }
  if (backgroundColor !== '' && backgroundColor !== 'rgb(255, 255, 255)') {
    extraStyles += `background-color: ${backgroundColor};`;
  }
  if (color !== '' && color !== 'rgb(0, 0, 0)') {
    extraStyles += `color: ${color};`;
  }
  return extraStyles;
};

const constructImportMap = (): DOMConversionMap => {
  const importMap: DOMConversionMap = {};

  for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
    importMap[tag] = (importNode) => {
      const importer = fn(importNode);
      if (!importer) {
        return null;
      }
      return {
        ...importer,
        conversion: (element) => {
          const output = importer.conversion(element);
          if (
            output === null ||
            output.forChild === undefined ||
            output.after !== undefined ||
            output.node !== null
          ) {
            return output;
          }
          const extraStyles = getExtraStyles(element);
          if (extraStyles) {
            const { forChild } = output;
            return {
              ...output,
              forChild: (child, parent) => {
                const textNode = forChild(child, parent);
                if ($isTextNode(textNode)) {
                  textNode.setStyle(textNode.getStyle() + extraStyles);
                }
                return textNode;
              },
            };
          }
          return output;
        },
      };
    };
  }

  return importMap;
};

export default function LexicalText({
  onUpdate,
  currContent,
  currNoteData,
}: Readonly<{
  onUpdate: (curr: object, currtitle: string) => void;
  currContent: string;
  currNoteData: Note;
}>) {
  const [currText, setCurrText] = useState<object | object>({});
  const [currTitle, setCurrTitle] = useState<string | string>(
    currNoteData.title
  );
  const editorConfig = {
    html: {
      export: exportMap,
      import: constructImportMap(),
    },
    namespace: 'React.js Demo',
    nodes: [
      ParagraphNode,
      TextNode,
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
    ],
    onError(error: Error) {
      throw error;
    },
    theme: theme,
    editorState: null,
  };

  const debouncedSave = useMemo(
    () =>
      debounce((json) => {
        setCurrText(json);
      }, 500),
    []
  );

  const onChange = useCallback(
    async (editorState: EditorState) => {
      const json = editorState;
      debouncedSave(json);
    },
    [debouncedSave]
  );

  const debouncedFilter = useMemo(
    () =>
      debounce((title: string) => {
        setCurrTitle(title);
      }, 300),
    []
  );

  const handleTitle = (value: string) => {
    debouncedFilter(value);
  };
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <ToolbarPlugin>
          <button
            className=" w-[88px] h-[34px] bg-[#00579A] rounded-[8px] shadow-[0px_1px_2px_0px_#0000000D] text-14-20-500 cursor-pointer"
            onClick={() => onUpdate(currText || {}, currTitle)}
          >
            Save
          </button>
        </ToolbarPlugin>
        <div className="editor-inner">
          <div className=" w-full flex-1 p-[24px]">
            <input
              type="text"
              value={currNoteData?.title}
              className=" w-full text-[14px] leading-[20px] font-bold shadow-[0px_1px_2px_0px_#0000000D]"
              onChange={(e) => handleTitle(e.target.value)}
            />
            <span className=" text-12-16-400">
              Last updated {formatDate(currNoteData?.createdAt)}
            </span>
          </div>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input"
                aria-placeholder={placeholder}
                placeholder={
                  <div className="editor-placeholder">{placeholder}</div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <OnChangePlugin onChange={onChange} />
          <ListPlugin />
          <AutoFocusPlugin />
          <LoadContentPlugin content={currContent} />

          {/* <TreeViewPlugin /> */}
        </div>
      </div>
    </LexicalComposer>
  );
}
