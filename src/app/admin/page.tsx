import { getPlanningShifts } from "@/lib/adminPlanning";
import { getVolunteersWithAssignments } from "@/lib/adminVolunteers";
import { PlanningBoard } from "@/components/admin/PlanningBoard";

export default async function AdminPage() {
  const [shifts, volunteers] = await Promise.all([
    getPlanningShifts(),
    getVolunteersWithAssignments(),
  ]);

  return <PlanningBoard initialShifts={shifts} volunteers={volunteers} />;
}
