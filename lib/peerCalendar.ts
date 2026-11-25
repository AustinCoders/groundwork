function stamp(ms: number): string {
  return new Date(ms)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function escape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/([,;])/g, "\\$1");
}

function fold(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  out.push(rest);
  return out.join("\r\n");
}

export interface CalendarMock {
  id: string;
  at: string;
  minutes: number;
  title: string;
  link: string | null;
  note: string;
  pageUrl: string;
}

export function icsFor(mock: CalendarMock, now: number = Date.now()): string {
  const start = Date.parse(mock.at);
  const end = start + mock.minutes * 60_000;
  const description = [mock.link ? `Call: ${mock.link}` : "", `Questions and scorecard: ${mock.pageUrl}`, mock.note]
    .filter(Boolean)
    .join("\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Groundwork//Mock interview//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${mock.id}@groundwork`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(mock.title)}`,
    `DESCRIPTION:${escape(description)}`,
    mock.link ? `LOCATION:${escape(mock.link)}` : "",
    `URL:${mock.pageUrl}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escape(mock.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function downloadIcs(mock: CalendarMock): void {
  const url = URL.createObjectURL(new Blob([icsFor(mock)], { type: "text/calendar" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "groundwork-mock-interview.ics";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function nextWeekAt(at: string, now: number): string {
  let next = Date.parse(at) + 7 * 86_400_000;
  while (next < now + 15 * 60_000) next += 7 * 86_400_000;
  return new Date(next).toISOString();
}
