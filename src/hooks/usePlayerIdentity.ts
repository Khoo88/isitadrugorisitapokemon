"use client";

import { useCallback, useEffect, useState } from "react";

/** @deprecated Use DEVICE_STORAGE_KEY — kept for migration */
export const GUEST_STORAGE_KEY = "game_guest_id";

export const DEVICE_STORAGE_KEY = "isit_device_id";
export const PLAYER_NAME_STORAGE_KEY = "isit_player_name";

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

function readStoredDeviceId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const current = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (current && isValidUuid(current)) return current;

    const legacy = localStorage.getItem(GUEST_STORAGE_KEY);
    if (legacy && isValidUuid(legacy)) {
      localStorage.setItem(DEVICE_STORAGE_KEY, legacy);
      return legacy;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Reads or creates a persistent device id in localStorage.
 * Falls back to an in-memory id when storage is blocked.
 */
export function resolveDeviceId(): string {
  if (typeof window === "undefined") {
    return createGuestId();
  }

  try {
    const stored = readStoredDeviceId();
    if (stored) return stored;

    const fresh = createGuestId();
    localStorage.setItem(DEVICE_STORAGE_KEY, fresh);
    localStorage.setItem(GUEST_STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return createGuestId();
  }
}

/** @deprecated Use resolveDeviceId */
export const resolveGuestId = resolveDeviceId;

export function getCachedPlayerName(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const name = localStorage.getItem(PLAYER_NAME_STORAGE_KEY)?.trim();
    return name || null;
  } catch {
    return null;
  }
}

export function setCachedPlayerName(name: string): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = name.trim();
    if (trimmed) {
      localStorage.setItem(PLAYER_NAME_STORAGE_KEY, trimmed);
    }
  } catch {
    /* storage blocked */
  }
}

export function clearCachedPlayerName(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PLAYER_NAME_STORAGE_KEY);
  } catch {
    /* storage blocked */
  }
}

/**
 * Persistent device fingerprint + cached display name for leaderboard submissions.
 */
export function usePlayerIdentity(): {
  deviceId: string | null;
  /** @deprecated Use deviceId */
  guestId: string | null;
  playerName: string | null;
  ready: boolean;
  setPlayerName: (name: string) => void;
  clearPlayerName: () => void;
} {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [playerName, setPlayerNameState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDeviceId(resolveDeviceId());
    setPlayerNameState(getCachedPlayerName());
    setReady(true);
  }, []);

  const setPlayerName = useCallback((name: string) => {
    setCachedPlayerName(name);
    setPlayerNameState(name.trim() || null);
  }, []);

  const clearPlayerName = useCallback(() => {
    clearCachedPlayerName();
    setPlayerNameState(null);
  }, []);

  return {
    deviceId,
    guestId: deviceId,
    playerName,
    ready,
    setPlayerName,
    clearPlayerName,
  };
}
