"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";



export default function Home() {
  const trpc = useTRPC();

  const { data } = useQuery(trpc.getUsers.queryOptions());

  return (
    <div className="flex min-h-screen items-center  flex-col gap-4 justify-center bg-zinc-50 font-sans dark:bg-black">
      {JSON.stringify(data)}
      <Button>
        Click me
      </Button>
    </div>
  );
}
