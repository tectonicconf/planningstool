"use client";

import { useEffect, useState } from "react";
import { respondToAssignment } from "@/lib/assignments";
import type { Shift } from "@/lib/shifts";
import { ShiftCard } from "@/components/ShiftCard";
import { ShiftDetail } from "@/components/ShiftDetail";
import { Modal } from "@/components/Modal";
import { saveToken } from "@/lib/clientToken";
import { AcademyGateCard, type AcademyProgress } from "@/components/AcademyGateCard";
import { AcademyFlow } from "@/components/AcademyFlow";

export function ShiftDashboard({
  token,
  firstName,
  initialShifts,
  initialQuizCompleted,
}: {
  token: string;
  firstName: string;
  initialShifts: Shift[];
  initialQuizCompleted: boolean;
}) {
  // This component only ever renders after the server has confirmed the
  // token belongs to a real volunteer, so it's safe to remember it here —
  // the home page and nav bar use this to skip the login form next time.
  useEffect(() => {
    saveToken(token);
  }, [token]);

  const [shifts, setShifts] = useState(initialShifts);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [detailTarget, setDetailTarget] = useState<Shift | null>(null);
  const [declineTarget, setDeclineTarget] = useState<Shift | null>(null);
  const [feedback, setFeedback] = useState<
    "accepted" | "declined" | "cancelled" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  // Gating: a volunteer must pass the onboarding quiz once before their
  // shifts are shown. Only the final pass/fail is persisted (the `quiz`
  // column on volunteers) — progress through the welcome/info steps below
  // is kept in memory only, so it resets if the page is reloaded mid-flow.
  const [quizCompleted, setQuizCompleted] = useState(initialQuizCompleted);
  const [academyProgress, setAcademyProgress] =
    useState<AcademyProgress>("not-started");
  const [academyOpen, setAcademyOpen] = useState(false);

  const totalHours = shifts.reduce((sum, shift) => sum + shift.hours, 0);

  async function handleAccept(shift: Shift) {
    setError(null);
    setUpdatingId(shift.assignmentId);

    const result = await respondToAssignment(
      token,
      shift.assignmentId,
      "accept",
    );

    setUpdatingId(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setShifts((current) =>
      current.map((item) =>
        item.assignmentId === shift.assignmentId
          ? { ...item, status: "confirmed" }
          : item,
      ),
    );
    setDetailTarget((current) =>
      current?.assignmentId === shift.assignmentId ? null : current,
    );
    setFeedback("accepted");
  }

  async function handleDeclineConfirm() {
    if (!declineTarget) return;

    const wasConfirmed = declineTarget.status === "confirmed";

    setError(null);
    setUpdatingId(declineTarget.assignmentId);

    const result = await respondToAssignment(
      token,
      declineTarget.assignmentId,
      "decline",
    );

    setUpdatingId(null);

    if (!result.ok) {
      setError(result.error);
      setDeclineTarget(null);
      return;
    }

    setShifts((current) =>
      current.filter(
        (item) => item.assignmentId !== declineTarget.assignmentId,
      ),
    );
    setDetailTarget((current) =>
      current?.assignmentId === declineTarget.assignmentId ? null : current,
    );
    setDeclineTarget(null);
    setFeedback(wasConfirmed ? "cancelled" : "declined");
  }

  return (
    <div className="min-h-screen bg-[#050822] px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Hi {firstName} 👋</h1>
        <p className="mt-2 text-blue-100/70">
          Here&apos;s your current schedule and important info.
        </p>

        {!quizCompleted && (
          <div className="mt-8">
            <AcademyGateCard
              progress={academyProgress}
              onStart={() => setAcademyOpen(true)}
            />
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your shifts</h2>
          <span className="text-sm text-blue-100/70">
            {shifts.length} shift{shifts.length === 1 ? "" : "s"} ·{" "}
            {totalHours} hours
          </span>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        {quizCompleted ? (
          <div className="mt-4 flex flex-col gap-4">
            {shifts.length === 0 ? (
              <p className="text-blue-100/70">No shifts assigned yet.</p>
            ) : (
              shifts.map((shift) => (
                <ShiftCard
                  key={shift.assignmentId}
                  shift={shift}
                  isUpdating={updatingId === shift.assignmentId}
                  onAccept={() => handleAccept(shift)}
                  onDecline={() => setDeclineTarget(shift)}
                  onOpenDetail={() => setDetailTarget(shift)}
                />
              ))
            )}
          </div>
        ) : shifts.length === 0 ? (
          <p className="mt-4 text-blue-100/70">
            No shifts planned for you yet.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {Array.from({ length: shifts.length }, (_, index) => (
              <div
                key={index}
                className="relative rounded-2xl border border-blue-400/20 bg-blue-950/20 p-5"
              >
                <div className="h-4 w-2/3 rounded-full bg-blue-100/10" />
                <div className="mt-2 h-3 w-1/2 rounded-full bg-blue-100/10" />
                <span className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full bg-blue-950/60 text-blue-200/50">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                </span>
              </div>
            ))}
            <p className="text-center text-sm text-blue-200/50">
              Unlocks after onboarding
            </p>
          </div>
        )}
      </div>

      {academyOpen && (
        <AcademyFlow
          token={token}
          initialStep={
            academyProgress === "info-done"
              ? "quiz"
              : academyProgress === "info-in-progress"
                ? "info"
                : "welcome"
          }
          onReachInfo={() => setAcademyProgress("info-in-progress")}
          onReachQuiz={() => setAcademyProgress("info-done")}
          onComplete={() => {
            setQuizCompleted(true);
            setAcademyOpen(false);
          }}
          onClose={() => setAcademyOpen(false)}
        />
      )}

      {quizCompleted && detailTarget && (
        <ShiftDetail
          shift={detailTarget}
          isUpdating={updatingId === detailTarget.assignmentId}
          onAccept={() => handleAccept(detailTarget)}
          onDecline={() => setDeclineTarget(detailTarget)}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {declineTarget && (
        <Modal onClose={() => setDeclineTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-blue-400/20 bg-[#0a0f35] p-6 text-white shadow-xl">
            <h3 className="text-xl font-bold">Sad to see you go 😢</h3>
            <p className="mt-2 text-sm text-blue-100/70">
              {declineTarget.status === "confirmed"
                ? "Are you sure you want to cancel this shift? We'll look for someone to cover it instead."
                : "Are you sure you want to decline this shift? We'll look for someone to cover it instead."}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeclineTarget(null)}
                className="flex-1 rounded-full border border-blue-400/40 py-2 text-sm font-semibold text-blue-100 hover:border-blue-300/70"
              >
                Back
              </button>
              <button
                type="button"
                disabled={updatingId === declineTarget.assignmentId}
                onClick={handleDeclineConfirm}
                className="flex-1 rounded-full bg-red-500/80 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
              >
                {declineTarget.status === "confirmed"
                  ? "Yes, cancel"
                  : "Yes, decline"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {feedback && (
        <Modal onClose={() => setFeedback(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-blue-400/20 bg-[#0a0f35] p-6 text-white shadow-xl">
            {feedback === "accepted" ? (
              <>
                <h3 className="text-xl font-bold">
                  You&apos;re confirmed! 🎉
                </h3>
                <p className="mt-2 text-sm text-blue-100/70">
                  Thanks for confirming — we&apos;ll see you at Tectonic
                  2026.
                </p>
              </>
            ) : feedback === "cancelled" ? (
              <>
                <h3 className="text-xl font-bold">Shift cancelled</h3>
                <p className="mt-2 text-sm text-blue-100/70">
                  No worries — thanks for letting us know in time.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold">Shift declined</h3>
                <p className="mt-2 text-sm text-blue-100/70">
                  No worries — thanks for letting us know in time.
                </p>
              </>
            )}
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="mt-6 w-full rounded-full bg-gradient-to-b from-blue-500 to-blue-700 py-2 text-sm font-semibold text-white hover:brightness-110"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
