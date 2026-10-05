import { ACADEMY_TERMS } from "@/data/academy";

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-[#050822] px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Startup 101</h1>
        <p className="mt-2 text-blue-100/70">
          New to the startup world? Here&apos;s a quick glossary of terms
          you&apos;ll hear a lot at Tectonic.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {ACADEMY_TERMS.map((item) => (
            <div
              key={item.term}
              className="rounded-2xl border border-blue-400/20 bg-blue-950/20 p-4"
            >
              <p className="font-semibold">{item.term}</p>
              <p className="mt-1 text-sm text-blue-100/70">
                {item.definition}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
