import { Dashboard } from "@/components/dashboard/dashboard";
import { getDashboardData, serializeDashboard } from "@/lib/habit-service";

export const dynamic = "force-dynamic";

export default async function Home() {
  const dashboard = await getDashboardData();
  const initialData = serializeDashboard(dashboard);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4 py-12 font-sans text-slate-900 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-12">
        <Dashboard initialData={initialData} />
      </div>
    </main>
  );
}
