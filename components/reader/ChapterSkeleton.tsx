/**
 * Shape of a chapter sheet, shown while the route streams. Navigation is
 * usually instant because Next prefetches the sidebar links, so this is
 * mostly seen on a cold or slow connection — but a blank sheet in that
 * case is the one moment the reader looks broken.
 */

const PARAGRAPH_WIDTHS = [
  [98, 96, 94, 61],
  [97, 99, 72],
];

export function ChapterSkeleton() {
  return (
    <section className="sheet chapter chapter--skeleton" role="status" aria-live="polite" aria-label="Loading chapter">
      <div className="ch-sk__head">
        <span className="sk ch-sk__badge" aria-hidden="true" />
        <span className="sk sk--text" style={{ width: 240, height: 26 }} aria-hidden="true" />
      </div>
      <span className="sk sk--text" style={{ width: "62%", height: 14 }} aria-hidden="true" />

      <div className="ch-sk__block" aria-hidden="true">
        <span className="sk sk--text" style={{ width: 300, height: 20 }} />
        {PARAGRAPH_WIDTHS[0].map((w, i) => (
          <span key={i} className="sk sk--text" style={{ width: `${w}%` }} />
        ))}
      </div>

      <span className="sk ch-sk__figure" aria-hidden="true" />

      <div className="ch-sk__block" aria-hidden="true">
        {PARAGRAPH_WIDTHS[1].map((w, i) => (
          <span key={i} className="sk sk--text" style={{ width: `${w}%` }} />
        ))}
      </div>
    </section>
  );
}
