import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';

function traverse(node: SerializedLexicalNode): string {
  if ('text' in node && typeof node.text === 'string') {
    return node.text;
  }
  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map(traverse).join(', ');
  }
  return '';
}

export function extractPlainText(content: string | null | undefined): string {
  if (!content || content.trim() === '') {
    return '';
  }

  try {
    const json: SerializedEditorState<SerializedLexicalNode> =
      JSON.parse(content);
    return traverse(json.root);
  } catch (error) {
    console.error('extractPlainText parse error:', error, 'content:', content);
    return content;
  }
}
