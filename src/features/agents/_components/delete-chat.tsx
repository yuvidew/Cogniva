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
import { Trash2 } from "lucide-react";
import { ReactNode, useState } from "react";
import { useDeleteChat } from "../hooks/use-agents";
import { Spinner } from "@/components/ui/spinner";
import { useParams } from "next/navigation";

/**
 * Props for the DeleteChat component.
 *
 * @param children - The trigger element that opens the confirmation dialog.
 *                   @example <Button variant="ghost"><Trash2 /></Button>
 *
 * @param title    - The display name of the chat shown inside the dialog heading.
 *                   @example "Xiaomi 14 Ultra Camera Features"
 *
 * @param chatId   - The unique Prisma ID of the chat to delete.
 *                   @example "cmmhf6qgw000atktnsbkvqzkl"
 */
interface DeleteChatProps {
    children: ReactNode,
    title: string,
    chatId: string,
}

/**
 * Renders a delete-confirmation AlertDialog for a chat conversation.
 *
 * Fetches the agent `id` from the URL params automatically and calls
 * the `agentById.deleteChat` tRPC mutation on confirmation.
 *
 * @param props - {@link DeleteChatProps}
 *
 * @example
 * ```tsx
 * <DeleteChat title={chat.title} chatId={chat.id}>
 *   <Button variant="ghost" size="icon">
 *     <Trash2 className="size-4" />
 *   </Button>
 * </DeleteChat>
 * ```
 */
export const DeleteChat = ({ children, title, chatId }: DeleteChatProps) => {
    const { id } = useParams<{ id: string }>();
    const { mutate, isPending } = useDeleteChat();
    const [open, setOpen] = useState(false);

    const handelDelete = () => {
        mutate({
            id,
            chatId
        }, {
            onSuccess: () => {
                setOpen(false);
            }
        });
    }

    return (
        <AlertDialog  open={open} >
            <AlertDialogTrigger asChild onClick={() => setOpen(true)}>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{title}"</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this chat? This action cannot be undone. All messages in this conversation will be permanently removed.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending} onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction disabled={isPending} variant={"destructive"} onClick={handelDelete}>
                        {isPending ? <>
                            <Spinner />
                            Deleting...
                        </> : <>
                            <Trash2 />

                            Yes Delete
                        </>}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
