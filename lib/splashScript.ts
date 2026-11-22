export const SPLASH_SESSION_KEY = "gw:splash";
export const SPLASH_RECENT_KEY = "gw:splash-at";
export const SPLASH_QUIET_MS = 30 * 60 * 1000;

export const SPLASH_SCRIPT = `(function () {
  var root = document.documentElement;
  try {
    if (navigator.webdriver || /bot|crawl|spider|lighthouse|headless|preview/i.test(navigator.userAgent)) return;
    if (sessionStorage.getItem("${SPLASH_SESSION_KEY}")) return;
    var last = Number(localStorage.getItem("${SPLASH_RECENT_KEY}"));
    sessionStorage.setItem("${SPLASH_SESSION_KEY}", "1");
    if (last && Date.now() - last < ${SPLASH_QUIET_MS}) return;
    localStorage.setItem("${SPLASH_RECENT_KEY}", String(Date.now()));
  } catch (e) {
    return;
  }
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var start = Date.now();
  var least = calm ? 300 : 1400;
  var most = calm ? 900 : 2400;
  var done = false;
  root.setAttribute("data-splash", "in");
  function finish() {
    if (done) return;
    done = true;
    root.setAttribute("data-splash", "out");
    window.setTimeout(function () {
      root.removeAttribute("data-splash");
    }, calm ? 120 : 460);
  }
  function ready() {
    window.setTimeout(finish, Math.max(0, least - (Date.now() - start)));
  }
  if (document.readyState === "complete") ready();
  else window.addEventListener("load", ready, { once: true });
  window.setTimeout(finish, most);
})();`;
