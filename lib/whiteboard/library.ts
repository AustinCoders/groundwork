import { bounds, duplicate, isLinear, unionBounds, type El } from "@/lib/whiteboard/model";
import { box, link } from "@/lib/whiteboard/templates";

export type PartGroup = "Edge" | "Compute" | "Data" | "Messaging" | "Patterns";

export interface Part {
  id: string;
  label: string;
  group: PartGroup;
  build: () => El[];
}

export const PART_GROUPS: PartGroup[] = ["Edge", "Compute", "Data", "Messaging", "Patterns"];

function single(id: string, group: PartGroup, kind: Parameters<typeof box>[0], label: string, fill: string): Part {
  const tall = kind === "cylinder" || kind === "hexagon" || kind === "cloud";
  return {
    id,
    label,
    group,
    build: () => [box(kind, 0, 0, tall ? 150 : 160, tall ? 100 : 76, label, { fill })],
  };
}

function loadBalanced(): El[] {
  const lb = box("hexagon", 0, 60, 150, 90, "Load balancer", { fill: "blue-soft" });
  const one = box("rect", 340, 0, 160, 76, "App server");
  const two = box("rect", 340, 134, 160, 76, "App server");
  return [lb, one, two, link(lb, one, { route: "elbow" }), link(lb, two, { route: "elbow" })];
}

function cacheAside(): El[] {
  const app = box("rect", 0, 90, 160, 76, "App server");
  const cache = box("cylinder", 360, 0, 140, 100, "Cache", { fill: "yellow-soft" });
  const db = box("cylinder", 360, 160, 140, 100, "Database", { fill: "green-soft" });
  return [
    app,
    cache,
    db,
    link(app, cache, { route: "elbow" }, "1 check"),
    link(app, db, { route: "elbow", dash: "dashed" }, "2 miss"),
  ];
}

function queueWorkers(): El[] {
  const api = box("rect", 0, 70, 150, 76, "API server");
  const queue = box("parallelogram", 270, 75, 170, 66, "Queue", { fill: "purple-soft" });
  const one = box("rect", 600, 0, 150, 76, "Worker");
  const two = box("rect", 600, 140, 150, 76, "Worker");
  return [
    api,
    queue,
    one,
    two,
    link(api, queue, {}, "enqueue"),
    link(queue, one, { route: "elbow" }, "pull"),
    link(queue, two, { route: "elbow" }),
  ];
}

function primaryReplica(): El[] {
  const primary = box("cylinder", 0, 0, 150, 100, "Primary", { fill: "green-soft" });
  const replica = box("cylinder", 320, 0, 150, 100, "Replica", { fill: "green-soft", dash: "dashed" });
  return [primary, replica, link(primary, replica, { dash: "dashed" }, "replicates")];
}

function cdnInFront(): El[] {
  const client = box("rect", 0, 10, 140, 76, "Client");
  const cdn = box("cloud", 240, 0, 160, 96, "CDN");
  const origin = box("rect", 500, 10, 150, 76, "Origin");
  return [client, cdn, origin, link(client, cdn), link(cdn, origin, { dash: "dashed" }, "miss")];
}

export const PARTS: Part[] = [
  single("client", "Edge", "rect", "Client", "none"),
  single("dns", "Edge", "ellipse", "DNS", "none"),
  single("cdn", "Edge", "cloud", "CDN", "none"),
  single("load-balancer", "Edge", "hexagon", "Load balancer", "blue-soft"),
  single("api-gateway", "Edge", "rect", "API gateway", "blue-soft"),
  single("rate-limiter", "Edge", "diamond", "Rate limiter", "yellow-soft"),
  single("app-server", "Compute", "rect", "App server", "none"),
  single("service", "Compute", "rect", "Service", "teal-soft"),
  single("worker", "Compute", "rect", "Worker", "grey-soft"),
  single("third-party", "Compute", "cloud", "Third-party API", "grey-soft"),
  single("sql", "Data", "cylinder", "SQL database", "green-soft"),
  single("nosql", "Data", "cylinder", "NoSQL store", "teal-soft"),
  single("cache", "Data", "cylinder", "Cache", "yellow-soft"),
  single("object-storage", "Data", "cylinder", "Object storage", "grey-soft"),
  single("queue", "Messaging", "parallelogram", "Message queue", "purple-soft"),
  single("topic", "Messaging", "parallelogram", "Pub/sub topic", "teal-soft"),
  { id: "load-balanced", label: "Load-balanced servers", group: "Patterns", build: loadBalanced },
  { id: "cache-aside", label: "Cache-aside read", group: "Patterns", build: cacheAside },
  { id: "queue-workers", label: "Queue and workers", group: "Patterns", build: queueWorkers },
  { id: "primary-replica", label: "Primary and replica", group: "Patterns", build: primaryReplica },
  { id: "cdn-origin", label: "CDN in front of origin", group: "Patterns", build: cdnInFront },
];

export function partFromEls(saved: readonly El[]): () => El[] {
  return () => {
    const ids = new Set(saved.map((e) => e.id));
    const { els, created } = duplicate([...saved], ids, 0);
    return els.filter((e) => created.includes(e.id));
  };
}

export function clearOf(existing: readonly El[], placed: El[], step = 28, tries = 30): El[] {
  const room = 8;
  const solid = existing.filter((e) => !isLinear(e)).map((e) => bounds(e));
  const whole = unionBounds(placed);
  const shapes = whole ? [whole] : [];
  const blocked = (shift: number) =>
    shapes.some((b) =>
      solid.some(
        (o) =>
          b.x + shift < o.x + o.w + room &&
          o.x < b.x + shift + b.w + room &&
          b.y + shift < o.y + o.h + room &&
          o.y < b.y + shift + b.h + room
      )
    );
  let shift = 0;
  while (shift < step * tries && blocked(shift)) shift += step;
  if (shift >= step * tries) shift = 0;
  return shift ? placed.map((e) => ({ ...e, x: e.x + shift, y: e.y + shift })) : placed;
}
