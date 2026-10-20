"use client";

import { useState } from "react";
import { setCancellationsEnabled } from "@/lib/adminActions";

export function CancellationsToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [busy, setBusy] = useState(false);

  async function handleToggle() {
    const next = !enabled;
    setBusy(true);
    const result = await setCancellationsEnabled(next);
    setBusy(false);

    if (result.ok) {
      setEnabled(result.data.enabled);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={busy}
      title="Whether volunteers can cancel a shift they've already confirmed — declining a still-pending invite is never affected by this"
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
        enabled
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
      }`}
    >
      Confirmed-shift cancelling: {enabled ? "On" : "Off"}
    </button>
  );
}
