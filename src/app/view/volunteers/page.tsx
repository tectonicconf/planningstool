import { getAdminTables } from "@/lib/adminData";
import { getVolunteersWithAssignments } from "@/lib/adminVolunteers";
import { getShiftDirectory } from "@/lib/adminPlanning";
import { VolunteersBoard } from "@/components/admin/VolunteersBoard";

export default async function ViewVolunteersPage(
  props: PageProps<"/view/volunteers">,
) {
  const searchParams = await props.searchParams;
  const searchParam = searchParams.search;
  const initialSearch = typeof searchParam === "string" ? searchParam : "";

  const data = await getAdminTables();
  const [volunteers, shiftDirectory] = await Promise.all([
    getVolunteersWithAssignments(data),
    getShiftDirectory(data),
  ]);

  return (
    <VolunteersBoard
      initialVolunteers={volunteers}
      shiftDirectory={shiftDirectory}
      initialSearch={initialSearch}
      readOnly
    />
  );
}
