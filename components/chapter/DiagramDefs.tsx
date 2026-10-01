export function DiagramDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <filter id="wob">
        <feTurbulence type="fractalNoise" baseFrequency={0.022} numOctaves={3} seed={7} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={2.4} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      {(
        [
          ["arrow", "var(--ink)"],
          ["arrow-green", "var(--green)"],
          ["arrow-red", "var(--red)"],
        ] as const
      ).map(([id, fill]) => (
        <marker
          key={id}
          id={id}
          viewBox="0 0 10 10"
          refX="8.5"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" style={{ fill }} />
        </marker>
      ))}
    </svg>
  );
}
