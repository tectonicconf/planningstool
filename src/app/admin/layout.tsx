import { AdminNav } from "@/components/admin/AdminNav";
import { AdminAutoRefresh } from "@/components/admin/AdminAutoRefresh";
import { CancellationsToggle } from "@/components/admin/CancellationsToggle";
import { getCancellationsEnabled } from "@/lib/appSettings";

// Without this, Next prerenders /admin and /admin/volunteers as static HTML
// at build time (neither route has params/cookies/headers to force dynamic
// rendering on its own), which would freeze the planning/volunteer data at
// whatever it was during `next build` instead of reading it live.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cancellationsEnabled = await getCancellationsEnabled();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminAutoRefresh />
      <AdminNav>
        <CancellationsToggle initialEnabled={cancellationsEnabled} />
      </AdminNav>
      {children}
    </div>
  );
}
