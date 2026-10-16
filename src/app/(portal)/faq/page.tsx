"use client";

import { useMemo, useState } from "react";
import { FAQ_CATEGORIES, FAQ_ITEMS, type FaqCategory } from "@/data/faq";
import { RichText } from "@/components/RichText";

export default function FaqPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FaqCategory | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesQuery =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.replace(/\*\*/g, "").toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <div className="min-h-screen bg-[#050A2B] px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">FAQ</h1>
        <p className="mt-2 text-white/70">
          Quick answers, grouped by theme.
        </p>

        <div className="relative mt-6">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
          >
            &#9906;
          </span>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search FAQ..."
            className="w-full rounded-full border border-white/15 bg-white/[0.06] py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/40 outline-none transition-colors focus:border-blue-300/50"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              category === "all"
                ? "bg-blue-500 text-white"
                : "bg-[#0D1341]/40 text-white/70 hover:bg-[#0D1341]/60"
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
                  : "bg-[#0D1341]/40 text-white/70 hover:bg-[#0D1341]/60"
              }`}
            >
              {item.short}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-10">
          {filtered.length === 0 ? (
            <p className="text-white/70">No matching questions.</p>
          ) : (
            FAQ_CATEGORIES.map((group) => {
              const items = filtered.filter((item) => item.category === group.id);
              if (items.length === 0) return null;

              return (
                <section key={group.id}>
                  <div className="mb-3 flex items-end justify-between gap-3 border-b border-white/15 pb-3">
                    <div>
                      <h2 className="text-lg font-semibold">{group.label}</h2>
                      <p className="mt-0.5 text-sm text-white/60">{group.description}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-300">
                      {items.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {items.map((item) => {
                      const isOpen = openId === item.id;

                      return (
                        <div
                          key={item.id}
                          className={`overflow-hidden rounded-2xl border transition-colors ${
                            isOpen
                              ? "border-blue-300/60 bg-white/[0.06]"
                              : "border-white/15 bg-white/[0.06]"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenId(isOpen ? null : item.id)}
                            className="flex w-full items-center justify-between gap-3 p-4 text-left font-semibold"
                          >
                            <span>{item.question}</span>
                            <span
                              aria-hidden="true"
                              className={`shrink-0 text-white/60 transition-transform ${
                                isOpen ? "rotate-90" : ""
                              }`}
                            >
                              &rsaquo;
                            </span>
                          </button>
                          {isOpen && (
                            <p className="-mt-1 px-4 pb-4 text-sm text-white/70">
                              <RichText>{item.answer}</RichText>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
