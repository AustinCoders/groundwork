export const THEME_INIT_SCRIPT = `(function () {
  function readJSON(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  try {
    var savedTheme = readJSON("jsnotes:theme");
    var theme =
      savedTheme ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    document.documentElement.setAttribute("data-theme", theme);

    var savedFont = readJSON("jsnotes:font");
    document.documentElement.setAttribute("data-font", savedFont || "classic");
  } catch (e) {
    /* the default light/classic look is fine */
  }
})();`;
