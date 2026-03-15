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
} from "@/components/ui/alert-dialog"
import { Trash2Icon } from "lucide-react";
import { ReactNode, useState } from "react";
import { useDeleteAgent } from "../hooks/use-agents";
import { Spinner } from "@/components/ui/spinner";


interface DeleteAgentProps {
    id: string;
    agent_name: string;
    conversation_count?: number;
    file_upload_count?: number;
    children: ReactNode;
}

export const DeleteAgent = ({ id, agent_name, children , conversation_count, file_upload_count }: DeleteAgentProps) => {
    const { mutate : onDelete , isPending} = useDeleteAgent();

    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = () => {
        onDelete({ id }, {
            onSuccess: () => {
                setIsOpen(false);
            }
        });
    };

    return (
        <AlertDialog open={isOpen} >
            <AlertDialogTrigger asChild onClick={() => setIsOpen(true)}>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete {agent_name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently remove the agent, all {conversation_count} conversations, and {file_upload_count} uploaded files. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsOpen(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant={"destructive"} onClick={handleDelete}>
                        {isPending ? <> <Spinner /> Deleting... </> : <> <Trash2Icon /> Yes Delete</>}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
