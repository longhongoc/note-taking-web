'use client';
import {
  LuSettings,
  LuPlus,
  LuDot,
  LuFolder,
  LuSearch,
  LuLink,
  LuChevronDown,
  LuEllipsisVertical,
  LuTrash2,
} from 'react-icons/lu';
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
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { create_colors } from '@/utils/constant';
import { useEffect, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProject, getAllProjects } from '@/lib/projectManagement';
import { createNote, getNotes } from '@/lib/noteManagement';

// Use the Project type from projectManagement for consistency
import type { Project } from '@/lib/projectManagement';
import type { Note } from '@/lib/noteManagement';

export default function Home() {
  const [openProject, setOpenProject] = useState(false);
  const [openNote, setOpenNote] = useState(false);
  const [openResource, setOpenResource] = useState(false);

  const [projectLists, setProjectLists] = useState<Project[] | null>(null);
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const [noteLists, setNoteLists] = useState<Note[] | null>(null);
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  const formSchemaProject = z.object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(50, 'Title up to 50 characters'),
    color: z.string().nonempty('You must choose a color'),
  });

  const formSchemaNote = z.object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(50, 'Title up to 50 characters'),
  });

  const formProject = useForm<z.infer<typeof formSchemaProject>>({
    resolver: zodResolver(formSchemaProject),
    defaultValues: {
      title: '',
      color: '',
    },
  });

  const formNote = useForm<z.infer<typeof formSchemaNote>>({
    resolver: zodResolver(formSchemaNote),
    defaultValues: {
      title: '',
    },
  });

  useEffect(() => {
    getAllProjects().then((value) => setProjectLists(value));
  }, []);

  const onSubmitProject = async (values: z.infer<typeof formSchemaProject>) => {
    try {
      const id = await createProject(values.title, values.color);
      if (id) {
        const updated = await getAllProjects();
        setProjectLists(updated);
        setOpenProject(false);
      }
    } catch {
      console.log('Failed update data');
    }
  };

  const onSubmitNote = async (values: z.infer<typeof formSchemaNote>) => {
    try {
      if (!currentProject?.id) {
        throw new Error('No project selected');
      }
      const id = await createNote(currentProject.id, {
        title: values.title,
        content: '',
      });
      if (id) {
        const updatedProject = await getAllProjects();
        const updatedNote = await getNotes(currentProject.id)
        setProjectLists(updatedProject);
        setNoteLists(updatedNote)
        setOpenNote(false);
      }
    } catch {
      console.log('Failed update data');
    }
  };

  return (
    <div className=" font-inter w-sceen h-screen flex items-center justify-items-center">
      <main className=" w-full h-full flex ">
        <div className=" w-[320px] h-full bg-[#DEF6FF] flex flex-col border-r-[1px] border-[#ADD5E9]">
          <div className=" w-full h-[133px] p-[24px] border-b-[1px] border-[#ADD5E9]">
            <div className=" w-full h-fit flex justify-between items-center">
              <h1 className=" text-18-28-600">Notes</h1>
              <LuSettings className="  mr-[8px]" />
            </div>
            <Dialog open={openProject} onOpenChange={setOpenProject}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className=" w-[271px] h-[36px] bg-[#00579A] rounded-[8px] text-14-20-500 shadow-[0px_1px_2px_0px_#0000000D] mt-[18px]"
                >
                  <LuPlus /> New Project
                </Button>
              </DialogTrigger>
              <DialogContent className=" w-[448px] h-[372px] bg-[#ECFBFF] shadow-[0px_4px_6px_-4px_#0000001A] border-1px-BEDDED">
                <DialogHeader>
                  <DialogTitle className=" text-[18px] leading-[18px] font-semibold">
                    Create New Project
                  </DialogTitle>
                  <DialogDescription className=" text-14-20-400">
                    Add a new project to organize your notes and resources.
                  </DialogDescription>
                </DialogHeader>

                <Form {...formProject}>
                  <form
                    onSubmit={formProject.handleSubmit(onSubmitProject)}
                    className=" relative w-[398px] h-[260px] "
                  >
                    <div className=" w-full h-[90%] overflow-y-scroll hide-scrollbar">
                      <FormField
                        control={formProject.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className=" text-[14px] leading-[14px] font-medium ">
                              Project Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter project name..."
                                {...field}
                                className=" w-[398px] h-[36px] mt-[8px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formProject.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className=" text-[14px] leading-[14px] font-medium mt-[24px]">
                              Project Color
                            </FormLabel>
                            <FormControl>
                              <div className="grid grid-cols-5 gap-3">
                                {create_colors.map((res, index) => (
                                  <label key={index} className="cursor-pointer">
                                    <input
                                      type="radio"
                                      value={res}
                                      checked={field.value === res}
                                      onChange={() => field.onChange(res)}
                                      className="hidden peer"
                                    />
                                    <div
                                      className={cn(
                                        'w-[44px] h-[44px] rounded-[10px] border-2 peer-checked:border-[#000E1C]',
                                        res
                                      )}
                                    ></div>
                                  </label>
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter className=" sticky bottom-0 ">
                      <DialogClose asChild>
                        <Button
                          type="submit"
                          variant="outline"
                          className=" border-1px-BEDDED bg-[#ECFBFF]"
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        type="submit"
                        className=" bg-[#00579A] shadow-[0px_1px_2px_0px_#0000000D] opacity-[50%]"
                      >
                        Create Project
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <div className=" w-full flex flex-1 flex-col gap-[3px] px-[12px] py-[16px]">
            {!projectLists && (
              <div className=" w-full h-full flex flex-col items-center">
                <LuFolder className=" w-[48px] h-[48px] text-[#537789]" />
                <span className=" text-14-20-400">No project yet</span>
                <span className=" text-12-16-400">
                  Create your first project to get started
                </span>
              </div>
            )}
            {projectLists?.map((res, index) => (
              <div
                key={index}
                className={cn(
                  ' w-full h-[62px] flex p-[12px] items-center gap-[12px] rounded-[10px] cursor-pointer hover:border-2 hover:border-[#ADD5E9]',
                  { 'bg-[#B6E6FF]': activeProject === index }
                )}
                onClick={() => {
                  setActiveProject(index);
                  setCurrentProject(res);
                }}
              >
                <div
                  className={cn(` w-[12px] h-[12px] rounded-full ${res.color}`)}
                ></div>
                <section className=" w-[183px] h-[38px] flex flex-col gap-[3px]">
                  <h2 className=" !text-left text-14-20-500 !text-[#001A2C]">
                    {res.title}
                  </h2>
                  <p className=" !text-left text-12-16-400">
                    {res.noteCount} notes <LuDot className=" inline" />{' '}
                    {res.resourceCount} resources
                  </p>
                </section>
                <LuFolder className=" w-[16px] h-[16px] text-[#537789]" />
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        'w-[16px] h-[16px] text-[#537789] border-none bg-[#DEF6FF] cursor-pointer',
                        { 'bg-[#B6E6FF]': activeProject === index }
                      )}
                    >
                      <LuEllipsisVertical />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[150px] h-[42px]">
                    <button className="w-full h-full text-14-20-400 !text-[#E7000B] cursor-pointer">
                      <LuTrash2 className=" w-[16px] h-[16px] text-[#537789] inline" />{' '}
                      Delete Project
                    </button>
                  </PopoverContent>
                </Popover>
              </div>
            ))}
          </div>
          <div className=" w-[319px] h-[49px] flex justify-center items-center border-t-[1px] border-[#ADD5E9]">
            <p className=" text-12-16-400">
              1 projects <LuDot className=" inline" /> 0 total notes
            </p>
          </div>
        </div>
        <div className=" w-[320px] h-full flex flex-col bg-[#F5FDFF] border-1px-BEDDED">
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
            />
          </div>
          <div className=" w-[319px] h-[65px] border-1px-BEDDED flex justify-center items-center">
            <Dialog open={openNote} onOpenChange={setOpenNote}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className=" w-[287px] h-[32px] bg-[#00579A] rounded-[8px] text-14-20-500 shadow-[0px_1px_2px_0px_#0000000D]"
                >
                  <LuPlus /> New Note
                </Button>
              </DialogTrigger>
              <DialogContent className=" w-[448px] h-[172px] bg-[#ECFBFF] shadow-[0px_4px_6px_-4px_#0000001A] border-1px-BEDDED">
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
                    onSubmit={formNote.handleSubmit(onSubmitNote)}
                    className=" w-full h-[88px]"
                  >
                    <FormField
                      control={formNote.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Enter note titel..."
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
                        className=" bg-[#00579A] shadow-[0px_1px_2px_0px_#0000000D] opacity-[50%]"
                      >
                        Create Note
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <div className=" w-full flex flex-1 flex-col items-center p-[8px]">
            {noteLists?.map((res, index) => (

              <div key={index} className={cn(` w-[303px] h-[104px] rounded-[10px] p-[12px] cursor-pointer`, {"bg-[#A0E2FF]": activeNote === index})} >
              <div className=" w-[255px] h-full flex flex-col gap-[6px]">
                <h2 className=" text-14-20-500 !text-[#000E1C]">
                  Welcome to Notes
                </h2>
                <span className=" text-12-16-400">
                  This is your first note. Start writing your thoughts here!
                </span>
                <span className=" text-12-16-400">Sep 27, 10:25 AM</span>
              </div>
            </div>
            ))}
          </div>
          <div className=" w-[319px] h-[201px] border-t-[1px] border-[#BEDDED] p-[16px]">
            <div className=" w-[287px] h-[20px]">
              <LuLink className=" inline" /> <span>Resources</span>{' '}
              <LuChevronDown className="inline" />
            </div>
            <div className=" w-[287px] h-[32]"></div>
          </div>
        </div>
        <div className=" flex flex-1 justify-center flex-col items-center h-full bg-[#ECFBFF]">
          <span className=" text-[19px] leading-[28px] font-medium text-[#537789] align-middle text-center">
            No Note Selected
          </span>
          <span className=" text-[15px] leading-[24px] font-normal text-[#537789] align-middle text-center mt-[8px]">
            Select a note to start editing, or create a new one
          </span>
        </div>
      </main>
    </div>
  );
}
