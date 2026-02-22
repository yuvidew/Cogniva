import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";

async function fetchData() {
  // Simulate a fetch request
  return await prisma.user.findMany();
}

export default async function Home() {
  const data = await fetchData();

  return (
    <div className="flex min-h-screen items-center  flex-col gap-4 justify-center bg-zinc-50 font-sans dark:bg-black">
      {JSON.stringify(data)}
      <Button>
        Click me
      </Button>
    </div>
  );
}
