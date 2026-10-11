"use client";

import { useSavedToken } from "@/lib/clientToken";
import { RichText } from "@/components/RichText";

// The shared volunteer number is only shown to volunteers who opened their
// personal link on this device, so it isn't visible to everyone who happens to
// find this page. During local development it is always shown so the page can
// be reviewed without a personal link.
export function ContactNumber({ number }: { number: string }) {
  const savedToken = useSavedToken();
  const visible = Boolean(savedToken) || process.env.NODE_ENV !== "production";

  if (!visible) {
    return (
      <span className="text-base font-medium text-white/70">
        Open your personal link to see the shared number.
      </span>
    );
  }

  if (number.startsWith("[")) {
    return (
      <span className="rounded-md border border-dashed border-amber-300/50 bg-amber-300/10 px-1.5 py-0.5 text-amber-200">
        {number}
      </span>
    );
  }

  return (
    <a href={`tel:${number.replace(/\s+/g, "")}`} className="text-cyan-200 hover:text-cyan-100">
      <RichText>{number}</RichText>
    </a>
  );
}
