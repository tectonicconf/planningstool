import { getAdminTables } from "@/lib/adminData";
import { getPlanningShifts } from "@/lib/adminPlanning";
import { getVolunteersWithAssignments } from "@/lib/adminVolunteers";
import { TimelineBoard } from "@/components/admin/TimelineBoard";

export default async function ViewTimelinePage() {
  const data = await getAdminTables();
  const [shifts, volunteers] = await Promise.all([
    getPlanningShifts(data),
    getVolunteersWithAssignments(data),
  ]);

  return <TimelineBoard initialShifts={shifts} volunteers={volunteers} readOnly />;
}
