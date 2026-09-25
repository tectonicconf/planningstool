import { AdminNav } from "@/components/admin/AdminNav";

// Without this, Next prerenders /admin and /admin/volunteers as static HTML
// at build time (neither route has params/cookies/headers to force dynamic
// rendering on its own), which would freeze the planning/volunteer data at
// whatever it was during `next build` instead of reading it live.
export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminNav />
      {children}
    </div>
  );
}
