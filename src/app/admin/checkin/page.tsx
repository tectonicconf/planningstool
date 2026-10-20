import { getAdminTables } from "@/lib/adminData";
import { getPlanningShifts } from "@/lib/adminPlanning";
import { CheckInBoard, type DailyCheckinState } from "@/components/admin/CheckInBoard";

export default async function AdminCheckInPage() {
  const data = await getAdminTables();
  const shifts = await getPlanningShifts(data);

  const dailyCheckins: Record<string, DailyCheckinState> = {};
  for (const v of data.volunteerRows) {
    dailyCheckins[v.id] = {
      daily1: v.daily_checkin_1 ?? false,
      daily2: v.daily_checkin_2 ?? false,
    };
  }

  return <CheckInBoard initialShifts={shifts} initialDailyCheckins={dailyCheckins} />;
}
