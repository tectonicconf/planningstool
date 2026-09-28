"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ACADEMY_EVENT_INFO,
  GUIDE_SECTIONS,
  QUIZ_QUESTIONS,
  PASS_THRESHOLD,
} from "@/lib/academyContent";
import { setAcademyStatus } from "@/lib/academyProgress";

type Step = "welcome" | "guide" | "quiz" | "results";

const TOTAL_STEPS = 3;

function EventInfoIcon({ icon }: { icon: "calendar" | "pin" | "person" }) {
  const glyph = icon === "calendar" ? "📅" : icon === "pin" ? "📍" : "👤";
  return (
    <span className="text-lg" aria-hidden="true">
      {glyph}
    </span>
  );
}

export function AcademyOnboarding({
  token,
  firstName,
}: {
  token: string;
  firstName: string;
}) {
  const [step, setStep] = useState<Step>("welcome");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    QUIZ_QUESTIONS.map(() => null),
  );
  const [lastScore, setLastScore] = useState<number | null>(null);

  const stepNumber = step === "welcome" ? 1 : step === "guide" ? 2 : 3;
  const currentAnswer = answers[questionIndex];
  const canAdvance = currentAnswer !== null;
  const passed = lastScore !== null && lastScore >= PASS_THRESHOLD;

  function selectAnswer(index: number) {
    setAnswers((current) => {
      const next = [...current];
      next[questionIndex] = index;
      return next;
    });
  }

  function goToNextQuestion() {
    if (questionIndex < QUIZ_QUESTIONS.length - 1) {
      setQuestionIndex((i) => i + 1);
      return;
    }
    const score = answers.reduce(
      (sum: number, answer, i) =>
        sum + (answer === QUIZ_QUESTIONS[i].correctIndex ? 1 : 0),
      0,
    );
    setLastScore(score);
    setAcademyStatus(token, score >= PASS_THRESHOLD ? "completed" : "quiz_failed");
    setStep("results");
  }

  function retakeQuiz() {
    setAnswers(QUIZ_QUESTIONS.map(() => null));
    setQuestionIndex(0);
    setLastScore(null);
    setStep("quiz");
  }

  return (
    <div className="min-h-screen bg-[#050822] px-6 py-12 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col">
        {step !== "results" && (
          <div className="mb-8">
            <div className="flex gap-1.5">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i < stepNumber ? "bg-blue-400" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <p className="mt-3 text-xs font-semibold tracking-wide text-blue-200/60">
              STEP {stepNumber} OF {TOTAL_STEPS}
              {step === "quiz"
                ? ` · QUESTION ${questionIndex + 1} OF ${QUIZ_QUESTIONS.length}`
                : ""}
            </p>
          </div>
        )}

        {step === "welcome" && (
          <>
            <h1 className="text-2xl font-bold">Welcome to Tectonic, {firstName}</h1>
            <p className="mt-2 text-sm text-blue-100/70">
              Before you can see your shifts, let&apos;s quickly go through where,
              when and who you&apos;ll be working with during the festival.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {ACADEMY_EVENT_INFO.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-blue-400/20 bg-[#0a0f35] px-4 py-3"
                >
                  <EventInfoIcon icon={item.icon} />
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-blue-100/60">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep("guide")}
              className="mt-8 w-full rounded-full bg-gradient-to-b from-blue-500 to-blue-700 py-4 font-semibold text-white shadow-lg shadow-blue-900/40 hover:brightness-110 active:scale-[0.99]"
            >
              Start onboarding
            </button>
          </>
        )}

        {step === "guide" && (
          <>
            <h1 className="text-2xl font-bold">Onboarding information</h1>
            <p className="mt-2 text-sm text-blue-100/70">
              A few minutes on how the event works and what we expect on shift.
            </p>
            <div className="mt-6 flex flex-col gap-6">
              {GUIDE_SECTIONS.map((section) => (
                <div key={section.title}>
                  <h2 className="text-sm font-semibold text-cyan-300">
                    {section.title}
                  </h2>
                  {section.body && (
                    <p className="mt-2 text-sm leading-relaxed text-blue-100/70">
                      {section.body}
                    </p>
                  )}
                  {section.bullets && (
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {section.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex gap-2 text-sm text-blue-100/70"
                        >
                          <span className="text-cyan-300">·</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setAcademyStatus(token, "guide_done");
                setStep("quiz");
              }}
              className="mt-8 w-full rounded-full bg-gradient-to-b from-blue-500 to-blue-700 py-4 font-semibold text-white shadow-lg shadow-blue-900/40 hover:brightness-110 active:scale-[0.99]"
            >
              Start the mini-quiz
            </button>
            <p className="mt-3 text-center text-xs text-blue-100/50">
              {QUIZ_QUESTIONS.length} short questions · about 1 minute
            </p>
          </>
        )}

        {step === "quiz" && (
          <>
            <h1 className="text-2xl font-bold">Quick check</h1>
            <p className="mt-2 text-sm text-blue-100/70">
              Just {QUIZ_QUESTIONS.length} short questions to confirm you&apos;re
              ready.
            </p>
            <div className="mt-6">
              <p className="text-sm font-semibold text-white">
                {QUIZ_QUESTIONS[questionIndex].question}
              </p>
              <div className="mt-4 flex flex-col gap-2.5">
                {QUIZ_QUESTIONS[questionIndex].options.map((option, index) => {
                  const selected = currentAnswer === index;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectAnswer(index)}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                        selected
                          ? "border-blue-400 bg-blue-500/10 text-white"
                          : "border-blue-400/20 bg-[#0a0f35] text-blue-100/80 hover:border-blue-400/40"
                      }`}
                    >
                      <span>{option}</span>
                      <span
                        className={`ml-3 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                          selected
                            ? "border-blue-400 bg-blue-400"
                            : "border-blue-400/40"
                        }`}
                      >
                        {selected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#050822]" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              disabled={!canAdvance}
              onClick={goToNextQuestion}
              className="mt-8 w-full rounded-full bg-gradient-to-b from-blue-500 to-blue-700 py-4 font-semibold text-white shadow-lg shadow-blue-900/40 hover:brightness-110 active:scale-[0.99] disabled:opacity-40"
            >
              {questionIndex < QUIZ_QUESTIONS.length - 1 ? "Next" : "Check answers"}
            </button>
          </>
        )}

        {step === "results" && lastScore !== null && (
          <div className="flex flex-col items-center text-center">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full border-2 text-xl font-bold ${
                passed
                  ? "border-blue-400 text-blue-300"
                  : "border-amber-400 text-amber-300"
              }`}
            >
              {lastScore}/{QUIZ_QUESTIONS.length}
            </div>
            <h1 className="mt-4 text-2xl font-bold">
              {passed ? "Nice work!" : "Let's try that again"}
            </h1>
            <p className="mt-2 text-sm text-blue-100/70">
              {passed
                ? "You passed — here's a quick look at the correct answers."
                : `You need at least ${PASS_THRESHOLD} out of ${QUIZ_QUESTIONS.length} correct to pass. No worries, you can retake it right away.`}
            </p>

            {passed ? (
              <div className="mt-6 flex w-full flex-col gap-2.5 text-left">
                {QUIZ_QUESTIONS.map((question, index) => {
                  const answerIndex = answers[index];
                  const correct = answerIndex === question.correctIndex;
                  return (
                    <div
                      key={question.id}
                      className="rounded-xl border border-blue-400/20 bg-[#0a0f35] px-4 py-3"
                    >
                      <div className="flex items-start gap-2 text-sm font-semibold text-white">
                        <span
                          className={correct ? "text-emerald-400" : "text-red-400"}
                        >
                          {correct ? "✓" : "✗"}
                        </span>
                        <span>{question.question}</span>
                      </div>
                      {!correct && answerIndex !== null && (
                        <p className="mt-1 pl-6 text-xs text-blue-100/60">
                          Your answer: {question.options[answerIndex]}
                          <br />
                          Correct: {question.options[question.correctIndex]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 flex w-full flex-col gap-2.5 text-left">
                {QUIZ_QUESTIONS.map((question, index) => {
                  const correct = answers[index] === question.correctIndex;
                  return (
                    <div
                      key={question.id}
                      className="flex items-center justify-between rounded-xl border border-blue-400/20 bg-[#0a0f35] px-4 py-3 text-sm text-white"
                    >
                      <span>Question {index + 1}</span>
                      <span
                        className={correct ? "text-emerald-400" : "text-red-400"}
                      >
                        {correct ? "✓ correct" : "✗ incorrect"}
                      </span>
                    </div>
                  );
                })}
                <p className="mt-1 text-center text-xs text-blue-100/40">
                  Correct answers aren&apos;t shown so the retake stays meaningful.
                </p>
              </div>
            )}

            {passed ? (
              <Link
                href={`/shift/${encodeURIComponent(token)}`}
                className="mt-8 w-full rounded-full bg-gradient-to-b from-blue-500 to-blue-700 py-4 text-center font-semibold text-white shadow-lg shadow-blue-900/40 hover:brightness-110 active:scale-[0.99]"
              >
                Continue to shifts →
              </Link>
            ) : (
              <button
                type="button"
                onClick={retakeQuiz}
                className="mt-8 w-full rounded-full bg-gradient-to-b from-blue-500 to-blue-700 py-4 font-semibold text-white shadow-lg shadow-blue-900/40 hover:brightness-110 active:scale-[0.99]"
              >
                Retake quiz →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
