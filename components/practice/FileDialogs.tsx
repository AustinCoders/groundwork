"use client";

import { useState } from "react";
import { NameDialog } from "@/components/Modal";
import { LANG_ORDER, LANGUAGES, type LanguageKey } from "@/lib/codeLanguages";
import { langForName, type PgFile } from "@/lib/playgroundProject";

function problemWith(name: string, files: PgFile[], except?: string): string | null {
  if (/[\\/]/.test(name)) return "A file name can't contain / or \\.";
  if (name.startsWith(".")) return "Give the file a name before its extension.";
  if (files.some((f) => f.id !== except && f.name.toLowerCase() === name.toLowerCase()))
    return `There is already a file called ${name}.`;
  return null;
}

export function finalName(typed: string, lang: LanguageKey): { name: string; lang: LanguageKey } {
  const fromExt = langForName(typed);
  if (fromExt && typed.includes(".")) return { name: typed, lang: fromExt };
  return { name: `${typed}.${LANGUAGES[lang].ext}`, lang };
}

export function NewFileDialog({
  files,
  initialLang,
  onCreate,
  onClose,
}: {
  files: PgFile[];
  initialLang: LanguageKey;
  onCreate: (name: string, lang: LanguageKey) => void;
  onClose: () => void;
}) {
  const [lang, setLang] = useState<LanguageKey>(initialLang);
  const base = (() => {
    const taken = new Set(files.map((f) => f.name.replace(/\.[^.]+$/, "")));
    if (!taken.has("scratch")) return "scratch";
    for (let n = 2; ; n++) if (!taken.has(`scratch-${n}`)) return `scratch-${n}`;
  })();
  return (
    <NameDialog
      title="New file"
      label="File name"
      initial={base}
      confirmLabel="Create file"
      wide
      validate={(typed) => problemWith(finalName(typed, lang).name, files)}
      hint={(typed) => {
        if (!typed) return "Type a name — the extension is added for you.";
        const made = finalName(typed, lang);
        return `Creates ${made.name} · ${LANGUAGES[made.lang].label}${LANGUAGES[made.lang].runnable ? " · runs here" : " · write only"}`;
      }}
      onSubmit={(typed) => {
        const made = finalName(typed, lang);
        onCreate(made.name, made.lang);
      }}
      onClose={onClose}
    >
      <fieldset className="lang-pick">
        <legend>Language</legend>
        <div className="lang-pick__grid" role="radiogroup" aria-label="Language">
          {LANG_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={lang === key}
              className="lang-pick__opt"
              onClick={() => setLang(key)}
            >
              <span>{LANGUAGES[key].label}</span>
              <small>.{LANGUAGES[key].ext}</small>
            </button>
          ))}
        </div>
      </fieldset>
    </NameDialog>
  );
}

export function RenameFileDialog({
  file,
  files,
  onRename,
  onClose,
}: {
  file: PgFile;
  files: PgFile[];
  onRename: (name: string) => void;
  onClose: () => void;
}) {
  return (
    <NameDialog
      title={`Rename ${file.name}`}
      label="New name"
      initial={file.name}
      confirmLabel="Rename"
      selectUntil={(v) => v.lastIndexOf(".")}
      validate={(typed) => (typed === file.name ? null : problemWith(typed, files, file.id))}
      hint={(typed) => {
        const lang = langForName(typed);
        if (!typed.includes(".") || !lang) return `No known extension — it stays ${LANGUAGES[file.lang].label}.`;
        return lang === file.lang ? LANGUAGES[lang].label : `Switches the file to ${LANGUAGES[lang].label}.`;
      }}
      onSubmit={onRename}
      onClose={onClose}
    />
  );
}
