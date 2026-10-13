// Content for the volunteer-facing Onboarding page (src/app/(portal)/onboarding/page.tsx).
// Edit the texts below directly — no code changes needed elsewhere.
//
// - Put **double asterisks** around the few words that really must stand out.
// - Anything that starts with "[" is a placeholder: the page shows it in amber
//   so it's easy to spot what still has to be filled in.
//
// Keep each fact in ONE place on this page; the FAQ page is the short lookup
// version of the same information.

export const ONBOARDING_INTRO = {
  eyebrow: "Tectonic 2026 · 21 October · Ghent",
  title: "Welcome to the crew",
  body: "You help build Tectonic from the inside. Tectonic is a conference about ideas and collaboration, not a job fair. This page covers what to do before the event, how your day works, what you get, how we work together and who to contact.",
};

export const WHY_VOLUNTEER = {
  eyebrow: "MISSION AND VISION",
  title: "Why Tectonic exists",
  // Mission: the big statement at the top.
  lead: "We want to stimulate innovation and technology, and we want to do it from Europe.",
  paragraphs: [
    {
      label: "Our vision",
      text: "A Europe that builds the technology it relies on, where founders, investors, companies and policymakers know each other.",
    },
    {
      label: "Why now",
      text: "AI is reshaping every industry, and technology now sits at the centre of security and politics. Europe wants to depend less on others for what it relies on. That starts with people who build, fund and use technology finding each other. As a volunteer, you help make that meeting happen.",
    },
  ],
};

export type TimelineItem = {
  id: string;
  date: string;
  month: string;
  title: string;
  body: string;
};

export const TIMELINE = {
  title: "Tectonic at a glance",
  items: [
    {
      id: "oct-19",
      date: "19",
      month: "Oct",
      title: "Hackathon setup",
      body: "A few volunteers help set up the hackathon space in the afternoon and evening.",
    },
    {
      id: "oct-20",
      date: "20",
      month: "Oct",
      title: "Hackathon day and Tecnotonic",
      body: "Setup and the hackathon, from the opening in the morning to the final in the evening. Later that night: the Tecnotonic party.",
    },
    {
      id: "oct-21",
      date: "21",
      month: "Oct",
      title: "Tectonic",
      body: "The main event at Wintercircus and Vooruit, with shifts throughout the day. Breakdown starts in the evening.",
    },
    {
      id: "oct-22",
      date: "22",
      month: "Oct",
      title: "Final breakdown",
      body: "The last breakdown shifts, in the morning.",
    },
  ] as TimelineItem[],
};

export type Step = {
  id: string;
  title: string;
  body: string;
  // Optional link shown under the step.
  link?: { label: string; href: string };
};

export const NEXT_STEPS: Step[] = [
  {
    id: "academy",
    title: "Unlock your shifts",
    body: "Complete the short intro and quiz on the Shifts page. It takes about 5 minutes.",
    link: { label: "Go to your shifts", href: "/" },
  },
  {
    id: "info-session",
    title: "Join one info session",
    body: "Pick one of the two online sessions under Coming up.",
  },
  {
    id: "explore-wintercircus",
    title: "Take a look at Wintercircus",
    body: "About 90% of the shifts take place in Wintercircus, so it helps to know the building before the day. Have a look around.",
    link: {
      label: "Explore Wintercircus",
      href: "https://www.wintercircus.be/en/practical/explore",
    },
  },
  {
    id: "group-chat",
    title: "Join the WhatsApp group",
    body: "One community channel for everyone, plus one channel per shift with your volunteer lead. You get the link by email.",
  },
  {
    id: "startup-101",
    title: "Explore the Academy (optional)",
    body: "A quick guide to the startup world, so you can follow what you hear around you.",
    link: { label: "Open the Academy", href: "/academy" },
  },
];

export type CrewEvent = {
  id: string;
  // Large text in the date chip, e.g. "18", plus the month below it.
  day: string;
  month: string;
  title: string;
  // Small line under the title, e.g. "Sunday · 16:00 · Online".
  meta: string;
  // Small cyan tag, e.g. "Optional".
  tag?: string;
  body: string;
  link?: { label: string; href: string };
};

