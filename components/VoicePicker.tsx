// components/VoicePicker.tsx
"use client"; // Next.js App Router: this component uses browser APIs

import { VoiceOption } from "@/hooks/useSpeechSynthesis";

interface VoicePickerProps {
  voices: VoiceOption[];
  selectedVoice: SpeechSynthesisVoice | null;
  onChange: (voice: SpeechSynthesisVoice | null) => void;
  disabled?: boolean;
}

export default function VoicePicker({
  voices,
  selectedVoice,
  onChange,
  disabled = false,
}: VoicePickerProps) {
  if (voices.length === 0) {
    // Chrome: voices haven't loaded yet (voiceschanged hasn't fired)
    // Firefox on Linux: may genuinely have no voices installed
    return <p className="text-sm text-muted-foreground">Loading voices...</p>;
  }

  // Group voices by language for a cleaner UX when there are many voices
  const grouped = voices.reduce<Record<string, VoiceOption[]>>((acc, v) => {
    // Use the base language code as the group key: "en-US" → "en"
    const lang = v.voice.lang.split("-")[0].toUpperCase();
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(v);
    return acc;
  }, {});

  return (
    <select
      disabled={disabled}
      value={selectedVoice?.name ?? ""}
      onChange={(e) => {
        const found = voices.find((v) => v.voice.name === e.target.value);
        onChange(found?.voice ?? null);
      }}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="" disabled>
        Select a voice...
      </option>

      {Object.entries(grouped).map(([lang, group]) => (
        <optgroup key={lang} label={`${lang} voices`}>
          {group.map(({ voice, label }) => (
            <option key={voice.name} value={voice.name}>
              {label}
              {/* Mark browser-default voice for clarity */}
              {voice.default ? " ★" : ""}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
