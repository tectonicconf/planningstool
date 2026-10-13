// Content for the volunteer-facing FAQ page (src/app/(portal)/faq/page.tsx).
// Edit the questions/answers below directly — no code changes needed elsewhere.
// Put **double asterisks** around words that should be bold.
// Answers are the short lookup version of the Onboarding page: keep them brief.

export type FaqCategory = "arriving" | "badge" | "shift" | "perks" | "contact";

// The FAQ page shows one section per category, in this order.
export const FAQ_CATEGORIES: { id: FaqCategory; label: string; short: string; description: string }[] = [
  { id: "arriving", short: "Arriving", label: "Arriving and finding your way", description: "Check-in, lockers, rooms and getting there." },
  { id: "badge", short: "Badge", label: "Badge and ticket", description: "How you get in, during and after your shift." },
  { id: "shift", short: "Your shift", label: "Your shift", description: "What to wear, food, and what if something comes up." },
  { id: "perks", short: "Perks", label: "Perks and parties", description: "What you get and the crew celebrations." },
  { id: "contact", short: "Questions", label: "Questions and feedback", description: "Who to ask and where to get help." },
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
    category: "arriving",
    question: "Where do I check in?",
    answer:
      "In the **volunteer room in Wintercircus** (Sint-Pietersnieuwstraat 11), downstairs. Enter via **De Krook** and follow the green line: through the foyer, around the Club Wintercircus hall and along the corridor. The blue screen on the foyer wall is not a door. If you have a special case, we will message you on WhatsApp. Arrive 15 minutes before your shift.",
  },
  {
    id: "volunteer-rooms",
    category: "arriving",
    question: "Where can I leave my things?",
    answer:
      "In the **lockers in the foyer** of Wintercircus.",
  },
  {
    id: "get-ready",
    category: "arriving",
    question: "Where can I get changed and ready?",
    answer: "In the **volunteer room**. Enter via De Krook and follow the green line: through the foyer, around the Club Wintercircus hall and along the corridor. The volunteer room has no door to the foyer.",
  },
  {
    id: "wintercircus",
    category: "arriving",
    question: "Where will my shift be?",
    answer:
      "About 90% of the shifts are in Wintercircus (Sint-Pietersnieuwstraat 11), so have a [look around the building](https://www.wintercircus.be/en/practical/explore) beforehand. Your team lead brings you to your station.",
  },
  {
    id: "between-venues",
    category: "arriving",
    question: "How do I get from Vooruit to Wintercircus?",
    answer:
      "Take the Tectonic bridge between the two venues or walk about 100 m. Your team lead brings you to your station.",
  },
  {
    id: "getting-there",
    category: "arriving",
    question: "How do I get to Wintercircus?",
    answer:
      "Wintercircus (Sint-Pietersnieuwstraat 11) is in the city centre, within walking distance of De Krook, Vooruit and Gent Zuid. It is about a 25-minute walk from Gent-Sint-Pieters and Gent-Dampoort. From Sint-Pieters, take tram 1 towards Evergem to Plateaustraat. From Dampoort, take a bus to Gent Zuid. Coming by car? See the next question.",
  },
  {
    id: "by-car",
    category: "arriving",
    question: "Can I come by car?",
    answer:
      "You can, but Wintercircus is in the **low-emission zone** of Ghent. Cars with a Belgian or Dutch plate are fine if they meet the emission rules. A car with another foreign plate must **always be registered** at lez.stad.gent before you drive in. Parking Zuid is about 2 minutes on foot from Wintercircus and Parking Sint-Pietersplein about 9 (paid parking). The easier option is the paid Park + Ride at Gent-Sint-Pieters, outside the zone: park there and continue by tram 1 towards Evergem to Plateaustraat. Allow extra time to find a spot. Not sure? Ask us on the shared WhatsApp number.",
  },
  {
    id: "what-to-bring",
    category: "shift",
    question: "What should I wear?",
    answer:
      "Casual, with the Tectonic shirt we give you. Catering: white shirt and black trousers if possible. Speaker buddies: business casual.",
  },
  {
    id: "change-shift",
    category: "shift",
    question: "Where can I change my shift?",
    answer:
      "Send a message to the shared WhatsApp number. It reaches Kaat, Charlotte and Eveline, who can change your shift. You'll find the number on the Onboarding page.",
  },
  {
    id: "food",
    category: "shift",
    question: "Is food provided?",
    answer: "Yes, food and drinks in the morning and afternoon.",
  },
  {
    id: "water",
    category: "shift",
    question: "Where can I refill my water bottle?",
    answer: "In the **volunteer room**. We provide water.",
  },
  {
    id: "own-food",
    category: "shift",
    question: "Can I bring my own food?",
    answer: "Yes, but only eat it in the **volunteer room**. The exception is something for your blood sugar or a quick energy boost, which you can have when you need it.",
  },
  {
    id: "wifi",
    category: "shift",
    question: "Is there wifi?",
    answer: "Normally yes, but we do not know how reliable it will be. Use your own 4G if you can.",
  },
  {
    id: "charge-phone",
    category: "shift",
    question: "Can I charge my phone?",
    answer: "Yes, in the **volunteer room**.",
  },
  {
    id: "event-snacks",
    category: "shift",
    question: "Can I take snacks and drinks from the event?",
    answer: "Not during your shift. We provide food and drinks for volunteers in the morning and afternoon.",
  },
  {
    id: "event-access",
    category: "badge",
    question: "Can I attend Tectonic after my shift?",
    answer: "Yes. Your volunteer badge is also your ticket for Tectonic. Check out at the end of your shift and enjoy the rest of the day. A regular ticket costs €149 to €349 (excl. VAT).",
  },
  {
    id: "badge",
    category: "badge",
    question: "Do I get a ticket, or do I pick up a badge?",
    answer: "During your shift you wear a **volunteer badge**, not a ticket. Pick it up at check-in, in the volunteer room in Wintercircus. The same badge is also your ticket for the rest of Tectonic after your shift, see the next question.",
  },
  {
    id: "boat",
    category: "perks",
    question: "What is the Tectonic Boat?",
    answer: "A crew party on the water on 21 October from 18:00 to 22:00, open to all volunteers. The boat is moored at **Kuiperskaai 24** in Ghent.",
  },
  {
    id: "tecnotonic",
    category: "perks",
    question: "How do I get a Tecnotonic ticket?",
    answer: "Take a breakdown shift or an extra shift. You get a ticket to Tecnotonic on the evening of 20 October: the party at Club Wintercircus after the hackathon final, with techno by Helena Lauwaert.",
  },
  {
    id: "reimbursement",
    category: "perks",
    question: "Is there a reimbursement for travel or other costs?",
    answer:
      "**No**, there is no reimbursement. We do give you a Tectonic shirt and food and drinks in the morning and afternoon.",
  },
  {
    id: "cv",
    category: "contact",
    question: "Can I get feedback on my CV?",
    answer:
      "Yes. The Academy page has a CV guide with do's and don'ts, a checklist and an example. For personal feedback, book a slot of 10 minutes by sending us a short email. The online CV session on 28 October (20:30) has a Google Meet link in the Academy.",
  },
  {
    id: "shift-questions",
    category: "contact",
    question: "Who do I ask about my shift?",
    answer:
      "Your team lead, in your shift's WhatsApp channel. Every type of shift has its own team lead, for example the catering lead if you work in catering. For anything else, use the shared WhatsApp number.",
  },
  {
    id: "running-late",
    category: "shift",
    question: "What if I'm late or sick?",
    answer:
      "Late: send a WhatsApp message to the shared WhatsApp number. Sick: call it via WhatsApp as soon as you know, so we can find a replacement. You'll find the number on the Onboarding page.",
  },
  {
    id: "where-shifts",
    category: "shift",
    question: "Where do I find my shifts?",
    answer: "In the **Shifts** tab of this portal. Your shifts unlock after you have read the onboarding and passed the quiz. You can accept or decline each shift there.",
  },
  {
    id: "cannot-attend",
    category: "shift",
    question: "What if I cannot attend my shift?",
    answer: "Tell us as early as possible with a message to the shared WhatsApp number, so we can find a replacement. Late or sick on the day itself: see the question above.",
  },
  {
    id: "shift-end",
    category: "shift",
    question: "What do I do when my shift ends?",
    answer: "Check out at the end of your shift and enjoy the rest of Tectonic. Your badge is also your ticket.",
  },
  {
    id: "problem",
    category: "contact",
    question: "Who do I contact if there is a problem?",
    answer: "Your team lead first. For anything else, use the shared WhatsApp number. In an emergency, call **112**.",
  },
  {
    id: "unsure",
    category: "contact",
    question: "What if I am unsure about my task, or a guest asks me something I do not know?",
    answer: "Ask your team lead. You do not have to know everything.",
  },
  {
    id: "technical-problem",
    category: "contact",
    question: "What do I do if there is a technical problem?",
    answer: "Contact your team lead and stay discreet.",
  },
  {
    id: "guest-ticket",
    category: "contact",
    question: "What if a guest has the wrong ticket or badge?",
    answer: "The details are shared with the volunteers who work that shift, in their shift info. If this is not your shift, ask your team lead.",
  },
  {
    id: "first-aid",
    category: "contact",
    question: "Where is first aid, and what if someone is injured or unwell?",
    answer: "First aid is in the **volunteer room**. Tell your team lead if someone is injured or unwell. In an emergency, call **112**.",
  },
  {
    id: "lost-item",
    category: "contact",
    question: "What do I do with a lost item?",
    answer: "Tell your team lead and leave the item where it is.",
  },
];
