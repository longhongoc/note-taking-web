import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { LuTrash2, LuEllipsisVertical } from 'react-icons/lu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type DeleteButton = {
  desb: string;
  warning: string;
  func: () => void;
};

export default function DeleteDialog({ desb, warning, func }: DeleteButton) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-14-20-400 !text-[#E7000B] cursor-pointer">
          <LuEllipsisVertical className=" w-[16px] h-[16px] text-[#537789] inline" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[150px] h-[42px]">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="text-14-20-400 !text-[#E7000B] cursor-pointer w-full h-full flex justify-around items-center">
              <LuTrash2 className=" w-[16px] h-[16px] text-[#537789] inline" />{' '}
              {desb}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{desb}</AlertDialogTitle>
              <AlertDialogDescription>{warning}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => func()}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PopoverContent>
    </Popover>
  );
}
