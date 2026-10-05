"use client";

import { useSyncExternalStore } from "react";

// Remembers a volunteer's token on this device (no expiry) so they don't
// have to retype it every time they open the app or switch tabs. Only ever
// written from the shift dashboard, after the server has confirmed the
// token is valid — never on a raw form submission — so an invalid token
// can't get stuck here and cause a redirect loop back to itself.

const STORAGE_KEY = "tectonic_volunteer_token";
// localStorage's own "storage" event only fires in *other* tabs, so we
// dispatch this ourselves to let components in the current tab react
// immediately to save/clear via useSyncExternalStore.
const TOKEN_CHANGED_EVENT = "tectonic-token-changed";

export function getSavedToken(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveToken(token: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Private browsing / storage disabled — fall back to re-entering the
    // token each time, same as today.
  }
  window.dispatchEvent(new Event(TOKEN_CHANGED_EVENT));
}

export function clearSavedToken(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
  window.dispatchEvent(new Event(TOKEN_CHANGED_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(TOKEN_CHANGED_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(TOKEN_CHANGED_EVENT, callback);
  };
}

function getServerSnapshot(): string | null {
  return null;
}

// The React-recommended way to read an external store (here, localStorage)
// during render instead of via a useEffect + setState, which both avoids an
// extra render pass and plays correctly with SSR/hydration.
export function useSavedToken(): string | null {
  return useSyncExternalStore(subscribe, getSavedToken, getServerSnapshot);
}
