import Link from "next/link";

export default function ShiftNotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050A2B] px-6 text-center font-sans text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 12% 95%, rgba(17,65,233,0.55), transparent 60%)," +
            "radial-gradient(ellipse 55% 45% at 90% 5%, rgba(118,49,220,0.32), transparent 60%)," +
            "linear-gradient(180deg, #0D1341 0%, #050A2B 55%, #03061C 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">
          TECTONIC 2026
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Token not recognized
        </h1>
        <p className="mt-6 max-w-md text-lg text-white/70">
          We couldn&apos;t find a volunteer schedule for that access token.
          Double-check it and try again, or contact the volunteer team.
        </p>

        <Link
          href="/"
          className="mt-10 flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#2F5BFF] to-[#1137EA] border border-white/25 shadow-[0_0_28px_-8px_#1141E9] px-8 py-4 font-semibold text-white transition-transform hover:brightness-110 active:scale-[0.99]"
        >
          <span aria-hidden="true">&larr;</span>
          Back to portal
        </Link>
      </div>
    </div>
  );
}
