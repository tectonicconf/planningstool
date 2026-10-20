import { notFound } from "next/navigation";
import { getVolunteerByToken } from "@/lib/volunteers";
import { getShiftsForVolunteer } from "@/lib/shifts";
import { getCancellationsEnabled } from "@/lib/appSettings";
import { ShiftDashboard } from "@/components/ShiftDashboard";

export default async function ShiftPage(props: PageProps<"/shift/[token]">) {
  const { token } = await props.params;
  const searchParams = await props.searchParams;
  const volunteer = await getVolunteerByToken(token);

  if (!volunteer) {
    notFound();
  }

  const [shifts, cancellationsEnabled] = await Promise.all([
    getShiftsForVolunteer(volunteer.id),
    getCancellationsEnabled(),
  ]);

  return (
    <ShiftDashboard
      token={token}
      firstName={volunteer.firstName}
      initialShifts={shifts}
      initialQuizCompleted={volunteer.quizCompleted}
      openAcademyFlow={searchParams.academy === "open"}
      cancellationsEnabled={cancellationsEnabled}
    />
  );
}
