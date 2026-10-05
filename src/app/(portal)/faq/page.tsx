"use client";

import { useMemo, useState } from "react";
import { FAQ_CATEGORIES, FAQ_ITEMS, type FaqCategory } from "@/data/faq";

export default function FaqPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FaqCategory | "all">("all");
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesQuery =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <div className="min-h-screen bg-[#050822] px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">FAQ</h1>
        <p className="mt-2 text-blue-100/70">
          Quick answers for during the event.
        </p>

        <div className="relative mt-6">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-200/40"
          >
            &#9906;
          </span>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search FAQ..."
            className="w-full rounded-full border border-blue-400/20 bg-blue-950/30 py-3 pl-11 pr-4 text-sm text-white placeholder:text-blue-200/40 outline-none transition-colors focus:border-blue-300/50"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              category === "all"
                ? "bg-blue-500 text-white"
                : "bg-blue-950/40 text-blue-100/70 hover:bg-blue-950/60"
            }`}
          >
            All
          </button>
          {FAQ_CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                category === item.id
                  ? "bg-blue-500 text-white"
                  : "bg-blue-950/40 text-blue-100/70 hover:bg-blue-950/60"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {filtered.length === 0 ? (
            <p className="text-blue-100/70">No matching questions.</p>
          ) : (
            filtered.map((item) => {
              const isOpen = openId === item.id;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 transition-colors ${
                    isOpen
                      ? "border-blue-300/60 bg-blue-950/30"
                      : "border-blue-400/20 bg-blue-950/10"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="flex w-full items-center justify-between gap-3 text-left font-semibold"
                  >
                    <span>{item.question}</span>
                    <span
                      aria-hidden="true"
                      className={`shrink-0 text-blue-200/60 transition-transform ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    >
                      &rsaquo;
                    </span>
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm text-blue-100/70">
                      {item.answer}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
