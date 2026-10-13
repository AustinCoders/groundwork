import { FONT_ITEMS, THEME_ITEMS } from "@/lib/storage";

const THEMES = JSON.stringify(THEME_ITEMS.map((item) => item.value));
const FONTS = JSON.stringify(FONT_ITEMS.map((item) => item.value));

export const THEME_INIT_SCRIPT = `(function () {
  var themes = ${THEMES};
  var fonts = ${FONTS};

  function readJSON(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw && raw.length < 200 ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  document.documentElement.setAttribute("data-js", "");

  try {
    var savedTheme = readJSON("jsnotes:theme");
    var theme =
      themes.indexOf(savedTheme) !== -1
        ? savedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    document.documentElement.setAttribute("data-theme", theme);

    var savedFont = readJSON("jsnotes:font");
    document.documentElement.setAttribute("data-font", fonts.indexOf(savedFont) !== -1 ? savedFont : "classic");

    var savedZoom = readJSON("jsnotes:zoom");
    if (typeof savedZoom === "number" && savedZoom >= 50 && savedZoom <= 200)
      document.documentElement.style.setProperty("--reader-zoom", String(savedZoom / 100));
  } catch (e) {}
})();`;
