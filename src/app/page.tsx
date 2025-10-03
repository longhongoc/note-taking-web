'use client';
import { LuSettings, LuPlus, LuDot, LuFolder } from 'react-icons/lu';
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
import { create_colors } from '@/utils/constant';
import { useState, useCallback } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import DeleteDialog from '@/components/deleteDialog/DeleteDialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createProject,
  deleteProject,
  getAllProjects,
  updateProject,
  listenTotalCounts,
  getProjectById,
} from '@/lib/projectManagement';

import NoteComponent from '@/components/noteComponent/NoteComponent';

import type { Project } from '@/lib/projectManagement';

export default function Home() {
  const [openProject, setOpenProject] = useState(false);
  const [openProjectChange, setOpenProjectChange] = useState(false);

  const [projectLists, setProjectLists] = useState<Project[] | null>(null);
  const [totalNoteAndResource, setTotalNoteAndResource] = useState({
    totalNotes: 0,
    totalResources: 0,
  });
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const formSchemaProject = z.object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(50, 'Title up to 50 characters'),
    color: z.string().nonempty('You must choose a color'),
  });

  const formProject = useForm<z.infer<typeof formSchemaProject>>({
    resolver: zodResolver(formSchemaProject),
    defaultValues: {
      title: '',
      color: '',
    },
    mode: 'onChange',
  });
  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = formProject;

  const getTotalData = useCallback(() => {
    getAllProjects().then((value) => {
      setProjectLists(value);
    });
    listenTotalCounts((value) => setTotalNoteAndResource(value));
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

  const onSubmitProjectChange = async (
    values: z.infer<typeof formSchemaProject>
  ) => {
    try {
      await updateProject(
        currentProject?.id || '',
        values.title,
        values.color
      ).then(async () => {
        getTotalData();
        await getProjectById(currentProject?.id || '').then((res) =>
          setCurrentProject(res)
        );
        setOpenProjectChange(false);
      });
    } catch (error: unknown) {
      console.log('Failed update data', error);
    }
  };

  const onDeleteProject = async () => {
    try {
      await deleteProject(currentProject?.id || '').then(async () => {
        getTotalData();
        setCurrentProject(null);
        setOpenProject(false);
        setActiveProject(null);
      });
    } catch (error: unknown) {
      console.log('Failed update data', error);
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
                <button className=" w-[271px] h-[36px] bg-[#00579A] rounded-[8px] text-14-20-500 shadow-[0px_1px_2px_0px_#0000000D] mt-[18px] cursor-pointer hover:border-2 hover:border-[#ADD5E9]">
                  <LuPlus className=" inline" /> New Project
                </button>
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
                    onSubmit={handleSubmit(onSubmitProject)}
                    className=" relative w-[398px] h-[260px] "
                  >
                    <div className=" w-full h-[90%] overflow-y-scroll hide-scrollbar">
                      <FormField
                        control={control}
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
                        control={control}
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
                        className={cn(
                          ' bg-[#00579A] shadow-[0px_1px_2px_0px_#0000000D] cursor-pointer',
                          { 'opacity-50': !isValid }
                        )}
                        disabled={!isValid}
                      >
                        Create Project
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <div className=" w-full flex flex-1 flex-col gap-[3px] px-[12px] py-[16px] overflow-x-scroll hide-scrollbar">
            {!!projectLists && projectLists.length === 0 && (
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
                <Dialog
                  open={activeProject === index && openProjectChange}
                  onOpenChange={setOpenProjectChange}
                >
                  <DialogTrigger asChild>
                    <button className=" w-[16px] h-[16px] rounded-[8px] text-14-20-500 shadow-[0px_1px_2px_0px_#0000000D] cursor-pointer ">
                      <LuFolder className=" w-[16px] h-[16px] text-[#537789]" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className=" w-[448px] bg-[#ECFBFF] shadow-[0px_4px_6px_-4px_#0000001A] border-1px-BEDDED">
                    <DialogHeader>
                      <DialogTitle className=" text-[18px] leading-[18px] font-semibold">
                        Change project title
                      </DialogTitle>
                      <DialogDescription className=" text-14-20-400">
                        Add a new title to your project
                      </DialogDescription>
                    </DialogHeader>

                    <Form {...formProject}>
                      <form
                        onSubmit={handleSubmit(onSubmitProjectChange)}
                        className=" w-[398px]"
                      >
                        <div className=" w-full overflow-y-scroll hide-scrollbar">
                          <FormField
                            control={control}
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
                            control={control}
                            name="color"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className=" text-[14px] leading-[14px] font-medium mt-[24px]">
                                  Project Color
                                </FormLabel>
                                <FormControl>
                                  <div className="grid grid-cols-5 gap-3">
                                    {create_colors.map((res, index) => (
                                      <label
                                        key={index}
                                        className="cursor-pointer"
                                      >
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
                        <DialogFooter className="  ">
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
                            className={cn(
                              ' bg-[#00579A] shadow-[0px_1px_2px_0px_#0000000D]',
                              { 'opacity-[50%]': !isValid }
                            )}
                            disabled={!isValid}
                          >
                            Change
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                <DeleteDialog
                  desb="Delete Project"
                  warning="Are you sure you want to delete this project? This action cannot be undone and will permanently delete all notes and resources in this project."
                  func={onDeleteProject}
                />
              </div>
            ))}
          </div>
          <div className=" w-[319px] h-[49px] flex justify-center items-center border-t-[1px] border-[#ADD5E9]">
            <p className=" text-12-16-400">
              {totalNoteAndResource.totalNotes} notes{' '}
              <LuDot className=" inline" />{' '}
              {totalNoteAndResource.totalResources} resources
            </p>
          </div>
        </div>
        <NoteComponent
          currentProject={currentProject}
          handleReload={getTotalData}
        />
      </main>
    </div>
  );
}
