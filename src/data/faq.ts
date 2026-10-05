// Content for the volunteer-facing FAQ page (src/app/(portal)/faq/page.tsx).
// Edit the questions/answers below directly — no code changes needed elsewhere.
// Everything here is placeholder copy: replace it with the real answers
// before the event.

export type FaqCategory = "on-the-day" | "shifts" | "contact";

export const FAQ_CATEGORIES: { id: FaqCategory; label: string }[] = [
  { id: "on-the-day", label: "On the day" },
  { id: "shifts", label: "Shifts" },
  { id: "contact", label: "Contact" },
];

export type FaqItem = {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "check-in",
    category: "on-the-day",
    question: "Where do I check in for my shift?",
    answer: "[Placeholder — add the real check-in location and process here.]",
  },
  {
    id: "what-to-bring",
    category: "on-the-day",
    question: "What should I wear or bring?",
    answer: "[Placeholder — add the real dress code and what to bring here.]",
  },
  {
    id: "running-late",
    category: "contact",
    question: "Who do I contact if I'm running late?",
    answer: "[Placeholder — add the real contact name/channel here.]",
  },
  {
    id: "food",
    category: "shifts",
    question: "Is food provided during shifts?",
    answer: "[Placeholder — add the real food/drinks policy here.]",
  },
];
