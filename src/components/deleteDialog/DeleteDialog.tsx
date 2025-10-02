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
import { LuTrash2 } from 'react-icons/lu';

type DeleteButton = {
  desb: string;
  warning: string;
  func: () => void;
};

export default function DeleteDialog({ desb, warning, func }: DeleteButton) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="text-14-20-400 !text-[#E7000B] cursor-pointer">
          <LuTrash2 className=" w-[16px] h-[16px] text-[#537789] inline" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{desb}</AlertDialogTitle>
          <AlertDialogDescription>{warning}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => func()}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
