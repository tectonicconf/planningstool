import { getAdminTables } from "@/lib/adminData";
import { getMailShifts, getMailVolunteers } from "@/lib/adminMail";
import { MailBoard } from "@/components/admin/MailBoard";

export default async function AdminMailPage() {
  const data = await getAdminTables();
  const [shifts, volunteers] = await Promise.all([
    getMailShifts(data),
    getMailVolunteers(data),
  ]);

  return <MailBoard shifts={shifts} volunteers={volunteers} />;
}
