"use client"

import { Button } from "@/components/ui/button"
import { useStartVideoProcessing } from "../hooks/use-agents"

export const VideosSection = () => {
    const { mutate , isPending} = useStartVideoProcessing()
    return (
        <Button onClick={() => mutate()} disabled={isPending}>
            {isPending ? "Processing..." : "Process"}
        </Button> 
    )
}
