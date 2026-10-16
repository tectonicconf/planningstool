import { Resend } from "resend";
import type { Shift } from "@/lib/shifts";

const resend = new Resend(process.env.RESEND_API_KEY);

// Must match a domain verified in the Resend dashboard.
// temp email untill domain is verified:
const FROM_ADDRESS = "Tectonic 2026 <noreply@volunteers.tectonicconf.eu>";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

type ShiftLineInfo = {
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  shiftType: string;
};

function formatShiftLine(shift: ShiftLineInfo) {
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
}: {
  to: string;
  firstName: string;
  token: string;
  confirmedShift: Shift;
}) {
  const personalLink = `${SITE_URL}/shift/${token}`;

  // Plain text, so a listed shift here is just a line, not the clickable
  // card the app itself renders — always pointing to the real schedule
  // (where every shift does open up) is more useful than a second,
  // non-interactive copy of the list in the email body.
  const text = [
    `Hi ${firstName},`,
    "",
    "You're confirmed for the following shift:",
    formatShiftLine(confirmedShift),
    "",
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

// For accepting every block of a template in one tap — one email listing
// all of them, instead of firing a separate confirmation per block.
export async function sendTemplateConfirmationEmail({
  to,
  firstName,
  token,
  confirmedShifts,
}: {
  to: string;
  firstName: string;
  token: string;
  confirmedShifts: Shift[];
}) {
  const personalLink = `${SITE_URL}/shift/${token}`;

  const text = [
    `Hi ${firstName},`,
    "",
    `You're confirmed for the following ${confirmedShifts.length} blocks:`,
    ...confirmedShifts.map(formatShiftLine),
    "",
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

export async function sendTemplateCancellationEmail({
  to,
  firstName,
  token,
  cancelledShifts,
}: {
  to: string;
  firstName: string;
  token: string;
  cancelledShifts: ShiftLineInfo[];
}) {
  const personalLink = `${SITE_URL}/shift/${token}`;

  const text = [
    `Hi ${firstName},`,
    "",
    `You're no longer signed up for the following ${cancelledShifts.length} blocks:`,
    ...cancelledShifts.map(formatShiftLine),
    "",
    `View your current schedule: ${personalLink}`,
    "",
    "Thanks for letting us know — see you at another shift!",
  ].join("\n");

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Your Tectonic 2026 shift was cancelled",
    text,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendCancellationEmail({
  to,
  firstName,
  token,
  cancelledShift,
}: {
  to: string;
  firstName: string;
  token: string;
  cancelledShift: ShiftLineInfo;
}) {
  const personalLink = `${SITE_URL}/shift/${token}`;

  const text = [
    `Hi ${firstName},`,
    "",
    "You're no longer signed up for the following shift:",
    formatShiftLine(cancelledShift),
    "",
    `View your current schedule: ${personalLink}`,
    "",
    "Thanks for letting us know — see you at another shift!",
  ].join("\n");

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Your Tectonic 2026 shift was cancelled",
    text,
  });

  if (error) {
    throw new Error(error.message);
  }
}
