"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  SendHorizontal,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Mic,
  AudioLines,
  Speech,
  Pause,
  Play,
  Square,
} from "lucide-react";
import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import VoicePicker from "@/components/VoicePicker";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [url, setUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState<boolean>(false);

  // All speech synthesis state and logic lives in the hook.
  // The hook handles: voice loading, cross-browser compatibility,
  // isSpeaking state, unmount cleanup, and onerror handling.
  const {
    speak,
    pause,
    resume,
    cancel,
    isSpeaking,
    isPaused,
    isSupported: isSpeechSupported,
    voices,
    selectedVoice,
    setSelectedVoice,
    error: speechError,
  } = useSpeechSynthesis();

  // Derived: show either the speech hook error or the submit error
  const displayError = submitError || speechError;

  // useCallback prevents handleSpeak from being recreated on every render
  const handleSpeak = useCallback(() => {
    if (!summary) return; // guard: button is disabled when summary is null anyway
    speak(summary);
  }, [summary, speak]);

  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    if (inputValue.trim() === "") {
      setSubmitError("Input cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_backendUrl}/summarize`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: inputValue }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        setSubmitError(
          errorData.message || "An error occurred while summarizing.",
        );
        return; // Early return — don't try to parse body as success
      }

      const data = await response.json();
      setSummary(data.summary);

      // Track original URL so we can show "Read Original" link
      setUrl(isValidUrl(inputValue) ? inputValue : null);
      setInputValue("");
    } catch (err) {
      console.error(err);
      setSubmitError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMic = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSubmitError("Speech Recognition is not supported in your browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setRecording(true);
    recognition.onend = () => setRecording(false);
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setInputValue((prev) => prev + transcript);
    };
    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setRecording(false);
      setSubmitError(`Speech Error: ${e.error}`);
    };

    recognition.start();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-end p-4 pb-12 bg-background">
      {/* Hero — only shown before first summary */}
      {!(loading || summary) && (
        <div className="flex-1 w-full max-w-2xl flex flex-col justify-center text-center mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">Summ-It-Up</h1>
          <p className="text-zinc-400">
            Paste a URL or text below to get started.
          </p>
        </div>
      )}

      {/* Error banner */}
      {displayError && !loading && (
        <Card className="w-full max-w-2xl border-border bg-card shadow-2xl overflow-hidden mb-4">
          <CardContent className="p-4">
            <p className="text-red-500">{displayError}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading skeleton */}
      {loading && (
        <Card className="w-full max-w-2xl border-border bg-card shadow-2xl overflow-hidden mb-4">
          <CardContent className="p-4 flex flex-col gap-3">
            <h2 className="animate-pulse text-lg font-semibold text-white mb-2">
              Summarizing...
            </h2>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      )}

      {/* Summary card */}
      {summary && !loading && (
        <Card className="w-full max-w-2xl border-border bg-card shadow-2xl overflow-hidden mb-4">
          {/* ── Speech controls ── */}
          <div className="flex flex-col gap-2 px-4 pt-4">
            {/* Voice picker — disabled while speaking to prevent mid-speech voice change */}
            {isSpeechSupported && (
              <VoicePicker
                voices={voices}
                selectedVoice={selectedVoice}
                onChange={setSelectedVoice}
                disabled={isSpeaking}
              />
            )}

            <div className="flex items-center justify-end gap-1">
              {!isSpeaking ? (
                // ── Not speaking: show Speak button ──
                <button
                  onClick={handleSpeak}
                  disabled={!isSpeechSupported}
                  title={
                    isSpeechSupported
                      ? "Read aloud"
                      : "Not supported in this browser"
                  }
                  className="text-white cursor-pointer p-2 rounded-md bg-transparent
                             hover:bg-zinc-900 transition-colors disabled:opacity-40
                             disabled:cursor-not-allowed"
                >
                  <Speech className="w-5 h-5" />
                </button>
              ) : (
                // ── Speaking: show Pause/Resume + Stop ──
                <>
                  <button
                    onClick={isPaused ? resume : pause}
                    title={isPaused ? "Resume" : "Pause"}
                    className="flex items-center gap-1 text-white cursor-pointer px-2 py-1.5
                               rounded-md bg-transparent hover:bg-zinc-900 transition-colors text-sm"
                  >
                    {isPaused ? (
                      <Play className="w-4 h-4" />
                    ) : (
                      <Pause className="w-4 h-4" />
                    )}
                    <span>{isPaused ? "Resume" : "Pause"}</span>
                  </button>

                  <button
                    onClick={cancel}
                    title="Stop"
                    className="flex items-center gap-1 text-red-400 cursor-pointer px-2 py-1.5
                               rounded-md bg-transparent hover:bg-zinc-900 transition-colors text-sm"
                  >
                    <Square className="w-4 h-4" />
                    <span>Stop</span>
                  </button>

                  {/* Pulse indicator while actively speaking */}
                  {!isPaused && (
                    <span className="flex h-2 w-2 ml-1">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Summary content ── */}
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-white mb-2">Summary</h2>
            <div className="text-zinc-400 whitespace-pre-wrap">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </CardContent>

          {/* ── Copy + Read Original ── */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(summary);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="cursor-pointer p-2 rounded-md bg-transparent hover:bg-zinc-900 transition-colors"
            >
              {copied ? (
                <div className="flex items-center gap-1">
                  <Check className="w-5 h-5 text-green-600" />
                  <p className="text-white">Copied</p>
                </div>
              ) : (
                <Copy className="w-5 h-5 text-white" />
              )}
            </button>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-white gap-1 ml-2 cursor-pointer p-2
                           rounded-md bg-transparent hover:bg-zinc-900 transition-colors"
              >
                <ExternalLink className="w-5 h-5 text-white" />
                Read Original
              </a>
            )}
          </div>
        </Card>
      )}

      {/* ── Input card ── */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          layout: {
            duration: 0.3,
            type: "spring",
            stiffness: 200,
            damping: 25,
          },
        }}
        className="w-full max-w-2xl"
      >
        <form onSubmit={handleSubmit}>
          <Card className="border-border bg-card shadow-2xl overflow-hidden">
            <CardContent className="p-4 flex flex-col gap-3">
              <Textarea
                placeholder="Paste a URL or type your text..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                name="input"
                autoResize
                minRows={1}
                maxRows={6}
                className="text-white py-2 bg-transparent border-none focus-visible:ring-0 text-base"
              />
              <div className="flex justify-end">
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5 text-white" />
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleMic}
                      className="cursor-pointer p-2 rounded-md bg-transparent hover:bg-zinc-900 transition-colors"
                    >
                      {recording ? (
                        <AudioLines className="text-red-500 animate-pulse" />
                      ) : (
                        <Mic className="text-white" />
                      )}
                    </button>
                    <button
                      type="submit"
                      className="cursor-pointer p-2 rounded-md bg-transparent hover:bg-zinc-900 transition-colors"
                    >
                      <SendHorizontal className="w-5 h-5 text-white" />
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </motion.div>
    </main>
  );
}
