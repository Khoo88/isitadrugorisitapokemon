"use client";

import { useEffect, useState } from "react";

export const GUEST_STORAGE_KEY = "game_guest_id";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Creates a RFC 4122 v4 UUID (works without localStorage). */
export function createGuestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function isValidUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/**
 * Reads or creates a persistent guest id in localStorage.
 * Falls back to an in-memory id when storage is blocked or cleared.
 */
export function resolveGuestId(): string {
  if (typeof window === "undefined") {
    return createGuestId();
  }

  try {
    const stored = localStorage.getItem(GUEST_STORAGE_KEY);
    if (stored && isValidUuid(stored)) {
      return stored;
    }

    const fresh = createGuestId();
    localStorage.setItem(GUEST_STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return createGuestId();
  }
}

/**
 * Anonymous player fingerprint for leaderboard tracking (no sign-in).
 */
export function usePlayerIdentity(): {
  guestId: string | null;
  ready: boolean;
} {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setGuestId(resolveGuestId());
    setReady(true);
  }, []);

  return { guestId, ready };
}
