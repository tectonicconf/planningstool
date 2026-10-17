// Student associations/schools whose members are volunteering alongside
// Tectonic's own crew — shown as a logo strip on the volunteer dashboard
// ("Crewing alongside you"). Logos are hotlinked directly from each
// organization's own site rather than mirrored here, except where a
// locally-supplied file renders better (see VEK below).
export type CrewPartner = {
  name: string;
  logoUrl: string;
};

export const CREW_PARTNERS: CrewPartner[] = [
  {
    name: "BEAM",
    logoUrl: "https://dsa.ugent.be/api/verenigingen/beam/logo?size=large",
  },
  {
    name: "Capitant Gent",
    logoUrl: "https://dsa.ugent.be/api/verenigingen/capitant/logo?size=large",
  },
  {
    name: "180 Degrees Consulting Ghent",
    logoUrl:
      "https://static.wixstatic.com/media/07a134_f32748976d5d4944bbb183ab42ca9262~mv2.png",
  },
  {
    name: "Vlerick Business School",
    logoUrl: "https://www.vlerick.com/logo.jpg",
  },
  {
    name: "VEK Investment Club",
    logoUrl: "/vek-logo.png",
  },
];
