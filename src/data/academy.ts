// Content for the volunteer-facing Academy page (src/app/(portal)/academy/page.tsx).
// Optional background reading: what Tectonic is, who is in the room and the
// vocabulary you will hear. Edit the texts below directly.

export const ACADEMY_INTRO = {
  eyebrow: "Startup Ecosystem 101",
  title: "Academy",
  body: "You spend the day in the middle of Europe's startup scene. This page helps you follow what you see and hear around you. It takes about 5 minutes and is optional.",
};

export const ACADEMY_PROGRAMME = {
  title: "What Tectonic is",
  intro:
    "Tectonic brings together founders, investors and large companies. It is a conference about ideas and collaboration, not a job fair. Things happen on stage and around it, all day.",
  items: [
    {
      title: "Pitching competition",
      body: "Startups pitch for €300,000 in investment prize money.",
    },
    {
      title: "Hackathon",
      body: "700+ builders from 7 Belgian cities. 32 teams reach the final in Ghent on 20 October.",
    },
    {
      title: "Innovation Challenges",
      body: "Large companies give startups a real business problem to solve.",
    },
    {
      title: "Tecnotonic",
      body: "The pre-conference party on the evening of 20 October.",
    },
  ],
};

export const ACADEMY_ROOM = {
  title: "Who you will meet",
  items: [
    {
      title: "Founders",
      body: "People who build a startup. They are here to find investors, customers and talent.",
    },
    {
      title: "Investors",
      body: "Venture capital firms and angel investors who put money into startups in return for a share of the company.",
    },
    {
      title: "Large companies",
      body: "Corporates that work with startups as customers, partners or investors.",
    },
    {
      title: "Builders",
      body: "Hackathon participants, students and developers who build a product in a short time.",
    },
  ],
};

export const ACADEMY_PARTNERS = {
  title: "Who makes it possible",
  intro: "Tectonic is supported by partners at different levels.",
  tiers: [
    {
      title: "Innovation Partners",
      body: "Run an innovation challenge for startups.",
      names: ["SD Worx", "Sandbox Flanders", "Baloise", "KBC"],
    },
    {
      title: "Leading Partners",
      body: "Host side events, workshops and activations.",
      names: ["Deloitte", "Salesforce", "StartUp.Wallonia"],
    },
    {
      title: "Community Partners",
      body: "Ecosystem builders, accelerators and venues.",
      names: [
        "Antler",
        "ClubWaW!",
        "ETH Zurich",
        "Maria 01",
        "Norrsken Evolve",
        "SSE Business Lab",
        "Start2 Group",
        "Wintercircus",
      ],
    },
  ],
};

export type AcademyTerm = {
  term: string;
  definition: string;
};

export type AcademyTermGroup = {
  title: string;
  terms: AcademyTerm[];
};

export const ACADEMY_GLOSSARY = {
  title: "Vocabulary",
  intro: "Words you will hear a lot, grouped by topic.",
  groups: [
    {
      title: "Raising money",
      terms: [
        {
          term: "Pitch deck",
          definition:
            "The short slide presentation a founder uses to explain the company to investors.",
        },
        {
          term: "Seed round",
          definition:
            "The first official round of funding, usually to build the early product and find customers.",
        },
        {
          term: "Series A / B / C",
          definition:
            "Later funding rounds. Each is typically larger and used to grow the company further.",
        },
        {
          term: "Valuation",
          definition:
            "An estimate of what a company is worth, often set during a funding round.",
        },
        {
          term: "Term sheet",
          definition:
            "A non-binding summary of the key terms of an investment, agreed before the legal contracts.",
        },
      ],
    },
    {
      title: "Who invests",
      terms: [
        {
          term: "VC (venture capital)",
          definition:
            "A firm that invests other people's money in fast-growing startups in return for equity.",
        },
        {
          term: "Angel investor",
          definition:
            "A person, often a former founder, who invests their own money in a very early startup.",
        },
        {
          term: "Accelerator",
          definition:
            "A program that helps early startups grow quickly, often with funding and mentoring.",
        },
      ],
    },
    {
      title: "Ownership",
      terms: [
        {
          term: "Equity",
          definition:
            "Ownership in a company, expressed as a percentage of its shares.",
        },
        {
          term: "Cap table",
          definition:
            "The overview of who owns what share of a company: founders, employees and investors.",
        },
        {
          term: "Exit",
          definition:
            "When founders and investors cash out, usually through a sale of the company or an IPO.",
        },
      ],
    },
    {
      title: "Running a startup",
      terms: [
        {
          term: "MVP",
          definition:
            "Minimum viable product: the simplest version that lets a startup test its idea with real users.",
        },
        {
          term: "Burn rate",
          definition: "How much cash a startup spends each month.",
        },
        {
          term: "Runway",
          definition:
            "How many months a startup can keep going before the cash runs out.",
        },
        {
          term: "ARR",
          definition:
            "Annual recurring revenue: the predictable yearly income from subscriptions or contracts.",
        },
        {
          term: "Bootstrapping",
          definition:
            "Building a company from savings or revenue, without outside investment.",
        },
        {
          term: "Unicorn",
          definition: "A private startup valued at $1 billion or more.",
        },
      ],
    },
  ] as AcademyTermGroup[],
};

