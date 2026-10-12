export const GLOBAL_ERROR_CSS = `
:root {
  color-scheme: light dark;
  --paper: #f1ede2;
  --sheet: #faf7ee;
  --ink: #1b1b1b;
  --soft: #4a463f;
  --line: #bdb5a1;
  --accent: #2f4f93;
  --on-accent: #faf7ee;
  --tape: rgba(190, 160, 80, 0.5);
}
@media (prefers-color-scheme: dark) {
  :root {
    --paper: #14151a;
    --sheet: #1d1f27;
    --ink: #ecebe6;
    --soft: #b7b4aa;
    --line: #4a4f5e;
    --accent: #9db8ff;
    --on-accent: #14151a;
    --tape: rgba(150, 150, 160, 0.4);
  }
}
body {
  display: grid;
  min-height: 100vh;
  margin: 0;
  padding: 48px 20px;
  place-items: center;
  color: var(--ink);
  background: var(--paper);
  font-family: system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
.card {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: 560px;
  padding: 40px 36px 34px;
  background: var(--sheet);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
  rotate: -1deg;
}
.tape {
  position: absolute;
  top: -13px;
  left: 50%;
  width: 92px;
  height: 26px;
  background: var(--tape);
  translate: -50% 0;
  rotate: -2deg;
}
.kicker {
  display: inline-block;
  margin: 0 0 18px;
  padding: 5px 14px;
  font: 13px/1.3 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--soft);
  border: 1px dashed var(--line);
  border-radius: 999px;
}
h1 {
  margin: 0 0 14px;
  font: 700 44px/1.05 "Bradley Hand", "Segoe Print", "Chalkboard SE", "Comic Sans MS", cursive;
}
.lead {
  margin: 0 0 26px;
  font-size: 18px;
  line-height: 1.6;
  color: var(--soft);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: 48px;
  padding: 0 24px;
  font: 700 16px/1 system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: var(--ink);
  text-decoration: none;
  background: transparent;
  border: 1.5px solid var(--line);
  border-radius: 999px;
  cursor: pointer;
}
.pill.primary {
  color: var(--on-accent);
  background: var(--accent);
  border-color: var(--accent);
}
.pill:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}
.code {
  margin: 24px 0 0;
  font: 13px/1.4 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  color: var(--soft);
  overflow-wrap: anywhere;
}
@media (max-width: 480px) {
  .card {
    padding: 34px 22px 26px;
  }
  h1 {
    font-size: 36px;
  }
}
`;
