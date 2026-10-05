import { notFound } from "next/navigation";
import { getVolunteerByToken } from "@/lib/volunteers";
import { getShiftsForVolunteer } from "@/lib/shifts";
import { ShiftDashboard } from "@/components/ShiftDashboard";

export default async function ShiftPage(props: PageProps<"/shift/[token]">) {
  const { token } = await props.params;
  const volunteer = await getVolunteerByToken(token);

  if (!volunteer) {
    notFound();
  }

  const shifts = await getShiftsForVolunteer(volunteer.id);

  return (
    <ShiftDashboard
      token={token}
      firstName={volunteer.firstName}
      initialShifts={shifts}
      initialQuizCompleted={volunteer.quizCompleted}
    />
  );
}
