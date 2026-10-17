import { getAdminTables } from "@/lib/adminData";
import { getPlanningShifts } from "@/lib/adminPlanning";
import { ShiftsBoard } from "@/components/admin/ShiftsBoard";

export default async function AdminShiftsPage() {
  const data = await getAdminTables();
  const shifts = await getPlanningShifts(data);

  return <ShiftsBoard initialShifts={shifts} />;
}
