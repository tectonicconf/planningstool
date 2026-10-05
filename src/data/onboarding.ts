// Content for the volunteer-facing Onboarding page (src/app/(portal)/onboarding/page.tsx).
// Edit the sections below directly — no code changes needed elsewhere.
// Everything here is placeholder copy: replace it with the real onboarding
// info before the event.

export type OnboardingSection = {
  id: string;
  title: string;
  body: string;
};

export const ONBOARDING_SECTIONS: OnboardingSection[] = [
  {
    id: "before",
    title: "Before the event",
    body: "[Placeholder — add what volunteers should do before Tectonic, e.g. confirm shifts, join the volunteer group chat.]",
  },
  {
    id: "arrival",
    title: "On arrival",
    body: "[Placeholder — add check-in instructions for the day of the event.]",
  },
  {
    id: "during-shift",
    title: "During your shift",
    body: "[Placeholder — add expectations and guidelines for volunteers while on shift.]",
  },
  {
    id: "contacts",
    title: "Who to contact",
    body: "[Placeholder — add the key contacts volunteers should reach out to during the event.]",
  },
];
