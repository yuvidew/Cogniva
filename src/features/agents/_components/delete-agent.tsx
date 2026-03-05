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
import { ReactNode } from "react";


interface DeleteAgentProps {
    agent_name: string;
    conversation_count?: number;
    file_upload_count?: number;
    children: ReactNode;
}

export const DeleteAgent = ({ agent_name, children , conversation_count, file_upload_count }: DeleteAgentProps) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
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
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant={"destructive"}>
                        <Trash2Icon/> Yes Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
