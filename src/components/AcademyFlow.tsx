"use client";

import { useEffect, useState } from "react";
import {
  ESSENTIALS,
  EVENT_FACTS,
  QUIZ_MIN_CORRECT,
  QUIZ_QUESTIONS,
  WELCOME,
  type EventFact,
  type QuizQuestion,
} from "@/data/onboardingQuiz";
import { completeOnboardingQuiz } from "@/lib/onboardingQuiz";

type FlowStep = "welcome" | "info" | "quiz" | "results";

const STEP_NUMBER: Record<Exclude<FlowStep, "results">, number> = {
  welcome: 1,
  info: 2,
  quiz: 3,
};
const TOTAL_STEPS = 3;

// The data file always lists the correct option first. Shuffle the options for
// every attempt so the answer is never in a predictable place, and remember
// where the correct one ended up.
type ShuffledQuestion = QuizQuestion & { correctPosition: number };

function shuffleQuiz(): ShuffledQuestion[] {
  return QUIZ_QUESTIONS.map((question) => {
    const order = question.options.map((_, index) => index);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return {
      ...question,
      options: order.map((index) => question.options[index]),
      correctPosition: order.indexOf(question.correctIndex),
    };
  });
}

function StepDots({ step }: { step: FlowStep }) {
  const current = step === "results" ? TOTAL_STEPS : STEP_NUMBER[step];

  return (
    <div className="flex flex-1 gap-1.5">
      {Array.from({ length: TOTAL_STEPS }, (_, index) => (
        <div
          key={index}
          className={`h-1 flex-1 rounded-full ${
            index < current ? "bg-cyan-300" : "bg-[#0D1341]/60"
          }`}
        />
      ))}
    </div>
  );
}

function FactIcon({ icon }: { icon: EventFact["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-5 w-5",
    "aria-hidden": true,
  };

  if (icon === "calendar") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </svg>
    );
  }
  if (icon === "location") {
    return (
      <svg {...common}>
        <path d="M12 21s-7-5.686-7-11a7 7 0 1 1 14 0c0 5.314-7 11-7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6" />
    </svg>
  );
}

