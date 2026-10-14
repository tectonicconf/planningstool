"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSavedToken, useSavedToken } from "@/lib/clientToken";

const NAV_LINKS = [
  {
    label: "Shifts",
    href: "/",
    isActive: (pathname: string) =>
      pathname === "/" || pathname.startsWith("/shift/"),
  },
  {
    label: "Onboarding",
    href: "/onboarding",
    isActive: (pathname: string) => pathname.startsWith("/onboarding"),
  },
  {
    label: "Academy",
    href: "/academy",
    isActive: (pathname: string) => pathname.startsWith("/academy"),
  },
  {
    label: "FAQ",
    href: "/faq",
    isActive: (pathname: string) => pathname.startsWith("/faq"),
  },
];

export function PortalNav() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const savedToken = useSavedToken();

  // Once a volunteer has a token — either in the URL or remembered on this
  // device — keep the Shifts tab pointing at their own schedule instead of
  // sending them back to the token entry form.
  const currentToken = pathname.startsWith("/shift/")
    ? decodeURIComponent(pathname.slice("/shift/".length))
    : savedToken;
  const shiftsHref = currentToken ? `/shift/${encodeURIComponent(currentToken)}` : "/";

  function handleLogout() {
    clearSavedToken();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-30 px-4 pt-3">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 rounded-full border border-white/25 bg-[#0D1341]/45 px-5 py-2 shadow-[0_9px_28px_-12px_rgba(4,16,72,0.8)] backdrop-blur-xl backdrop-saturate-150">
        {/* Dropped below the sm breakpoint so the tabs have room to breathe
            on phone-width screens instead of forcing a horizontal scroll. */}
        <Link href="/" className="hidden shrink-0 sm:block">
          <img src="/logo.png" alt="Tectonic" className="w-24" />
        </Link>
        <div className="flex min-w-0 items-center gap-3">
          <nav className="flex min-w-0 items-center gap-1 overflow-x-auto text-sm font-semibold text-white/70">
            {NAV_LINKS.map((link) => {
              const active = link.isActive(pathname);
              const href = link.label === "Shifts" ? shiftsHref : link.href;

              return (
                <Link
                  key={link.label}
                  href={href}
                  className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors ${
                    active
                      ? "bg-white/12 text-cyan-300"
                      : "hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          {savedToken && (
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="flex shrink-0 items-center justify-center rounded-full p-2 text-white/50 transition-colors hover:text-red-300"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
