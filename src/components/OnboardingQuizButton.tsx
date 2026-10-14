"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSavedToken } from "@/lib/clientToken";
import { getVolunteerByToken } from "@/lib/volunteers";

// Shown only once we've positively confirmed (via the saved device token)
// that this viewer has an onboarding quiz still to take — defaults to
// hidden so there's no flash of an incorrect state while that check runs.
export function OnboardingQuizButton() {
  const token = useSavedToken();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    getVolunteerByToken(token).then((volunteer) => {
      if (!cancelled && volunteer && !volunteer.quizCompleted) {
        setShowButton(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!showButton || !token) return null;

  return (
    <Link
      href={`/shift/${encodeURIComponent(token)}?academy=open`}
      className="mt-6 block w-full rounded-full bg-gradient-to-b from-[#2F5BFF] to-[#1137EA] border border-white/25 shadow-[0_0_28px_-8px_#1141E9] py-3 text-center text-sm font-semibold text-white transition-transform hover:brightness-110 active:scale-[0.99]"
    >
      Ready for the mini-quiz
    </Link>
  );
}
