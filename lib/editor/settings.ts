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
  const saved = store.get<unknown>(KEY, null);
  const loose = (saved !== null && typeof saved === "object" && !Array.isArray(saved) ? saved : {}) as Record<
    string,
    unknown
  >;
  const flag = (name: Exclude<keyof EditorSettings, "tabSize">): boolean =>
    typeof loose[name] === "boolean" ? loose[name] : DEFAULT_SETTINGS[name];
  return {
    formatOnSave: flag("formatOnSave"),
    runOnSave: flag("runOnSave"),
    lint: flag("lint"),
    vim: flag("vim"),
    minimap: flag("minimap"),
    indentGuides: flag("indentGuides"),
    wrap: flag("wrap"),
    tabSize: loose.tabSize === 4 ? 4 : 2,
  };
}

export function saveSettings(settings: EditorSettings) {
  store.set(KEY, settings);
}
