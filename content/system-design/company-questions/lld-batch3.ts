import type { LldQuestion } from "./lld-types";

export const questions: LldQuestion[] = [
  {
    id: "amazon-parking-lot",
    company: "amazon",
    title: "Parking lot system",
    prompt:
      "Model a parking lot that has small, medium and large spots. It must let you check whether a spot is available and respect which vehicle types may use which spots. Expect to discuss how the design grows to handle real-world complications.",
    level: "SDE-3 (L6); also SDE-1 (L4)",
    round: "lld",
    topic: "booking",
    patterns: ["Strategy", "Factory"],
    evidence: "several",
    sources: [
      {
        label: "Interview Experience 98, Amazon SDE3 L6 (Roundz)",
        url: "https://roundz.substack.com/p/interview-experience-98-amazon-sde3-l6",
        kind: "candidate-report",
        year: 2025,
      },
      {
        label: "Interview Experience: Amazon SDE1 L4 (Roundz)",
        url: "https://roundz.substack.com/p/interview-experience-amazon-sde1-l4",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: [],
    answer: {
      ask: "<p>Questions worth asking before drawing anything:</p><ul><li>Is this one lot with one entrance, or several floors and gates?</li><li>Which vehicle types exist, and may a small vehicle use a larger spot?</li><li>How is the fee calculated, and who pays on exit?</li><li>Do spots ever go out of service, and is a reservation a requirement now or a later extension?</li></ul><p><b>Assumed scope.</b> The reports name three spot sizes, an availability check, vehicle-type constraints and unspecified real-world extensions. Tickets, fees, out-of-service spots, hourly pricing and reservations are this answer's own assumptions and extension examples, not reported requirements. In: one lot, three spot sizes (small, medium, large), three vehicle types (bike, car, truck), ticket on entry, fee on exit, an availability count per size, and a swappable spot-picking rule and pricing rule. Out: payment processing, entry hardware, multiple lots, and reservations, which are discussed as an extension.</p>",
      entities:
        "<ul><li><b>Vehicle</b> has a plate and a type. It knows the smallest spot size it needs (bike needs small, car needs medium, truck needs large).</li><li><b>Spot</b> has an id, a size, a distance from the entrance, an occupant and an out-of-service flag. It answers <code>isFree</code> and <code>fits(vehicle)</code>.</li><li><b>SmallestFit</b> and <b>NearestFit</b> implement the allocation strategy: given the spots and a vehicle, return one free spot or nothing.</li><li><b>HourlyPricing</b> and <b>FlatPricing</b> implement the pricing strategy: given a spot and the minutes parked, return a fee.</li><li><b>Ticket</b> links a vehicle, the spot it took and the entry time.</li><li><b>ParkingLot</b> has many spots, uses one allocation strategy and one pricing strategy, owns the open tickets, and reads time from an injected clock.</li></ul>",
      design:
        "<p>The lot is a thin coordinator. It owns the spots and the open tickets, and it delegates the two decisions that tend to change: which spot to give, and how much to charge. Both are strategies passed into the constructor, so adding a new rule never edits <code>ParkingLot</code>.</p><p><b>Entry flow.</b> <code>park</code> first rejects a plate that already has an open ticket. It then asks the allocation strategy for a spot. <code>SmallestFit</code> scans every spot and keeps the free one that fits with the smallest size, breaking ties by the shortest distance, so large spots stay available for trucks. <code>NearestFit</code> ignores size and takes the closest free spot that fits. If the strategy returns nothing, the lot answers with a reason instead of throwing, because a full lot is a normal outcome. Otherwise it marks the spot occupied, builds a <code>Ticket</code> with the clock reading and stores it.</p><p><b>Exit flow.</b> <code>unpark</code> looks up the ticket, computes the minutes from the injected clock, asks the pricing strategy for the fee, frees the spot and deletes the ticket. <code>HourlyPricing</code> charges every started hour with a one hour minimum, so 60 minutes costs one hour and 61 costs two. Using a clock object rather than reading the system time is what lets the tests step time deterministically.</p><p><b>Where patterns earn their place.</b> Strategy appears twice and each use is a real axis of change. The small <code>buildLot</code> function plays the factory role: it builds the spot layout and wires the lot together, so callers never assemble spots by hand. A singleton is not needed: one lot instance is passed where it is used.</p><p><b>Complexity and trade-off.</b> Allocation is a linear scan of the spots, and the duplicate plate check scans open tickets. That is fine for a few hundred spots and keeps the code obvious. For thousands, keep a free list per size ordered by distance (a heap or sorted set) and a map from plate to ticket, which makes both operations logarithmic or constant. In a concurrent lot, <code>park</code> must claim the spot atomically (compare and set on the occupant), otherwise two gates can hand out the same spot.</p>",
      extend: [
        "How would you add reservations so a spot is held for a time window and the allocation strategy never gives it away?",
        "How would you support several floors, and let the allocation strategy prefer a floor near the exit that the driver picked?",
        "How would you price differently by vehicle type, by time of day, or with a daily cap, without growing one big if statement?",
        "What changes if two entry gates call park at the same moment, and where do you put the lock or the atomic claim?",
        "How would you let a car take two adjacent small spots when no medium spot is left?",
      ],
      slips:
        "<p>These are the mistakes this problem punishes:</p><ul><li>Branching on the vehicle type inside the lot, so every new vehicle type or pricing rule edits the core class. Push the rule into the vehicle needs and the strategies.</li><li>Letting a truck into a medium spot, or a car into a small one. The fit check must compare ranked sizes, not just equality.</li><li>Reading <code>Date.now()</code> inside the lot, which makes pricing impossible to test. Inject a clock.</li><li>Charging zero for a short stay, or rounding 61 minutes down to one hour. State the rounding rule and test the boundary.</li><li>Forgetting to free the spot on exit, or allowing the same plate to park twice.</li><li>Starting with a deep inheritance tree of Car, Bike and Truck subclasses that differ only by a constant.</li></ul>",
    },
    code: `const SIZE_RANK = { SMALL: 1, MEDIUM: 2, LARGE: 3 };
const NEEDS = { BIKE: "SMALL", CAR: "MEDIUM", TRUCK: "LARGE" };

class Vehicle {
  constructor(plate, type) {
    if (!NEEDS[type]) throw new Error("unknown vehicle type " + type);
    this.plate = plate;
    this.type = type;
  }
  get minimumSize() {
    return NEEDS[this.type];
  }
}

class Spot {
  constructor(id, size, distance) {
    this.id = id;
    this.size = size;
    this.distance = distance;
    this.occupant = null;
    this.outOfService = false;
  }
  get isFree() {
    return this.occupant === null && !this.outOfService;
  }
  fits(vehicle) {
    return SIZE_RANK[this.size] >= SIZE_RANK[vehicle.minimumSize];
  }
}

class SmallestFit {
  pick(spots, vehicle) {
    let best = null;
    for (const spot of spots) {
      if (!spot.isFree || !spot.fits(vehicle)) continue;
      const smaller = best && SIZE_RANK[spot.size] < SIZE_RANK[best.size];
      const closer = best && spot.size === best.size && spot.distance < best.distance;
      if (!best || smaller || closer) best = spot;
    }
    return best;
  }
}

class NearestFit {
  pick(spots, vehicle) {
    let best = null;
    for (const spot of spots) {
      if (!spot.isFree || !spot.fits(vehicle)) continue;
      if (!best || spot.distance < best.distance) best = spot;
    }
    return best;
  }
}

class HourlyPricing {
  constructor(ratesBySize) {
    this.rates = ratesBySize;
  }
  fee(spot, minutes) {
    const hours = Math.max(1, Math.ceil(minutes / 60));
    return hours * this.rates[spot.size];
  }
}

class FlatPricing {
  constructor(amount) {
    this.amount = amount;
  }
  fee() {
    return this.amount;
  }
}

class Ticket {
  constructor(id, vehicle, spot, enteredAt) {
    this.id = id;
    this.vehicle = vehicle;
    this.spot = spot;
    this.enteredAt = enteredAt;
  }
}

class ParkingLot {
  constructor(spots, allocation, pricing, clock) {
    this.spots = spots;
    this.allocation = allocation;
    this.pricing = pricing;
    this.clock = clock;
    this.open = new Map();
    this.nextTicket = 1;
  }
  park(vehicle) {
    for (const ticket of this.open.values()) {
      if (ticket.vehicle.plate === vehicle.plate) return { ok: false, reason: "already parked" };
    }
    const spot = this.allocation.pick(this.spots, vehicle);
    if (!spot) return { ok: false, reason: "no spot available" };
    spot.occupant = vehicle;
    const ticket = new Ticket("T" + this.nextTicket++, vehicle, spot, this.clock.now());
    this.open.set(ticket.id, ticket);
    return { ok: true, ticket };
  }
  unpark(ticketId) {
    const ticket = this.open.get(ticketId);
    if (!ticket) return { ok: false, reason: "unknown ticket" };
    const minutes = this.clock.now() - ticket.enteredAt;
    const fee = this.pricing.fee(ticket.spot, minutes);
    ticket.spot.occupant = null;
    this.open.delete(ticketId);
    return { ok: true, fee, spotId: ticket.spot.id, minutes };
  }
  setOutOfService(spotId, value) {
    const spot = this.spots.find((s) => s.id === spotId);
    if (!spot || spot.occupant) return false;
    spot.outOfService = value;
    return true;
  }
  availability() {
    const counts = { SMALL: 0, MEDIUM: 0, LARGE: 0 };
    for (const spot of this.spots) if (spot.isFree) counts[spot.size]++;
    return counts;
  }
  setPricing(pricing) {
    this.pricing = pricing;
  }
}

class FakeClock {
  constructor(start = 0) {
    this.time = start;
  }
  now() {
    return this.time;
  }
  advance(minutes) {
    this.time += minutes;
  }
}

function buildLot(allocation, pricing, clock) {
  const spots = [
    new Spot("S1", "SMALL", 5),
    new Spot("S2", "SMALL", 4),
    new Spot("M1", "MEDIUM", 3),
    new Spot("M2", "MEDIUM", 2),
    new Spot("L1", "LARGE", 1),
  ];
  return new ParkingLot(spots, allocation, pricing, clock);
}`,
    checks: [
      {
        name: "parks a bike in the closest of the smallest spots",
        expr: '(() => { const lot = buildLot(new SmallestFit(), new FlatPricing(10), new FakeClock()); return lot.park(new Vehicle("B1", "BIKE")).ticket.spot.id; })()',
        expected: "S2",
      },
      {
        name: "falls back to a larger spot when its own size is full",
        expr: '(() => { const lot = buildLot(new SmallestFit(), new FlatPricing(10), new FakeClock()); return ["C1", "C2", "C3"].map((plate) => lot.park(new Vehicle(plate, "CAR")).ticket.spot.id); })()',
        expected: ["M2", "M1", "L1"],
      },
      {
        name: "never puts a truck in a smaller spot",
        expr: '(() => { const lot = buildLot(new SmallestFit(), new FlatPricing(10), new FakeClock()); const first = lot.park(new Vehicle("T1", "TRUCK")); const second = lot.park(new Vehicle("T2", "TRUCK")); return [first.ok, second.ok, second.reason]; })()',
        expected: [true, false, "no spot available"],
      },
      {
        name: "rejects the same plate while it is still parked",
        expr: '(() => { const lot = buildLot(new SmallestFit(), new FlatPricing(10), new FakeClock()); lot.park(new Vehicle("C1", "CAR")); return lot.park(new Vehicle("C1", "CAR")).reason; })()',
        expected: "already parked",
      },
      {
        name: "charges per started hour with a one hour minimum",
        expr: '(() => { const rates = { SMALL: 10, MEDIUM: 20, LARGE: 40 }; const fees = [0, 60, 61].map((minutes) => { const clock = new FakeClock(); const lot = buildLot(new SmallestFit(), new HourlyPricing(rates), clock); const ticket = lot.park(new Vehicle("C1", "CAR")).ticket; clock.advance(minutes); return lot.unpark(ticket.id).fee; }); return fees; })()',
        expected: [20, 20, 40],
      },
      {
        name: "swaps the pricing strategy without touching the lot",
        expr: '(() => { const clock = new FakeClock(); const lot = buildLot(new SmallestFit(), new HourlyPricing({ SMALL: 10, MEDIUM: 20, LARGE: 40 }), clock); const ticket = lot.park(new Vehicle("C1", "CAR")).ticket; clock.advance(180); lot.setPricing(new FlatPricing(7)); return lot.unpark(ticket.id).fee; })()',
        expected: 7,
      },
      {
        name: "swaps the allocation strategy to prefer the closest spot",
        expr: '(() => { const smallest = buildLot(new SmallestFit(), new FlatPricing(1), new FakeClock()); const nearest = buildLot(new NearestFit(), new FlatPricing(1), new FakeClock()); return [smallest, nearest].map((lot) => lot.park(new Vehicle("B1", "BIKE")).ticket.spot.id); })()',
        expected: ["S2", "L1"],
      },
      {
        name: "frees the spot on exit and reports availability",
        expr: '(() => { const lot = buildLot(new SmallestFit(), new FlatPricing(10), new FakeClock()); const ticket = lot.park(new Vehicle("C1", "CAR")).ticket; const during = lot.availability(); lot.unpark(ticket.id); return [during, lot.availability()]; })()',
        expected: [
          { SMALL: 2, MEDIUM: 1, LARGE: 1 },
          { SMALL: 2, MEDIUM: 2, LARGE: 1 },
        ],
      },
      {
        name: "skips a spot taken out of service and refuses to disable an occupied one",
        expr: '(() => { const lot = buildLot(new SmallestFit(), new FlatPricing(10), new FakeClock()); lot.setOutOfService("M2", true); const car = lot.park(new Vehicle("C1", "CAR")); return [car.ticket.spot.id, lot.setOutOfService("M1", true)]; })()',
        expected: ["M1", false],
      },
      {
        name: "rejects an unknown ticket",
        expr: '(() => { const lot = buildLot(new SmallestFit(), new FlatPricing(10), new FakeClock()); return lot.unpark("T99"); })()',
        expected: { ok: false, reason: "unknown ticket" },
      },
      {
        name: "rejects a second exit on the same ticket and lets the plate park again",
        expr: '(() => { const lot = buildLot(new SmallestFit(), new FlatPricing(10), new FakeClock()); const ticket = lot.park(new Vehicle("C1", "CAR")).ticket; const first = lot.unpark(ticket.id).ok; const second = lot.unpark(ticket.id).reason; return [first, second, lot.park(new Vehicle("C1", "CAR")).ok]; })()',
        expected: [true, "unknown ticket", true],
      },
      {
        name: "returns a disabled spot to service and keeps the rest of the lot untouched",
        expr: '(() => { const lot = buildLot(new SmallestFit(), new FlatPricing(10), new FakeClock()); ["S1", "S2"].forEach((id) => lot.setOutOfService(id, true)); const blocked = lot.park(new Vehicle("B1", "BIKE")).ticket.spot.id; lot.setOutOfService("S1", false); return [blocked, lot.availability().SMALL, lot.park(new Vehicle("B2", "BIKE")).ticket.spot.id]; })()',
        expected: ["M2", 1, "S1"],
      },
      {
        name: "reports a full lot as a result and leaves availability unchanged",
        expr: '(() => { const lot = buildLot(new SmallestFit(), new FlatPricing(10), new FakeClock()); lot.park(new Vehicle("T1", "TRUCK")); const before = lot.availability(); const refused = lot.park(new Vehicle("T2", "TRUCK")); return [refused.ok, lot.availability(), before]; })()',
        expected: [false, { SMALL: 2, MEDIUM: 2, LARGE: 0 }, { SMALL: 2, MEDIUM: 2, LARGE: 0 }],
      },
      {
        name: "refuses an unknown vehicle type",
        expr: '(() => { try { new Vehicle("X1", "BUS"); return "accepted"; } catch (error) { return error.message; } })()',
        expected: "unknown vehicle type BUS",
      },
    ],
  },
  {
    id: "amazon-elevator-system",
    company: "amazon",
    title: "Elevator system with priority scheduling",
    prompt:
      "Design the classes and public methods of an elevator system for a building, and explain what each class is responsible for. The reported follow-up is to schedule requests by priority.",
    level: "SDE-2 (L5)",
    round: "lld",
    topic: "scheduling",
    patterns: ["State", "Strategy", "Scheduler"],
    evidence: "one",
    sources: [
      {
        label: "Interview Experience 82, Amazon SDE2 (Roundz)",
        url: "https://roundz.substack.com/p/interview-experience-82-amazon-sde2",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: [],
    answer: {
      ask: "<p>Clarify these before designing:</p><ul><li>How many elevators and floors, and is the building one bank or several zones?</li><li>Are there two kinds of request: a call button on a floor (with a direction) and a floor button inside a car?</li><li>What does priority mean: a fire or service mode, a VIP floor, or a request that has waited long?</li><li>Do we model time, or only the order of events?</li></ul><p><b>Assumed scope.</b> The report names only the class design and a priority-scheduling follow-up. Spreading calls over several cars, using each request's direction and each car's state, and the numeric priority are this answer's reading of it. In: one bank of elevators, hall calls with a direction and a numeric priority, car calls, a state machine per car, and a swappable dispatch rule, all advanced by explicit ticks. Out: door sensors, weight, a real clock, and fault handling, which come up as extensions.</p>",
      entities:
        "<ul><li><b>Controller</b> owns the elevators, the pending request list and the dispatch strategy. It validates floors, orders pending requests and advances time with <code>step</code>.</li><li><b>Elevator</b> has an id, a floor, a direction, a set of stops, a queue limit and a state (IDLE, UP, DOWN, OPEN). It moves one floor per tick and opens its doors at a stop.</li><li><b>Request</b> is a hall call: a floor, a direction, a priority and an arrival id.</li><li><b>DispatchStrategy</b> is the interface: given the elevators and a request, choose one or none. <b>NearestCar</b> picks the lowest travel cost. <b>LeastBusy</b> picks the car with the fewest stops, with travel cost as the tiebreak.</li></ul><p>The controller has many elevators and many pending requests, and uses exactly one strategy at a time.</p>",
      design:
        "<p>The design separates three things that change for different reasons: the movement rules of one car, the choice of which car answers a call, and the order in which waiting calls are considered.</p><p><b>State machine.</b> Each <code>Elevator</code> is in one of four states. From IDLE it goes UP or DOWN when a stop exists, or straight to OPEN when called at its own floor. UP and DOWN go to OPEN when the car reaches a stop. OPEN goes back to UP, DOWN or IDLE on the next tick, depending on what is left. The rule for direction is the classic sweep: keep going the same way while any stop is ahead, otherwise turn toward the nearest stop. That is why a car heading to 8 still stops at 5 on the way.</p><p><b>Dispatch strategy.</b> The controller asks <code>strategy.choose(elevators, request)</code>. <code>NearestCar</code> uses a travel cost. A car with no stop to visit costs the plain gap. A busy car has a heading, the direction it will take next, and costs the gap when the floor lies that way and the request has the same direction, the gap plus a penalty when the request has the opposite direction, and the distance to its turning point plus the way back when the floor lies behind it. <code>LeastBusy</code> spreads load instead. Swapping them is one call and needs no change to <code>Elevator</code> or the controller.</p><p>A call from inside a car goes through <code>press</code>, which adds a stop to that car directly and skips dispatch. It ignores the queue limit, because a rider already inside must be able to pick a floor, and it throws for an unknown car or floor.</p><p><b>Priority.</b> Each tick the controller sorts pending requests by priority, highest first, then by arrival id, and offers them to the strategy in that order. Dispatch gives each car at most <code>maxQueue</code> distinct stops, and a floor a car already has costs no extra slot, so when cars are full the lower priority calls stay pending while a higher priority call takes the next free slot.</p><p><b>Determinism.</b> Nothing reads a clock. <code>step</code> is the only thing that advances time, so a test can run ten ticks and compare snapshots.</p><p><b>Trade-off.</b> Stops are plain floors, not floor plus direction, so a car can stop for a rider who wants the other direction. The wrong-way penalty makes the strategy avoid that, but a fuller model keeps separate up and down stop sets. A real controller also needs door timers, load limits and an emergency mode that overrides the queue.</p>",
      extend: [
        "How would you add a fire or maintenance mode that takes a car out of dispatch and sends it to the ground floor?",
        "How would you make the stop set direction-aware, so an upward rider is never picked up by a car going down?",
        "How would you stop a low priority request from starving forever behind a stream of high priority ones?",
        "How would you divide a tall building into zones, with some cars serving only certain floors?",
        "How would you add a third dispatch rule that minimises the average waiting time, and how would you test that it beats the others?",
      ],
      slips:
        "<p>Common mistakes on this problem:</p><ul><li>Modelling the elevator as methods like <code>goUp</code> and <code>goDown</code> with no explicit state, so the transitions and the open-door case are scattered through if statements.</li><li>Using real timers or sleeping to simulate movement. Step by ticks so the behaviour is repeatable.</li><li>Hard-coding nearest-car dispatch inside the controller, which leaves nowhere to plug in the priority follow-up.</li><li>Ignoring direction: assigning a downward call to a car that is passing the floor going up.</li><li>Reversing a car that still has stops ahead, which makes riders ride past their floor.</li><li>Letting a priority request jump a full car without saying what happens to the displaced requests.</li></ul>",
    },
    code: `const WRONG_WAY = 10;

class Elevator {
  constructor(id, floor = 0, maxQueue = 4) {
    this.id = id;
    this.floor = floor;
    this.maxQueue = maxQueue;
    this.state = "IDLE";
    this.dir = 0;
    this.stops = new Set();
    this.served = [];
  }
  canTake(floor) {
    return this.stops.has(floor) || this.stops.size < this.maxQueue;
  }
  addStop(floor) {
    this.stops.add(floor);
  }
  ahead(dir) {
    for (const stop of this.stops) if ((stop - this.floor) * dir > 0) return true;
    return false;
  }
  chooseDirection() {
    if (this.dir !== 0 && this.ahead(this.dir)) return this.dir;
    let best = 0;
    let bestGap = Infinity;
    for (const stop of this.stops) {
      const gap = Math.abs(stop - this.floor);
      if (gap > 0 && gap < bestGap) {
        bestGap = gap;
        best = Math.sign(stop - this.floor);
      }
    }
    return best;
  }
  openDoors() {
    this.stops.delete(this.floor);
    this.served.push(this.floor);
    this.state = "OPEN";
    if (this.stops.size === 0) this.dir = 0;
  }
  step() {
    if (this.stops.has(this.floor)) return this.openDoors();
    this.dir = this.chooseDirection();
    if (this.dir === 0) {
      this.state = "IDLE";
      return;
    }
    this.floor += this.dir;
    this.state = this.dir > 0 ? "UP" : "DOWN";
    if (this.stops.has(this.floor)) this.openDoors();
  }
}

function travelCost(elevator, request) {
  const gap = request.floor - elevator.floor;
  const dir = elevator.chooseDirection();
  if (dir === 0) return Math.abs(gap);
  if (dir * gap >= 0) return Math.abs(gap) + (dir === request.dir ? 0 : WRONG_WAY);
  let turn = elevator.floor;
  for (const stop of elevator.stops) {
    const beyond = (stop - elevator.floor) * dir > 0;
    if (beyond && Math.abs(stop - elevator.floor) > Math.abs(turn - elevator.floor)) turn = stop;
  }
  return Math.abs(turn - elevator.floor) + Math.abs(turn - request.floor);
}

function cheapest(elevators, request, costOf) {
  let best = null;
  let bestCost = Infinity;
  for (const elevator of elevators) {
    if (!elevator.canTake(request.floor)) continue;
    const cost = costOf(elevator, request);
    if (cost < bestCost) {
      best = elevator;
      bestCost = cost;
    }
  }
  return best;
}

class NearestCar {
  choose(elevators, request) {
    return cheapest(elevators, request, travelCost);
  }
}

class LeastBusy {
  choose(elevators, request) {
    return cheapest(elevators, request, (e, r) => e.stops.size * 100 + travelCost(e, r));
  }
}

class Controller {
  constructor(floors, elevators, strategy) {
    this.floors = floors;
    this.elevators = elevators;
    this.strategy = strategy;
    this.pending = [];
    this.nextId = 1;
    this.ticks = 0;
  }
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  request(floor, dir, priority = 0) {
    if (floor < 0 || floor >= this.floors) throw new RangeError("no such floor");
    if (dir !== 1 && dir !== -1) throw new RangeError("direction must be 1 or -1");
    const request = { id: this.nextId++, floor, dir, priority };
    this.pending.push(request);
    return request.id;
  }
  press(elevatorId, floor) {
    if (floor < 0 || floor >= this.floors) throw new RangeError("no such floor");
    const elevator = this.elevators.find((e) => e.id === elevatorId);
    if (!elevator) throw new RangeError("no such elevator");
    elevator.addStop(floor);
  }
  dispatch() {
    const order = [...this.pending].sort((a, b) => b.priority - a.priority || a.id - b.id);
    this.pending = [];
    for (const request of order) {
      const elevator = this.strategy.choose(this.elevators, request);
      if (elevator) elevator.addStop(request.floor);
      else this.pending.push(request);
    }
  }
  step() {
    this.dispatch();
    for (const elevator of this.elevators) elevator.step();
    this.ticks++;
  }
  run(maxTicks) {
    for (let i = 0; i < maxTicks && !this.settled(); i++) this.step();
    return this.ticks;
  }
  settled() {
    return (
      this.pending.length === 0 &&
      this.elevators.every((e) => e.stops.size === 0 && e.state !== "UP" && e.state !== "DOWN")
    );
  }
  snapshot() {
    return this.elevators.map((e) => e.id + ":" + e.floor + ":" + e.state);
  }
}`,
    checks: [
      {
        name: "walks a car through the moving, open and idle states",
        expr: '(() => { const car = new Elevator("E1", 0); const ctrl = new Controller(10, [car], new NearestCar()); ctrl.request(3, 1); const states = []; for (let i = 0; i < 4; i++) { ctrl.step(); states.push(car.state + car.floor); } return states; })()',
        expected: ["UP1", "UP2", "OPEN3", "IDLE3"],
      },
      {
        name: "stops at a requested floor on the way past it",
        expr: '(() => { const car = new Elevator("E1", 0); const ctrl = new Controller(10, [car], new NearestCar()); ctrl.press("E1", 5); ctrl.press("E1", 2); ctrl.run(50); return car.served; })()',
        expected: [2, 5],
      },
      {
        name: "keeps its direction while stops remain ahead of it",
        expr: '(() => { const car = new Elevator("E1", 0); const ctrl = new Controller(10, [car], new NearestCar()); ctrl.press("E1", 8); ctrl.step(); ctrl.press("E1", 0); ctrl.run(50); return car.served; })()',
        expected: [8, 0],
      },
      {
        name: "serves the higher priority request first when the queue is full",
        expr: '(() => { const car = new Elevator("E1", 0, 1); const ctrl = new Controller(10, [car], new NearestCar()); ctrl.request(5, 1, 0); ctrl.request(3, 1, 9); ctrl.step(); const waiting = ctrl.pending.length; ctrl.run(50); return [waiting, car.served]; })()',
        expected: [1, [3, 5]],
      },
      {
        name: "avoids a car that would pass the floor in the wrong direction",
        expr: '(() => { const passing = new Elevator("E1", 2); const idle = new Elevator("E2", 7); const ctrl = new Controller(10, [passing, idle], new NearestCar()); passing.addStop(8); passing.step(); ctrl.request(4, -1); ctrl.step(); return [idle.stops.has(4), passing.stops.has(4)]; })()',
        expected: [true, false],
      },
      {
        name: "swaps the dispatch strategy to favour the least busy car",
        expr: '(() => { const pick = (strategy) => { const busy = new Elevator("E1", 0); const free = new Elevator("E2", 9); busy.addStop(5); busy.addStop(6); return strategy.choose([busy, free], { floor: 1, dir: 1, priority: 0 }).id; }; return [pick(new NearestCar()), pick(new LeastBusy())]; })()',
        expected: ["E1", "E2"],
      },
      {
        name: "splits requests between two cars by distance",
        expr: '(() => { const a = new Elevator("E1", 0); const b = new Elevator("E2", 9); const ctrl = new Controller(10, [a, b], new NearestCar()); ctrl.request(1, 1); ctrl.request(8, -1); ctrl.run(50); return [a.served, b.served]; })()',
        expected: [[1], [8]],
      },
      {
        name: "opens the doors without moving when called at its own floor",
        expr: '(() => { const car = new Elevator("E1", 4); const ctrl = new Controller(10, [car], new NearestCar()); ctrl.request(4, 1); ctrl.step(); return ctrl.snapshot(); })()',
        expected: ["E1:4:OPEN"],
      },
      {
        name: "rejects a floor outside the building",
        expr: '(() => { const ctrl = new Controller(10, [new Elevator("E1", 0)], new NearestCar()); try { ctrl.request(10, 1); return "accepted"; } catch (error) { return error.message; } })()',
        expected: "no such floor",
      },
      {
        name: "rejects a bad direction and an unknown car, and queues nothing for them",
        expr: '(() => { const ctrl = new Controller(10, [new Elevator("E1", 0)], new NearestCar()); const errors = []; for (const action of [() => ctrl.request(3, 0), () => ctrl.press("E9", 3), () => ctrl.press("E1", -1)]) { try { action(); errors.push("accepted"); } catch (error) { errors.push(error.message); } } return [errors, ctrl.pending.length, ctrl.elevators[0].stops.size]; })()',
        expected: [["direction must be 1 or -1", "no such elevator", "no such floor"], 0, 0],
      },
      {
        name: "lets a second call for an already queued floor ride along when the car is full",
        expr: '(() => { const car = new Elevator("E1", 0, 1); const ctrl = new Controller(10, [car], new NearestCar()); ctrl.request(5, 1); ctrl.request(5, -1); ctrl.request(7, 1); ctrl.step(); return [ctrl.pending.map((r) => r.floor), [...car.stops]]; })()',
        expected: [[7], [5]],
      },
      {
        name: "serves equal priority requests in arrival order and keeps waiting calls pending",
        expr: '(() => { const car = new Elevator("E1", 5, 1); const ctrl = new Controller(10, [car], new NearestCar()); ctrl.request(6, 1, 1); ctrl.request(4, 1, 5); ctrl.request(7, 1, 5); ctrl.step(); const waiting = ctrl.pending.map((r) => r.floor); ctrl.run(50); return [waiting, car.served]; })()',
        expected: [
          [7, 6],
          [4, 7, 6],
        ],
      },
      {
        name: "prices a request at the floor where a car with the doors open is standing",
        expr: '(() => { const car = new Elevator("E1", 4); car.addStop(4); car.addStop(8); car.step(); return [travelCost(car, { floor: 4, dir: 1 }), travelCost(car, { floor: 4, dir: -1 })]; })()',
        expected: [0, 10],
      },
    ],
  },
  {
    id: "uber-multi-device-controller",
    company: "uber",
    title: "Multi-device controller",
    prompt:
      "Design an application that controls several kinds of device, for example a fan and a television. Some commands apply to every device and some belong to one device type. The brief is loose, so part of the task is deciding which commands exist and whether the set of devices is known up front.",
    level: "SDE",
    round: "lld",
    topic: "infra",
    patterns: ["Command", "Factory"],
    evidence: "one",
    sources: [
      {
        label: "Uber Interview Experience for SDE (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/interview-experiences/uber-interview-experience-for-sde/",
        kind: "candidate-report",
      },
    ],
    chapters: [],
    answer: {
      ask: "<p>The brief is vague, so pin it down out loud:</p><ul><li>Which commands are generic (power on, power off) and which are specific (fan speed, tv channel)?</li><li>Is the set of device types fixed, or will new ones be added later?</li><li>Are devices registered at runtime, or known when the program starts?</li><li>What should happen when a command is sent to a device that is off, or to a device that does not support it?</li><li>Is undo needed?</li></ul><p><b>Assumed scope.</b> The report names only shared and device-specific commands and four required functions that it does not list. Undo and broadcast are this answer's additions. In: registering devices, running a named command with arguments against a device, running a shared command on all devices, validation errors returned as results, and undo of the last successful command. Out: real hardware, networking, scheduling and persistence.</p>",
      entities:
        "<ul><li><b>Device</b> is the base class: an id, a type and an on flag. It can take a snapshot of its own state and restore one.</li><li><b>Fan</b> and <b>Tv</b> extend Device with their own state (speed and oscillation; channel, volume and mute).</li><li><b>Command</b> is the base for every action. It holds a device and arguments, and offers <code>execute</code> and <code>undo</code>. Subclasses such as <b>PowerOn</b>, <b>SetSpeed</b> and <b>SetChannel</b> implement only <code>run</code>.</li><li><b>CommandRegistry</b> maps a command name to a factory function, either shared across all types or registered for one type. It acts as the factory.</li><li><b>DeviceController</b> has many devices and a history stack, uses the registry to create commands, and runs them.</li></ul>",
      design:
        '<p>The core idea is that a request such as "set the fan to speed 3" becomes an object. That object knows how to do the action and how to reverse it, which is the Command pattern. The controller then never needs to know what a fan or a television can do.</p><p><b>Shared and specific commands.</b> The registry keeps two maps. One holds shared commands such as <code>powerOn</code>, available for every device. The other holds commands per device type. Lookup tries the type map first and then the shared map, so a type can also override a shared command. An unknown name fails with a clear error instead of a crash. The registry is a small factory: given a device, a name and arguments, it returns the right command object.</p><p><b>Execution.</b> <code>execute(deviceId, name, ...args)</code> finds the device, asks the registry for a command, runs it and pushes it on the history only if it succeeded. Failures such as an unknown device, a device that is off or a value out of range come back as <code>{ ok: false, error }</code>. This is deliberate: a bad command is a normal input, not an exceptional program state.</p><p><b>Undo.</b> The base <code>Command.execute</code> takes a snapshot of the device before it calls <code>run</code>. Undo restores the snapshot. Subclasses validate first and mutate last, so a failed command leaves no partial change and never reaches the history. Because undo is a stack, restoring a whole snapshot is correct: nothing newer is still in effect.</p><p><b>Extension without edits.</b> Adding a lamp means one Device subclass, one Command subclass and one <code>register</code> call. The controller, the registry and the existing commands do not change, which is the point of the design. A shared command applied to all devices is a loop over the same <code>execute</code>.</p><p><b>Broadcast.</b> <code>broadcast</code> runs one command on every device and reports success per device. The command for each device is its own history entry, so one <code>undo</code> reverts only the last device in the loop. Grouping them needs a macro command, which is listed as an extension.</p><p><b>Trade-off.</b> Command classes per action are verbose for tiny actions. A table of functions would be shorter, but then undo and validation have no obvious home. In a real system, commands that talk to hardware are asynchronous and need timeouts, and undo may be impossible, so only some commands would be undoable.</p>',
      extend: [
        "How would you add a macro command such as movie night that runs several commands on different devices and undoes them together?",
        "How would you make commands asynchronous with a timeout, since a real device answers over a network?",
        "How would you add a new device type whose commands need a capability check, for example a fan without oscillation?",
        "How would you record a command log so the controller can rebuild device state after a restart?",
        "How would you let two users control the same device without one silently undoing the other?",
      ],
      slips:
        "<p>What tends to go wrong:</p><ul><li>Jumping to code without asking which commands exist and whether devices are fixed. With a vague brief, the clarifying questions are part of what is being judged.</li><li>A controller with a long switch on device type and command name, so every new device edits it.</li><li>Putting every command on the base Device class, so a fan has a <code>setChannel</code> method that makes no sense.</li><li>Throwing an exception for ordinary bad input, or worse, failing silently when the device is off.</li><li>Undo that restores only some fields, or that records a command that failed.</li><li>Letting a failed command change state before it fails the validation.</li></ul>",
    },
    code: `class Device {
  constructor(id, type) {
    this.id = id;
    this.type = type;
    this.on = false;
  }
  snapshot() {
    const { id, type, ...state } = this;
    return state;
  }
  restore(state) {
    Object.assign(this, state);
  }
}

class Fan extends Device {
  constructor(id) {
    super(id, "fan");
    this.speed = 1;
    this.oscillating = false;
  }
}

class Tv extends Device {
  constructor(id) {
    super(id, "tv");
    this.channel = 1;
    this.volume = 10;
    this.muted = false;
  }
}

class Command {
  constructor(device, args) {
    this.device = device;
    this.args = args;
    this.before = null;
  }
  execute() {
    this.before = this.device.snapshot();
    this.run();
    return this.device.snapshot();
  }
  undo() {
    this.device.restore(this.before);
  }
  requireOn() {
    if (!this.device.on) throw new Error(this.device.id + " is off");
  }
  requireRange(value, low, high) {
    if (!Number.isInteger(value) || value < low || value > high) throw new Error("value out of range");
  }
}

class PowerOn extends Command {
  run() {
    this.device.on = true;
  }
}

class PowerOff extends Command {
  run() {
    this.device.on = false;
  }
}

class SetSpeed extends Command {
  run() {
    this.requireOn();
    this.requireRange(this.args[0], 1, 5);
    this.device.speed = this.args[0];
  }
}

class Oscillate extends Command {
  run() {
    this.requireOn();
    this.device.oscillating = Boolean(this.args[0]);
  }
}

class SetChannel extends Command {
  run() {
    this.requireOn();
    this.requireRange(this.args[0], 1, 999);
    this.device.channel = this.args[0];
  }
}

class AdjustVolume extends Command {
  run() {
    this.requireOn();
    this.requireRange(this.args[0], -100, 100);
    this.device.volume = Math.min(100, Math.max(0, this.device.volume + this.args[0]));
    this.device.muted = false;
  }
}

class Mute extends Command {
  run() {
    this.requireOn();
    this.device.muted = true;
  }
}

class CommandRegistry {
  constructor() {
    this.shared = new Map();
    this.byType = new Map();
  }
  registerShared(name, make) {
    this.shared.set(name, make);
  }
  register(type, name, make) {
    if (!this.byType.has(type)) this.byType.set(type, new Map());
    this.byType.get(type).set(name, make);
  }
  create(device, name, args) {
    const make = (this.byType.get(device.type) || new Map()).get(name) || this.shared.get(name);
    if (!make) throw new Error("unknown command " + name + " for " + device.type);
    return make(device, args);
  }
  namesFor(type) {
    return [...new Set([...this.shared.keys(), ...(this.byType.get(type) || new Map()).keys()])].sort();
  }
}

class DeviceController {
  constructor(registry) {
    this.registry = registry;
    this.devices = new Map();
    this.history = [];
  }
  add(device) {
    if (this.devices.has(device.id)) return false;
    this.devices.set(device.id, device);
    return true;
  }
  execute(deviceId, name, ...args) {
    const device = this.devices.get(deviceId);
    if (!device) return { ok: false, error: "unknown device " + deviceId };
    try {
      const command = this.registry.create(device, name, args);
      const state = command.execute();
      this.history.push(command);
      return { ok: true, state };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
  broadcast(name, ...args) {
    const results = {};
    for (const id of this.devices.keys()) results[id] = this.execute(id, name, ...args).ok;
    return results;
  }
  undo() {
    const command = this.history.pop();
    if (!command) return false;
    command.undo();
    return true;
  }
}

function createController() {
  const registry = new CommandRegistry();
  registry.registerShared("powerOn", (d, a) => new PowerOn(d, a));
  registry.registerShared("powerOff", (d, a) => new PowerOff(d, a));
  registry.register("fan", "setSpeed", (d, a) => new SetSpeed(d, a));
  registry.register("fan", "oscillate", (d, a) => new Oscillate(d, a));
  registry.register("tv", "setChannel", (d, a) => new SetChannel(d, a));
  registry.register("tv", "adjustVolume", (d, a) => new AdjustVolume(d, a));
  registry.register("tv", "mute", (d, a) => new Mute(d, a));
  return new DeviceController(registry);
}`,
    checks: [
      {
        name: "runs a shared command and then a fan specific command",
        expr: '(() => { const c = createController(); c.add(new Fan("fan1")); c.execute("fan1", "powerOn"); return c.execute("fan1", "setSpeed", 3); })()',
        expected: { ok: true, state: { on: true, speed: 3, oscillating: false } },
      },
      {
        name: "rejects a specific command while the device is off",
        expr: '(() => { const c = createController(); c.add(new Fan("fan1")); return c.execute("fan1", "setSpeed", 3); })()',
        expected: { ok: false, error: "fan1 is off" },
      },
      {
        name: "rejects a value outside the allowed range",
        expr: '(() => { const c = createController(); c.add(new Fan("fan1")); c.execute("fan1", "powerOn"); return [c.execute("fan1", "setSpeed", 5).ok, c.execute("fan1", "setSpeed", 6).error]; })()',
        expected: [true, "value out of range"],
      },
      {
        name: "does not offer a tv command to a fan",
        expr: '(() => { const c = createController(); c.add(new Fan("fan1")); return c.execute("fan1", "setChannel", 4).error; })()',
        expected: "unknown command setChannel for fan",
      },
      {
        name: "lists shared and device specific commands for a type",
        expr: '(() => { const c = createController(); return [c.registry.namesFor("tv"), c.registry.namesFor("fan")]; })()',
        expected: [
          ["adjustVolume", "mute", "powerOff", "powerOn", "setChannel"],
          ["oscillate", "powerOff", "powerOn", "setSpeed"],
        ],
      },
      {
        name: "undoes the last successful command only",
        expr: '(() => { const c = createController(); const tv = new Tv("tv1"); c.add(tv); c.execute("tv1", "powerOn"); c.execute("tv1", "setChannel", 42); c.execute("tv1", "setChannel", 5000); c.undo(); return [tv.channel, tv.on]; })()',
        expected: [1, true],
      },
      {
        name: "clamps the volume at its limits and unmutes",
        expr: '(() => { const c = createController(); const tv = new Tv("tv1"); c.add(tv); c.execute("tv1", "powerOn"); c.execute("tv1", "mute"); c.execute("tv1", "adjustVolume", 90); c.execute("tv1", "adjustVolume", 90); return [tv.volume, tv.muted]; })()',
        expected: [100, false],
      },
      {
        name: "broadcasts a shared command to every device",
        expr: '(() => { const c = createController(); c.add(new Fan("fan1")); c.add(new Tv("tv1")); c.broadcast("powerOn"); const results = c.broadcast("powerOff"); return [results, [...c.devices.values()].map((d) => d.on)]; })()',
        expected: [{ fan1: true, tv1: true }, [false, false]],
      },
      {
        name: "adds a new device type by registering commands only",
        expr: '(() => { class Lamp extends Device { constructor(id) { super(id, "lamp"); this.level = 100; } } class Dim extends Command { run() { this.requireOn(); this.device.level = this.args[0]; } } const c = createController(); c.registry.register("lamp", "dim", (d, a) => new Dim(d, a)); c.add(new Lamp("lamp1")); c.execute("lamp1", "powerOn"); return c.execute("lamp1", "dim", 30).state.level; })()',
        expected: 30,
      },
      {
        name: "refuses a duplicate device id and an unknown device",
        expr: '(() => { const c = createController(); c.add(new Fan("fan1")); return [c.add(new Fan("fan1")), c.execute("nope", "powerOn").error]; })()',
        expected: [false, "unknown device nope"],
      },
      {
        name: "rejects a non numeric volume change and leaves state and history untouched",
        expr: '(() => { const c = createController(); const tv = new Tv("tv1"); c.add(tv); c.execute("tv1", "powerOn"); const result = c.execute("tv1", "adjustVolume", "loud"); return [result.error, tv.volume, c.history.length]; })()',
        expected: ["value out of range", 10, 1],
      },
      {
        name: "lets a device type override a shared command and lists the name once",
        expr: '(() => { const c = createController(); class SafePowerOff extends Command { run() { this.device.on = false; this.device.speed = 1; } } c.registry.register("fan", "powerOff", (d, a) => new SafePowerOff(d, a)); const fan = new Fan("fan1"); c.add(fan); c.execute("fan1", "powerOn"); c.execute("fan1", "setSpeed", 4); c.execute("fan1", "powerOff"); return [fan.speed, c.registry.namesFor("fan")]; })()',
        expected: [1, ["oscillate", "powerOff", "powerOn", "setSpeed"]],
      },
      {
        name: "undoes in reverse order and reports an empty history",
        expr: '(() => { const c = createController(); const fan = new Fan("fan1"); c.add(fan); c.execute("fan1", "powerOn"); c.execute("fan1", "setSpeed", 4); c.execute("fan1", "oscillate", true); const seen = []; for (let i = 0; i < 4; i++) { const undone = c.undo(); seen.push(undone, fan.on, fan.speed, fan.oscillating); } return seen; })()',
        expected: [true, true, 4, false, true, true, 1, false, true, false, 1, false, false, false, 1, false],
      },
      {
        name: "records one history entry per device when a command is broadcast",
        expr: '(() => { const c = createController(); const fan = new Fan("fan1"); const tv = new Tv("tv1"); c.add(fan); c.add(tv); c.broadcast("powerOn"); c.undo(); return [c.history.length, fan.on, tv.on]; })()',
        expected: [1, true, false],
      },
    ],
  },
  {
    id: "phonepe-movie-booking",
    company: "phonepe",
    title: "Movie ticket booking system",
    prompt:
      "Design an object-oriented movie ticket booking system, organised into entity, service and repository layers, and write tests for it. The sources do not state concurrency requirements, so the answer treats seat holds and conflicting bookings as the central design question and states that assumption.",
    level: "SDE-2 (per post title)",
    round: "machine-coding",
    topic: "booking",
    patterns: ["Repository", "State", "Dependency injection"],
    evidence: "one",
    sources: [
      {
        label: "Interview Experience 101, PhonePe SDE2 (Roundz)",
        url: "https://roundz.substack.com/p/interview-experience-101-phonepe-sde2",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: ["sysdes-transactions-isolation", "sysdes-consistency-models", "sysdes-time-ordering-ids"],
    answer: {
      ask: "<p>Ask these first:</p><ul><li>Is the scope one cinema or many, and do I model screens and seat layouts?</li><li>When a user picks seats, are the seats held while they pay? For how long?</li><li>Can a user book several seats at once, and is there a limit?</li><li>What happens if payment fails, or arrives after the hold has expired?</li><li>Does the test suite need to run without a database or a real clock?</li></ul><p><b>Assumed scope.</b> The report names only entity, service and repository layers and tests. Holds, payment and cancellation are this answer's assumptions. In: shows with a seat grid, a timed hold on a set of seats, confirmation with a payment step, cancellation, availability, and a clear answer on conflicts. Out: search and browsing, seat pricing tiers, refunds, notifications, and closing sales when a show starts. Storage is in memory behind repositories.</p>",
      entities:
        "<ul><li><b>Show</b> has an id, a movie, a start time, a price and the ids of its seats (for example A1 to B5).</li><li><b>Booking</b> has a user, a show, a set of seats, an amount, an expiry time and a status: HELD, CONFIRMED, EXPIRED, CANCELLED or FAILED.</li><li><b>Repository</b> stores entities by id. <b>BookingRepository</b> extends it with a query for the seats already confirmed on a show.</li><li><b>SeatLockManager</b> owns the temporary holds. It reports success or the list of conflicting seats, records the booking id as the owner of each hold, and reads time from an injected clock.</li><li><b>BookingService</b> has the show and booking repositories, the lock manager, a payment function and the clock. It exposes <code>hold</code>, <code>confirm</code>, <code>cancel</code> and <code>available</code>.</li></ul>",
      design:
        "<p>The hard part of a booking system is not the classes, it is making sure two people never end up with the same seat. The design uses two layers of protection: a short-lived hold while the user pays, and a permanent record once the booking is confirmed.</p><p><b>Seat holds.</b> <code>SeatLockManager.tryLock</code> takes a show, a list of seats, an owner (the booking id, not the user) and a time to live. It checks every seat first and either takes all of them or none, returning the list of conflicting seats. A hold counts as live while <code>clock.now()</code> is before its expiry, so it ends exactly at the expiry time. An expired hold needs no cleanup to stop blocking others, because every check compares against the clock. That makes expiry testable with a fake clock instead of timers.</p><p><b>Flow.</b> <code>hold</code> validates the show, the seat count and the seat ids, rejects the request with the full list of seats that are confirmed or held, otherwise takes the locks and saves a HELD booking with its expiry. <code>confirm</code> checks that the booking is still HELD and not past its expiry, then calls the payment function. A decline marks it FAILED and releases the seats. A success marks it CONFIRMED. Late confirmation marks it EXPIRED and releases only the locks that carry its own booking id, so someone who has since taken those seats keeps them, even if it is the same user who booked them again. Availability is the seat list minus confirmed seats minus live holds.</p><p><b>Status as a state machine.</b> HELD can go to CONFIRMED, EXPIRED, FAILED or CANCELLED. CONFIRMED can go to CANCELLED. Nothing else is allowed, and every method checks the current status before it changes it.</p><p><b>What a real concurrent system needs.</b> The sketch is single-threaded, so each method runs to completion and the all-or-nothing check is atomic by construction. With many servers, that atomicity must come from the store. Use a unique constraint on (show, seat) for confirmed bookings so the database rejects a double booking whatever the application does, take holds with an atomic set-if-absent that carries its own time to live, and lock several seats in one transaction or in a sorted order to avoid deadlock. Make confirm idempotent, and have a refund path for a payment that completes after the hold has expired.</p><p><b>Patterns.</b> The repositories keep storage separate from the booking rules. Booking status is a small state machine. The clock and the payment function are passed in, so tests replace them without mocks.</p><p><b>Trade-off.</b> Expiring by comparison keeps the code simple, but an abandoned booking stays HELD in storage until someone touches it, so a periodic sweeper should mark those EXPIRED. Availability and the sold-seat check also scan every booking, which is fine for a sketch; a real store keeps an index by show.</p>",
      extend: [
        "How would you let a user extend a hold once, and what stops them extending it forever?",
        "How would you support seat categories with different prices, and charge the total in one payment?",
        "How would you make confirm idempotent when the payment provider retries its callback?",
        "How would you run this on many servers, and which guarantee do you move into the database?",
        "How would you handle a payment that succeeds after the hold has already expired and been taken by someone else?",
      ],
      slips:
        "<p>The classic failures here:</p><ul><li>Checking availability and then locking in two separate steps, which leaves a window where two users both pass the check.</li><li>Locking seats one at a time and leaving the first ones locked when a later seat conflicts. The hold must be all or nothing.</li><li>Holds that never expire, so an abandoned checkout blocks seats for ever. Test the exact expiry boundary.</li><li>Releasing locks by user instead of by booking when a hold expires, which can free seats that the same or another user has legitimately taken since.</li><li>Treating a confirmed seat as free once its hold has expired. Confirmed seats come from bookings, not from locks.</li><li>Reading the system clock inside the service, which makes expiry untestable.</li><li>Ignoring payment failure, so the seats stay held after a decline.</li></ul>",
    },
    code: `class FakeClock {
  constructor(start = 0) {
    this.time = start;
  }
  now() {
    return this.time;
  }
  advance(seconds) {
    this.time += seconds;
  }
}

class Show {
  constructor(id, movie, startsAt, rows, perRow, price) {
    this.id = id;
    this.movie = movie;
    this.startsAt = startsAt;
    this.price = price;
    this.seatIds = [];
    for (let r = 0; r < rows; r++) {
      for (let n = 1; n <= perRow; n++) this.seatIds.push(String.fromCharCode(65 + r) + n);
    }
  }
}

class Booking {
  constructor(id, userId, showId, seatIds, expiresAt, amount) {
    this.id = id;
    this.userId = userId;
    this.showId = showId;
    this.seatIds = seatIds;
    this.expiresAt = expiresAt;
    this.amount = amount;
    this.status = "HELD";
  }
}

class Repository {
  constructor() {
    this.rows = new Map();
  }
  save(entity) {
    this.rows.set(entity.id, entity);
    return entity;
  }
  get(id) {
    return this.rows.get(id) || null;
  }
  all() {
    return [...this.rows.values()];
  }
}

class BookingRepository extends Repository {
  confirmedSeats(showId) {
    const taken = new Set();
    for (const b of this.all()) {
      if (b.showId === showId && b.status === "CONFIRMED") b.seatIds.forEach((s) => taken.add(s));
    }
    return taken;
  }
}

class SeatLockManager {
  constructor(clock) {
    this.clock = clock;
    this.locks = new Map();
  }
  holder(showId, seatId) {
    const lock = this.locks.get(showId + ":" + seatId);
    if (!lock || this.clock.now() >= lock.expiresAt) return null;
    return lock.owner;
  }
  tryLock(showId, seatIds, owner, ttl) {
    const conflicts = seatIds.filter((s) => this.holder(showId, s) !== null);
    if (conflicts.length > 0) return { ok: false, conflicts };
    const expiresAt = this.clock.now() + ttl;
    for (const s of seatIds) this.locks.set(showId + ":" + s, { owner, expiresAt });
    return { ok: true, expiresAt };
  }
  release(showId, seatIds, owner) {
    for (const s of seatIds) {
      if (this.holder(showId, s) === owner) this.locks.delete(showId + ":" + s);
    }
  }
}

class BookingService {
  constructor(shows, bookings, locks, clock, payments, options = {}) {
    this.shows = shows;
    this.bookings = bookings;
    this.locks = locks;
    this.clock = clock;
    this.payments = payments;
    this.holdSeconds = options.holdSeconds || 300;
    this.maxSeats = options.maxSeats || 6;
    this.nextId = 1;
  }
  available(showId) {
    const show = this.shows.get(showId);
    if (!show) return [];
    const sold = this.bookings.confirmedSeats(showId);
    return show.seatIds.filter((s) => !sold.has(s) && this.locks.holder(showId, s) === null);
  }
  hold(userId, showId, seatIds) {
    const show = this.shows.get(showId);
    if (!show) return { ok: false, reason: "unknown show" };
    const unique = [...new Set(seatIds)];
    if (unique.length === 0 || unique.length > this.maxSeats) return { ok: false, reason: "bad seat count" };
    if (unique.some((s) => !show.seatIds.includes(s))) return { ok: false, reason: "unknown seat" };
    const sold = this.bookings.confirmedSeats(showId);
    const taken = unique.filter((s) => sold.has(s) || this.locks.holder(showId, s) !== null);
    if (taken.length > 0) return { ok: false, reason: "seat taken", conflicts: taken };
    const id = "B" + this.nextId;
    const lock = this.locks.tryLock(showId, unique, id, this.holdSeconds);
    if (!lock.ok) return { ok: false, reason: "seat taken", conflicts: lock.conflicts };
    this.nextId++;
    const booking = new Booking(id, userId, showId, unique, lock.expiresAt, show.price * unique.length);
    return { ok: true, booking: this.bookings.save(booking) };
  }
  confirm(bookingId) {
    const booking = this.bookings.get(bookingId);
    if (!booking || booking.status !== "HELD") return { ok: false, reason: "not held" };
    if (this.clock.now() >= booking.expiresAt) {
      this.finish(booking, "EXPIRED");
      return { ok: false, reason: "hold expired" };
    }
    if (!this.payments(booking.userId, booking.amount)) {
      this.finish(booking, "FAILED");
      return { ok: false, reason: "payment declined" };
    }
    booking.status = "CONFIRMED";
    return { ok: true, booking };
  }
  cancel(bookingId) {
    const booking = this.bookings.get(bookingId);
    if (!booking || (booking.status !== "HELD" && booking.status !== "CONFIRMED")) return false;
    this.finish(booking, "CANCELLED");
    return true;
  }
  finish(booking, status) {
    booking.status = status;
    this.locks.release(booking.showId, booking.seatIds, booking.id);
  }
}

function createService(payments = () => true, options = {}) {
  const clock = new FakeClock();
  const shows = new Repository();
  shows.save(new Show("S1", "Film", 1000, 2, 5, 150));
  const service = new BookingService(
    shows,
    new BookingRepository(),
    new SeatLockManager(clock),
    clock,
    payments,
    options
  );
  return { service, clock };
}`,
    checks: [
      {
        name: "holds two seats, confirms them and removes them from availability",
        expr: '(() => { const { service } = createService(); const held = service.hold("u1", "S1", ["A1", "A2"]); const done = service.confirm(held.booking.id); return [held.booking.amount, done.booking.status, service.available("S1").length]; })()',
        expected: [300, "CONFIRMED", 8],
      },
      {
        name: "rejects a second user for a seat that is held",
        expr: '(() => { const { service } = createService(); service.hold("u1", "S1", ["A1"]); const second = service.hold("u2", "S1", ["A1"]); return [second.ok, second.reason, second.conflicts]; })()',
        expected: [false, "seat taken", ["A1"]],
      },
      {
        name: "leaves no partial hold when one of the seats conflicts",
        expr: '(() => { const { service } = createService(); service.hold("u1", "S1", ["A1"]); service.hold("u2", "S1", ["A2", "A1"]); return service.available("S1").includes("A2"); })()',
        expected: true,
      },
      {
        name: "frees a hold exactly when its time to live runs out",
        expr: '(() => { const { service, clock } = createService(); service.hold("u1", "S1", ["A1"]); clock.advance(299); const before = service.hold("u2", "S1", ["A1"]).ok; clock.advance(1); const after = service.hold("u2", "S1", ["A1"]).ok; return [before, after]; })()',
        expected: [false, true],
      },
      {
        name: "refuses to confirm a hold that has expired and keeps the new holder",
        expr: '(() => { const { service, clock } = createService(); const first = service.hold("u1", "S1", ["A1"]); clock.advance(300); const second = service.hold("u2", "S1", ["A1"]); const late = service.confirm(first.booking.id); return [late.reason, first.booking.status, service.confirm(second.booking.id).ok]; })()',
        expected: ["hold expired", "EXPIRED", true],
      },
      {
        name: "never lets a confirmed seat be held again",
        expr: '(() => { const { service, clock } = createService(); const held = service.hold("u1", "S1", ["B3"]); service.confirm(held.booking.id); clock.advance(10000); return service.hold("u2", "S1", ["B3"]).reason; })()',
        expected: "seat taken",
      },
      {
        name: "cancelling a booking releases its seats",
        expr: '(() => { const { service } = createService(); const held = service.hold("u1", "S1", ["A1"]); const cancelled = service.cancel(held.booking.id); return [cancelled, service.hold("u2", "S1", ["A1"]).ok, service.cancel(held.booking.id)]; })()',
        expected: [true, true, false],
      },
      {
        name: "releases the seats when payment is declined",
        expr: '(() => { const { service } = createService(() => false); const held = service.hold("u1", "S1", ["A1"]); const result = service.confirm(held.booking.id); return [result.reason, held.booking.status, service.available("S1").length]; })()',
        expected: ["payment declined", "FAILED", 10],
      },
      {
        name: "enforces the seat limit and rejects unknown seats",
        expr: '(() => { const { service } = createService(() => true, { maxSeats: 2 }); return [service.hold("u1", "S1", ["A1", "A2", "A3"]).reason, service.hold("u1", "S1", ["Z9"]).reason, service.hold("u1", "S1", []).reason]; })()',
        expected: ["bad seat count", "unknown seat", "bad seat count"],
      },
      {
        name: "keeps a newer hold by the same user when the older expired booking is confirmed late",
        expr: '(() => { const { service, clock } = createService(); const old = service.hold("u1", "S1", ["A1"]); clock.advance(300); const fresh = service.hold("u1", "S1", ["A1"]); const late = service.confirm(old.booking.id).reason; return [late, service.hold("u2", "S1", ["A1"]).ok, fresh.booking.status]; })()',
        expected: ["hold expired", false, "HELD"],
      },
      {
        name: "lists every conflicting seat, confirmed or held, and nothing else",
        expr: '(() => { const { service } = createService(); const sold = service.hold("u1", "S1", ["A1"]); service.confirm(sold.booking.id); service.hold("u2", "S1", ["A2"]); return service.hold("u3", "S1", ["A1", "A2", "A3"]).conflicts; })()',
        expected: ["A1", "A2"],
      },
      {
        name: "returns the seats of a cancelled confirmed booking and refuses a second confirm",
        expr: '(() => { const { service } = createService(); const held = service.hold("u1", "S1", ["A1", "A2"]); service.confirm(held.booking.id); const again = service.confirm(held.booking.id).reason; const before = service.available("S1").length; service.cancel(held.booking.id); return [again, before, service.available("S1").length, held.booking.status]; })()',
        expected: ["not held", 8, 10, "CANCELLED"],
      },
      {
        name: "answers an unknown show with a reason and an empty availability list",
        expr: '(() => { const { service } = createService(); return [service.hold("u1", "S9", ["A1"]).reason, service.available("S9")]; })()',
        expected: ["unknown show", []],
      },
      {
        name: "treats a repeated seat in one request as a single seat",
        expr: '(() => { const { service } = createService(); const held = service.hold("u1", "S1", ["A1", "A1"]); return [held.booking.seatIds, held.booking.amount]; })()',
        expected: [["A1"], 150],
      },
    ],
  },
  {
    id: "swiggy-meeting-calendar",
    company: "swiggy",
    title: "Meeting calendar application",
    prompt:
      "Build a calendar application that schedules meetings, shows each user's calendar, and lets invitees accept or reject. The report lists seven requirements, not all of which are readable, and the code had to run cleanly at the end, so the answer states the assumed requirements.",
    level: "SDE-1",
    round: "machine-coding",
    topic: "booking",
    patterns: ["Observer", "Strategy"],
    evidence: "one",
    sources: [
      {
        label: "Swiggy Interview Experience for SDE-1 (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-for-sde-1-2/",
        kind: "candidate-report",
        year: 2021,
      },
    ],
    chapters: [],
    answer: {
      ask: "<p>Since the full requirement list is not known, confirm it:</p><ul><li>Can a meeting have several invitees, and does the organizer count as attending automatically?</li><li>What does a user's calendar show: only accepted meetings, or pending ones too?</li><li>Is an overlap with another accepted meeting an error, or just a warning?</li><li>Who can cancel a meeting?</li><li>Do users need to be told about invites and replies?</li><li>Are there recurring meetings or time zones?</li></ul><p><b>Assumed scope.</b> The report names scheduling, a calendar per user and accept or reject. The rest is this answer's assumption. In: users, a meeting with a time range and invitees, accept and reject, a per-user calendar view over a time range, overlap detection with a configurable policy, notifications, and cancel by the organizer. Out: recurrence, time zones, rooms and persistence. Times are integer minutes.</p>",
      entities:
        "<ul><li><b>User</b> has an id and a name.</li><li><b>Meeting</b> has an organizer, a title, a start and an end, and a response for each person: ACCEPTED, PENDING or REJECTED. It answers <code>overlaps(other)</code>.</li><li><b>CalendarService</b> has many users and many meetings, uses one conflict policy, and notifies observers. It exposes <code>schedule</code>, <code>respond</code>, <code>cancel</code> and <code>view</code>.</li><li><b>StrictPolicy</b> and <b>PermissivePolicy</b> implement the conflict policy: given the conflicting meetings, say whether the action is allowed.</li><li><b>InboxObserver</b> implements the observer interface. It receives events and keeps a message list per user.</li></ul>",
      design:
        "<p>The service is the single entry point. It keeps meetings in a map and keeps each person's response inside the meeting, which means there is one source of truth and no per-user copy to keep in sync.</p><p><b>Overlap rule.</b> Two meetings overlap when each starts before the other ends, using half-open ranges. A meeting that ends at 11:00 and one that starts at 11:00 do not conflict, which is the boundary an interviewer will test. <code>conflictsFor(user, meeting)</code> returns the ids of the user's accepted meetings that overlap. Only accepted meetings block time, so pending and rejected ones never do.</p><p><b>Strategy.</b> What to do about a conflict is a policy, not a fact. <code>StrictPolicy</code> refuses when there is any conflict and <code>PermissivePolicy</code> allows it. The service passes the conflict list to <code>policy.allows</code> both when scheduling (for the organizer) and when an invitee accepts. Swapping the policy changes behaviour without touching the service.</p><p><b>Observer.</b> The service does not know how anyone is notified. It emits events (invited, accepted, rejected, cancelled) to every subscribed observer. The inbox observer is one subscriber; email or push would be others. Events are delivered synchronously here, so a slow subscriber would block the caller. A subscriber that throws would also stop the notifications after it. A real system hands events to a queue.</p><p><b>Flows.</b> <code>schedule</code> validates the range and the users, builds the meeting with the organizer accepted and every invitee pending, runs the policy check, stores it and emits an invite per invitee. <code>respond</code> checks that the person is an invitee, runs the policy check on acceptance, records the answer and tells the organizer. <code>view</code> returns meetings in a time range where the user is not rejected, sorted by start, with ties kept in the order the meetings were created.</p><p><b>Trade-off.</b> <code>conflictsFor</code> and <code>view</code> scan all meetings. For a real calendar, index each user's meetings by start time and search only the neighbours of the new range.</p>",
      extend: [
        "How would you support recurring meetings, and how does an overlap check work against an infinite series?",
        "How would you add time zones without changing the overlap rule?",
        "How would you let a user find a free slot that works for every invitee?",
        "How would you reserve a meeting room, and how does that clash differ from a person's clash?",
        "How would you deliver notifications reliably when the subscriber is slow or fails?",
      ],
      slips:
        "<p>What this problem punishes:</p><ul><li>Using closed ranges, so back-to-back meetings are reported as conflicts.</li><li>Storing a separate meeting copy per user, which drifts out of sync when one person replies.</li><li>Letting pending or rejected meetings block time.</li><li>Hard-coding what happens on a conflict instead of making it a policy, then having no room for the follow-up.</li><li>Calling the notification code directly from the scheduling code, so every new channel edits the service.</li><li>Not checking that only invitees can respond and only the organizer can cancel.</li><li>Running out of time with an unfinished large design. A smaller version that runs cleanly is the better result.</li></ul>",
    },
    code: `class User {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}

class Meeting {
  constructor(id, organizerId, title, start, end, inviteeIds) {
    this.id = id;
    this.organizerId = organizerId;
    this.title = title;
    this.start = start;
    this.end = end;
    this.responses = new Map([[organizerId, "ACCEPTED"]]);
    for (const userId of inviteeIds) this.responses.set(userId, "PENDING");
  }
  overlaps(other) {
    return this.start < other.end && other.start < this.end;
  }
}

class StrictPolicy {
  allows(conflicts) {
    return conflicts.length === 0;
  }
}

class PermissivePolicy {
  allows() {
    return true;
  }
}

class InboxObserver {
  constructor() {
    this.inboxes = new Map();
  }
  update(event) {
    if (!this.inboxes.has(event.userId)) this.inboxes.set(event.userId, []);
    this.inboxes.get(event.userId).push(event.type + ":" + event.meetingId);
  }
  inbox(userId) {
    return this.inboxes.get(userId) || [];
  }
}

class CalendarService {
  constructor(policy) {
    this.policy = policy;
    this.users = new Map();
    this.meetings = new Map();
    this.observers = [];
    this.nextId = 1;
  }
  addUser(user) {
    this.users.set(user.id, user);
  }
  subscribe(observer) {
    this.observers.push(observer);
  }
  emit(type, meeting, userId) {
    for (const observer of this.observers) observer.update({ type, meetingId: meeting.id, userId });
  }
  conflictsFor(userId, meeting) {
    const found = [];
    for (const other of this.meetings.values()) {
      const accepted = other.responses.get(userId) === "ACCEPTED";
      if (accepted && other.id !== meeting.id && other.overlaps(meeting)) found.push(other.id);
    }
    return found;
  }
  schedule(organizerId, title, start, end, inviteeIds) {
    if (!this.users.has(organizerId)) return { ok: false, reason: "unknown organizer" };
    if (!(start < end)) return { ok: false, reason: "invalid time range" };
    const invitees = [...new Set(inviteeIds)].filter((id) => id !== organizerId);
    if (invitees.some((id) => !this.users.has(id))) return { ok: false, reason: "unknown invitee" };
    const meeting = new Meeting("M" + this.nextId, organizerId, title, start, end, invitees);
    const conflicts = this.conflictsFor(organizerId, meeting);
    if (!this.policy.allows(conflicts)) return { ok: false, reason: "organizer is busy", conflicts };
    this.nextId++;
    this.meetings.set(meeting.id, meeting);
    for (const id of invitees) this.emit("invited", meeting, id);
    return { ok: true, meeting };
  }
  respond(meetingId, userId, accept) {
    const meeting = this.meetings.get(meetingId);
    if (!meeting || !meeting.responses.has(userId) || userId === meeting.organizerId) {
      return { ok: false, reason: "not an invitee" };
    }
    if (accept) {
      const conflicts = this.conflictsFor(userId, meeting);
      if (!this.policy.allows(conflicts)) return { ok: false, reason: "overlaps an accepted meeting", conflicts };
    }
    meeting.responses.set(userId, accept ? "ACCEPTED" : "REJECTED");
    this.emit(accept ? "accepted" : "rejected", meeting, meeting.organizerId);
    return { ok: true };
  }
  cancel(meetingId, userId) {
    const meeting = this.meetings.get(meetingId);
    if (!meeting || meeting.organizerId !== userId) return false;
    this.meetings.delete(meetingId);
    for (const id of meeting.responses.keys()) if (id !== userId) this.emit("cancelled", meeting, id);
    return true;
  }
  view(userId, from, to) {
    const rows = [];
    for (const m of this.meetings.values()) {
      const status = m.responses.get(userId);
      if (!status || status === "REJECTED") continue;
      if (m.start < to && from < m.end) rows.push({ id: m.id, title: m.title, start: m.start, end: m.end, status });
    }
    return rows.sort((a, b) => a.start - b.start);
  }
}

function createService(policy) {
  const service = new CalendarService(policy);
  for (const id of ["ann", "bob", "cy"]) service.addUser(new User(id, id));
  const inbox = new InboxObserver();
  service.subscribe(inbox);
  return { service, inbox };
}`,
    checks: [
      {
        name: "shows a new meeting as accepted for the organizer and pending for the invitee",
        expr: '(() => { const { service } = createService(new StrictPolicy()); service.schedule("ann", "Plan", 600, 660, ["bob"]); return [service.view("ann", 0, 1440)[0].status, service.view("bob", 0, 1440)[0].status, service.view("cy", 0, 1440)]; })()',
        expected: ["ACCEPTED", "PENDING", []],
      },
      {
        name: "updates the invitee view when they accept",
        expr: '(() => { const { service } = createService(new StrictPolicy()); const m = service.schedule("ann", "Plan", 600, 660, ["bob"]).meeting; service.respond(m.id, "bob", true); return service.view("bob", 0, 1440).map((row) => row.status); })()',
        expected: ["ACCEPTED"],
      },
      {
        name: "hides a meeting the invitee rejected",
        expr: '(() => { const { service } = createService(new StrictPolicy()); const m = service.schedule("ann", "Plan", 600, 660, ["bob"]).meeting; service.respond(m.id, "bob", false); return [service.view("bob", 0, 1440), service.view("ann", 0, 1440).length]; })()',
        expected: [[], 1],
      },
      {
        name: "treats back to back meetings as not overlapping",
        expr: '(() => { const { service } = createService(new StrictPolicy()); service.schedule("ann", "One", 600, 660, ["bob"]); const second = service.schedule("ann", "Two", 660, 720, ["bob"]); return second.ok; })()',
        expected: true,
      },
      {
        name: "refuses an acceptance that overlaps an accepted meeting under the strict policy",
        expr: '(() => { const { service } = createService(new StrictPolicy()); const a = service.schedule("ann", "One", 600, 660, ["cy"]).meeting; const b = service.schedule("bob", "Two", 630, 690, ["cy"]).meeting; service.respond(a.id, "cy", true); const result = service.respond(b.id, "cy", true); return [result.ok, result.conflicts]; })()',
        expected: [false, ["M1"]],
      },
      {
        name: "allows the same overlap when the policy is swapped",
        expr: '(() => { const { service } = createService(new PermissivePolicy()); const a = service.schedule("ann", "One", 600, 660, ["cy"]).meeting; const b = service.schedule("bob", "Two", 630, 690, ["cy"]).meeting; service.respond(a.id, "cy", true); return service.respond(b.id, "cy", true).ok; })()',
        expected: true,
      },
      {
        name: "refuses to schedule over the organizer's own accepted meeting",
        expr: '(() => { const { service } = createService(new StrictPolicy()); service.schedule("ann", "One", 600, 660, []); const clash = service.schedule("ann", "Two", 650, 700, []); return [clash.ok, clash.reason]; })()',
        expected: [false, "organizer is busy"],
      },
      {
        name: "notifies observers on invite, response and cancel",
        expr: '(() => { const { service, inbox } = createService(new StrictPolicy()); const m = service.schedule("ann", "Plan", 600, 660, ["bob", "cy"]).meeting; service.respond(m.id, "bob", true); service.cancel(m.id, "ann"); return [inbox.inbox("bob"), inbox.inbox("ann")]; })()',
        expected: [["invited:M1", "cancelled:M1"], ["accepted:M1"]],
      },
      {
        name: "lets only the organizer cancel",
        expr: '(() => { const { service } = createService(new StrictPolicy()); const m = service.schedule("ann", "Plan", 600, 660, ["bob"]).meeting; return [service.cancel(m.id, "bob"), service.cancel(m.id, "ann"), service.view("bob", 0, 1440)]; })()',
        expected: [false, true, []],
      },
      {
        name: "keeps meetings that start together in creation order",
        expr: '(() => { const { service } = createService(new PermissivePolicy()); for (let i = 0; i < 11; i++) service.schedule("ann", "t" + i, 600, 660, []); return service.view("ann", 0, 1440).map((row) => row.id).join(","); })()',
        expected: "M1,M2,M3,M4,M5,M6,M7,M8,M9,M10,M11",
      },
      {
        name: "ignores a repeat acceptance as a conflict with itself and lets a reply change",
        expr: '(() => { const { service } = createService(new StrictPolicy()); const m = service.schedule("ann", "Plan", 600, 660, ["bob"]).meeting; const first = service.respond(m.id, "bob", true).ok; const again = service.respond(m.id, "bob", true).ok; service.respond(m.id, "bob", false); const hidden = service.view("bob", 0, 1440).length; service.respond(m.id, "bob", true); return [first, again, hidden, service.view("bob", 0, 1440)[0].status]; })()',
        expected: [true, true, 0, "ACCEPTED"],
      },
      {
        name: "refuses a reply from an outsider, from the organizer and for an unknown meeting",
        expr: '(() => { const { service } = createService(new StrictPolicy()); const m = service.schedule("ann", "Plan", 600, 660, ["bob"]).meeting; return [service.respond(m.id, "cy", true).reason, service.respond(m.id, "ann", false).reason, service.respond("M9", "bob", true).reason, service.view("ann", 0, 1440)[0].status]; })()',
        expected: ["not an invitee", "not an invitee", "not an invitee", "ACCEPTED"],
      },
      {
        name: "rejects a bad time range, an unknown invitee and filters the view by range",
        expr: '(() => { const { service } = createService(new StrictPolicy()); const bad = service.schedule("ann", "x", 700, 700, []).reason; const ghost = service.schedule("ann", "x", 700, 760, ["zed"]).reason; service.schedule("ann", "Early", 100, 160, []); service.schedule("ann", "Late", 900, 960, []); return [bad, ghost, service.view("ann", 150, 800).map((row) => row.title), service.view("ann", 160, 900)]; })()',
        expected: ["invalid time range", "unknown invitee", ["Early"], []],
      },
    ],
  },
];
