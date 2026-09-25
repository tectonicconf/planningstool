"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { getVolunteerByToken } from "@/lib/volunteers";

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [checking, setChecking] = useState(false);
  const [invalid, setInvalid] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) return;

    setChecking(true);
    setInvalid(false);

    const volunteer = await getVolunteerByToken(trimmed);

    if (!volunteer) {
      setChecking(false);
      setInvalid(true);
      return;
    }

    router.push(`/shift/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#050822] font-sans text-white">
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 12% 95%, rgba(37,70,235,0.55), transparent 60%)," +
            "radial-gradient(ellipse 55% 45% at 90% 5%, rgba(45,90,235,0.4), transparent 60%)," +
            "linear-gradient(180deg, #060a2e 0%, #050818 55%, #04050f 100%)",
        }}
      />

      {/* decorative curved plate lines */}
      <div className="pointer-events-none absolute -left-56 -top-56 h-[560px] w-[560px] rotate-12 rounded-full border-t-2 border-blue-400/25" />
      <div className="pointer-events-none absolute -right-64 top-1/3 h-[620px] w-[620px] -rotate-12 rounded-full border-l-2 border-blue-400/20" />
      <div className="pointer-events-none absolute -bottom-72 -left-24 h-[520px] w-[700px] rounded-full border-t-2 border-blue-400/20" />

      {/* header */}
      <header className="relative z-10 flex items-start justify-between px-8 pt-8 sm:px-14 sm:pt-10">
        <div className="text-2xl font-bold tracking-tight">
          <img src="/logo.png" alt="Tectonic" className="w-32"/>
        </div>
        <div className="text-right font-mono text-xs tracking-widest text-blue-100/80">
          <div className="flex items-center justify-end gap-2">
            <span>OCTOBER 21 2026</span>
          </div>
          <div className="mt-1">GHENT, BELGIUM</div>
        </div>
      </header>

      {/* main */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="mb-4 font-mono text-sm tracking-[0.3em] text-blue-200/60">
          TECTONIC 2026
        </p>

        <h1 className="text-6xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl">
          <span className="text-white">Volunteer</span>
          <br />
          <span className="text-cyan-300">Portal</span>
        </h1>

        <p className="mt-6 max-w-md text-lg text-blue-100/70">
          Access your personal volunteer schedule and be part of what&apos;s
          next.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 flex w-full max-w-md flex-col gap-4"
        >
          <div className="relative">
            <input
              type="text"
              value={token}
              onChange={(event) => {
                setToken(event.target.value);
                setInvalid(false);
              }}
              placeholder="Enter your unique access token"
              onAnimationEnd={() => setInvalid(false)}
              className={`w-full rounded-full border py-4 px-12 text-center font-mono text-sm text-white placeholder:text-blue-200/40 outline-none transition-colors ${
                invalid
                  ? "animate-shake border-red-400/70 bg-red-950/20"
                  : "border-blue-400/40 bg-blue-950/30 focus:border-blue-300/70"
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={checking}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 py-4 font-semibold text-white shadow-lg shadow-blue-900/40 transition-transform hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
          >
            {checking ? "Checking..." : "Continue"}
            <span aria-hidden="true">&rarr;</span>
          </button>
        </form>

        <p className="mt-8 text-sm text-blue-100/60">
          Can&apos;t find your code?
          <br />
          Check your email or contact the volunteer team.
        </p>
      </main>

    </div>
  );
}
