# Code languages: JavaScript, Python, Java and C++

This is the source for CAP-11. Scope (owner, 2026-10-07): chapter code blocks and the player's code panel. Exercises, their starter code and tests, and the Playground stay as they are.

## Choice and storage

- **Languages.** `javascript` (main and default), `python`, `java`, `cpp`.
- **Key.** `groundwork:dsa:lang`, versioned, its own store with the snapshot cache and cross-tab events used by `groundwork:quiz`. It never writes a `jsnotes:*` key and never touches the global level.
- **The switch.** One component, a labelled group of four buttons with `aria-pressed`, shown in the chapter header and beside every player. A change is announced through a `role="status"` line ("Code shown in Python"). The language is always stated in text.
- **Not reset.** Switching re-renders code only. It never reloads the page and never resets a running player, a puzzle or a check.

## Authoring format

- **Chapter code.** Each code block in a chapter body is `<div data-code="binary-search-classic"><pre><code>…JavaScript…</code></pre></div>`; the JavaScript inside is the version the chapter's prose describes and is what the server renders. The other three languages live in `content/dsa/code/<chapter-id>/<language>.ts` (`python`, `java`, `cpp`), each exporting `code: Record<blockId, html>` where the html is what goes inside `<code>` (comments in `<span class="c">`, markup escaped). Translations have the same structure and variable names as the JavaScript where the language allows.
- **Tracer code.** A tracer declares its code lines by stable line ids. Each language gives its own lines and a map from line id to the line numbers it covers. A frame names a line id; the player highlights that id's lines in the chosen language. The run, frames, narration, variables and generated questions never depend on the language.
- **Loading.** The server renders the chapter with the placeholder's JavaScript, and a client step swaps in the chosen language from a lazy per-language import, so a page fetches only the language shown and JavaScript fetches nothing.

## Tests

- **Completeness.** Every `data-code` id in a chapter has all four languages, non-empty. Every tracer has all four languages and a line-id map that covers every line id its frames use.
- **Syntax.** Each translation parses without error nodes, using the Lezer grammars the editor already ships (JavaScript, Python, Java, C++).
- **Behaviour.** A rendered chapter shows the chosen language after the switch and after a reload, a running player keeps its step when the language changes, and the highlighted line follows the frame in each language.
