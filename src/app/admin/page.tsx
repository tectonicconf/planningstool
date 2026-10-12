import { getAdminTables } from "@/lib/adminData";
import { getPlanningShifts } from "@/lib/adminPlanning";
import { getVolunteersWithAssignments } from "@/lib/adminVolunteers";
import { PlanningBoard } from "@/components/admin/PlanningBoard";

export default async function AdminPage() {
  const data = await getAdminTables();
  const [shifts, volunteers] = await Promise.all([
    getPlanningShifts(data),
    getVolunteersWithAssignments(data),
  ]);

  return <PlanningBoard initialShifts={shifts} volunteers={volunteers} />;
}
