import LexicalText from '../lexicalEditor/LexicalEditor';
import { Note } from '@/lib/noteManagement';

export default function EditorNoteComponent({
  onUpdateContent,
  currentNote,
}: {
  currentNote: Note | null;
  onUpdateContent: (values: object, title: string) => void;
}) {
  return (
    <>
      {currentNote && (
        <LexicalText
          onUpdate={onUpdateContent}
          currContent={currentNote?.content || ''}
          currNoteData={currentNote!}
        />
      )}
      {!currentNote && (
        <div className=" w-full h-auto flex flex-col justify-center items-center">
          <span className=" text-[19px] leading-7 font-medium text-[#537789]">
            No Note Selected
          </span>
          <span className=" text-[16px] leading-6 font-normal text-[#537789]">
            Select a note to start editing, or create a new one
          </span>
        </div>
      )}
    </>
  );
}
