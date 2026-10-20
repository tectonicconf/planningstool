import { getAdminTables } from "@/lib/adminData";
import { getPlanningShifts } from "@/lib/adminPlanning";
import { CheckInBoard } from "@/components/admin/CheckInBoard";

export default async function AdminCheckInPage() {
  const data = await getAdminTables();
  const shifts = await getPlanningShifts(data);

  return <CheckInBoard initialShifts={shifts} />;
}
