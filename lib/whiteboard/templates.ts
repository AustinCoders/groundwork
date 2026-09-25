import { DEFAULT_STYLE, newId, routeArrows, unionBounds, type El, type Kind, type Style } from "@/lib/whiteboard/model";

export interface Template {
  id: string;
  label: string;
  hint: string;
  build: () => El[];
}

function box(kind: Kind, x: number, y: number, w: number, h: number, text = "", style: Partial<Style> = {}): El {
  return { id: newId(), kind, x, y, w, h, text, style: { ...DEFAULT_STYLE, ...style } };
}

function link(a: El, b: El, style: Partial<Style> = {}): El {
  return {
    id: newId(),
    kind: "arrow",
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    points: [
      [0, 0],
      [0, 0],
    ],
    start: a.id,
    end: b.id,
    style: { ...DEFAULT_STYLE, ...style },
  };
}

function label(x: number, y: number, text: string, fontSize = 24): El {
  return box("text", x, y, Math.ceil(text.length * fontSize * 0.58) + 8, Math.ceil(fontSize * 1.25) + 8, text, {
    fontSize,
  });
}

function sticky(x: number, y: number, text: string, fill = "yellow-soft"): El {
  return box("sticky", x, y, 180, 120, text, { fill, fontSize: 18 });
}

function flowchart(): El[] {
  const start = box("ellipse", 60, 0, 180, 70, "Start", { fill: "green-soft" });
  const input = box("parallelogram", 40, 130, 220, 80, "Read input");
  const decide = box("diamond", 50, 270, 200, 130, "Valid?", { fill: "yellow-soft" });
  const work = box("rect", 50, 460, 200, 80, "Process it");
  const fix = box("rect", 340, 295, 180, 80, "Show an error", { fill: "red-soft" });
  const end = box("ellipse", 60, 600, 180, 70, "End", { fill: "green-soft" });
  const yes = label(160, 410, "yes", 18);
  const no = label(262, 300, "no", 18);
  return [
    start,
    input,
    decide,
    work,
    fix,
    end,
    yes,
    no,
    link(start, input),
    link(input, decide),
    link(decide, work),
    link(decide, fix),
    link(fix, input, { dash: "dashed" }),
    link(work, end),
  ];
}

function systemDesign(): El[] {
  const client = box("rect", 0, 150, 160, 80, "Client");
  const cdn = box("cloud", 0, 0, 170, 100, "CDN");
  const lb = box("hexagon", 240, 145, 170, 90, "Load balancer", { fill: "blue-soft" });
  const api1 = box("rect", 490, 70, 170, 80, "API server");
  const api2 = box("rect", 490, 230, 170, 80, "API server");
  const cache = box("cylinder", 750, 0, 150, 110, "Cache", { fill: "yellow-soft" });
  const db = box("cylinder", 750, 150, 150, 120, "Database", { fill: "green-soft" });
  const queue = box("parallelogram", 730, 320, 190, 70, "Queue", { fill: "purple-soft" });
  const worker = box("rect", 990, 315, 160, 80, "Worker");
  return [
    client,
    cdn,
    lb,
    api1,
    api2,
    cache,
    db,
    queue,
    worker,
    link(client, cdn, { dash: "dashed" }),
    link(client, lb),
    link(lb, api1),
    link(lb, api2),
    link(api1, cache),
    link(api1, db),
    link(api2, db),
    link(api2, queue),
    link(queue, worker),
  ];
}

function columns(titles: string[], notes: string[][], fills: string[]): El[] {
  const out: El[] = [];
  titles.forEach((title, i) => {
    const x = i * 240;
    out.push(label(x + 10, 0, title, 26));
    out.push(box("rect", x, 50, 220, 460, "", { fill: "paper", dash: "dashed", width: 1 }));
    notes[i].forEach((note, j) => out.push(sticky(x + 20, 70 + j * 140, note, fills[i])));
  });
  return out;
}

function kanban(): El[] {
  return columns(
    ["To do", "Doing", "Done"],
    [["Write the spec", "Design the API"], ["Build the board"], ["Set up the repo", "Pick a stack"]],
    ["yellow-soft", "blue-soft", "green-soft"]
  );
}

function retro(): El[] {
  return columns(
    ["Went well", "To improve", "Actions"],
    [["Shipped on time"], ["Too many meetings"], ["Try a no-meeting day"]],
    ["green-soft", "red-soft", "blue-soft"]
  );
}

function mindMap(): El[] {
  const centre = box("ellipse", 300, 200, 220, 110, "Main idea", { fill: "yellow-soft", fontSize: 24 });
  const spots: [number, number][] = [
    [0, 20],
    [320, -80],
    [640, 20],
    [640, 380],
    [320, 480],
    [0, 380],
  ];
  const fills = ["red-soft", "blue-soft", "green-soft", "purple-soft", "teal-soft", "yellow-soft"];
  const out: El[] = [centre];
  spots.forEach(([x, y], i) => {
    const node = box("rect", x + 10, y, 180, 70, `Branch ${i + 1}`, { fill: fills[i] });
    out.push(node, link(centre, node, { endHead: "none" }));
  });
  return out;
}

function matrix(): El[] {
  const cells: [string, string, number, number][] = [
    ["Do first", "red-soft", 0, 0],
    ["Schedule", "blue-soft", 300, 0],
    ["Delegate", "yellow-soft", 0, 220],
    ["Drop", "grey-soft", 300, 220],
  ];
  const out: El[] = cells.map(([text, fill, x, y]) => box("rect", x + 60, y + 40, 280, 200, text, { fill }));
  out.push(label(230, 0, "Important →", 20));
  out.push(label(0, 470, "Urgent ↓ · Less urgent →", 18));
  return out;
}

export const TEMPLATES: Template[] = [
  { id: "flowchart", label: "Flowchart", hint: "Start, decision, loop back, end", build: flowchart },
  { id: "system", label: "System design", hint: "Client, load balancer, APIs, cache, DB, queue", build: systemDesign },
  { id: "kanban", label: "Kanban", hint: "To do, doing, done", build: kanban },
  { id: "mind-map", label: "Mind map", hint: "An idea with six branches", build: mindMap },
  { id: "matrix", label: "2 × 2 matrix", hint: "Urgent vs important", build: matrix },
  { id: "retro", label: "Retro", hint: "Went well, to improve, actions", build: retro },
];

export function placeTemplate(t: Template, centre: [number, number]): El[] {
  const els = routeArrows(t.build());
  const b = unionBounds(els)!;
  const dx = centre[0] - (b.x + b.w / 2);
  const dy = centre[1] - (b.y + b.h / 2);
  return routeArrows(els.map((e) => ({ ...e, x: e.x + dx, y: e.y + dy })));
}
