import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LuPlus, LuLink, LuFolder } from 'react-icons/lu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CiShare1 } from 'react-icons/ci';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import {
  createResource,
  getResources,
  updateResource,
  deleteResource,
} from '@/lib/resourceManagement';
import { Resource } from '@/lib/resourceManagement';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import DeleteDialog from '../deleteDialog/DeleteDialog';

export default function ResourceComponent({
  currentProject,
  handleResourceChange,
}: {
  currentProject: string;
  handleResourceChange: (list: Resource[]) => void;
}) {
  const [resourceLists, setResourceLists] = useState<Resource[] | []>([]);
  const [openResource, setOpenResource] = useState(false);
  const [activeResource, setActiveResource] = useState<number | null>(null);
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [openResourceChange, setOpenResourceChange] = useState(false);

  const formSchemaResource = z.object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(50, 'Title up to 50 characters'),
    url: z.url(' Url is invalid'),
  });
  const formResource = useForm<z.infer<typeof formSchemaResource>>({
    resolver: zodResolver(formSchemaResource),
    defaultValues: {
      title: '',
      url: '',
    },
  });

  useEffect(() => {
    handleResourceChange(resourceLists);
  }, [resourceLists, handleResourceChange]);

  useEffect(() => {
    if (currentProject) {
      getResources(currentProject).then((res) => setResourceLists(res));
    } else return setResourceLists([]);
  }, [currentProject]);

  const onSubmitResource = async (
    values: z.infer<typeof formSchemaResource>
  ) => {
    try {
      if (!currentProject) {
        throw new Error('No project selected');
      }
      const id = await createResource(currentProject, {
        title: values.title,
        url: values.url,
      });
      if (id) {
        const updatedResource = await getResources(currentProject);
        setResourceLists(updatedResource);
        setOpenResource(false);
      }
    } catch {
      console.log('Failed update data');
    }
  };

  const onSubmitResourceChange = async (
    values: z.infer<typeof formSchemaResource>
  ) => {
    try {
      if (!currentProject) {
        throw new Error('No project selected');
      }
      await updateResource(
        currentProject,
        currentResource?.id || '',
        values.title,
        values.url
      ).then(async () => {
        const updatedResource = await getResources(currentProject || '');
        setResourceLists(updatedResource);
        setOpenResourceChange(false);
      });
    } catch (error: unknown) {
      console.log('Failed update data', error);
    }
  };

  const onDeleteResource = async () => {
    try {
      await deleteResource(
        currentProject || '',
        currentResource?.id || ''
      ).then(async () => {
        const updatedResource = await getResources(currentProject || '');
        setResourceLists(updatedResource);
        setOpenResourceChange(false);
      });
    } catch {
      console.log('Failed delete data');
    }
  };

  return (
    <>
      <div className=" w-[287px] h-[32px] mt-4">
        <Dialog open={openResource} onOpenChange={setOpenResource}>
          <DialogTrigger asChild>
            <button
              className=" w-[287px] h-[32px] rounded-[8px] text-14-20-500 !text-[#000E1C] shadow-[0px_1px_2px_0px_#0000000D] border-2 border-[#BEDDED]"
              disabled={currentProject ? false : true}
            >
              <LuPlus className=" inline" /> Add Resource
            </button>
          </DialogTrigger>
          <DialogContent className=" w-[448px] bg-[#ECFBFF] shadow-[0px_4px_6px_-4px_#0000001A] border-1px-BEDDED">
            <DialogHeader className=" w-[120px] h-[18px]">
              <DialogTitle className=" text-[18px] leading-[18px] font-semibold">
                Add Resource
              </DialogTitle>
            </DialogHeader>
            <Form {...formResource}>
              <form
                onSubmit={formResource.handleSubmit(onSubmitResource)}
                className=" w-full flex flex-col justify-between gap-4 hide-scrollbar"
              >
                <FormField
                  control={formResource.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter resource title..."
                          {...field}
                          className=" w-[398px] h-[36px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formResource.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com"
                          {...field}
                          className=" w-[398px] h-[36px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="mt-[5px]">
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
                    Add Resource
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className=" w-full h-[88px] flex flex-col gap-2 overflow-x-scroll hide-scrollbar mt-2">
        {resourceLists && resourceLists.length === 0 && (
          <div className=" w-full h-full flex flex-col justify-center items-center">
            <LuLink className=" w-[32px] h-[32px] text-[#537789]" />
            <span className=" text-12-16-400">No resources yet</span>
          </div>
        )}
        {resourceLists?.map((value, index) => (
          <div
            key={index}
            className={cn(
              ' w-full h-[24px] flex items-center gap-2 cursor-pointer hover:border-2 border-[#BEDDED] rounded-[8px]',
              { 'border-2 border-[#BEDDED]': activeResource === index }
            )}
            onClick={() => {
              setActiveResource(index);
              setCurrentResource(value);
            }}
          >
            <div className=" flex flex-1">
              <CiShare1 className=" w-[16px] h-[16px] inline" />
              <Link
                href={value.url ?? '#'}
                className=" !text-[#00579A] mr-[140px] text-14-20-500"
              >
                {value.title}
              </Link>
            </div>
            <Dialog
              open={activeResource === index && openResourceChange}
              onOpenChange={setOpenResourceChange}
            >
              <DialogTrigger asChild>
                <button className=" rounded-[8px] text-14-20-500 !text-[#000E1C] shadow-[0px_1px_2px_0px_#0000000D] cursor-pointer">
                  <LuFolder className=" w-[16px] h-[16px] text-[#537789]" />
                </button>
              </DialogTrigger>
              <DialogContent className=" w-[448px] bg-[#ECFBFF] shadow-[0px_4px_6px_-4px_#0000001A] border-1px-BEDDED">
                <DialogHeader className=" w-[120px] h-[18px]">
                  <DialogTitle className=" text-[18px] leading-[18px] font-semibold">
                    Add Resource
                  </DialogTitle>
                </DialogHeader>
                <Form {...formResource}>
                  <form
                    onSubmit={formResource.handleSubmit(onSubmitResourceChange)}
                    className=" w-full flex flex-col justify-between gap-4 hide-scrollbar"
                  >
                    <FormField
                      control={formResource.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter resource title..."
                              {...field}
                              className=" w-[398px] h-[36px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formResource.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com"
                              {...field}
                              className=" w-[398px] h-[36px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter className="mt-[5px]">
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
                        Change
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <DeleteDialog
              desb="Delete Resource"
              warning="Are you sure you want to delete this resource? This action cannot be undone and will permanently delete this resrouce."
              func={onDeleteResource}
            />
          </div>
        ))}
      </div>
    </>
  );
}
