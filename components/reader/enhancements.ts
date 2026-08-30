import { run } from "@/lib/runner";

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, html?: string) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html != null) node.innerHTML = html;
  return node;
}

function legacyCopy(text: string): boolean {
  const ta = el("textarea");
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

function copyText(text: string): Promise<boolean> {
  if (!navigator.clipboard || !window.isSecureContext) {
    return Promise.resolve(legacyCopy(text));
  }

  const write = navigator.clipboard.writeText(text).then(
    () => true,
    () => false
  );
  const timeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1000));

  return Promise.race([write, timeout]).then((copied) => copied || legacyCopy(text));
}

export function enhanceCodeBlocks(container: HTMLElement) {
  Array.from(container.querySelectorAll("pre")).forEach((pre) => {
    if (pre.parentElement?.classList.contains("codeblock")) return;
    const wrap = el("div", "codeblock");
    pre.parentNode?.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    const btn = el("button", "codeblock__copy", "copy");
    btn.type = "button";
    btn.setAttribute("aria-label", "Copy code to clipboard");

    btn.addEventListener("click", () => {
      copyText((pre as HTMLElement).innerText).then((ok) => {
        btn.textContent = ok ? "copied ✓" : "copy failed";
        btn.classList.toggle("is-done", ok);
        setTimeout(() => {
          btn.textContent = "copy";
          btn.classList.remove("is-done");
        }, 1600);
      });
    });

    wrap.appendChild(btn);
  });
}

export function enhanceTables(container: HTMLElement) {
  Array.from(container.querySelectorAll("table")).forEach((table) => {
    if (table.parentElement?.classList.contains("table-scroll")) return;
    const wrap = el("div", "table-scroll");
    table.parentNode?.insertBefore(wrap, table);
    wrap.appendChild(table);
  });
}

export function activateScripts(container: HTMLElement) {
  Array.from(container.querySelectorAll("script")).forEach((old) => {
    const fresh = document.createElement("script");
    Array.prototype.forEach.call(old.attributes, (attr: Attr) => {
      fresh.setAttribute(attr.name, attr.value);
    });
    fresh.textContent = old.textContent;
    old.parentNode?.replaceChild(fresh, old);
  });
}

export function enhanceTryBlocks(container: HTMLElement) {
  Array.from(container.querySelectorAll<HTMLElement>(".try")).forEach((block) => {
    if (block.querySelector(".try__run")) return;
    const pre = block.querySelector("pre");
    if (!pre) return;
    const code = (pre as HTMLElement).innerText;

    const btn = el("button", "btn try__run", "▶ Run this");
    btn.type = "button";
    const out = el("div", "demo__term");
    out.hidden = true;
    block.appendChild(btn);
    block.appendChild(out);

    let running: { stop: () => void } | null = null;

    btn.addEventListener("click", () => {
      if (running) running.stop();
      out.hidden = false;
      out.innerHTML = "";
      btn.disabled = true;
      btn.textContent = "Running…";

      running = run({
        code,
        timeout: 3000,
        onConsole: (entry) => {
          // Table entries only ever come from the SQL runner, never from
          // this plain JS `run()` — narrow it away rather than widen the UI.
          if (entry.kind === "table") return;
          const line = el(
            "div",
            entry.kind === "error" ? "err" : entry.kind === "warn" || entry.kind === "system" ? "dim" : "ok"
          );
          line.textContent = entry.text;
          out.appendChild(line);
        },
        onDone: () => {
          running = null;
          btn.disabled = false;
          btn.textContent = "Run again";
          if (!out.children.length) out.appendChild(el("div", "dim", "(no output)"));
        },
      });
    });
  });
}
