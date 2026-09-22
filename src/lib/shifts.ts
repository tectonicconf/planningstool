export type ShiftStatus = "pending" | "confirmed";

export type Shift = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  location: string;
  shiftType: string;
  status: ShiftStatus;
};

// TODO: replace with a real Supabase query once lib/supabase.ts is wired up.
export async function getShiftsForToken(token: string): Promise<Shift[]> {
  return [];
}
