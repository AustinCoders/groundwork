export interface EdgeVoice {
  value: string;
  label: string;
  short: string;
}

export const EDGE_VOICES: EdgeVoice[] = [
  { value: "en-US-AriaNeural", label: "Aria — US, warm & clear", short: "Aria · US" },
  { value: "en-US-GuyNeural", label: "Guy — US, confident", short: "Guy · US" },
  { value: "en-US-JennyNeural", label: "Jenny — US, friendly tutor", short: "Jenny · US" },
  { value: "en-US-DavisNeural", label: "Davis — US, energetic", short: "Davis · US" },
  { value: "en-US-EmmaNeural", label: "Emma — US, natural", short: "Emma · US" },
  { value: "en-GB-RyanNeural", label: "Ryan — UK, calm", short: "Ryan · UK" },
  { value: "en-GB-SoniaNeural", label: "Sonia — UK, crisp", short: "Sonia · UK" },
  { value: "en-GB-LibbyNeural", label: "Libby — UK, friendly", short: "Libby · UK" },
  { value: "en-GB-ThomasNeural", label: "Thomas — UK, thoughtful", short: "Thomas · UK" },
  { value: "en-AU-NatashaNeural", label: "Natasha — AU, bright", short: "Natasha · AU" },
  { value: "en-IN-NeerjaNeural", label: "Neerja — IN, clear", short: "Neerja · IN" },
];

export const DEFAULT_EDGE_VOICE = EDGE_VOICES[0].value;
