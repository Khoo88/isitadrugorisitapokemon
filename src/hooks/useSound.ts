"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "drug-pokemon-sound-muted";

export type SoundId = "correct" | "wrong" | "complete";

function createContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ??
    (
      window as unknown as {
        webkitAudioContext: typeof AudioContext;
      }
    ).webkitAudioContext;
  if (!AudioCtx) return null;
  return new AudioCtx();
}

function scheduleTone(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  options?: { type?: OscillatorType; volume?: number },
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const type = options?.type ?? "square";
  const volume = options?.volume ?? 0.07;

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration);
}

function playEffect(ctx: AudioContext, id: SoundId): void {
  const t = ctx.currentTime;

  switch (id) {
    case "correct":
      scheduleTone(ctx, 523.25, t, 0.07);
      scheduleTone(ctx, 659.25, t + 0.08, 0.07);
      scheduleTone(ctx, 783.99, t + 0.16, 0.12);
      break;
    case "wrong":
      scheduleTone(ctx, 196, t, 0.1, { type: "sawtooth", volume: 0.09 });
      scheduleTone(ctx, 147, t + 0.1, 0.18, { type: "sawtooth", volume: 0.08 });
      break;
    case "complete":
      scheduleTone(ctx, 392, t, 0.08);
      scheduleTone(ctx, 523.25, t + 0.1, 0.08);
      scheduleTone(ctx, 659.25, t + 0.2, 0.08);
      scheduleTone(ctx, 783.99, t + 0.3, 0.2);
      break;
  }
}

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMuted(localStorage.getItem(STORAGE_KEY) === "true");
    setReady(true);
  }, []);

  const ensureContext = useCallback(async (): Promise<AudioContext | null> => {
    if (!ctxRef.current) {
      ctxRef.current = createContext();
    }
    const ctx = ctxRef.current;
    if (!ctx) return null;
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    return ctx;
  }, []);

  const play = useCallback(
    async (id: SoundId) => {
      if (!ready || muted) return;
      const ctx = await ensureContext();
      if (!ctx) return;
      playEffect(ctx, id);
    },
    [ensureContext, muted, ready],
  );

  const setMutedPersisted = useCallback((value: boolean) => {
    setMuted(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  }, []);

  const toggleMute = useCallback(() => {
    setMutedPersisted(!muted);
  }, [muted, setMutedPersisted]);

  return { play, muted, toggleMute, setMuted: setMutedPersisted };
}
