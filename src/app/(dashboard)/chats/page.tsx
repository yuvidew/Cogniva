"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

const ChatsPage = () => {
    const trpc = useTRPC();
    const [prompt , setPrompt] = useState("");
    const [msg, setMsg] = useState("");
    const {mutate, isPending} = useMutation(trpc.dashboard.textAi.mutationOptions({
        onSuccess: (data) => {
            setMsg(data.result);
        }
    }))
    return (
        <main className=" flex items-start gap-3">
            <div className="flex flex-col gap-3 flex-1">
                <Label className=" text-lg">
                    Enter your message:
                </Label>
                <Textarea className=" h-52 resize-none" value={prompt} onChange={(e) => setPrompt(e.target.value)} />

                <Button className=" self-end mt-2" onClick={() => mutate({ prompt })} disabled={isPending}>
                    Send
                </Button>
            </div>

            <div className="w-[40%]">
                {msg && (
                    <div className="p-4 border rounded-md">
                        <Label className=" text-lg mb-2">AI Response:</Label>
                        <p>{msg}</p>
                    </div>
                )}
            </div>
        </main>
    )
}

export default ChatsPage