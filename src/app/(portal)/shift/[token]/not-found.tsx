import Link from "next/link";

export default function ShiftNotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050822] px-6 text-center font-sans text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 12% 95%, rgba(37,70,235,0.55), transparent 60%)," +
            "radial-gradient(ellipse 55% 45% at 90% 5%, rgba(45,90,235,0.4), transparent 60%)," +
            "linear-gradient(180deg, #060a2e 0%, #050818 55%, #04050f 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <p className="mb-4 font-mono text-sm tracking-[0.3em] text-blue-200/60">
          TECTONIC 2026
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Token not recognized
        </h1>
        <p className="mt-6 max-w-md text-lg text-blue-100/70">
          We couldn&apos;t find a volunteer schedule for that access token.
          Double-check it and try again, or contact the volunteer team.
        </p>

        <Link
          href="/"
          className="mt-10 flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 px-8 py-4 font-semibold text-white shadow-lg shadow-blue-900/40 transition-transform hover:brightness-110 active:scale-[0.99]"
        >
          <span aria-hidden="true">&larr;</span>
          Back to portal
        </Link>
      </div>
    </div>
  );
}
