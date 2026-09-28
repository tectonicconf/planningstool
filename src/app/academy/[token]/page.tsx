import { notFound } from "next/navigation";
import { getVolunteerByToken } from "@/lib/volunteers";
import { AcademyOnboarding } from "@/components/academy/AcademyOnboarding";

export default async function AcademyPage(props: PageProps<"/academy/[token]">) {
  const { token } = await props.params;
  const volunteer = await getVolunteerByToken(token);

  if (!volunteer) {
    notFound();
  }

  return <AcademyOnboarding token={token} firstName={volunteer.firstName} />;
}
