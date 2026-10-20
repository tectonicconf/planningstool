// Maps a shift's calendar date to the matching daily-checkin column on
// `volunteers` — a per-volunteer, per-day flag (distinct from the
// per-assignment people_checkin/checked_in_at on `assignments`) that's true
// once that volunteer has been people-checked-in for *any* shift that day.
// Only Tuesday 20 Oct and Wednesday 21 Oct have a column so far (whatever
// was actually added to the table) — any other date (e.g. Thursday 22 Oct)
// has no daily check-in tracked yet.
export const DAILY_CHECKIN_COLUMN_BY_DATE: Record<string, "daily_checkin_1" | "daily_checkin_2"> = {
  "2026-10-20": "daily_checkin_1",
  "2026-10-21": "daily_checkin_2",
};

export type DailyCheckinColumn = "daily_checkin_1" | "daily_checkin_2";

export function dailyCheckinColumnForDate(date: string): DailyCheckinColumn | null {
  return DAILY_CHECKIN_COLUMN_BY_DATE[date] ?? null;
}