export const COMING_UP = {
  title: "Coming up",
  intro:
    "Everything around the event, in order. The info sessions are the only ones we ask you to join.",
  items: [
    {
      id: "info-1",
      day: "18",
      month: "Oct",
      title: "Info session",
      meta: "Sunday · 16:00 · Online",
      tag: "Join one of the two",
      body: "The venue, shifts, roles and practical details.",
      link: { label: "Join the session", href: "https://meet.google.com/cwr-skcj-vix" },
    },
    {
      id: "info-2",
      day: "19",
      month: "Oct",
      title: "Info session",
      meta: "Monday · 18:00 · Online",
      tag: "Join one of the two",
      body: "The same session, at a different time.",
      link: { label: "Join the session", href: "https://meet.google.com/udd-jpnk-pva" },
    },
    {
      id: "first-aid",
      day: "19",
      month: "Oct",
      title: "First-aid training",
      meta: "Monday · 19:00–21:00 · Emile Clauslaan 5, Ghent",
      tag: "Optional · limited places",
      body: "Learn what to do if something happens at the event.",
      link: { label: "Sign up", href: "https://tally.so/r/jadqK6" },
    },
    {
      id: "cv",
      day: "28",
      month: "Oct",
      title: "CV session",
      meta: "Wednesday · 20:30 · Online · about 30 minutes",
      tag: "Optional",
      body: "Do's and don'ts for your CV, plus a checklist and an example. Prefer personal feedback? Book a one-on-one with one of the three contact people.",
      link: { label: "Open the CV guide", href: "/academy#cv" },
    },
    {
      id: "crew-event",
      day: "Nov",
      month: "",
      title: "Crew event after Tectonic",
      meta: "Two weeks after the event · date and place to be announced",
      tag: "For the whole crew",
      body: "A big event for the whole crew, together with volunteers from previous editions. Meet people from other years and celebrate what we built.",
    },
  ] as CrewEvent[],
};

export const ON_THE_DAY = {
  title: "Your day, step by step",
  map: {
    title: "Find Wintercircus",
    body: "Sint-Pietersnieuwstraat 11, Ghent. Enter via De Krook and follow the arrows to the check-in point.",
    label: "Open in Google Maps",
    href: "https://www.google.com/maps/search/?api=1&query=Wintercircus+Sint-Pietersnieuwstraat+11+Gent",
  },
  steps: [
    {
      id: "arrive",
      title: "Arrive early",
      body: "Be there **15 minutes before your shift** starts.",
    },
    {
      id: "check-in",
      title: "Check in",
      body: "The **check-in point is in Wintercircus**. Enter via De Krook and follow the arrows. Pick up your badge here: you cannot enter without it.",
    },
    {
      id: "things",
      title: "Leave your things",
      body: "Use the **lockers in Wintercircus**.",
    },
    {
      id: "station",
      title: "Go to your station",
      body: "Your lead takes you there. About 90% of the shifts are in Wintercircus. Between Wintercircus and Vooruit, take the Tectonic bridge or walk about 100 m.",
    },
    {
      id: "after",
      title: "After your shift",
      body: "Enjoy the rest of Tectonic.",
    },
  ] as Step[],
};

export type Room = { name: string; where: string; what: string };

// Which room is where. Sources: tectonicconf.eu/program, wintercircus.be and the
// Event Timeline 2026 (Notion). Check names and floors with production before sharing widely.
export const VENUE_GUIDE = {
  title: "Where is what",
  intro:
    "Tectonic takes place in two buildings about 100 m apart, linked by Tectonic's own bridge. About 90% of the shifts are in Wintercircus, so learn those rooms first.",
  venues: [
    {
      name: "Wintercircus",
      address: "Sint-Pietersnieuwstraat 11",
      note: "Where most shifts are, and where you check in.",
      rooms: [
        {
          name: "Main Stage",
          where: "Club Wintercircus",
          what: "Opening, keynotes, fireside chats, panels and debates, back to back all day.",
        },
        {
          name: "Innovation Stage",
          where: "Auditorium, level 1, above the Arena",
          what: "Innovation Challenges and sessions.",
        },
        {
          name: "Workshop rooms 1 and 2",
          where: "Wintercircus",
          what: "Workshops of 45 minutes, in two rooms at the same time.",
        },
        {
          name: "Atrium and Arena",
          where: "Ground floor",
          what: "The partner booths.",
        },
        {
          name: "Space Bar",
          where: "Bar Bougie, ground floor",
          what: "Networking sessions and drinks.",
        },
        {
          name: "Rooftop Lounge",
          where: "Bar Bassie and Tribune, at the top of the building",
          what: "Networking sessions and lunches.",
        },
      ] as Room[],
    },
    {
      name: "Vooruit",
      address: "Sint-Pietersnieuwstraat 23",
      note: "The Pitching Stage and the Meeting Hub.",
      rooms: [
        {
          name: "Theaterzaal",
          where: "Vooruit",
          what: "The Pitching Stage: the Pitching Competition on 21 October and the hackathon final on 20 October.",
        },
        {
          name: "Concertzaal",
          where: "Vooruit",
          what: "The Meeting Hub on 21 October and the hackathon on 20 October.",
        },
        {
          name: "Foyer Theaterzaal",
          where: "Vooruit",
          what: "Feedback sessions after the pitches and side events.",
        },
      ] as Room[],
    },
  ],
  note: "Rooms and times can still change. The full program is on tectonicconf.eu.",
  link: { label: "Open the full program", href: "https://www.tectonicconf.eu/program" },
};

export type GlanceItem = { time: string; title: string; place: string };

