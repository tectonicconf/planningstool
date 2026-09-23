"use client";

import { useState } from "react";
import { respondToAssignment } from "@/lib/assignments";
import type { Shift } from "@/lib/shifts";
import { ShiftCard } from "@/components/ShiftCard";

function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-blue-400/20 bg-[#0a0f35] p-6 text-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function ShiftDashboard({
  token,
  firstName,
  initialShifts,
}: {
  token: string;
  firstName: string;
  initialShifts: Shift[];
}) {
  const [shifts, setShifts] = useState(initialShifts);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [declineTarget, setDeclineTarget] = useState<Shift | null>(null);
  const [feedback, setFeedback] = useState<"accepted" | "declined" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

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
    setFeedback("accepted");
  }

  async function handleDeclineConfirm() {
    if (!declineTarget) return;

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
    setDeclineTarget(null);
    setFeedback("declined");
  }

  return (
    <div className="min-h-screen bg-[#050822] px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Hi {firstName} 👋</h1>
        <p className="mt-2 text-blue-100/70">
          Here&apos;s your current schedule and important info.
        </p>

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
              />
            ))
          )}
        </div>
      </div>

      {declineTarget && (
        <Modal onClose={() => setDeclineTarget(null)}>
          <h3 className="text-xl font-bold">Sad to see you go 😢</h3>
          <p className="mt-2 text-sm text-blue-100/70">
            Are you sure you want to decline this shift? We&apos;ll look for
            someone to cover it instead.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setDeclineTarget(null)}
              className="flex-1 rounded-full border border-blue-400/40 py-2 text-sm font-semibold text-blue-100 hover:border-blue-300/70"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={updatingId === declineTarget.assignmentId}
              onClick={handleDeclineConfirm}
              className="flex-1 rounded-full bg-red-500/80 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
            >
              Yes, decline
            </button>
          </div>
        </Modal>
      )}

      {feedback && (
        <Modal onClose={() => setFeedback(null)}>
          {feedback === "accepted" ? (
            <>
              <h3 className="text-xl font-bold">You&apos;re confirmed! 🎉</h3>
              <p className="mt-2 text-sm text-blue-100/70">
                Thanks for confirming — we&apos;ll see you at Tectonic 2026.
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
        </Modal>
      )}
    </div>
  );
}
