/**
 * Stands in for the editor while the CodeMirror chunk loads — around four
 * seconds on a mid-range connection, which used to be a blank rectangle.
 * It reuses the editor's own `.ed` shell so the toolbar, gutter and status
 * bar land in their final positions and nothing shifts when the real
 * editor swaps in.
 */

const LINE_WIDTHS = [72, 45, 88, 30, 64, 52, 78, 38, 60, 84, 26, 56, 70, 42];

export function EditorSkeleton({ height = 430 }: { height?: number }) {
  return (
    <div
      className="ed ed--skeleton"
      style={{ "--ed-height": `${height}px` } as React.CSSProperties}
      role="status"
      aria-live="polite"
      aria-label="Loading the editor"
    >
      <div className="ed__bar">
        <span className="ed__traffic" aria-hidden="true">
          <span className="ed__tl ed__tl--red" />
          <span className="ed__tl ed__tl--yellow" />
          <span className="ed__tl ed__tl--green" />
        </span>
        <span className="ed__tabs">
          <span className="ed__tab is-active">
            <span className="sk sk--text" style={{ width: 70 }} />
          </span>
        </span>
        <span className="ed__spacer" />
        <span className="sk sk--btn" style={{ width: 92, marginBottom: 8 }} />
        <span className="sk sk--btn" style={{ width: 58, marginBottom: 8 }} />
      </div>

      <div className="ed__body">
        <div className="ed__cm ed-sk__cm">
          <div className="ed-sk__gutter" aria-hidden="true">
            {LINE_WIDTHS.map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
          <div className="ed-sk__lines" aria-hidden="true">
            {LINE_WIDTHS.map((w, i) => (
              <span key={i} className="sk sk--line" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>

      <div className="ed__status">
        <span className="sk sk--text" style={{ width: 60 }} />
        <span className="sk sk--text" style={{ width: 70 }} />
        <span className="ed__spacer" />
        <span className="ed-sk__note">loading the editor…</span>
      </div>
    </div>
  );
}
