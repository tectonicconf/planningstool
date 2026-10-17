// Student associations/schools whose members are volunteering alongside
// Tectonic's own crew — shown as a logo strip on the volunteer dashboard
// ("Crewing alongside you"). Logos are hotlinked directly from each
// organization's own site rather than mirrored here, except where a
// locally-supplied file renders better (see VEK below).
export type CrewPartner = {
  name: string;
  logoUrl: string;
  // Tailwind height class for the logo strip. Square/circular marks read
  // smaller than wide rectangular logos at the same height, so this can be
  // bumped per-partner to even that out visually. Defaults to "h-14".
  heightClass?: string;
  // The default treatment inverts colors + screen-blends so a logo's own
  // (usually dark, opaque-background) artwork reads as light-on-dark. Set
  // this when a logo already has real alpha transparency and should keep
  // its true colors instead (e.g. a colored circular badge).
  keepColors?: boolean;
  // Forces the logo to a solid white silhouette (brightness-0 then invert)
  // instead of a plain color invert. Use when the source art is mid-gray
  // rather than black, so a plain invert only reaches light gray.
  monoWhite?: boolean;
  // Extra Tailwind filter classes appended after the default treatment,
  // for per-logo brightness/contrast tweaks.
  extraClass?: string;
};

export const CREW_PARTNERS: CrewPartner[] = [
  {
    name: "VEK Investment Club",
    logoUrl: "/vek-logo.png",
    heightClass: "h-21",
    keepColors: true,
  },
  {
    name: "Capitant Gent",
    logoUrl: "https://dsa.ugent.be/api/verenigingen/capitant/logo?size=large",
    monoWhite: true,
    heightClass: "h-12",
  },
  {
    name: "180 Degrees Consulting Ghent",
    logoUrl:
      "https://static.wixstatic.com/media/07a134_f32748976d5d4944bbb183ab42ca9262~mv2.png",
    heightClass: "h-[70px]",
    extraClass: "brightness-100",
  },
  {
    name: "BEAM",
    logoUrl: "https://dsa.ugent.be/api/verenigingen/beam/logo?size=large",
    heightClass: "h-16",
  },
  {
    name: "Vlerick Business School",
    logoUrl: "https://www.vlerick.com/logo.jpg",
  },
];
