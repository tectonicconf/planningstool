"use client";

/**
 * Phase 1 (UI-only): Academy progress is kept in the browser via localStorage,
 * keyed per volunteer token. This is NOT synced across devices and is lost if
 * the volunteer clears site data or switches phones — it's a placeholder so
 * the full onboarding flow works end-to-end before we add a real
 * `academy_status` column on the `volunteers` table together with Kaat
 * (Phase 2 — see tectonic-2026-academy-concept.md).
 */

export type AcademyStatus = "not_started" | "guide_done" | "quiz_failed" | "completed";

const KEY_PREFIX = "tectonic-academy-progress:";

export function getAcademyStatus(token: string): AcademyStatus {
  if (typeof window === "undefined") return "not_started";
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + token);
    if (raw === "guide_done" || raw === "quiz_failed" || raw === "completed") {
      return raw;
    }
  } catch {
    // localStorage unavailable (private mode, blocked storage, ...) — fall back silently.
  }
  return "not_started";
}

export function setAcademyStatus(token: string, status: AcademyStatus) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY_PREFIX + token, status);
  } catch {
    // ignore — non-critical, UI still works within the session
  }
}
