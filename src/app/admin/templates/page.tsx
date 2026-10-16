import { getAdminTables } from "@/lib/adminData";
import { getTemplateGroups } from "@/lib/adminPlanning";
import { getVolunteersWithAssignments } from "@/lib/adminVolunteers";
import { TemplatesBoard } from "@/components/admin/TemplatesBoard";

export default async function AdminTemplatesPage() {
  const data = await getAdminTables();
  const [groups, volunteers] = await Promise.all([
    getTemplateGroups(data),
    getVolunteersWithAssignments(data),
  ]);

  return <TemplatesBoard initialGroups={groups} volunteers={volunteers} />;
}
