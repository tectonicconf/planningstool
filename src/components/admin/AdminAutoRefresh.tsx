"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const REFRESH_INTERVAL_MS = 20_000;

// Admin pages fetch their data once per request (Server Components) — a
// change made elsewhere (another admin tab, another device, or a volunteer
// accepting/declining/cancelling their own shift from the portal) never
// reaches an already-open admin page until it's manually reloaded.
// router.refresh() re-runs the server components for the current route and
// streams in fresh props without losing client-side state (scroll position,
// open filters, in-progress edits) — each board resyncs its own local state
// from those refreshed props (see the `useEffect` next to each board's
// `useState(initial...)`).
export function AdminAutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [router]);

  return null;
}