function StatusIcon({ ok }: { ok: boolean }) {
  return (
    <span
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
        ok ? "bg-cyan-300/15 text-cyan-300" : "bg-amber-400/15 text-amber-300"
      }`}
      aria-hidden="true"
    >
      {ok ? "✓" : "!"}
    </span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
      {children}
    </p>
  );
}

const PRIMARY_BUTTON =
  "w-full rounded-full bg-gradient-to-b from-[#2F5BFF] to-[#1137EA] border border-white/25 shadow-[0_0_28px_-8px_#1141E9] py-3 text-sm font-semibold text-white transition-transform hover:brightness-110 active:scale-[0.99] disabled:opacity-40";

export function AcademyFlow({
  token,
  initialStep = "welcome",
  onReachInfo,
  onReachQuiz,
  onComplete,
  onClose,
}: {
  token: string;
  initialStep?: "welcome" | "info" | "quiz";
  onReachInfo: () => void;
  onReachQuiz: () => void;
  onComplete: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<FlowStep>(initialStep);
  // Starts unshuffled (identical on server and client) and shuffles once
  // mounted — shuffling during the lazy initializer would run again on the
  // client during hydration with a different Math.random() result than the
  // server used, which React flags as a hydration mismatch.
  const [questions, setQuestions] = useState<ShuffledQuestion[]>(() =>
    QUIZ_QUESTIONS.map((question) => ({
      ...question,
      correctPosition: question.correctIndex,
    })),
  );
  useEffect(() => {
    queueMicrotask(() => setQuestions(shuffleQuiz()));
  }, []);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    QUIZ_QUESTIONS.map(() => null),
  );
  const [score, setScore] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passed = score >= QUIZ_MIN_CORRECT;
  const answeredCount = answers.filter((answer) => answer !== null).length;
  const allAnswered = answeredCount === questions.length;
  const missed = questions.filter(
    (question, index) => answers[index] !== question.correctPosition,
  );

  function handleCheckAnswers() {
    const correctCount = answers.reduce<number>(
      (count, answer, index) =>
        answer === questions[index].correctPosition ? count + 1 : count,
      0,
    );
    setScore(correctCount);
    setStep("results");
    window.scrollTo({ top: 0 });
  }

  function handleRetake() {
    setQuestions(shuffleQuiz());
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
    <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-[#050A2B] text-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh]"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 10% 0%, rgba(17,65,233,0.38), transparent 70%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-2xl px-6 pt-8">
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

      <div className="relative mx-auto w-full max-w-2xl flex-1 px-6 pb-16 pt-8">
        {step === "welcome" && (
          <>
            <Eyebrow>STEP 1 OF {TOTAL_STEPS}</Eyebrow>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {WELCOME.title}
            </h1>
            <p className="mt-3 leading-relaxed text-white/75">
              {WELCOME.body}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {EVENT_FACTS.map((fact) => (
                <div
                  key={fact.title}
                  className="flex items-center gap-3 rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-300">
                    <FactIcon icon={fact.icon} />
                  </span>
                  <div>
                    <p className="font-semibold">{fact.title}</p>
                    <p className="mt-0.5 text-sm text-white/70">
                      {fact.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                onReachInfo();
                setStep("info");
                window.scrollTo({ top: 0 });
              }}
              className={`mt-8 ${PRIMARY_BUTTON}`}
            >
              Start
            </button>
          </>
        )}

        {step === "info" && (
          <>
            <Eyebrow>STEP 2 OF {TOTAL_STEPS}</Eyebrow>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {ESSENTIALS.title}
            </h1>
            <p className="mt-3 leading-relaxed text-white/75">
              {ESSENTIALS.intro}
            </p>

            <ol className="mt-6 flex flex-col gap-3">
              {ESSENTIALS.items.map((item, index) => (
                <li
                  key={item.title}
                  className="flex gap-3 rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-300/60 bg-cyan-300/10 text-xs font-bold text-cyan-200">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/70">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <button
              type="button"
              onClick={() => {
                onReachQuiz();
                setStep("quiz");
                window.scrollTo({ top: 0 });
              }}
              className={`mt-8 ${PRIMARY_BUTTON}`}
            >
              Start the quiz
            </button>
            <p className="mt-3 text-center text-xs text-white/50">
              {QUIZ_QUESTIONS.length} short questions, about 2 minutes
            </p>
          </>
        )}

        {step === "quiz" && (
          <>
            <Eyebrow>STEP 3 OF {TOTAL_STEPS}</Eyebrow>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Quick check
            </h1>
            <p className="mt-3 leading-relaxed text-white/75">
              Answer {QUIZ_MIN_CORRECT} of {questions.length} correctly to
              unlock your shifts. You can retake it as often as you need.
            </p>

            <div className="mt-8 flex flex-col gap-8">
              {questions.map((q, qIndex) => (
                <div key={q.id}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Question {qIndex + 1} of {questions.length}
                  </p>
                  <p className="mt-1 font-semibold">{q.question}</p>
                  <div className="mt-3 flex flex-col gap-2">
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
                          className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                            selected
                              ? "border-cyan-300/70 bg-cyan-300/10 text-white"
                              : "border-white/15 bg-white/[0.06] text-white/80 hover:border-blue-300/40"
                          }`}
                        >
                          <span>{option}</span>
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                              selected
                                ? "border-cyan-300 bg-cyan-300 text-[#050A2B]"
                                : "border-white/25"
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
              className={`mt-10 ${PRIMARY_BUTTON}`}
            >
              Check answers
            </button>
            {!allAnswered && (
              <p className="mt-3 text-center text-xs text-white/50">
                {answeredCount} of {questions.length} answered
              </p>
            )}
          </>
        )}

        {step === "results" && (
          <div className="flex flex-col items-center text-center">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full border-4 text-xl font-bold ${
                passed
                  ? "border-cyan-300 text-cyan-200"
                  : "border-amber-400 text-amber-300"
              }`}
            >
              {score}/{questions.length}
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {passed ? "You're ready" : "Almost there"}
            </h1>
            <p className="mt-3 max-w-sm leading-relaxed text-white/75">
              {passed
                ? "Your shifts are unlocked. See you at Tectonic."
                : `You need ${QUIZ_MIN_CORRECT} of ${questions.length} correct. Have a look at the questions below, then try again.`}
            </p>

            {missed.length > 0 && (
              <div className="mt-8 flex w-full flex-col gap-3 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  {passed ? "Worth knowing" : "To review"}
                </p>
                {missed.map((q) => (
                  <div
                    key={q.id}
                    className="flex gap-3 rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-4"
                  >
                    <StatusIcon ok={false} />
                    <div>
                      <p className="font-semibold">{q.question}</p>
                      {passed && (
                        <>
                          <p className="mt-1 text-sm text-cyan-200">
                            {q.options[q.correctPosition]}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-white/70">
                            {q.explanation}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {!passed && (
                  <p className="text-sm leading-relaxed text-white/60">
                    The answers are not shown, so the retake stays meaningful.
                    Everything is on the{" "}
                    <a
                      href="/onboarding"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-300 underline-offset-2 hover:underline"
                    >
                      Onboarding page
                    </a>
                    .
                  </p>
                )}
              </div>
            )}

            {error && (
              <p className="mt-4 w-full rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={completing}
              onClick={passed ? handleContinueToShifts : handleRetake}
              className={`mt-8 ${PRIMARY_BUTTON}`}
            >
              {passed
                ? completing
                  ? "Saving..."
                  : "Go to my shifts"
                : "Retake the quiz"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
