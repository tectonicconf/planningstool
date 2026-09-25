import { getVolunteersWithAssignments } from "@/lib/adminVolunteers";
import { getShiftDirectory } from "@/lib/adminPlanning";
import { VolunteersBoard } from "@/components/admin/VolunteersBoard";

export default async function AdminVolunteersPage() {
  const [volunteers, shiftDirectory] = await Promise.all([
    getVolunteersWithAssignments(),
    getShiftDirectory(),
  ]);

  return (
    <VolunteersBoard initialVolunteers={volunteers} shiftDirectory={shiftDirectory} />
  );
}
