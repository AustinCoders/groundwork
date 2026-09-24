import { store } from "@/lib/storage";

export interface EditorSettings {
  formatOnSave: boolean;
  runOnSave: boolean;
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
