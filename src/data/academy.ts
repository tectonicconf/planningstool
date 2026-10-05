// Content for the volunteer-facing Academy page (src/app/(portal)/academy/page.tsx).
// A short startup-vocabulary glossary — edit/extend the list below directly.

export type AcademyTerm = {
  term: string;
  definition: string;
};

export const ACADEMY_TERMS: AcademyTerm[] = [
  {
    term: "Seed round",
    definition:
      "The first official round of funding a startup raises, usually used to validate an idea and reach initial product-market fit.",
  },
  {
    term: "Series A / B / C",
    definition:
      "Funding rounds that follow the seed round, each typically larger and used to scale the business further.",
  },
  {
    term: "VC (Venture Capital)",
    definition:
      "Investment firms that fund high-growth startups in exchange for equity, usually from Series A onward.",
  },
  {
    term: "Angel investor",
    definition:
      "An individual — often a former founder — who invests their own money in early-stage startups, typically before or alongside a seed round.",
  },
  {
    term: "MVP (Minimum Viable Product)",
    definition:
      "The simplest version of a product that still lets a startup test its core idea with real users.",
  },
  {
    term: "Runway",
    definition:
      "How many months a startup can keep operating before it runs out of cash, at its current spending rate.",
  },
  {
    term: "Burn rate",
    definition: "How quickly a startup is spending its cash each month.",
  },
  {
    term: "Equity",
    definition:
      "Ownership in a company, usually expressed as a percentage of shares.",
  },
  {
    term: "Cap table",
    definition:
      "A table listing who owns what percentage of a company — founders, employees, and investors.",
  },
  {
    term: "Term sheet",
    definition:
      "A non-binding document outlining the key terms of an investment, agreed before the final legal contracts.",
  },
  {
    term: "Valuation",
    definition:
      "An estimate of how much a company is worth, often set during a funding round.",
  },
  {
    term: "Bootstrapping",
    definition:
      "Building a company using personal savings or revenue, without raising outside investment.",
  },
  {
    term: "Pitch deck",
    definition:
      "A short slide presentation founders use to explain their startup to investors.",
  },
  {
    term: "Unicorn",
    definition: "A privately held startup valued at $1 billion or more.",
  },
  {
    term: "Exit",
    definition:
      "The event where founders and investors cash out their equity, usually through an acquisition or IPO.",
  },
];
