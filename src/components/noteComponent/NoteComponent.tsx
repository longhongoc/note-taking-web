import { LuPlus, LuFolder, LuSearch } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import DeleteDialog from '@/components/deleteDialog/DeleteDialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatDate } from '@/utils/handleTime';
import { getNote, Note } from '@/lib/noteManagement';
import { Project } from '@/lib/projectManagement';
import { extractPlainText } from '../lexicalEditor/PlainText';
import {
  getNotes,
  createNote,
  deleteNote,
  updateNote,
} from '@/lib/noteManagement';
import debounce from 'lodash/debounce';
import ResourceComponent from '../resourceComponent/ResourceComponent';
import EditorNoteComponent from './EditorNoteComponent';

export default function NoteComponent({
  currentProject,
  handleReload,
}: {
  currentProject: Project | null;
  handleReload: () => void;
}) {
  const [openNote, setOpenNote] = useState(false);
  const [noteLists, setNoteLists] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [filteredNotes, setFilteredNotes] = useState<Note[] | []>([]);

  const formSchemaNote = z.object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(50, 'Title up to 50 characters'),
  });

  const formNote = useForm<z.infer<typeof formSchemaNote>>({
    resolver: zodResolver(formSchemaNote),
    defaultValues: {
      title: '',
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = formNote;

  useEffect(() => {
    handleReload();
  }, [noteLists, handleReload]);

  const handleReloadData = useCallback(async () => {
    if (currentProject?.id) {
      await getNotes(currentProject?.id).then((res) => {
        setNoteLists(res);
        setFilteredNotes(res);
      });
    } else {
      setNoteLists([]);
      setFilteredNotes([]);
      setCurrentNote(null);
    }
  }, [currentProject?.id]);

  useEffect(() => {
    handleReloadData();
  }, [currentProject, handleReloadData]);

  const onSubmitNote = async (values: z.infer<typeof formSchemaNote>) => {
    try {
      if (!currentProject?.id) {
        throw new Error('No project selected');
      }
      const id = await createNote(currentProject?.id, {
        title: values.title,
        content: '',
      });
      if (id) {
        handleReloadData();
        setOpenNote(false);
      }
    } catch (error: unknown) {
      console.log('Failed update data', error);
    }
  };

  const onDeleteNote = async () => {
    try {
      if (currentProject?.id && currentNote?.id) {
        await deleteNote(currentProject.id, currentNote?.id).then(async () => {
          handleReloadData();
          setCurrentNote(null);
          setActiveNote(null);
        });
      }
    } catch (error: unknown) {
      console.log('Failed delete data', error);
    }
  };

  const debouncedFilter = useMemo(
    () =>
      debounce((query: string, list: Note[]) => {
        const filtered = list.filter((note) =>
          note.title?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredNotes(filtered);
      }, 300),
    []
  );

  const handleSearch = (value: string) => {
    debouncedFilter(value, noteLists || []);
  };

  const onUpdateContent = async (values: object, title: string) => {
    try {
      if (!currentProject?.id && !currentNote?.id) {
        throw new Error('No project selected');
      }
      if (currentProject?.id && currentNote?.id) {
        await updateNote(
          currentProject.id,
          currentNote?.id,
          title,
          JSON.stringify(values)
        ).then(async () => {
          handleReloadData();
          await getNote(currentProject.id, currentNote.id || '').then((res) =>
            setCurrentNote(res)
          );
          alert('Save data successfully');
        });
      }
    } catch (error: unknown) {
      console.log('Failed update data', error);
    }
  };

  return (
    <>
      <div className=" w-[320px] h-full flex flex-col bg-[#F5FDFF] border-r-2 border-[#BEDDED]">
        <div className=" w-[319px] h-[113px] border-1px-BEDDED px-[16px] py-[16px]">
          <section className=" flex items-center gap-[12px]">
            <div
              className={cn(
                ` w-[16px] h-[16px] rounded-full ${currentProject?.color}`
              )}
            ></div>
            <h1 className=" text-18-28-600">{currentProject?.title}</h1>
          </section>
          <Input
            type="text"
            placeholder="Search notes..."
            className=" gap-[13px] mt-[16px]"
            icon={<LuSearch />}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className=" w-[319px] h-[65px] border-1px-BEDDED flex justify-center items-center">
          <Dialog open={openNote} onOpenChange={setOpenNote}>
            <DialogTrigger asChild>
              <button
                className={cn(
                  ' w-[287px] h-[32px] bg-[#00579A] rounded-[8px] text-14-20-500 shadow-[0px_1px_2px_0px_#0000000D] cursor-pointer hover:border-2 hover:border-[#ADD5E9]',
                  { 'opacity-50 border-none': !currentProject }
                )}
                disabled={!currentProject}
              >
                <LuPlus className=" inline" /> New Note
              </button>
            </DialogTrigger>
            <DialogContent className=" w-[448px] bg-[#ECFBFF] shadow-[0px_4px_6px_-4px_#0000001A] border-1px-BEDDED">
              <DialogHeader>
                <DialogTitle className=" text-[18px] leading-[18px] font-semibold">
                  Create New Note
                </DialogTitle>
                <DialogDescription className=" text-14-20-400">
                  Add a new note to the project.
                </DialogDescription>
              </DialogHeader>
              <Form {...formNote}>
                <form
                  onSubmit={handleSubmit(onSubmitNote)}
                  className=" w-full h-[88px]"
                >
                  <FormField
                    control={control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Enter note title..."
                            {...field}
                            className=" w-[398px] h-[36px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className=" mt-[5px]">
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        className=" border-1px-BEDDED bg-[#ECFBFF]"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      className={cn(
                        ' bg-[#00579A] shadow-[0px_1px_2px_0px_#0000000D]',
                        { 'opacity-[50%]': !isValid }
                      )}
                      disabled={!isValid}
                    >
                      Create Note
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <div className=" w-full flex flex-1 flex-col items-center p-2 gap-1 overflow-x-scroll hide-scrollbar">
          {filteredNotes && filteredNotes.length === 0 && (
            <div className=" w-full h-full flex flex-col items-center">
              <LuFolder className=" w-[48px] h-[48px] text-[#537789]" />
              <span className=" text-14-20-400">No notes yet</span>
              <span className=" text-12-16-400">
                Create your first note to get started
              </span>
            </div>
          )}
          {filteredNotes?.map((res, index) => (
            <div
              key={index}
              className={cn(
                ` w-[303px] min-h-[90px] rounded-[10px] p-2 cursor-pointer hover:border-2 hover:border-[#BEDDED]`,
                { 'bg-[#A0E2FF]': activeNote === index }
              )}
              onClick={() => {
                setActiveNote(index);
                setCurrentNote(res);
              }}
            >
              <div className=" w-full h-full flex flex-col gap-[6px]">
                <div className=" w-full flex justify-between">
                  <h2 className=" text-14-20-500 !text-[#000E1C]">
                    {res?.title}
                  </h2>
                  <DeleteDialog
                    desb="Delete Note"
                    warning="Are you sure you want to delete this note? This action cannot be undone and will permanently delete this note."
                    func={onDeleteNote}
                  />
                </div>
                <span className=" text-12-16-400 ">
                  {extractPlainText(res?.content)}
                </span>
                <span className=" text-12-16-400">
                  {formatDate(res.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <ResourceComponent
          currentProject={currentProject?.id || ''}
          handleResourceChange={handleReload}
        />
      </div>
      <div className=" flex flex-1 h-full bg-[#ECFBFF]">
        <EditorNoteComponent
          onUpdateContent={onUpdateContent}
          currentNote={currentNote}
        />
      </div>
    </>
  );
}
