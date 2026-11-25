export interface DeviceLabel {
  browser: string;
  os: string;
  kind: "phone" | "tablet" | "computer" | "unknown";
}

export function describeDevice(agent: string | null | undefined): DeviceLabel {
  const ua = (agent ?? "").slice(0, 400);
  if (!ua) return { browser: "Unknown browser", os: "unknown device", kind: "unknown" };
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /SamsungBrowser\//.test(ua)
        ? "Samsung Internet"
        : /Firefox\/|FxiOS\//.test(ua)
          ? "Firefox"
          : /Chrome\/|CriOS\//.test(ua)
            ? "Chrome"
            : /Safari\//.test(ua)
              ? "Safari"
              : /node|undici|curl|axios|python|okhttp/i.test(ua)
                ? "An app or script"
                : "A browser";
  const os = /iPad/.test(ua)
    ? "iPad"
    : /iPhone|iPod/.test(ua)
      ? "iPhone"
      : /Android/.test(ua)
        ? "Android"
        : /Windows NT/.test(ua)
          ? "Windows"
          : /Mac OS X|Macintosh/.test(ua)
            ? "Mac"
            : /CrOS/.test(ua)
              ? "ChromeOS"
              : /Linux/.test(ua)
                ? "Linux"
                : "unknown device";
  const kind = /iPad|Tablet/.test(ua)
    ? "tablet"
    : /iPhone|iPod|Mobile|Android/.test(ua)
      ? "phone"
      : os === "unknown device"
        ? "unknown"
        : "computer";
  return { browser, os, kind };
}
