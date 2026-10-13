// Content for the mandatory Academy flow shown before a volunteer can see
// their shifts for the first time (src/components/AcademyFlow.tsx).
// Edit the values below directly — no code changes needed elsewhere.
//
// Keep this in sync with the Onboarding page: the quiz only asks about rules
// that are written down in "The essentials" below.

export type EventFact = {
  icon: "calendar" | "location" | "person";
  title: string;
  subtitle: string;
};

export const WELCOME = {
  title: "Welcome to Tectonic",
  body: "Before your shifts unlock, we go through the essentials: where you go, who to call and how we work. It takes about 5 minutes.",
};

export const EVENT_FACTS: EventFact[] = [
  {
    icon: "calendar",
    title: "21 October 2026",
    subtitle: "Ghent, Belgium",
  },
  {
    icon: "location",
    title: "2 venues",
    subtitle: "Wintercircus and Vooruit",
  },
  {
    icon: "person",
    title: "Your contacts",
    subtitle: "Your team lead and one shared WhatsApp number",
  },
];

export const ESSENTIALS = {
  title: "The essentials",
  intro:
    "Seven things to remember. The Onboarding page has the full picture, and the quiz only asks about what is below.",
  items: [
    {
      title: "Arrive 15 minutes early",
      body: "That gives you time to leave your things and for your team lead to take you to your station.",
    },
    {
      title: "Check in at Wintercircus",
      body: "The check-in point is in the volunteer room in Wintercircus, downstairs. Enter via De Krook and follow the green line: through the foyer, around the Club Wintercircus hall and along the corridor. The room has no door to the foyer. Pick up your badge there: you cannot enter without it.",
    },
    {
      title: "Running late or sick?",
      body: "Late: send a WhatsApp message to the shared WhatsApp number. Sick: call it via WhatsApp as soon as you know, so we can find a replacement.",
    },
    {
      title: "Focus on your shift",
      body: "Networking is not allowed during your shift, and neither are alcohol and your private phone. Network after your shift.",
    },
    {
      title: "Ask the right person",
      body: "Questions about your shift go to your team lead. Everything else goes to the shared WhatsApp number.",
    },
    {
      title: "Know where the rooms are",
      body: "About 90% of the shifts are in Wintercircus: the Main Stage is in Club Wintercircus and the Innovation Stage in the Auditorium. Vooruit has the Theaterzaal (the Pitching Stage), the Concertzaal (the Meeting Hub). Leave your things in the lockers in Wintercircus.",
    },
    {
      title: "Keep it discreet",
      body: "No photos of slides or deal conversations, and nothing on social media about what you overheard. If you find a lost item, tell your team lead and leave it where it is.",
    },
  ],
};

export type QuizQuestion = {
  id: string;
  question: string;
  // The first option must be the correct one. The flow shuffles the options
  // every time the quiz is shown, so the position never gives it away.
  options: string[];
  correctIndex: number;
  // Shown after a pass, next to the questions that were missed.
  explanation: string;
};

// A volunteer needs at least this many correct (out of QUIZ_QUESTIONS.length)
// to pass. Failing lets them retake immediately, with no cooldown.
export const QUIZ_MIN_CORRECT = 8;

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "check-in",
    question: "Where do you check in on the day?",
    options: [
      "At the check-in point in Wintercircus, downstairs",
      "At the main entrance of Vooruit",
      "Directly at your station, without checking in",
    ],
    correctIndex: 0,
    explanation:
      "Check in at the volunteer room in Wintercircus. Enter via De Krook and follow the green line around the Club Wintercircus hall and along the corridor.",
  },
  {
    id: "badge",
    question: "What do you need to get in as a volunteer?",
    options: [
      "The badge you pick up at check-in",
      "A ticket you print yourself",
      "Your confirmation email on your phone",
    ],
    correctIndex: 0,
    explanation:
      "Volunteers do not enter with a separate ticket. Pick up your badge at check-in: without it you cannot enter. The same badge is your ticket for the rest of Tectonic after your shift.",
  },
  {
    id: "arrival",
    question: "When should you arrive?",
    options: [
      "15 minutes before your shift starts",
      "Exactly when your shift starts",
      "As soon as the doors open, even hours early",
    ],
    correctIndex: 0,
    explanation:
      "Be there 15 minutes before your shift, so you can leave your things and be taken to your station.",
  },
  {
    id: "late-sick",
    question: "You wake up sick on the day of your shift. What do you do?",
    options: [
      "Call the shared WhatsApp number as soon as you know",
      "Send a message at the end of the day",
      "Ask another volunteer to take your place quietly",
    ],
    correctIndex: 0,
    explanation:
      "Call as soon as you know, so we can find a replacement. If you are only running late, a message to the shared WhatsApp number is enough.",
  },
  {
    id: "networking",
    question: "Are you allowed to network with guests and startups during your shift?",
    options: [
      "No, not during your shift. Do it afterwards",
      "Yes, whenever it is quiet",
      "Yes, while you guide guests to their place",
    ],
    correctIndex: 0,
    explanation:
      "Networking is not allowed while you are on shift. Your focus is on your task. Enjoy the event and network once you are done.",
  },
  {
    id: "who-to-ask",
    question: "You have a question about your own shift. Who do you ask?",
    options: [
      "Your team lead",
      "A speaker or guest nearby",
      "Nobody, you work it out yourself",
    ],
    correctIndex: 0,
    explanation:
      "Your team lead is your first contact for your shift. For anything else, use the shared WhatsApp number.",
  },
  {
    id: "discretion",
    question: "You overhear a conversation about a deal. What do you do?",
    options: [
      "Keep it to yourself",
      "Post about it on social media",
      "Take a photo of the slides to share with friends",
    ],
    correctIndex: 0,
    explanation:
      "Discretion is non-negotiable: no photos of slides or deal conversations, and nothing on social media about what you overheard.",
  },
  {
    id: "lost-found",
    question: "You find something that someone lost. What do you do?",
    options: [
      "Tell your team lead, but leave it where it is",
      "Take it with you to keep it safe",
      "Give it to the first person who says it is theirs",
    ],
    correctIndex: 0,
    explanation:
      "Report it to your team lead and leave it where it is.",
  },
  {
    id: "pitching-stage",
    question: "Where does the Pitching Competition take place?",
    options: [
      "In the Theaterzaal at Vooruit",
      "On the Main Stage in Wintercircus",
      "In the Auditorium in Wintercircus",
    ],
    correctIndex: 0,
    explanation:
      "The Pitching Stage is the Theaterzaal at Vooruit. The Main Stage is in Club Wintercircus and the Innovation Stage in the Auditorium.",
  },
  {
    id: "leave-things",
    question: "Where do you leave your things on the day?",
    options: [
      "In the lockers in Wintercircus",
      "At your station",
      "In the Atrium at Wintercircus",
    ],
    correctIndex: 0,
    explanation:
      "Leave your things in the lockers in Wintercircus.",
  },
];
