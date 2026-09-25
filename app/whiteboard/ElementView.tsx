"use client";

import { memo } from "react";
import { CSS_PALETTE, describe, type Part } from "@/lib/whiteboard/geometry";
import type { El } from "@/lib/whiteboard/model";

function PartView({ part }: { part: Part }) {
  const { tag, attrs, lines } = part;
  const props: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(attrs)) props[k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = v;
  if (tag === "text") {
    const lh = Number(attrs["font-size"]) * 1.25;
    return (
      <text {...props}>
        {(lines ?? []).map((line, i) => (
          <tspan key={i} x={attrs.x} dy={i ? lh : 0}>
            {line || " "}
          </tspan>
        ))}
      </text>
    );
  }
  if (tag === "image") return <image {...props} />;
  if (tag === "rect") return <rect {...props} />;
  if (tag === "ellipse") return <ellipse {...props} />;
  if (tag === "polygon") return <polygon {...props} />;
  return <path {...props} />;
}

export const ElementView = memo(function ElementView({ el, hidden }: { el: El; hidden?: boolean }) {
  return (
    <g data-id={el.id} data-kind={el.kind} opacity={hidden ? 0 : undefined}>
      {describe(el, CSS_PALETTE).map((part, i) => (
        <PartView key={i} part={part} />
      ))}
    </g>
  );
});
