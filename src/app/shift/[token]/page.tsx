import { notFound } from "next/navigation";
import { getVolunteerByToken } from "@/lib/volunteers";
import { getShiftsForToken } from "@/lib/shifts";
import { ShiftCard } from "@/components/ShiftCard";

export default async function ShiftPage(props: PageProps<"/shift/[token]">) {
  const { token } = await props.params;
  const volunteer = await getVolunteerByToken(token);

  if (!volunteer) {
    notFound();
  }

  const shifts = await getShiftsForToken(token);

  return (
    <div className="min-h-screen bg-[#050822] px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">
          Hi {volunteer.firstName} {volunteer.lastName}
        </h1>
        <div className="mt-8 flex flex-col gap-4">
          {shifts.length === 0 ? (
            <p className="text-blue-100/70">No shifts assigned yet.</p>
          ) : (
            shifts.map((shift) => <ShiftCard key={shift.id} shift={shift} />)
          )}
        </div>
      </div>
    </div>
  );
}
