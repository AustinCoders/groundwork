import type {
  Diagram as DiagramData,
  FlowDiagram,
  SequenceDiagram,
} from "@/content/system-design/company-questions/diagram-types";
import type { SVGProps } from "react";
import { NODE_H, NODE_W, SEQ, layoutFlow, layoutSequence, roundedPath } from "./diagramLayout";
import { SvgFit } from "./SvgFit";
import styles from "./diagram.module.css";

const ICONS: Record<string, string> = {
  client: "M3 4h14v9H3zM7 17h6M10 13v4",
  service: "M10 2l7 4v8l-7 4-7-4V6zM3 6l7 4 7-4M10 10v8",
  store:
    "M3 5c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3zM3 5v10c0 1.7 3.1 3 7 3s7-1.3 7-3V5M3 10c0 1.7 3.1 3 7 3s7-1.3 7-3",
  queue: "M2 6h12M2 10h12M2 14h12M15 7l3 3-3 3",
  cache: "M11 2L4 11h5l-1 7 8-9h-5z",
  external: "M5 15a3.5 3.5 0 010-7 5 5 0 019.6-1A3.8 3.8 0 0115 15z",
  worker:
    "M10 7a3 3 0 100 6 3 3 0 000-6zM10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4",
  decision: "M10 2l8 8-8 8-8-8z",
};

function Canvas({ mini, children, ...props }: SVGProps<SVGSVGElement> & { mini?: boolean }) {
  return mini ? <svg {...props}>{children}</svg> : <SvgFit {...props}>{children}</SvgFit>;
}

function Defs({ uid }: { uid: string }) {
  return (
    <defs>
      <marker id={`${uid}-a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
        <path d="M1 1.5L9 5 1 8.5z" className={styles.arrow} />
      </marker>
      <marker id={`${uid}-p`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
        <path d="M1 1.5L9 5 1 8.5z" className={styles.arrowAsync} />
      </marker>
    </defs>
  );
}

function Flow({ diagram, uid, mini, bare }: { diagram: FlowDiagram; uid: string; mini?: boolean; bare?: boolean }) {
  const layout = layoutFlow(diagram);
  return (
    <Canvas
      mini={mini}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className={mini ? styles.mini : styles.svg}
      role={mini ? undefined : "img"}
      aria-label={mini ? undefined : `${diagram.title}. ${diagram.caption}`}
      aria-hidden={mini ? true : undefined}
      style={mini || bare ? undefined : { minWidth: `${Math.round(layout.width * 0.62)}px` }}
    >
      <Defs uid={uid} />
      {layout.edges.map((laid) => (
        <path
          key={`${laid.edge.from}-${laid.edge.to}`}
          d={roundedPath(laid.points)}
          className={styles.edge}
          data-style={laid.style}
          markerEnd={`url(#${uid}-${laid.style === "async" ? "p" : "a"})`}
        />
      ))}
      {layout.nodes.map((entry) => (
        <g
          key={entry.node.id}
          className={styles.node}
          data-kind={entry.node.kind}
          transform={`translate(${entry.x} ${entry.y})`}
        >
          <rect width={NODE_W} height={NODE_H} rx={mini ? 10 : 16} />
          {!mini && (
            <>
              <g transform="translate(14 22)" className={styles.icon}>
                <path d={ICONS[entry.node.kind]} />
              </g>
              <text
                x={44}
                y={entry.node.sub ? NODE_H / 2 - 3 : entry.lines.length > 1 ? NODE_H / 2 - 5 : NODE_H / 2 + 6}
                className={styles.label}
              >
                {entry.lines.map((line, i) => (
                  <tspan key={line} x={44} dy={i === 0 ? 0 : 19} data-max={NODE_W - 54}>
                    {line}
                  </tspan>
                ))}
              </text>
              {entry.node.sub && (
                <text x={44} y={NODE_H / 2 + 16} className={styles.sub} data-max={NODE_W - 54}>
                  {entry.node.sub}
                </text>
              )}
            </>
          )}
        </g>
      ))}
      {!mini &&
        layout.edges.map(
          (laid) =>
            laid.label && (
              <g key={`l-${laid.edge.from}-${laid.edge.to}`} transform={`translate(${laid.label.x} ${laid.label.y})`}>
                <rect
                  x={-laid.label.width / 2}
                  y={-11}
                  width={laid.label.width}
                  height={22}
                  rx={11}
                  className={styles.pill}
                />
                <text
                  textAnchor="middle"
                  x={laid.label.shift}
                  y={4}
                  className={styles.pillText}
                  data-max={laid.label.width - 14 - (laid.edge.step ? 22 : 0)}
                >
                  {laid.edge.label}
                </text>
              </g>
            )
        )}
      {!mini &&
        layout.edges.map(
          (laid) =>
            laid.badge && (
              <g key={`b-${laid.edge.from}-${laid.edge.to}`} transform={`translate(${laid.badge[0]} ${laid.badge[1]})`}>
                <circle r={11} className={styles.badge} />
                <text textAnchor="middle" y={4} className={styles.badgeText}>
                  {laid.edge.step}
                </text>
              </g>
            )
        )}
    </Canvas>
  );
}

