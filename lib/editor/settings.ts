import { store } from "@/lib/storage";

/** What the editor does, as the reader has set it. Kept on this device. */
export interface EditorSettings {
  /** Run Prettier before saving (JavaScript and TypeScript). */
  formatOnSave: boolean;
  /** Run the code after saving, so ⌘/Ctrl+S is "save and see". */
  runOnSave: boolean;
  /** ESLint for JavaScript, type-checking for TypeScript, as you type. */
  lint: boolean;
  vim: boolean;
  minimap: boolean;
  indentGuides: boolean;
  wrap: boolean;
  tabSize: 2 | 4;
}

export const DEFAULT_SETTINGS: EditorSettings = {
  formatOnSave: true,
  runOnSave: false,
  lint: true,
  vim: false,
  minimap: false,
  indentGuides: true,
  wrap: false,
  tabSize: 2,
};

const KEY = "jsnotes:editor-settings";

export function loadSettings(): EditorSettings {
  const saved = store.get<Partial<EditorSettings>>(KEY, {});
  return { ...DEFAULT_SETTINGS, ...saved, tabSize: saved.tabSize === 4 ? 4 : 2 };
}

export function saveSettings(settings: EditorSettings) {
  store.set(KEY, settings);
}
