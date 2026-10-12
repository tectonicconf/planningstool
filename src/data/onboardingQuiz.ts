// Content for the mandatory onboarding flow shown before a volunteer can see
// their shifts for the first time (src/components/AcademyFlow.tsx).
// Edit the values below directly — no code changes needed elsewhere.
// Everything here is made-up placeholder copy: replace it with the real
// event facts and quiz before the event.

// The 3-step explainer card on the welcome screen.
export const HOW_IT_WORKS_STEPS: string[] = [
  "Read the onboarding info",
  "Take a short quiz to finish onboarding",
  "Your shifts unlock. Confirm them in the portal",
];

// The "Good to know" tips card on the welcome screen.
export const GOOD_TO_KNOW_ITEMS: string[] = [
  "A shift can be cancelled through the portal until the week of the event.",
  "Last-minute absence? Call us as soon as possible, so we can fill your shift.",
  "Onboarding info, Academy and FAQ remain available in your portal.",
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
