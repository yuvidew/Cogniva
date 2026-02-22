import { DashboardView } from "@/features/dashboard/_components/dashboard-view";
import { requireAuth } from "@/lib/auth-utils";



export default async function Home() {
  await requireAuth();
  return (
    <DashboardView/>
  );
}
