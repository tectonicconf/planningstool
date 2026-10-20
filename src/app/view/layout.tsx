import { ViewNav } from "@/components/view/ViewNav";
import { AdminAutoRefresh } from "@/components/admin/AdminAutoRefresh";

// Same reasoning as src/app/admin/layout.tsx: without this, Next would
// prerender these pages as static HTML at build time and freeze the data.
export const dynamic = "force-dynamic";

export default function ViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* These pages are meant to be left open on a shared screen, so a
          periodic auto-refresh matters even more here than in /admin. */}
      <AdminAutoRefresh />
      <ViewNav />
      {children}
    </div>
  );
}
