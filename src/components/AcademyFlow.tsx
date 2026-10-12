"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GOOD_TO_KNOW_ITEMS,
  HOW_IT_WORKS_STEPS,
  QUIZ_MIN_CORRECT,
  QUIZ_QUESTIONS,
} from "@/data/onboardingQuiz";
import { completeOnboardingQuiz } from "@/lib/onboardingQuiz";

type FlowStep = "welcome" | "quiz" | "results";

const STEP_NUMBER: Record<Exclude<FlowStep, "results">, number> = {
  welcome: 1,
  quiz: 2,
};
const TOTAL_STEPS = 2;

function StepDots({ step }: { step: FlowStep }) {
  const current = step === "results" ? TOTAL_STEPS : STEP_NUMBER[step];

  return (
    <div className="flex gap-1.5">
      {Array.from({ length: TOTAL_STEPS }, (_, index) => (
        <div
          key={index}
          className={`h-1 flex-1 rounded-full ${
            index < current ? "bg-blue-400" : "bg-blue-950/60"
          }`}
        />
      ))}
    </div>
  );
}

function CheckCircleIcon({ ok }: { ok: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
        ok ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
      }`}
      aria-hidden="true"
    >
      {ok ? "✓" : "✕"}
    </span>
  );
}

export function AcademyFlow({
  token,
  initialStep = "welcome",
  onReachQuiz,
  onComplete,
  onClose,
}: {
  token: string;
  initialStep?: "welcome" | "quiz";
  onReachQuiz: () => void;
  onComplete: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<FlowStep>(initialStep);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => QUIZ_QUESTIONS.map(() => null),
  );
  const [score, setScore] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passed = score >= QUIZ_MIN_CORRECT;
  const allAnswered = answers.every((answer) => answer !== null);

  function handleCheckAnswers() {
    const correctCount = answers.reduce<number>(
      (count, answer, index) =>
        answer === QUIZ_QUESTIONS[index].correctIndex ? count + 1 : count,
      0,
    );
    setScore(correctCount);
    setStep("results");
  }

  function handleRetake() {
    setAnswers(QUIZ_QUESTIONS.map(() => null));
    setScore(0);
    setStep("quiz");
  }

  async function handleContinueToShifts() {
    setError(null);
    setCompleting(true);
    const result = await completeOnboardingQuiz(token);
    setCompleting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onComplete();
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-[#050822] text-white">
      <div className="mx-auto w-full max-w-2xl px-6 pt-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back to shifts"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/15"
          >
            <span aria-hidden="true">&larr;</span>
          </button>
          {step !== "results" && <StepDots step={step} />}
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl flex-1 px-6 pb-16 pt-6">
        {step === "welcome" && (
          <>
            <p className="font-mono text-xs tracking-[0.2em] text-blue-200/60">
              STEP 1 OF {TOTAL_STEPS}
            </p>
            <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold">
              Welcome to
              <img src="/logo.png" alt="Tectonic" className="h-7 w-auto" />
            </h1>
            <p className="mt-2 text-sm text-blue-100/70">
              Before you can view your shifts, you first have to go through
              onboarding.
            </p>

            <div className="mt-6 rounded-xl border border-blue-400/20 bg-blue-950/30 p-4">
              <p className="text-sm font-semibold">How it works</p>
              <ol className="mt-2 flex flex-col gap-1.5 text-sm text-blue-100/70">
                {HOW_IT_WORKS_STEPS.map((text, index) => (
                  <li key={text} className="flex gap-2">
                    <span className="text-blue-300/70">{index + 1}.</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-3 rounded-xl border border-blue-400/20 bg-blue-950/20 p-4">
              <p className="text-sm text-white">
                Make sure you carefully read the onboarding.
              </p>
              <Link
                href="/onboarding"
                className="mt-3 inline-flex items-center gap-1 rounded-full border border-cyan-400/60 px-4 py-2 text-sm font-semibold text-cyan-300 transition-colors hover:border-cyan-300 hover:text-cyan-200"
              >
                Go to Onboarding
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>

            <div className="mt-3 rounded-xl border-2 border-blue-400/40 p-4">
              <p className="font-mono text-xs font-semibold tracking-[0.2em] text-blue-300/70">
                GOOD TO KNOW
              </p>
              <ul className="mt-2 flex flex-col gap-2 text-sm text-blue-100/70">
                {GOOD_TO_KNOW_ITEMS.map((text) => (
                  <li key={text} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-300/70" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                onReachQuiz();
                setStep("quiz");
              }}
              className="mt-6 w-full rounded-full bg-gradient-to-b from-blue-500 to-blue-700 py-3 text-sm font-semibold text-white transition-transform hover:brightness-110 active:scale-[0.99]"
            >
              I&apos;ve read the onboarding. Ready for the mini-quiz
            </button>
            <p className="mt-3 text-center text-xs text-blue-200/50">
              {QUIZ_QUESTIONS.length} short questions · about 1 minute
            </p>
          </>
        )}

        {step === "quiz" && (
          <>
            <p className="font-mono text-xs tracking-[0.2em] text-blue-200/60">
              STEP 2 OF {TOTAL_STEPS} · QUICK CHECK
            </p>
            <h1 className="mt-2 text-2xl font-bold">Quick check</h1>
            <p className="mt-2 text-sm text-blue-100/70">
              Just {QUIZ_QUESTIONS.length} short questions to confirm you&apos;re
              ready.
            </p>

            <div className="mt-6 flex flex-col gap-6">
              {QUIZ_QUESTIONS.map((q, qIndex) => (
                <div key={q.id}>
                  <p className="text-sm font-semibold">{q.question}</p>
                  <div className="mt-2 flex flex-col gap-2">
                    {q.options.map((option, optionIndex) => {
                      const selected = answers[qIndex] === optionIndex;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setAnswers((current) =>
                              current.map((value, i) =>
                                i === qIndex ? optionIndex : value,
                              ),
                            )
                          }
                          className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                            selected
                              ? "border-blue-300/70 bg-blue-900/40 text-white"
                              : "border-blue-400/20 bg-blue-950/20 text-blue-100/80 hover:border-blue-300/40"
                          }`}
                        >
                          <span>{option}</span>
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              selected
                                ? "border-blue-300 bg-blue-400 text-[#050822]"
                                : "border-blue-400/40"
                            }`}
                            aria-hidden="true"
                          >
                            {selected ? "✓" : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              disabled={!allAnswered}
              onClick={handleCheckAnswers}
              className="mt-8 w-full rounded-full bg-gradient-to-b from-blue-500 to-blue-700 py-3 text-sm font-semibold text-white transition-transform hover:brightness-110 active:scale-[0.99] disabled:opacity-40"
            >
              Check answers
            </button>
          </>
        )}

        {step === "results" && (
          <div className="flex flex-col items-center text-center">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full border-4 text-xl font-bold ${
                passed
                  ? "border-blue-400 text-blue-200"
                  : "border-amber-400 text-amber-300"
              }`}
            >
              {score}/{QUIZ_QUESTIONS.length}
            </div>

            <h1 className="mt-4 text-2xl font-bold">
              {passed ? "Nice work!" : "Let's try that again"}
            </h1>
            <p className="mt-2 max-w-sm text-sm text-blue-100/70">
              {passed
                ? "You passed — here's a quick look at the correct answers."
                : `You need at least ${QUIZ_MIN_CORRECT} out of ${QUIZ_QUESTIONS.length} correct to pass. No worries, you can retake it right away.`}
            </p>

            <div className="mt-6 flex w-full flex-col gap-3 text-left">
              {!passed && (
                <p className="font-mono text-xs tracking-[0.2em] text-blue-200/50">
                  YOUR RESULTS
                </p>
              )}
              {QUIZ_QUESTIONS.map((q, index) => {
                const isCorrect = answers[index] === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="rounded-xl border border-blue-400/20 bg-blue-950/20 p-4"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon ok={isCorrect} />
                      {passed ? (
                        <div>
                          <p className="text-sm font-semibold">{q.question}</p>
                          {isCorrect ? (
                            <p className="mt-1 text-sm text-green-200/80">
                              {q.options[q.correctIndex]}
                            </p>
                          ) : (
                            <div className="mt-1 space-y-1 text-sm">
                              <p className="text-red-200/80">
                                Your answer:{" "}
                                {answers[index] !== null
                                  ? q.options[answers[index] as number]
                                  : "—"}
                              </p>
                              <p className="text-green-200/80">
                                Correct: {q.options[q.correctIndex]}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm">
                          Question {index + 1} —{" "}
                          {isCorrect ? "correct" : "incorrect"}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              {!passed && (
                <p className="text-xs text-blue-200/50">
                  Correct answers aren&apos;t shown so the retake stays
                  meaningful.
                </p>
              )}
            </div>

            {error && (
              <p className="mt-4 w-full rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={completing}
              onClick={passed ? handleContinueToShifts : handleRetake}
              className="mt-6 w-full rounded-full bg-gradient-to-b from-blue-500 to-blue-700 py-3 text-sm font-semibold text-white transition-transform hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
            >
              {passed
                ? completing
                  ? "Saving..."
                  : "Continue to shifts →"
                : "Retake quiz →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
