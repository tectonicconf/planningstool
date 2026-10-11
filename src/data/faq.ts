// Content for the volunteer-facing FAQ page (src/app/(portal)/faq/page.tsx).
// Edit the questions/answers below directly — no code changes needed elsewhere.
// Put **double asterisks** around words that should be bold.
// Answers are the short lookup version of the Onboarding page: keep them brief.

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
    question: "Where do I check in?",
    answer:
      "At the **volunteer entrance next to the café** (Sint-Pietersnieuwstraat 23). The main entrance is not in use. Arrive 15 minutes before your shift.",
  },
  {
    id: "volunteer-rooms",
    category: "on-the-day",
    question: "Where can I leave my things?",
    answer:
      "In the volunteer rooms in Studio groot. The door code is shared in the WhatsApp group the day before the event.",
  },
  {
    id: "wintercircus",
    category: "on-the-day",
    question: "Where will my shift be?",
    answer:
      "About 90% of the shifts are in Wintercircus (Sint-Pietersnieuwstraat 11), so have a [look around the building](https://www.wintercircus.be/en/practical/explore) beforehand. Your lead brings you to your station.",
  },
  {
    id: "between-venues",
    category: "on-the-day",
    question: "How do I get from Vooruit to Wintercircus?",
    answer:
      "Take the bridge or walk about 100 m. Your lead brings you to your station.",
  },
  {
    id: "getting-there",
    category: "on-the-day",
    question: "How do I get to Vooruit?",
    answer:
      "Vooruit is a 25-minute walk from Gent-Sint-Pieters and Gent-Dampoort. From Sint-Pieters, take tram 1 towards Evergem to Plateaustraat. From Dampoort, take a bus to Gent Zuid. Free covered bike parking is under the terrace. By car, Vooruit is in the low-emission zone and the nearby car parks (Zuid, Savaanstraat, Sint-Pietersplein) fill up fast. The Park + Ride at Gent-Sint-Pieters is easier.",
  },
  {
    id: "what-to-bring",
    category: "shifts",
    question: "What should I wear?",
    answer:
      "Casual, with the Tectonic shirt we give you. Catering: white shirt and black trousers if possible. Speaker buddies: business casual.",
  },
  {
    id: "food",
    category: "shifts",
    question: "Is food provided?",
    answer: "Yes, food and drinks in the morning and afternoon.",
  },
  {
    id: "event-access",
    category: "shifts",
    question: "Can I attend Tectonic outside my shift?",
    answer: "Yes. Every volunteer gets access to Tectonic 2026. A regular ticket costs €149 to €349 (excl. VAT).",
  },
  {
    id: "badge",
    category: "on-the-day",
    question: "Do I get a ticket, or do I pick up a badge?",
    answer: "Volunteers get a **badge**, not a ticket. You must pick it up at check-in, at the volunteer entrance next to the café. You cannot enter with a ticket instead.",
  },
  {
    id: "boat",
    category: "shifts",
    question: "What is the Tectonic Boat?",
    answer: "A crew celebration on 21 October from 18:00 to 22:00, open to all volunteers.",
  },
  {
    id: "tecnotonic",
    category: "shifts",
    question: "How do I get a Tecnotonic ticket?",
    answer: "Take a breakdown shift or an extra shift. You get a ticket to Tecnotonic on the evening of 20 October: the party at Club Wintercircus after the hackathon final, with techno by Helena Lauwaert.",
  },
  {
    id: "reimbursement",
    category: "shifts",
    question: "Is there a reimbursement for travel or other costs?",
    answer:
      "**No**, there is no reimbursement. We do give you a Tectonic shirt and food and drinks in the morning and afternoon.",
  },
  {
    id: "cv",
    category: "contact",
    question: "Can I get feedback on my CV?",
    answer:
      "Yes. The Academy page has a CV guide with do's and don'ts, a checklist and an example. For personal feedback, book a one-on-one with one of the three contact people via the shared number.",
  },
  {
    id: "shift-questions",
    category: "contact",
    question: "Who do I ask about my shift?",
    answer:
      "Your volunteer lead, in your shift's WhatsApp channel. For anything else, use the shared number.",
  },
  {
    id: "running-late",
    category: "contact",
    question: "What if I'm late or sick?",
    answer:
      "Late: send a message to the shared number. Sick: call it as soon as you know, so we can find a replacement. You'll find the number on the Onboarding page.",
  },
];
