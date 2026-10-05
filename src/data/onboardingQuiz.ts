// Content for the mandatory onboarding flow shown before a volunteer can see
// their shifts for the first time (src/components/AcademyFlow.tsx).
// Edit the values below directly — no code changes needed elsewhere.
// Everything here is made-up placeholder copy: replace it with the real
// event facts and quiz before the event.

export type EventFact = {
  icon: "calendar" | "location" | "person";
  title: string;
  subtitle: string;
};

export const EVENT_FACTS: EventFact[] = [
  {
    icon: "calendar",
    title: "21–22 October 2026",
    subtitle: "Ghent, Belgium",
  },
  {
    icon: "location",
    title: "3 venues",
    subtitle: "Wintercircus, Vooruit, De Kreun",
  },
  {
    icon: "person",
    title: "Your team lead",
    subtitle: "Your on-site contact for questions",
  },
];

export const ONBOARDING_INFO_PARAGRAPHS: string[] = [
  "Tectonic brings together founders, investors and the wider startup ecosystem for three days in Ghent.",
  "As a volunteer, you'll help things run smoothly across our venues — from welcoming guests to supporting speakers and sessions.",
  "This short quiz just confirms you've got the essentials before your first shift.",
];

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
};

// A volunteer needs at least this many correct (out of QUIZ_QUESTIONS.length)
// to pass. Failing lets them retake immediately, with no cooldown.
export const QUIZ_MIN_CORRECT = 4;

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "check-in",
    question: "Where should you check in on your first shift?",
    options: [
      "Main entrance info desk",
      "Directly at your stage",
      "Ask on the volunteer Slack",
    ],
    correctIndex: 0,
  },
  {
    id: "booths",
    question: "How do I interact with startup booths?",
    options: [
      "I can show my interest but won't break up conversations",
      "I go talk to them and ask about internships or job opportunities",
      "I give them my printed-out CV",
    ],
    correctIndex: 0,
  },
  {
    id: "late",
    question: "Who do you contact if you're running late?",
    options: [
      "Message your team lead on the volunteer Slack",
      "Wait until you arrive to explain",
      "Ask another volunteer to quietly cover for you",
    ],
    correctIndex: 0,
  },
  {
    id: "lost-found",
    question: "What do you do with a lost & found item?",
    options: [
      "Bring it to the info desk at Wintercircus",
      "Keep it until someone asks about it",
      "Post about it on social media",
    ],
    correctIndex: 0,
  },
  {
    id: "dress-code",
    question: "What should you wear during your shift?",
    options: [
      "Comfortable clothing and your volunteer badge",
      "Business formal attire",
      "Whatever you like — there's no guideline",
    ],
    correctIndex: 0,
  },
];
