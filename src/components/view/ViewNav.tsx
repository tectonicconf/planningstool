"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/view", label: "Planning" },
  { href: "/view/timeline", label: "Timeline" },
  { href: "/view/volunteers", label: "Volunteers" },
];

export function ViewNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 border-b border-slate-200 bg-white px-6 py-3">
      {LINKS.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-indigo-100 text-indigo-700"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
        View only
      </span>
    </nav>
  );
}
