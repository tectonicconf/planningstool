// `shifts.shift_lead` can hold more than one name, separated by ";" (e.g.
// "Seger;Kerem") when a shift has multiple leads — these two helpers are the
// one place that splits/joins that format, so a shift lead is displayed
// consistently (comma-separated) and filterable by each individual name
// rather than only by the exact combined string.
export function splitShiftLeads(raw: string): string[] {
  return raw
    .split(";")
    .map((name) => name.trim())
    .filter(Boolean);
}

export function formatShiftLead(raw: string): string {
  return splitShiftLeads(raw).join(", ");
}

// `shifts.tectonic_responsible` uses the same "TBC" not-yet-decided
// placeholder convention as shift_lead, but holds a single name rather than
// a ";"-separated list — this is the one place that decides whether a value
// counts as "actually set" for display purposes.
export function hasTectonicResponsible(raw: string): boolean {
  const trimmed = raw.trim();
  return trimmed !== "" && trimmed !== "TBC";
}
