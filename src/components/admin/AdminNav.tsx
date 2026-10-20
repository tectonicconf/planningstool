"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Planning" },
  { href: "/admin/shifts", label: "Shifts", icon: "pencil" as const },
  { href: "/admin/timeline", label: "Timeline" },
  { href: "/admin/templates", label: "Templates" },
  { href: "/admin/volunteers", label: "Volunteers" },
  { href: "/admin/activity", label: "Activity" },
  { href: "/admin/mail", label: "Mail" },
  { href: "/admin/checkin", label: "Check-in" },
];

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

export function AdminNav({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-6 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {LINKS.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {link.label}
              {link.icon === "pencil" && <PencilIcon />}
            </Link>
          );
        })}
      </div>
      {children}
    </nav>
  );
}