// CV session and personal feedback. Shown as the "CV and career" section on the
// Academy page (anchor #cv). The online session is on Wednesday 28 October.
export const ACADEMY_CV = {
  eyebrow: "CAREER",
  title: "CV session and feedback",
  intro:
    "Tectonic is a conference about ideas and collaboration, not a job fair. A sharp CV still helps you in your career, whether you apply here or elsewhere. We run a short online CV session, and you can book personal feedback on your own CV.",
  session: {
    title: "The online CV session",
    meta: "Wednesday 28 October · 20:30 · Online · about 30 minutes",
    body: "We show what a strong CV looks like, what to cut and how to describe your volunteering. Optional, and open to every volunteer.",
  },
  dos: [
    "Keep it to one page. Short is fine when you are early in your career.",
    "Put the most relevant and most recent things first.",
    "Start each bullet with a verb and show the result. Use numbers when you have them.",
    "Adapt your CV to each application. Reuse the words from the job description.",
    "Use one clean layout: one font, clear headings, plenty of white space. Send it as a PDF.",
    "Add a link to your LinkedIn profile, portfolio or GitHub, and a professional email address.",
  ],
  donts: [
    "Don't write vague claims like 'hard worker' or 'team player' without proof.",
    "Don't leave typos. Ask someone else to proofread.",
    "Don't add filler: old school details, 'references on request' or hobbies that say nothing.",
    "Don't use skill bars, star ratings or heavy graphics. They say little and can break in screening software.",
    "Don't exaggerate. Recruiters check, and interviewers ask follow-up questions.",
    "Don't send the same CV everywhere.",
  ],
  checklist: [
    "Does it fit on one page?",
    "Is your most relevant experience in the top half?",
    "Does every bullet show what you did and what it led to?",
    "Does it match the role you are applying for?",
    "Are your contact details and links correct and easy to find?",
    "Is the layout the same everywhere: dates, fonts, spacing?",
    "Has someone else read it for typos?",
    "Is it saved as a PDF with a clear file name, like firstname-lastname-cv.pdf?",
  ],
  example: {
    title: "Put your Tectonic shift on your CV",
    intro:
      "Volunteering counts as experience, if you describe what you actually did.",
    before: "Volunteer at Tectonic. Helped at the event.",
    after:
      "Volunteer, Tectonic 2026, Ghent (October 2026). Welcomed international founders and investors at a two-venue startup conference, answered visitors' questions on the spot and worked in a team of volunteers under time pressure.",
    note: "Add a number if you have one, for example how many guests you helped. Do your networking after your shift, not during it.",
  },
  feedback: {
    title: "Personal feedback",
    body: "Prefer feedback on your own CV? Book a one-on-one with one of the three contact people: Charlotte, Eveline or Kaat. Send a message to the shared WhatsApp number with the word CV and the moments that suit you. You find the number on the Onboarding page.",
    cta: { label: "Go to the shared WhatsApp number", href: "/onboarding#contact" },
  },
};
