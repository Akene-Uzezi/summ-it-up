// hooks/useSpeechSynthesis.ts
import { useState, useEffect, useRef, useCallback } from "react";

export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  label: string; // e.g. "Google US English (en-US)"
}

interface UseSpeechSynthesisReturn {
  isSpeaking: boolean;
  isPaused: boolean;
  voices: VoiceOption[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  isSupported: boolean;
  error: string | null;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Store the active utterance in a ref so we can cancel it on unmount
  // without it being a dependency in useEffect/useCallback
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Tracks whether the component is still mounted — prevents setState
  // calls on an unmounted component (common with async speech events)
  const mountedRef = useRef(true);

  // ─── Voice loading ────────────────────────────────────────────────────────
  useEffect(() => {
    // Guard: this entire block must only run in a browser context.
    // Next.js runs components on the server during SSR — window doesn't exist there.
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      const raw = window.speechSynthesis.getVoices();
      if (!mountedRef.current) return;

      const mapped: VoiceOption[] = raw.map((v) => ({
        voice: v,
        // e.g. "Google US English (en-US)" or "Alex (en-US)"
        label: `${v.name} (${v.lang})`,
      }));

      setVoices(mapped);

      // Auto-select a sensible default voice:
      // Prefer English voices; prefer "Google" voices on Chrome for quality.
      // Falls back to the first English voice, then whatever the browser picks.
      if (mapped.length > 0) {
        const preferred =
          raw.find(
            (v) =>
              v.lang.startsWith("en") &&
              v.name.toLowerCase().includes("google"),
          ) ??
          raw.find((v) => v.lang.startsWith("en")) ??
          raw[0];

        setSelectedVoice(preferred ?? null);
      }
    };

    // Firefox: getVoices() is synchronous, so this call works immediately.
    // Chrome: getVoices() returns [] until the 'voiceschanged' event fires.
    // We call it eagerly AND listen for the event to cover both browsers.
    loadVoices();

    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cancel any ongoing speech when the component using this hook unmounts.
      // Critical in Next.js: client-side navigation doesn't reload the page,
      // so without this the browser keeps speaking after the user navigates away.
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ─── speak ────────────────────────────────────────────────────────────────
  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        setError("Speech synthesis is not supported in this browser.");
        return;
      }

      // Validate input — use setError instead of throwing, so it surfaces
      // in your UI rather than as an unhandled exception in the console
      if (!text || text.trim().length === 0) {
        setError("No text available to speak.");
        return;
      }

      // Cancel any currently running speech before starting a new one.
      // Only cancel if actually speaking — avoids unnecessarily killing
      // speech from other components on the page
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      setError(null);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Apply selected voice if available.
      // Without this, each browser picks its own default — this is the
      // primary reason Chrome and Firefox sound completely different.
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        // Also set lang explicitly — some browsers derive it from the voice
        // object and some don't, so be explicit to avoid mismatches
        utterance.lang = selectedVoice.lang;
      }

      // Lifecycle callbacks — necessary for accurate isSpeaking state
      utterance.onstart = () => {
        if (mountedRef.current) {
          setIsSpeaking(true);
          setIsPaused(false);
        }
      };

      utterance.onend = () => {
        if (mountedRef.current) {
          setIsSpeaking(false);
          setIsPaused(false);
        }
      };

      // onerror fires for things like: voice not found, engine timeout,
      // the utterance was cancelled programmatically (error.error === 'canceled')
      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        // 'canceled' is not a real error — it fires when we call cancel()
        // ourselves. Suppress it to avoid confusing the user.
        if (event.error === "canceled") return;

        if (mountedRef.current) {
          setIsSpeaking(false);
          setIsPaused(false);
          setError(`Speech error: ${event.error}`);
        }
      };

      // Store ref so pause/resume/cancel and the unmount cleanup can access it
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [selectedVoice], // Re-create only when the selected voice changes
  );

  // ─── Controls ─────────────────────────────────────────────────────────────
  const pause = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.pause();
    if (mountedRef.current) setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.resume();
    if (mountedRef.current) setIsPaused(false);
  }, []);

  const cancel = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    if (mountedRef.current) {
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  return {
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    setSelectedVoice,
    speak,
    pause,
    resume,
    cancel,
    isSupported: typeof window !== "undefined" && "speechSynthesis" in window,
    error,
  };
}
