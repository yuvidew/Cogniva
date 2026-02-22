import { requireAuth } from "@/lib/auth-utils";



export default async function Home() {
  await requireAuth();
  return (
    <div className="flex min-h-screen items-center  flex-col gap-4 justify-center bg-zinc-50 font-sans dark:bg-black">

      <h1 className="text-4xl font-bold">Welcome to Cogniva</h1>

    </div>
  );
}
