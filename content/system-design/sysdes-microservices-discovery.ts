import type { Chapter } from "../types";

export const sysdesMicroservicesDiscovery: Chapter = {
  id: "sysdes-microservices-discovery",
  num: "I10",
  title: "Microservices and service discovery",
  short: "Microservices",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle:
    "When splitting a system pays for itself, what it costs, and how one service finds another once the addresses keep changing.",
  body: `<h3>A microservice is a team boundary before it is a technical one</h3>
<p>
  A <b>microservice</b> is a small service that is deployed on its own, owns its own data and is built
  around one business capability. That is the shape Martin Fowler and James Lewis described in their 2014
  essay, and the reason is organisational: when fifty engineers share one deploy, every release waits for
  the slowest change, and a bug in the reviews code can take down checkout. Splitting buys <b>independent
  deploys</b> and <b>independent scaling</b>. It does not buy simplicity. The complexity of the whole system
  stays; it moves from inside a process, where a function call cannot fail halfway, to the network, where it can.
</p>
<p>
  Fowler's advice is blunt: almost every successful microservice system started as a monolith that grew too
  big to work in, and almost every system built as microservices from day one ran into trouble. His "microservice
  premium" makes the same point as a cost curve. Below some level of complexity the extra machinery costs more
  than it returns, and only above it does the productivity gain win. In an interview, "I would start with a
  well-structured monolith and split when a team or a scaling reason forces it" is a stronger answer than
  drawing eleven boxes for a product with ten engineers.
</p>
<table>
  <tr><th>What you gain</th><th>What you pay for it</th></tr>
  <tr><td>Deploy one service without redeploying the rest</td><td>Every call between services can now time out, fail halfway or return a stale answer</td></tr>
  <tr><td>Scale the hot service alone (search, not billing)</td><td>Latency adds up along the call chain, and availability multiplies down it</td></tr>
  <tr><td>A failure stays inside one service if you build it to</td><td>No joins and no transaction across services; consistency becomes your problem (sagas, outbox)</td></tr>
  <tr><td>Each team picks its own stack and release pace</td><td>Contracts between services need versioning, and a change to one can break another silently</td></tr>
  <tr><td>Smaller codebases that a new hire can hold in their head</td><td>Debugging needs distributed tracing, and a local test run no longer covers the system</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ The distributed monolith</span>
  If two services must be deployed together, share a database table or call each other in a tight loop for
  every request, you have a monolith with network calls in the middle. You pay every cost in the right-hand
  column and collect none of the gains in the left. It is the most common way a microservice migration goes wrong.
</div>

<h3>Where to cut: data ownership decides the boundary</h3>
<p>
  The test for a good boundary is not "does this look like a noun" but <b>who owns the data</b>. Each service
  owns its tables and nobody else reads them directly; other services go through its API or consume events it
  publishes. This is the <em>database per service</em> pattern, and it is what makes independent deploys real:
  you can change a table without asking anyone. It is also what takes away joins and cross-service transactions,
  which is exactly the price.
</p>
<figure>
  <svg viewBox="0 0 640 230" class="dg" role="img" aria-label="Left, three services all reading one shared database, which couples their deploys. Right, three services each with its own database and talking to each other through APIs and events.">
    <g class="rough">
      <rect class="boxr" x="24"  y="30"  width="70" height="40" rx="6" />
      <rect class="boxr" x="108" y="30"  width="70" height="40" rx="6" />
      <rect class="boxr" x="192" y="30"  width="70" height="40" rx="6" />
      <rect class="boxr" x="64"  y="150" width="160" height="44" rx="6" />
      <path class="lnr" d="M59,70 L110,150" />
      <path class="lnr" d="M143,70 L144,150" />
      <path class="lnr" d="M227,70 L180,150" />
      <rect class="boxg" x="350" y="30"  width="80" height="40" rx="6" />
      <rect class="boxg" x="450" y="30"  width="80" height="40" rx="6" />
      <rect class="boxg" x="550" y="30"  width="70" height="40" rx="6" />
      <rect class="box"  x="356" y="150" width="68" height="40" rx="6" />
      <rect class="box"  x="456" y="150" width="68" height="40" rx="6" />
      <rect class="box"  x="552" y="150" width="68" height="40" rx="6" />
      <path class="ln" d="M390,70 L390,150" />
      <path class="ln" d="M490,70 L490,150" />
      <path class="ln" d="M585,70 L586,150" />
      <path class="ln dash" d="M430,50 L450,50" />
      <path class="ln dash" d="M530,50 L550,50" />
    </g>
    <text class="sm" x="59"  y="54" text-anchor="middle">orders</text>
    <text class="sm" x="143" y="54" text-anchor="middle">users</text>
    <text class="sm" x="227" y="54" text-anchor="middle">stock</text>
    <text class="sm rd" x="144" y="176" text-anchor="middle">one shared database</text>
    <text class="sm" x="390" y="54" text-anchor="middle">orders</text>
    <text class="sm" x="490" y="54" text-anchor="middle">users</text>
    <text class="sm" x="585" y="54" text-anchor="middle">stock</text>
    <text class="sm" x="390" y="174" text-anchor="middle">own data</text>
    <text class="sm" x="490" y="174" text-anchor="middle">own data</text>
    <text class="sm" x="588" y="174" text-anchor="middle">own data</text>
    <text class="lbl rd" x="144" y="220" text-anchor="middle" style="font-size:14px">lockstep releases</text>
    <text class="lbl gr" x="486" y="220" text-anchor="middle" style="font-size:14px">independent releases</text>
  </svg>
  <figcaption>The left side is a monolith in disguise: any schema change is a three-team conversation. On the right the only coupling is the published API or event, which is the thing you can version.</figcaption>
</figure>
<p>
  Signs you cut in the wrong place: two services that always change in the same pull request, a request that
  needs six calls to assemble one screen, a table that two services both write, or a business operation (place
  an order) that needs a distributed transaction every time. The usual fix is to merge the services back, or
  to move the shared concept into one owner and let the others hold a read-only copy fed by events.
</p>
<p>
  Because there is no join, a read that spans services is built one of three ways. <b>API composition</b>:
  a gateway or the calling service fetches from several and stitches the result, which is simple and costs
  latency. <b>A local read model</b>: a service keeps its own denormalised copy of the data it needs, updated
  from events, which is fast and means it can be stale (see the consistency chapter). <b>A saga</b> for writes
  that must happen across services, with a compensating action for each step that can be undone; the transactions and payments
  chapters work this through.
</p>

<h3>How services find each other: service discovery</h3>
<p>
  In a fixed data centre you could write an address in a config file. With autoscaling, deploys and node
  failures, instances appear and disappear every few minutes and keep getting new addresses. <b>Service
  discovery</b> is the mechanism that maps a stable name such as <code>inventory</code> to the set of
  instances that are alive right now. Three patterns cover almost everything.
</p>
<table>
  <tr><th>Pattern</th><th>Who picks the instance</th><th>Example</th><th>Trade-off</th></tr>
  <tr><td>Client-side discovery</td><td>The caller asks a registry for the list, then balances across it itself</td><td>gRPC with a resolver, Envoy fed by an xDS control plane, Consul, and the older Netflix Eureka</td><td>No extra hop and smart balancing, but every client needs the logic and a language-specific library</td></tr>
  <tr><td>Server-side discovery</td><td>The caller sends to a stable virtual address; a proxy or balancer picks</td><td>A Kubernetes Service, a cloud load balancer</td><td>Simple clients, one more hop, and the balancer is a component you must keep available</td></tr>
  <tr><td>DNS-based</td><td>The caller resolves a name to one or more addresses</td><td>Cluster DNS, Consul DNS, a record per service</td><td>Works with anything, but answers are cached by clients and resolvers, so changes spread slowly</td></tr>
</table>
<p>
  <b>Kubernetes</b> is the version most interviews assume. A Service gives a set of pods one stable virtual IP and
  a DNS name of the form <code>inventory.shop.svc.cluster.local</code> (service, namespace). The control plane
  records the pods behind a Service, and whether each one is ready, in <b>EndpointSlice</b> objects, by default no more than 100 endpoints each, and
  <code>kube-proxy</code> on every node turns that into routing rules. Only ready pods receive traffic, so a
  failed readiness check removes a pod from rotation without anyone editing a config. A service with 450 pods
  therefore needs at least 5 slices (slices are also split by IP family and port set), and splitting a large service into slices is what keeps one pod change from
  re-sending a giant object to every node.
</p>
<p>
  Outside Kubernetes the same ideas appear as a registry (Consul, ZooKeeper or etcd). An instance either
  registers itself and sends a heartbeat before a time-to-live expires, or a platform component registers it and
  runs health checks. Envoy shows the modern form of the client-side idea: a control plane pushes the endpoint list
  to each proxy over its discovery API, so the data path never asks a registry per request.
</p>
<div class="sticky mint">
  <span class="ttl">Discovery has to degrade gracefully</span>
  <ul style="margin:8px 0 0">
    <li><b>Keep the last known good list.</b> If the registry is unreachable, callers should keep using the addresses they already have, not drop to zero and take the whole system down with the registry.</li>
    <li><b>Stale entries are the normal failure.</b> A crashed instance keeps getting traffic until its registration expires and every cache between you and the registry refreshes. Pair discovery with timeouts and retries to a different instance (see the fault tolerance chapter).</li>
    <li><b>Drain before you stop.</b> A deploy should remove an instance from discovery first, wait for in-flight requests, then stop it (see the load balancing chapter on connection draining).</li>
  </ul>
</div>
<h4>Dry run: how long does a dead instance keep getting traffic?</h4>
<table>
  <tr><th>Step</th><th>What happens</th><th>Time</th></tr>
  <tr><td>1</td><td>An instance crashes. It sent its last heartbeat just before.</td><td>t = 0 s</td></tr>
  <tr><td>2</td><td>The registry waits out a 30 s time-to-live before it drops the entry</td><td>entry gone at t = 30 s</td></tr>
  <tr><td>3</td><td>Callers refresh their cached list every 15 s, so the worst case is one full refresh interval after the entry disappears</td><td>last caller updated at t = 45 s</td></tr>
  <tr><td>4</td><td>Requests sent in that window fail or time out and are retried on another instance</td><td>up to 45 s of failed attempts</td></tr>
  <tr><td>5</td><td>An active health check from the proxy (two failures, 5 s apart) would have ejected it much sooner</td><td>about 10 s</td></tr>
</table>
<p class="sub">
  The numbers are an example configuration, not a standard. The point is the shape: <b>staleness is the sum
  of every timer on the path</b>, and the cheapest fix is a fast local health check at the caller or proxy rather
  than a shorter registry time-to-live.
</p>

<h3>The gateway, the mesh and who does what</h3>
<p>
  Two proxies sit on different paths and are often confused. The <b>API gateway</b> handles <em>north-south</em>
  traffic, from outside into the system: authentication, TLS, rate limits, routing and sometimes response
  assembly (the APIs chapter covers what belongs there). A <b>backend for frontend</b> is a gateway tuned to one
  client type, so the mobile app gets one lean response instead of five calls.
</p>
<p>
  A <b>service mesh</b> handles <em>east-west</em> traffic, between services. Each service gets a proxy next to it
  (a sidecar, which in Istio is an Envoy proxy) that adds mutual TLS, retries, timeouts, load balancing and metrics without changing
  application code. Istio also offers an <em>ambient</em> mode that moves the common work into one shared proxy per
  node, with an optional <em>waypoint</em> proxy, per namespace or per service, only where application-layer features such as retries are needed, to cut the
  per-pod overhead. A mesh is worth its cost when many services written in different languages need the same
  security and traffic policy. For five services it is usually a library and a deploy script.
</p>
<div class="warn">
  <span class="ttl">⚠ Retries stack across layers</span>
  A mesh that allows up to three attempts in front of an application that also allows up to three turns one failure
  into nine attempts, and across three layers into twenty-seven (counting three retries as four attempts, the SRE book's
  own example reaches sixty-four). Pick one layer to own retries and put a retry
  budget on it (see the fault tolerance chapter).
</div>

<h3>Dry run: five services, one product page</h3>
<p>
  A product page needs a catalogue record first (it supplies the product id), then pricing, stock, reviews and
  recommendations. Service times: catalogue 20 ms, pricing 15 ms, stock 25 ms, reviews 40 ms, recommendations 60 ms.
  Each service is 99.9% available.
</p>
<table>
  <tr><th>Design</th><th>Latency (sum of the critical path)</th><th>Availability</th><th>Downtime a year (365.25-day year)</th></tr>
  <tr><td>All five called in sequence</td><td>20 + 15 + 25 + 40 + 60 = 160 ms</td><td>0.999<sup>5</sup> = 99.50%</td><td>43.7 hours</td></tr>
  <tr><td>Catalogue first, then the other four in parallel</td><td>20 + max(15, 25, 40, 60) = 80 ms</td><td>99.50% (all still required)</td><td>43.7 hours</td></tr>
  <tr><td>Same, but reviews and recommendations are optional and the page degrades without them</td><td>20 + 25 = 45 ms before the optional parts; 80 ms when they answer</td><td>0.999<sup>3</sup> = 99.70% (catalogue, pricing, stock)</td><td>26.3 hours</td></tr>
</table>
<p class="sub">
  Parallelism fixes latency and does nothing for availability; <b>deciding which dependencies are optional</b>
  fixes availability and costs nothing in latency. That is the whole argument for graceful degradation, and it is
  also why a design with many hard dependencies in a chain should make an interviewer ask "which of these can fail
  without the page failing?".
</p>

<h3>Migrating without a rewrite: the strangler fig</h3>
<p>
  The safe way out of a monolith is not a rewrite. Put a routing layer in front, build one capability as a new
  service, send a slice of its traffic there, and compare. When it behaves, send more; the old code for that
  capability is deleted last. Fowler calls this the <b>strangler fig</b>, after the vine that grows around a tree.
  Every step is reversible by changing the routing, which is the property a big-bang migration lacks. Start with
  an edge capability that has few inbound dependencies (notifications, search, reporting), not with the one the
  whole product leans on.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'd keep this as a modular monolith for now — one deploy, clear
  module boundaries, one database with schemas per module. I'd split out search first because it has a different
  scaling profile and an owning team, and I'd do it behind a routing layer so I can send ten percent of traffic
  and roll back by changing a config. Each new service owns its data; where I need a view across services I'd
  use a read model fed by events rather than a shared table. And I'd decide up front which calls are optional,
  because that, not the parallelism, sets the availability of the page."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>Signals:</b> "multiple teams", "independent deploys", "different scaling needs", or a prompt that lists many nouns (users, orders, payments, inventory). The question underneath is whether to split, not how many boxes to draw.</li>
  <li><b>The naive design</b> is a service per entity with one shared database, or a request that walks six services in series. Name the shared-table coupling and the chain length as the problems before the interviewer does.</li>
  <li><b>Always give the cost with the benefit:</b> network failure, latency along the chain, no cross-service transaction, contract versioning, and the tracing and on-call burden.</li>
  <li><b>Say how services find each other</b> in one sentence (cluster DNS plus ready-pod routing, or a registry with health checks), and what happens when the registry is down.</li>
  <li><b>Separate gateway from mesh:</b> gateway for traffic entering the system, mesh for service-to-service policy. Do not propose a mesh for a handful of services.</li>
  <li><b>The pitfall:</b> starting with microservices because they are fashionable. A monolith with good module boundaries is a defensible, often better, first answer.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Explain why the shared database makes a set of services a distributed monolith, and what you give up when each service owns its data.</li>
    <li>Compute the latency and the availability of a page that calls five services, once in series and once with two optional dependencies in parallel.</li>
    <li>Compare client-side, server-side and DNS-based discovery, and say what happens in each when an instance crashes.</li>
    <li>Say what a gateway does and what a mesh does, and name one situation where a mesh is not worth it.</li>
    <li>Describe how you would move one capability out of a monolith without a rewrite and how you would roll it back.</li>
  </ul>
</div>

<div class="bx is-ref">
  <span class="ttl">Sources and further reading</span>
  <ul>
    <li><a href="https://martinfowler.com/articles/microservices.html" rel="noopener noreferrer">Fowler and Lewis, Microservices</a> — the definition, independent deploys, decentralised data, the costs</li>
    <li><a href="https://martinfowler.com/bliki/MonolithFirst.html" rel="noopener noreferrer">Fowler, Monolith First</a> — why most successful microservice systems began as a monolith</li>
    <li><a href="https://martinfowler.com/bliki/MicroservicePremium.html" rel="noopener noreferrer">Fowler, Microservice Premium</a> — the cost curve and when the productivity gain pays for it</li>
    <li><a href="https://martinfowler.com/bliki/StranglerFigApplication.html" rel="noopener noreferrer">Fowler, Strangler Fig Application</a> — migrating by routing a slice at a time</li>
    <li><a href="https://microservices.io/patterns/data/database-per-service.html" rel="noopener noreferrer">microservices.io: database per service</a> — the pattern and its consequences for joins and transactions</li>
    <li><a href="https://kubernetes.io/docs/concepts/services-networking/service/" rel="noopener noreferrer">Kubernetes: Service</a> — stable virtual IP, cluster DNS names, ready endpoints</li>
    <li><a href="https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/" rel="noopener noreferrer">Kubernetes: EndpointSlices</a> — 100 endpoints per slice by default, why slices scale</li>
    <li><a href="https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/service_discovery" rel="noopener noreferrer">Envoy: service discovery</a> — endpoints pushed by a control plane, active and passive health checking</li>
    <li><a href="https://istio.io/latest/docs/ambient/overview/" rel="noopener noreferrer">Istio: ambient mode overview</a> — the shared per-node proxy and the optional per-service proxy</li>
    <li><a href="https://sre.google/sre-book/addressing-cascading-failures/" rel="noopener noreferrer">SRE book: addressing cascading failures</a> — retry amplification across layers</li>
  </ul>
  <p class="sub">Claims in this chapter were checked against these sources in October 2026. Figures marked "example" are illustrative configurations, not standards.</p>
</div>`,
};
