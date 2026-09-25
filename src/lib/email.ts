import { Resend } from "resend";
import type { Shift } from "@/lib/shifts";

const resend = new Resend(process.env.RESEND_API_KEY);

// Must match a domain verified in the Resend dashboard.
// temp email untill domain is verified:
const FROM_ADDRESS = "Tectonic 2026 <onboarding@resend.dev>";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

function formatShiftLine(shift: Shift) {
  const date = new Date(`${shift.date}T00:00:00`).toLocaleDateString(
    "en-GB",
    { weekday: "short", day: "numeric", month: "short" },
  );

  return `${date}, ${shift.startTime}–${shift.endTime} · ${shift.location} · ${shift.shiftType}`;
}

export async function sendConfirmationEmail({
  to,
  firstName,
  token,
  confirmedShift,
  allConfirmedShifts,
}: {
  to: string;
  firstName: string;
  token: string;
  confirmedShift: Shift;
  allConfirmedShifts: Shift[];
}) {
  const personalLink = `${SITE_URL}/shift/${token}`;

  const otherShifts = allConfirmedShifts.filter(
    (shift) => shift.assignmentId !== confirmedShift.assignmentId,
  );

  const text = [
    `Hi ${firstName},`,
    "",
    "You're confirmed for the following shift:",
    formatShiftLine(confirmedShift),
    "",
    ...(otherShifts.length > 0
      ? [
          "Your other confirmed shifts:",
          ...otherShifts.map(formatShiftLine),
          "",
        ]
      : []),
    `View your full schedule: ${personalLink}`,
    "",
    "Thanks for volunteering at Tectonic 2026!",
  ].join("\n");

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "You're confirmed for your Tectonic 2026 shift",
    text,
  });

  if (error) {
    throw new Error(error.message);
  }
}
