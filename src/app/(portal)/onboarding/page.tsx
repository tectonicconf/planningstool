import { ONBOARDING_SECTIONS } from "@/data/onboarding";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[#050822] px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Onboarding</h1>
        <p className="mt-2 text-blue-100/70">
          Everything you need to know before, during and after your shifts.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {ONBOARDING_SECTIONS.map((section) => (
            <div
              key={section.id}
              className="rounded-2xl border border-blue-400/20 bg-blue-950/20 p-4"
            >
              <p className="font-semibold">{section.title}</p>
              <p className="mt-1 text-sm text-blue-100/70">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
