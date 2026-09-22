import { VolunteerTable } from "@/components/VolunteerTable";

export default function AdminVolunteersPage() {
  return (
    <div className="min-h-screen bg-[#050822] px-6 py-12 text-white">
      <h1 className="text-3xl font-bold">Volunteers</h1>
      <div className="mt-8">
        <VolunteerTable volunteers={[]} />
      </div>
    </div>
  );
}
