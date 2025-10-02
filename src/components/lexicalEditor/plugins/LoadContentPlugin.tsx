import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export default function LoadContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (content) {
      const editorState = editor.parseEditorState(content);
      editor.setEditorState(editorState);
    } else {
      const emptyData = editor.parseEditorState(
        '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Enter something......","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":null,"format":"","indent":0,"type":"root","version":1}}'
      );
      editor.setEditorState(emptyData);
    }
  }, [content, editor]);

  return null;
}
