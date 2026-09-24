"use client";

import { useEffect } from "react";

function legacyCopy(text: string): boolean {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

export function GitCodeCopy({ containerId }: { containerId: string }) {
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const cleanups: (() => void)[] = [];

    container.querySelectorAll<HTMLElement>(".codeblock").forEach((wrap) => {
      const pre = wrap.querySelector("pre");
      const btn = wrap.querySelector<HTMLButtonElement>(".codeblock__copy");
      if (!pre || !btn) return;

      const onClick = () => {
        const text = (pre as HTMLElement).innerText;
        const done = (ok: boolean) => {
          btn.textContent = ok ? "copied ✓" : "copy failed";
          btn.classList.toggle("is-done", ok);
          setTimeout(() => {
            btn.textContent = "copy";
            btn.classList.remove("is-done");
          }, 1600);
        };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(
            () => done(true),
            () => done(false)
          );
        } else {
          done(legacyCopy(text));
        }
      };
      btn.addEventListener("click", onClick);
      cleanups.push(() => btn.removeEventListener("click", onClick));
    });

    return () => cleanups.forEach((fn) => fn());
  }, [containerId]);

  return null;
}