function Sequence({
  diagram,
  uid,
  mini,
  bare,
}: {
  diagram: SequenceDiagram;
  uid: string;
  mini?: boolean;
  bare?: boolean;
}) {
  const layout = layoutSequence(diagram);
  return (
    <Canvas
      mini={mini}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className={mini ? styles.mini : styles.svg}
      role={mini ? undefined : "img"}
      aria-label={mini ? undefined : `${diagram.title}. ${diagram.caption}`}
      aria-hidden={mini ? true : undefined}
      style={mini || bare ? undefined : { minWidth: `${Math.round(layout.width * 0.7)}px` }}
    >
      <Defs uid={uid} />
      {layout.actors.map((actor) => (
        <g key={actor.id}>
          <line x1={actor.cx} x2={actor.cx} y1={SEQ.top + SEQ.head} y2={layout.lifeEnd} className={styles.life} />
          <g className={styles.node} data-kind={actor.kind} transform={`translate(${actor.cx - 66} ${SEQ.top})`}>
            <rect width={132} height={SEQ.head} rx={mini ? 8 : 14} />
            {!mini && (
              <text x={66} y={SEQ.head / 2 + 5} textAnchor="middle" className={styles.label} data-max={116}>
                {actor.label}
              </text>
            )}
          </g>
        </g>
      ))}
      {layout.rows.map((row) => {
        const marker = `url(#${uid}-${row.style === "async" ? "p" : "a"})`;
        if (row.self) {
          const x = row.x1;
          return (
            <g key={row.n}>
              <path
                d={`M${x} ${row.y - 12} h42 v26 h-42`}
                className={styles.edge}
                data-style={row.style}
                markerEnd={marker}
              />
              {!mini && (
                <text x={x + 52} y={row.y + 5} className={styles.seqText} data-max={SEQ.colW - 70}>
                  {row.label}
                </text>
              )}
              {!mini && (
                <g transform={`translate(${x - 14} ${row.y - 12})`}>
                  <circle r={10} className={styles.badge} />
                  <text textAnchor="middle" y={4} className={styles.badgeText}>
                    {row.n}
                  </text>
                </g>
              )}
            </g>
          );
        }
        const toRight = row.x2 > row.x1;
        return (
          <g key={row.n}>
            <line
              x1={row.x1}
              x2={row.x2 + (toRight ? -2 : 2)}
              y1={row.y}
              y2={row.y}
              className={styles.edge}
              data-style={row.style}
              markerEnd={marker}
            />
            {!mini && (
              <>
                <text
                  x={(row.x1 + row.x2) / 2}
                  y={row.y - 9}
                  textAnchor="middle"
                  className={styles.seqText}
                  data-max={Math.max(60, Math.abs(row.x2 - row.x1) - 44)}
                >
                  {row.label}
                </text>
                <g transform={`translate(${row.x1 + (toRight ? 16 : -16)} ${row.y})`}>
                  <circle r={10} className={styles.badge} />
                  <text textAnchor="middle" y={4} className={styles.badgeText}>
                    {row.n}
                  </text>
                </g>
              </>
            )}
          </g>
        );
      })}
    </Canvas>
  );
}

export function Diagram({
  diagram,
  uid,
  mini,
  bare,
}: {
  diagram: DiagramData;
  uid: string;
  mini?: boolean;
  bare?: boolean;
}) {
  if (bare) {
    return diagram.kind === "flow" ? (
      <Flow diagram={diagram} uid={uid} bare />
    ) : (
      <Sequence diagram={diagram} uid={uid} bare />
    );
  }
  if (mini) {
    return diagram.kind === "flow" ? (
      <Flow diagram={diagram} uid={uid} mini />
    ) : (
      <Sequence diagram={diagram} uid={uid} mini />
    );
  }
  return (
    <figure className={styles.figure}>
      <figcaption className={styles.head}>
        <b>{diagram.title}</b>
        <span>{diagram.caption}</span>
      </figcaption>
      <div className={styles.scroll} tabIndex={0} role="group" aria-label={`${diagram.title}, scrollable`}>
        {diagram.kind === "flow" ? <Flow diagram={diagram} uid={uid} /> : <Sequence diagram={diagram} uid={uid} />}
      </div>
      {diagram.kind === "flow" && diagram.steps && (
        <ol className={styles.steps}>
          {diagram.steps.map((step, index) => (
            <li key={step}>
              <span aria-hidden="true">{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}