// A light run-of-show, only public program items. Source: Event Timeline 2026.
export const DAY_GLANCE = {
  title: "The day at a glance",
  intro: "The rhythm of the two main days. Your own shift times are in your schedule.",
  days: [
    {
      label: "20 October",
      items: [
        { time: "09:00–16:00", title: "Hackathon", place: "Vooruit, Concertzaal" },
        { time: "16:15–17:45", title: "Hackathon semi-finals", place: "Wintercircus, workshop rooms" },
        { time: "18:00–19:30", title: "Hackathon final", place: "Vooruit, Theaterzaal" },
        { time: "19:45–21:00", title: "Hackathon reception", place: "Wintercircus, foyer of Club Wintercircus" },
        { time: "21:15–01:00", title: "Tecnotonic", place: "Club Wintercircus" },
      ] as GlanceItem[],
    },
    {
      label: "21 October",
      items: [
        { time: "09:00–16:30", title: "Meeting Hub", place: "Vooruit, Concertzaal" },
        { time: "09:30", title: "Opening", place: "Main Stage" },
        { time: "09:45–18:00", title: "Main Stage program", place: "Club Wintercircus" },
        { time: "09:30–18:00", title: "Partner booths", place: "Wintercircus, Atrium" },
        { time: "10:15–16:45", title: "Workshops and Innovation Challenges", place: "Workshop rooms and Innovation Stage" },
        { time: "10:30–17:15", title: "Pitching Competition, Grand Final at 16:30", place: "Vooruit, Theaterzaal" },
        { time: "From 17:30", title: "Closing drinks, dinners and the Tectonic Boat", place: "Around Ghent" },
      ] as GlanceItem[],
    },
  ],
  note: "Times are from the current planning and can still change.",
};

export type Perk = { id: string; title: string; body: string };

export const PERKS = {
  title: "What you get",
  items: [
    {
      id: "access",
      title: "Access to Tectonic",
      body: "Your volunteer badge gives you free access to the whole event, also outside your shift. A regular ticket costs €149 to €349 (excl. VAT).",
    },
    {
      id: "boat",
      title: "Tectonic Boat",
      body: "Celebrate with the crew on 21 October, 18:00–22:00.",
    },
    {
      id: "tecnotonic",
      title: "Tecnotonic ticket",
      body: "Volunteers on a breakdown shift or an extra shift get a ticket to Tecnotonic, the party at Club Wintercircus after the hackathon final on 20 October, with techno by Helena Lauwaert. Places are normally limited to 600. Breakdown crew get this instead of the boat.",
    },
    {
      id: "activities",
      title: "Crew activities",
      body: "Meet the rest of the crew and have fun around the event, for example at the big crew event after Tectonic, together with volunteers from previous editions, two weeks after the event. Details follow.",
    },
    {
      id: "basics",
      title: "Shirt, food and drinks",
      body: "A Tectonic shirt, plus food and drinks in the morning and in the afternoon.",
    },
  ] as Perk[],
};

export const CONDUCT = {
  title: "Code of conduct",
  intro: "What matters most is that you're reliable, proactive and ready to get involved. Here's how we work together.",
  items: [
    {
      title: "Dress code",
      body: "Casual, with your Tectonic shirt. Catering: white shirt and black trousers if possible. Speaker buddies: business casual.",
    },
    {
      title: "Be professional",
      body: "Friendly, focused and respectful to guests, speakers and the team. Speak English with guests; French is a plus.",
    },
    {
      title: "Keep it discreet",
      body: "No photos of slides or deal conversations, and nothing on social media about what you overheard.",
    },
    {
      title: "Focus on your shift",
      body: "No networking, no alcohol and no private phone use during your shift. Network after your shift.",
    },
    {
      title: "Stay at your station",
      body: "Need to leave? Tell your lead first.",
    },
    {
      title: "Don't solve problems alone",
      body: "A complaint or an issue goes to your lead.",
    },
    {
      title: "Found a lost item?",
      body: "Tell your lead and leave it where it is.",
    },
  ],
};

export const CONTACTS = {
  title: "Who to contact",
  body: "Questions about your shift go to your volunteer lead. Everything else goes to the **shared WhatsApp number**, which reaches all three contact people. **Always reach it through WhatsApp**: send a message or call there.",
  number: "+32 451 05 54 92",
  people: [
    { name: "Charlotte Manteleers", photo: "/contacts/charlotte-manteleers.jpg" },
    { name: "Eveline Dioos", photo: "/contacts/eveline-dioos.jpg" },
    { name: "Kaat de Jonge", photo: "/contacts/kaat-de-jonge.jpg" },
  ],
  when: [
    "Running late? Send a WhatsApp message.",
    "Sick? Call via WhatsApp as soon as you know, so we can find a replacement.",
    "Emergency? Call **112** first, then the shared WhatsApp number.",
  ],
};
