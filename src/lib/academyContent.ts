/**
 * Content for the Tectonic Academy onboarding flow (Guide + Quick check).
 * Guide copy is taken from the Academy concept doc (Tectonic Guide subpage).
 * Event facts (dates/locations) reflect the latest info shared for onboarding.
 */

export type EventInfoItem = {
  icon: "calendar" | "pin" | "person";
  label: string;
  sub: string;
};

export const ACADEMY_EVENT_INFO: EventInfoItem[] = [
  { icon: "calendar", label: "Oct 21–22, 2026", sub: "Ghent, Belgium" },
  { icon: "pin", label: "3 locations", sub: "Wintercircus, Vooruit, De Kreun" },
  { icon: "person", label: "Your team lead", sub: "Contact on site" },
];

export type GuideSection =
  | { title: string; body: string; bullets?: undefined }
  | { title: string; bullets: string[]; body?: undefined };

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    title: "What's actually happening",
    body: "Tectonic 2026 runs on three things at once: a pitching competition (€300,000 in investment prize money), Belgium's biggest hackathon (700+ builders, 32 teams in the final, built around real KBC and SD Worx challenges), and Innovation Challenges where corporate partners bring real business problems to start-ups. Plus Tecnotonic, the pre-conference party on 20 October. Wherever your post is, this is what's happening around you.",
  },
  {
    title: "Professionalism, in short",
    bullets: [
      "English for public-facing roles, French is a plus.",
      "Discretion is non-negotiable — no photos of decks or deal conversations, no talking about who you overheard.",
      "On shift: no phone, no alcohol, on time.",
      "Something's off? Escalate to your team lead, or the crew crisis line.",
    ],
  },
  {
    title: "Why this matters",
    bullets: [
      "Access — backstage, keynotes, the hackathon final.",
      "Network — founders, investors, the people building what's next.",
      "Opportunity — partners like Deloitte and Salesforce scout crew for roles.",
      "Experience — genuinely worth putting on your CV.",
    ],
  },
];

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "checkin",
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
      "I can show my interest but will not break up conversations",
      "I go talk to them and ask for possible internships or job opportunities",
      "I give them my printed out CV",
    ],
    correctIndex: 0,
  },
  {
    id: "late",
    question: "Who do you contact if you're running late?",
    options: [
      "Message your team lead on the volunteer Slack",
      "Just come in whenever, no need to tell anyone",
      "Post about it in the general Tectonic Slack",
    ],
    correctIndex: 0,
  },
  {
    id: "lostfound",
    question: "What do you do with a lost & found item?",
    options: [
      "Bring it to the info desk at Wintercircus",
      "Keep it at your post until someone asks",
      "Post a photo of it in the volunteer group chat",
    ],
    correctIndex: 0,
  },
  {
    id: "discretion",
    question: "You overhear two investors discussing a term sheet. What do you do?",
    options: [
      "Nothing — you don't repeat who you overheard or what was said",
      "Mention it to your team, it's interesting gossip",
      "Ask the founder about it later, out of curiosity",
    ],
    correctIndex: 0,
  },
];

export const PASS_THRESHOLD = 4;
