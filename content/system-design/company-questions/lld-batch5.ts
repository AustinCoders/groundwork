import type { LldQuestion } from "./lld-types";

export const questions: LldQuestion[] = [
  {
    id: "myntra-ecommerce-emi",
    company: "myntra",
    title: "Online store with direct and instalment payments",
    prompt:
      "Build the back end of a small online store that lives entirely in memory. Admins add products from the console, from a file or from an external feed, and users browse and buy. A user can pay straight through a payment gateway or in instalments within a personal credit limit that depends on their past payments. Payment methods are expected to change, so adding one should not mean rewriting checkout.",
    level: "Senior Software Engineer (about 5 years of experience)",
    round: "machine-coding",
    topic: "payments",
    patterns: ["Strategy", "Adapter"],
    evidence: "several",
    sources: [
      {
        label: "Myntra Interview Experience, 5 years, Senior Software Engineer (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/interview-experiences/myntra-interview-experience-5years-experienced-for-senior-software-engineer/",
        kind: "candidate-report",
      },
      {
        label: "What to expect in the Myntra system design interview (DesignGurus)",
        url: "https://www.designgurus.io/answers/detail/what-to-expect-in-the-myntra-system-design-interview",
        kind: "prep-guide",
      },
    ],
    chapters: ["sysdes-walkthrough-payments"],
    answer: {
      ask: "<p>Questions to ask first: is money held in whole paise or as decimal rupees, is the credit limit a fixed number or derived from payment history and by what rule, how many instalments are there and when is each one due, do unpaid instalments reduce what the user can borrow, can one order hold several products, and is stock taken before payment or only after it succeeds. Also ask which of the three product sources must work in the first version and whether refunds or cancellation are expected.</p><p>Assumed scope: integer paise everywhere and a single currency. An instalment order has three parts, the first charged at purchase and the others charged when the user asks to pay the next one. The credit limit is a base amount plus a percentage of everything the user has paid so far, with a cap, and unpaid instalment balances count against it. The report says the limit is configurable per user and based on previous payments; here one rule applies to everyone, and a per-user override is left as an extension. Stock is checked before payment and taken after it succeeds, which is safe because this version is single threaded. Out of scope: real gateways, interest and late fees, due dates, refunds, authentication and persistence.</p>",
      entities:
        "<ul><li><b>Catalog</b> owns the products keyed by sku, each with a name, a price in paise and a stock count. It validates items, merges repeats, and loads from any product source.</li><li><b>ProductSource</b> is the adapter interface with one method, <code>load()</code>. <code>ListSource</code>, <code>CsvSource</code> and <code>FeedSource</code> each hide one input shape and return the same item shape.</li><li><b>Store</b> is the orchestrator. It owns the accounts, the orders and a registry of payment methods, and exposes <code>checkout</code> and <code>payNext</code>.</li><li><b>Account</b> belongs to one user and holds the paid total and the outstanding instalment balance.</li><li><b>Order</b> records the user, the method name, the total, the status (NEW, FAILED, PAID or INSTALMENTS), the amount paid and the schedule of instalments still due.</li><li><b>PaymentMethod</b> is the strategy interface with <code>pay</code> and <code>payNext</code>. <code>DirectPayment</code> and <code>InstalmentPayment</code> implement it and are looked up by name.</li><li><b>CreditPolicy</b> is a second strategy. <code>PastPaymentsPolicy</code> computes a limit from an account and can be replaced by any object with <code>limitFor</code>.</li><li><b>Gateway</b> is the outside collaborator with <code>charge(userId, amount)</code>. The code uses a fake that can be told to fail.</li></ul>",
      design:
        "<p>Checkout is a short orchestration over three seams. <code>Store.checkout</code> refuses an empty cart and any line with a zero, negative or fractional quantity, merges the lines by sku, checks that each product exists with enough stock, and sums the total in integer paise. It then creates an order and asks the chosen <code>PaymentMethod</code> to <code>pay</code>. Only when that succeeds does it take the stock and set the order status. A failed payment leaves stock untouched and the order marked FAILED, so there is nothing to undo.</p><p><b>Strategy for payment.</b> Direct and instalment payment differ in how much they charge now, what they remember afterwards and what they check beforehand. Each is a class with the same two methods, and the store finds it by name. Adding cash on delivery or a wallet is one new class and one <code>registerMethod</code> call, and checkout does not change (the last check does exactly this). Without the pattern, checkout would grow an if-else per method that every new method must edit.</p><p><b>Strategy for credit.</b> The limit is computed by a <code>CreditPolicy</code> from the account each time, never stored, so it moves as the user pays. Here it is a base of 1,000.00 plus 10 percent of everything paid, capped. Available credit is the limit minus the outstanding balance, and a purchase above it is refused before the gateway is called. Worked example in paise: base 100000, a 90000 purchase in three parts charges 30000 now and leaves 60000 outstanding. A second 90000 purchase is refused because the limit is then 103000 and only 43000 is available. After the other two parts are paid, the paid total is 90000, the limit becomes 109000 and outstanding is back to 0.</p><p><b>Adapters for product sources.</b> Each source converts its own format into the same item shape. The catalog validates a whole batch before adding any of it, so one bad row rejects the import instead of loading half of it. A feed that gives rupees with decimals is rounded once, at the edge, to paise.</p><p><b>Splitting money.</b> The total is divided with integer arithmetic and the remainder goes on the first instalment, so the parts always add up: 100001 becomes 33335, 33333 and 33333. A total too small to give every part a paisa drops the empty parts, and an order left with nothing to schedule is PAID at once.</p><p><b>Trade-off.</b> Checking stock and taking it later is a race once there are real threads, because two buyers can both see the last unit. The fix is to reserve stock atomically before charging and release it if payment fails, or to decrement with a conditional update. This version accepts the race to keep the flow readable.</p>",
      extend: [
        "How would you add cash on delivery or a wallet payment without changing the checkout code?",
        "How would you let the user choose 3, 6 or 12 instalments, with a different limit rule for each?",
        "A user misses an instalment: how do you record it, lower their limit and block new instalment orders?",
        "How would you make checkout safe when two users buy the last unit at the same moment?",
        "How would you add cancellation so that stock, the paid amount and the credit limit are all restored?",
      ],
      slips:
        "<p>Writing an if-else on the payment type inside checkout, so each new method edits the same function. Keeping money as floating point rupees, which drifts when a total is split in three. Forgetting that unpaid instalments must count against the limit, which lets a user borrow up to the limit again and again. Taking stock before the payment result is known and not putting it back on failure. Storing the credit limit once instead of computing it from the history. Loading half of a bad import. Putting the limit rule inside the instalment class so it cannot be swapped.</p>",
    },
    checks: [
      {
        name: "pays directly, marks the order paid and reduces stock",
        expr: '(() => { const mk = () => { const catalog = new Catalog(); catalog.importFrom(new ListSource([{ sku: "tee", name: "Tee", price: 30000, stock: 5 }, { sku: "jeans", name: "Jeans", price: 90000, stock: 2 }])); const gateway = new FakeGateway(); const policy = new PastPaymentsPolicy(100000, 10, 500000); const store = new Store(catalog, [new DirectPayment(gateway), new InstalmentPayment(gateway, policy, 3)]); return { catalog, gateway, policy, store }; }; const { catalog, store } = mk(); const r = store.checkout("u1", [{ sku: "tee", qty: 2 }], "direct"); return [r.status, catalog.get("tee").stock]; })()',
        expected: ["PAID", 3],
      },
      {
        name: "rejects a purchase larger than the stock",
        expr: '(() => { const mk = () => { const catalog = new Catalog(); catalog.importFrom(new ListSource([{ sku: "tee", name: "Tee", price: 30000, stock: 5 }, { sku: "jeans", name: "Jeans", price: 90000, stock: 2 }])); const gateway = new FakeGateway(); const policy = new PastPaymentsPolicy(100000, 10, 500000); const store = new Store(catalog, [new DirectPayment(gateway), new InstalmentPayment(gateway, policy, 3)]); return { catalog, gateway, policy, store }; }; const { store } = mk(); return store.checkout("u1", [{ sku: "tee", qty: 6 }], "direct").reason; })()',
        expected: "unavailable tee",
      },
      {
        name: "keeps stock and marks the order failed when the gateway declines",
        expr: '(() => { const mk = () => { const catalog = new Catalog(); catalog.importFrom(new ListSource([{ sku: "tee", name: "Tee", price: 30000, stock: 5 }, { sku: "jeans", name: "Jeans", price: 90000, stock: 2 }])); const gateway = new FakeGateway(); const policy = new PastPaymentsPolicy(100000, 10, 500000); const store = new Store(catalog, [new DirectPayment(gateway), new InstalmentPayment(gateway, policy, 3)]); return { catalog, gateway, policy, store }; }; const { catalog, gateway, store } = mk(); gateway.failNext(1); const r = store.checkout("u1", [{ sku: "tee", qty: 1 }], "direct"); return [r.ok, r.reason, catalog.get("tee").stock, store.orders[0].status]; })()',
        expected: [false, "declined", 5, "FAILED"],
      },
      {
        name: "charges one third now and tracks the rest of an instalment order",
        expr: '(() => { const mk = () => { const catalog = new Catalog(); catalog.importFrom(new ListSource([{ sku: "tee", name: "Tee", price: 30000, stock: 5 }, { sku: "jeans", name: "Jeans", price: 90000, stock: 2 }])); const gateway = new FakeGateway(); const policy = new PastPaymentsPolicy(100000, 10, 500000); const store = new Store(catalog, [new DirectPayment(gateway), new InstalmentPayment(gateway, policy, 3)]); return { catalog, gateway, policy, store }; }; const { store } = mk(); const r = store.checkout("u1", [{ sku: "jeans", qty: 1 }], "instalment"); return [r.status, store.orders[0].paid, store.orders[0].schedule, store.account("u1").outstanding]; })()',
        expected: ["INSTALMENTS", 30000, [30000, 30000], 60000],
      },
      {
        name: "paying every instalment clears the balance and raises the limit",
        expr: '(() => { const mk = () => { const catalog = new Catalog(); catalog.importFrom(new ListSource([{ sku: "tee", name: "Tee", price: 30000, stock: 5 }, { sku: "jeans", name: "Jeans", price: 90000, stock: 2 }])); const gateway = new FakeGateway(); const policy = new PastPaymentsPolicy(100000, 10, 500000); const store = new Store(catalog, [new DirectPayment(gateway), new InstalmentPayment(gateway, policy, 3)]); return { catalog, gateway, policy, store }; }; const { store, policy } = mk(); const r = store.checkout("u1", [{ sku: "jeans", qty: 1 }], "instalment"); store.payNext(r.orderId); const last = store.payNext(r.orderId); return [last.status, store.account("u1").outstanding, policy.limitFor(store.account("u1"))]; })()',
        expected: ["PAID", 0, 109000],
      },
      {
        name: "counts outstanding instalments against the credit limit",
        expr: '(() => { const mk = () => { const catalog = new Catalog(); catalog.importFrom(new ListSource([{ sku: "tee", name: "Tee", price: 30000, stock: 5 }, { sku: "jeans", name: "Jeans", price: 90000, stock: 2 }])); const gateway = new FakeGateway(); const policy = new PastPaymentsPolicy(100000, 10, 500000); const store = new Store(catalog, [new DirectPayment(gateway), new InstalmentPayment(gateway, policy, 3)]); return { catalog, gateway, policy, store }; }; const { store } = mk(); store.checkout("u1", [{ sku: "jeans", qty: 1 }], "instalment"); return store.checkout("u1", [{ sku: "jeans", qty: 1 }], "instalment").reason; })()',
        expected: "over credit limit",
      },
      {
        name: "refuses what the history policy allowed when a flat 500.00 policy is swapped in",
        expr: '(() => { const mk = () => { const catalog = new Catalog(); catalog.importFrom(new ListSource([{ sku: "tee", name: "Tee", price: 30000, stock: 5 }, { sku: "jeans", name: "Jeans", price: 90000, stock: 2 }])); const gateway = new FakeGateway(); const policy = new PastPaymentsPolicy(100000, 10, 500000); const store = new Store(catalog, [new DirectPayment(gateway), new InstalmentPayment(gateway, policy, 3)]); return { catalog, gateway, policy, store }; }; const { catalog, gateway } = mk(); const store = new Store(catalog, [new InstalmentPayment(gateway, { limitFor: () => 50000 }, 3)]); return store.checkout("u1", [{ sku: "jeans", qty: 1 }], "instalment").reason; })()',
        expected: "over credit limit",
      },
      {
        name: "loads products from csv text and from a feed with rupee prices",
        expr: '(() => { const c = new Catalog(); c.importFrom(new CsvSource("a,A,1000,2\\nb,B,2000,0")); c.importFrom(new FeedSource({ items: [{ id: "c", title: "C", priceRupees: 499.5, qty: 4 }] })); return [c.browse(), c.get("c").price]; })()',
        expected: [["a", "c"], 49950],
      },
      {
        name: "puts the remainder of an uneven split on the first instalment",
        expr: "splitEvenly(100001, 3)",
        expected: [33335, 33333, 33333],
      },
      {
        name: "accepts a payment method registered after the store was built",
        expr: '(() => { const mk = () => { const catalog = new Catalog(); catalog.importFrom(new ListSource([{ sku: "tee", name: "Tee", price: 30000, stock: 5 }, { sku: "jeans", name: "Jeans", price: 90000, stock: 2 }])); const gateway = new FakeGateway(); const policy = new PastPaymentsPolicy(100000, 10, 500000); const store = new Store(catalog, [new DirectPayment(gateway), new InstalmentPayment(gateway, policy, 3)]); return { catalog, gateway, policy, store }; }; const { store, gateway } = mk(); store.registerMethod({ name: "cod", pay(account, order) { order.paid = 0; return { ok: true, status: "COD" }; }, payNext() { return { ok: false, reason: "nothing due" }; } }); return [store.checkout("u1", [{ sku: "tee", qty: 1 }], "cod").status, gateway.charges.length]; })()',
        expected: ["COD", 0],
      },
      {
        name: "rejects a whole import when one row is invalid and adds none of it",
        expr: '(() => { const mk = () => { const catalog = new Catalog(); catalog.importFrom(new ListSource([{ sku: "tee", name: "Tee", price: 30000, stock: 5 }, { sku: "jeans", name: "Jeans", price: 90000, stock: 2 }])); const gateway = new FakeGateway(); const policy = new PastPaymentsPolicy(100000, 10, 500000); const store = new Store(catalog, [new DirectPayment(gateway), new InstalmentPayment(gateway, policy, 3)]); return { catalog, gateway, policy, store }; }; const c = new Catalog(); let msg; try { c.importFrom(new ListSource([{ sku: "x", name: "X", price: 100, stock: 1 }, { sku: "y", name: "Y", price: 100, stock: -1 }])); } catch (e) { msg = e.message; } return [msg, c.browse()]; })()',
        expected: ["invalid product y", []],
      },
      {
        name: "refuses an empty cart and a line that would cancel another line",
        expr: '(() => { const mk = () => { const catalog = new Catalog(); catalog.importFrom(new ListSource([{ sku: "tee", name: "Tee", price: 30000, stock: 5 }, { sku: "jeans", name: "Jeans", price: 90000, stock: 2 }])); const gateway = new FakeGateway(); const policy = new PastPaymentsPolicy(100000, 10, 500000); const store = new Store(catalog, [new DirectPayment(gateway), new InstalmentPayment(gateway, policy, 3)]); return { catalog, gateway, policy, store }; }; const { store, catalog } = mk(); return [store.checkout("u1", [], "direct").reason, store.checkout("u1", [{ sku: "tee", qty: 3 }, { sku: "tee", qty: -2 }], "direct").reason, catalog.get("tee").stock, store.orders.length]; })()',
        expected: ["empty cart", "unavailable tee", 5, 0],
      },
      {
        name: "allows an instalment purchase that exactly uses the remaining credit",
        expr: '(() => { const mk = () => { const catalog = new Catalog(); catalog.importFrom(new ListSource([{ sku: "tee", name: "Tee", price: 30000, stock: 5 }, { sku: "jeans", name: "Jeans", price: 90000, stock: 2 }])); const gateway = new FakeGateway(); const policy = new PastPaymentsPolicy(100000, 10, 500000); const store = new Store(catalog, [new DirectPayment(gateway), new InstalmentPayment(gateway, policy, 3)]); return { catalog, gateway, policy, store }; }; const { catalog, gateway } = mk(); const store = new Store(catalog, [new InstalmentPayment(gateway, { limitFor: () => 90000 }, 3)]); const first = store.checkout("u1", [{ sku: "jeans", qty: 1 }], "instalment"); const second = store.checkout("u1", [{ sku: "tee", qty: 1 }], "instalment"); const third = store.checkout("u1", [{ sku: "tee", qty: 1 }], "instalment"); return [first.ok, second.ok, third.reason, store.account("u1").outstanding]; })()',
        expected: [true, true, "over credit limit", 80000],
      },
      {
        name: "leaves the schedule and balances unchanged when an instalment charge is declined",
        expr: '(() => { const mk = () => { const catalog = new Catalog(); catalog.importFrom(new ListSource([{ sku: "tee", name: "Tee", price: 30000, stock: 5 }, { sku: "jeans", name: "Jeans", price: 90000, stock: 2 }])); const gateway = new FakeGateway(); const policy = new PastPaymentsPolicy(100000, 10, 500000); const store = new Store(catalog, [new DirectPayment(gateway), new InstalmentPayment(gateway, policy, 3)]); return { catalog, gateway, policy, store }; }; const { store, gateway } = mk(); const r = store.checkout("u1", [{ sku: "jeans", qty: 1 }], "instalment"); gateway.failNext(1); const declined = store.payNext(r.orderId); const order = store.orders[0]; const after = [order.schedule.length, order.paid, store.account("u1").outstanding]; const ok = store.payNext(r.orderId); return [declined.reason, after, ok.ok, order.schedule.length]; })()',
        expected: ["declined", [2, 30000, 60000], true, 1],
      },
      {
        name: "answers an unknown order and a direct order with nothing due without throwing",
        expr: '(() => { const mk = () => { const catalog = new Catalog(); catalog.importFrom(new ListSource([{ sku: "tee", name: "Tee", price: 30000, stock: 5 }, { sku: "jeans", name: "Jeans", price: 90000, stock: 2 }])); const gateway = new FakeGateway(); const policy = new PastPaymentsPolicy(100000, 10, 500000); const store = new Store(catalog, [new DirectPayment(gateway), new InstalmentPayment(gateway, policy, 3)]); return { catalog, gateway, policy, store }; }; const { store } = mk(); const direct = store.checkout("u1", [{ sku: "tee", qty: 1 }], "direct"); return [store.payNext(99).reason, store.payNext(direct.orderId).reason]; })()',
        expected: ["unknown order", "nothing due"],
      },
      {
        name: "marks an order paid at once when the total is too small to split",
        expr: '(() => { const mk = () => { const catalog = new Catalog(); catalog.importFrom(new ListSource([{ sku: "tee", name: "Tee", price: 30000, stock: 5 }, { sku: "jeans", name: "Jeans", price: 90000, stock: 2 }])); const gateway = new FakeGateway(); const policy = new PastPaymentsPolicy(100000, 10, 500000); const store = new Store(catalog, [new DirectPayment(gateway), new InstalmentPayment(gateway, policy, 3)]); return { catalog, gateway, policy, store }; }; const { catalog, store } = mk(); catalog.add({ sku: "pin", name: "Pin", price: 2, stock: 3 }); const r = store.checkout("u1", [{ sku: "pin", qty: 1 }], "instalment"); return [r.status, store.orders[0].schedule, store.account("u1").outstanding]; })()',
        expected: ["PAID", [], 0],
      },
      {
        name: "never lets the history policy go above its cap",
        expr: '(() => { const mk = () => { const catalog = new Catalog(); catalog.importFrom(new ListSource([{ sku: "tee", name: "Tee", price: 30000, stock: 5 }, { sku: "jeans", name: "Jeans", price: 90000, stock: 2 }])); const gateway = new FakeGateway(); const policy = new PastPaymentsPolicy(100000, 10, 500000); const store = new Store(catalog, [new DirectPayment(gateway), new InstalmentPayment(gateway, policy, 3)]); return { catalog, gateway, policy, store }; }; const { policy } = mk(); return [policy.limitFor({ paidTotal: 0 }), policy.limitFor({ paidTotal: 1000000 }), policy.limitFor({ paidTotal: 100000000 })]; })()',
        expected: [100000, 200000, 500000],
      },
    ],
    code: `class Catalog {
  constructor() {
    this.products = new Map();
  }
  check(item) {
    if (!item.sku || !Number.isInteger(item.price) || item.price <= 0 || !Number.isInteger(item.stock) || item.stock < 0) {
      throw new Error("invalid product " + item.sku);
    }
  }
  add(item) {
    this.check(item);
    const existing = this.products.get(item.sku);
    if (existing) existing.stock += item.stock;
    else this.products.set(item.sku, { ...item });
  }
  importFrom(source) {
    const items = source.load();
    items.forEach((item) => this.check(item));
    items.forEach((item) => this.add(item));
  }
  get(sku) {
    return this.products.get(sku);
  }
  browse() {
    return [...this.products.values()].filter((p) => p.stock > 0).map((p) => p.sku);
  }
}

class ListSource {
  constructor(items) {
    this.items = items;
  }
  load() {
    return this.items.map((item) => ({ ...item }));
  }
}

class CsvSource {
  constructor(text) {
    this.text = text;
  }
  load() {
    return this.text
      .split("\\n")
      .filter((line) => line.length > 0)
      .map((line) => {
        const [sku, name, price, stock] = line.split(",");
        return { sku, name, price: Number(price), stock: Number(stock) };
      });
  }
}

class FeedSource {
  constructor(payload) {
    this.payload = payload;
  }
  load() {
    return this.payload.items.map((i) => ({
      sku: i.id,
      name: i.title,
      price: Math.round(i.priceRupees * 100),
      stock: i.qty,
    }));
  }
}

class FakeGateway {
  constructor() {
    this.charges = [];
    this.failures = 0;
  }
  failNext(count) {
    this.failures = count;
  }
  charge(userId, amount) {
    if (this.failures > 0) {
      this.failures -= 1;
      return { ok: false };
    }
    this.charges.push({ userId, amount });
    return { ok: true, ref: "ch" + this.charges.length };
  }
}

class PastPaymentsPolicy {
  constructor(base, percentOfPaid, cap) {
    this.base = base;
    this.percentOfPaid = percentOfPaid;
    this.cap = cap;
  }
  limitFor(account) {
    return Math.min(this.cap, this.base + Math.floor((account.paidTotal * this.percentOfPaid) / 100));
  }
}

function splitEvenly(total, parts) {
  const base = Math.floor(total / parts);
  const amounts = Array.from({ length: parts }, () => base);
  amounts[0] += total - base * parts;
  return amounts;
}

class DirectPayment {
  constructor(gateway) {
    this.name = "direct";
    this.gateway = gateway;
  }
  pay(account, order) {
    if (!this.gateway.charge(account.id, order.total).ok) return { ok: false, reason: "declined" };
    account.paidTotal += order.total;
    order.paid = order.total;
    return { ok: true, status: "PAID" };
  }
  payNext() {
    return { ok: false, reason: "nothing due" };
  }
}

class InstalmentPayment {
  constructor(gateway, policy, count) {
    this.name = "instalment";
    this.gateway = gateway;
    this.policy = policy;
    this.count = count;
  }
  pay(account, order) {
    const available = this.policy.limitFor(account) - account.outstanding;
    if (order.total > available) return { ok: false, reason: "over credit limit" };
    const amounts = splitEvenly(order.total, this.count).filter((amount) => amount > 0);
    if (!this.gateway.charge(account.id, amounts[0]).ok) return { ok: false, reason: "declined" };
    account.paidTotal += amounts[0];
    account.outstanding += order.total - amounts[0];
    order.paid = amounts[0];
    order.schedule = amounts.slice(1);
    return { ok: true, status: order.schedule.length === 0 ? "PAID" : "INSTALMENTS" };
  }
  payNext(account, order) {
    if (order.schedule.length === 0) return { ok: false, reason: "nothing due" };
    const amount = order.schedule[0];
    if (!this.gateway.charge(account.id, amount).ok) return { ok: false, reason: "declined" };
    order.schedule.shift();
    order.paid += amount;
    account.paidTotal += amount;
    account.outstanding -= amount;
    if (order.schedule.length === 0) order.status = "PAID";
    return { ok: true, status: order.status };
  }
}

class Store {
  constructor(catalog, methods) {
    this.catalog = catalog;
    this.methods = new Map(methods.map((m) => [m.name, m]));
    this.accounts = new Map();
    this.orders = [];
  }
  registerMethod(method) {
    this.methods.set(method.name, method);
  }
  account(id) {
    if (!this.accounts.has(id)) this.accounts.set(id, { id, paidTotal: 0, outstanding: 0 });
    return this.accounts.get(id);
  }
  checkout(userId, lines, methodName) {
    const method = this.methods.get(methodName);
    if (!method) throw new Error("unknown payment method " + methodName);
    const wanted = new Map();
    for (const line of lines) {
      if (!Number.isInteger(line.qty) || line.qty <= 0) return { ok: false, reason: "unavailable " + line.sku };
      wanted.set(line.sku, (wanted.get(line.sku) || 0) + line.qty);
    }
    if (wanted.size === 0) return { ok: false, reason: "empty cart" };
    let total = 0;
    for (const [sku, qty] of wanted) {
      const product = this.catalog.get(sku);
      if (!product || product.stock < qty) {
        return { ok: false, reason: "unavailable " + sku };
      }
      total += product.price * qty;
    }
    const order = {
      id: this.orders.length + 1,
      userId,
      method: methodName,
      total,
      status: "NEW",
      paid: 0,
      schedule: [],
    };
    this.orders.push(order);
    const result = method.pay(this.account(userId), order);
    if (!result.ok) {
      order.status = "FAILED";
      return { ok: false, reason: result.reason, orderId: order.id };
    }
    for (const [sku, qty] of wanted) this.catalog.get(sku).stock -= qty;
    order.status = result.status;
    return { ok: true, orderId: order.id, status: order.status };
  }
  payNext(orderId) {
    const order = this.orders[orderId - 1];
    if (!order) return { ok: false, reason: "unknown order" };
    return this.methods.get(order.method).payNext(this.account(order.userId), order);
  }
}`,
  },
  {
    id: "groww-splitwise",
    company: "groww",
    title: "Expense sharing with debt simplification",
    prompt:
      "Design an expense-sharing app in the style of Splitwise, with users, groups and balances. People in a group add expenses that one person pays and several people share, and the app must always show who owes whom. Build it as an in-memory machine-coding task that is easy to extend with new ways of splitting.",
    level: "level not stated",
    round: "machine-coding",
    topic: "payments",
    patterns: ["Strategy", "Ledger", "Bitmask DP"],
    evidence: "guide",
    sources: [
      {
        label: "Groww interview process round by round (DesignGurus)",
        url: "https://www.designgurus.io/answers/detail/what-is-the-groww-interview-process-like-round-by-round",
        kind: "prep-guide",
      },
      {
        label: "CodeKerdos: Groww SDE-1 breakdown",
        url: "https://blog.codekerdos.in/groww-sde-1-interview-a-complete-breakdown/",
        kind: "prep-guide",
      },
    ],
    chapters: [],
    answer: {
      ask: "<p>Questions to ask first: which split types are needed (equal, exact amounts, percentages, shares), are amounts whole paise or decimals, must the payer be one of the people sharing, can a user be in several groups, do we record repayments between people, and should the app suggest a smaller set of payments that clears the group. Ask how a leftover paisa is handled when a total does not divide evenly.</p><p>Assumed scope: integer paise, one currency, equal, exact and percent splits chosen per expense, a payer who must be a group member, and repayments that are recorded as payments between two members and cannot exceed what is owed. Debt simplification is included as the main extension: the app can return the fewest payments that bring every balance in the group to zero. Out of scope: currencies, receipts, notifications, editing or deleting old expenses, authentication and persistence.</p>",
      entities:
        "<ul><li><b>Group</b> holds the member ids, a list of expenses and one <code>Ledger</code>. It exposes <code>addExpense</code>, <code>settle</code> and <code>simplify</code>. A user is just an id in this version.</li><li><b>Expense</b> is a record of the payer and the amount. The shares are not stored on it, because they are turned into ledger entries the moment they are validated.</li><li><b>SplitStrategy</b> is the interface with <code>split(amount, spec)</code>, which returns a map from user to share that adds up exactly to the amount. <code>EqualSplit</code> takes a list of users, <code>ExactSplit</code> takes user to amount, and <code>PercentSplit</code> takes user to percent.</li><li><b>Ledger</b> keeps one number per ordered pair, so reverse debts cancel. <code>owes(a, b)</code> reads it and <code>net()</code> gives each person's total position, where a positive number means they are owed money. People at zero are left out.</li><li><b>Settlement functions</b> <code>greedySettlements</code> and <code>minimalSettlements</code> take net balances and return a list of payments from a debtor to a creditor.</li></ul>",
      design:
        "<p>Adding an expense validates that the amount is a positive integer, asks the strategy for the shares, checks that every share is a whole non-negative number of paise and that they add up exactly to the amount, checks that the payer and everyone in the shares belong to the group, and only then adds each non-payer's share to the ledger as a debt to the payer. The payer's own share is never recorded, because nobody owes themselves. The group does not trust the strategy, so a custom strategy, a name repeated in an equal split or a negative percentage is rejected before the ledger changes.</p><p><b>Strategy for splits.</b> The three split types differ only in how they turn an amount and a spec into shares, so each is a class returning a map that sums exactly to the amount. This is the one place rounding lives. Equal split gives everyone the floor of the division and hands one extra paisa to the first few people. Percent split floors each share and gives leftover paise to the first people in order. Exact split passes the given shares through, and the group rejects them if they are negative, fractional or do not add up. A new split type, such as shares by weight, is one more class and no change to the group.</p><p><b>Ledger.</b> It stores a single net debt per ordered pair. If B owes A 500 and later A owes B 150, the ledger holds that B owes A 350 and nothing in the other direction. A person's net position is what others owe them minus what they owe, and the sum of all net positions in a group is always zero, which is the invariant to assert in tests.</p><p><b>Simplification.</b> Only net positions matter for clearing a group, so the problem becomes: given positive and negative balances that sum to zero, find the fewest payments from debtors to creditors. The greedy method repeatedly makes the largest debtor pay the largest creditor, and uses at most k minus 1 payments for k people with a non-zero balance, but it is not always the fewest. The true minimum is k minus the largest number of groups of people whose balances sum to zero, because a zero-sum group of size s needs s minus 1 payments and no fewer. Finding that partition is hard in general, so <code>minimalSettlements</code> uses a bitmask over subsets: for each subset it records the best count of zero-sum prefixes over all orderings, which costs about 2 to the power k times k steps. That is fine up to 16 people, and the group falls back to greedy beyond that.</p><p><b>Worked check.</b> Balances in paise: A +500, B -300, C -200, D +400, E -400. Greedy pays E to A 400, B to D 300, C to D 100 and C to A 100, which is 4 payments. The partition {A, B, C} and {D, E} sums to zero in each part, so the minimum is 3: B to A 300, C to A 200, E to D 400.</p><p><b>Trade-off.</b> The ledger is a cache of the expense history, quick to read but unable to answer which expense created a debt; the expense list is kept for audit and rebuilds. Writes to one group should be serialised, because an expense touches several pairs.</p>",
      extend: [
        "How would you add a split by shares, such as two shares for an adult and one for a child?",
        "How would you support several currencies in one group, and when do you convert?",
        "How would you let a user delete or edit an old expense without breaking the balances of later ones?",
        "How would you keep the simplified payments stable so the suggestions do not change after every new expense?",
        "How would you handle a group with thousands of members, where the subset method is too slow?",
      ],
      slips:
        "<p>Using floating point money, so a three way split of 100.00 loses a paisa. Letting the shares add up to a different total than the amount. Recording the payer's own share as a debt. Keeping two directions per pair so that A owes B and B owes A at the same time. Settling with a greedy match and calling it minimal. Allowing a settlement larger than the debt, which silently reverses it. Accepting people who are not in the group. Forgetting that percentages must add up to exactly 100.</p>",
    },
    checks: [
      {
        name: "splits an equal expense and records one debt per other person",
        expr: '(() => { const g = new Group(["A", "B", "C"]); g.addExpense("A", 10000, new EqualSplit(), ["A", "B", "C"]); return [g.ledger.owes("B", "A"), g.ledger.owes("C", "A"), g.ledger.owes("A", "B")]; })()',
        expected: [3333, 3333, 0],
      },
      {
        name: "rejects exact shares that do not add up to the amount",
        expr: '(() => { const g = new Group(["A", "B"]); try { g.addExpense("A", 1000, new ExactSplit(), { A: 400, B: 500 }); } catch (e) { return e.message; } })()',
        expected: "shares add up to 900 not 1000",
      },
      {
        name: "gives the leftover paisa of a percent split to the first person",
        expr: "Array.from(new PercentSplit().split(1001, { A: 50, B: 30, C: 20 }))",
        expected: [
          ["A", 501],
          ["B", 300],
          ["C", 200],
        ],
      },
      {
        name: "cancels opposite debts between the same pair",
        expr: '(() => { const g = new Group(["A", "B"]); g.addExpense("A", 1000, new EqualSplit(), ["A", "B"]); g.addExpense("B", 300, new EqualSplit(), ["A", "B"]); return [g.ledger.owes("B", "A"), g.ledger.owes("A", "B")]; })()',
        expected: [350, 0],
      },
      {
        name: "settles part of a debt and refuses to settle more than is owed",
        expr: '(() => { const g = new Group(["A", "B"]); g.addExpense("A", 1000, new EqualSplit(), ["A", "B"]); g.settle("B", "A", 200); let msg; try { g.settle("B", "A", 400); } catch (e) { msg = e.message; } return [g.ledger.owes("B", "A"), msg]; })()',
        expected: [300, "cannot settle 400"],
      },
      {
        name: "needs 3 payments where the greedy method uses 4",
        expr: '(() => { const nets = new Map([["A", 500], ["B", -300], ["C", -200], ["D", 400], ["E", -400]]); return [greedySettlements(nets).length, minimalSettlements(nets).length]; })()',
        expected: [4, 3],
      },
      {
        name: "clears every balance with the simplified payments",
        expr: '(() => { const g = new Group(["A", "B", "C", "D"]); g.addExpense("A", 3000, new EqualSplit(), ["A", "B", "C"]); g.addExpense("B", 1500, new EqualSplit(), ["B", "C"]); g.addExpense("D", 800, new EqualSplit(), ["A", "D"]); const moves = g.simplify(); const left = new Map(g.ledger.net()); for (const m of moves) { left.set(m.from, left.get(m.from) + m.amount); left.set(m.to, left.get(m.to) - m.amount); } return [moves.length, Array.from(left.values()).every((v) => v === 0), Array.from(g.ledger.net().values()).reduce((a, b) => a + b, 0)]; })()',
        expected: [3, true, 0],
      },
      {
        name: "accepts a new weighted split strategy without changing the group",
        expr: '(() => { const g = new Group(["A", "B", "C"]); const byWeight = { split: (amount, w) => new Map(Object.entries(w).map(([id, n]) => [id, (amount * n) / 6])) }; g.addExpense("A", 900, byWeight, { A: 1, B: 2, C: 3 }); return [g.ledger.owes("B", "A"), g.ledger.owes("C", "A")]; })()',
        expected: [300, 450],
      },
      {
        name: "rejects an expense that names someone outside the group",
        expr: '(() => { const g = new Group(["A", "B"]); try { g.addExpense("A", 500, new EqualSplit(), ["A", "Z"]); } catch (e) { return e.message; } })()',
        expected: "Z is not in the group",
      },
      {
        name: "rejects a strategy whose shares do not add up and leaves the ledger untouched",
        expr: '(() => { const g = new Group(["A", "B"]); let msg; try { g.addExpense("A", 100, { split: () => new Map([["B", 10]]) }, null); } catch (e) { msg = e.message; } return [msg, g.ledger.owes("B", "A"), g.expenses.length]; })()',
        expected: ["shares add up to 10 not 100", 0, 0],
      },
      {
        name: "rejects an equal split that lists the same person twice",
        expr: '(() => { const g = new Group(["A", "B"]); let msg; try { g.addExpense("A", 100, new EqualSplit(), ["A", "B", "B"]); } catch (e) { msg = e.message; } return [msg, g.ledger.owes("B", "A")]; })()',
        expected: ["shares add up to 67 not 100", 0],
      },
      {
        name: "rejects percentages that do not add up to 100 and negative shares",
        expr: '(() => { const g = new Group(["A", "B"]); const msgs = []; for (const spec of [{ A: 60, B: 30 }, { A: 150, B: -50 }]) { try { g.addExpense("A", 100, new PercentSplit(), spec); } catch (e) { msgs.push(e.message); } } return [msgs, g.ledger.owes("B", "A")]; })()',
        expected: [["percentages add up to 90", "shares must be whole paise"], 0],
      },
      {
        name: "refuses fractional settlements and settlements between people with no debt",
        expr: '(() => { const g = new Group(["A", "B", "C"]); g.addExpense("A", 1000, new EqualSplit(), ["A", "B"]); const msgs = []; for (const move of [["B", "A", 0.5], ["C", "A", 1], ["A", "B", 1]]) { try { g.settle(...move); } catch (e) { msgs.push(e.message); } } return [msgs, g.ledger.owes("B", "A")]; })()',
        expected: [["cannot settle 0.5", "cannot settle 1", "cannot settle 1"], 500],
      },
      {
        name: "settles a whole debt down to zero and removes the pair",
        expr: '(() => { const g = new Group(["A", "B"]); g.addExpense("A", 1000, new EqualSplit(), ["A", "B"]); g.settle("B", "A", 500); return [g.ledger.owes("B", "A"), g.ledger.owed.size, g.ledger.net().size]; })()',
        expected: [0, 0, 0],
      },
      {
        name: "drops people whose debts cancel out of the net positions",
        expr: '(() => { const g = new Group(["A", "B", "C"]); g.addExpense("A", 200, new EqualSplit(), ["A", "B"]); g.addExpense("B", 200, new EqualSplit(), ["B", "C"]); return Array.from(g.ledger.net()); })()',
        expected: [
          ["A", 100],
          ["C", -100],
        ],
      },
      {
        name: "finds the fewest payments when the group splits into several zero-sum subgroups",
        expr: '(() => { const nets = new Map([["A", 300], ["B", -100], ["C", -200], ["D", 500], ["E", -250], ["F", -250]]); return [greedySettlements(nets).length, minimalSettlements(nets).length]; })()',
        expected: [5, 4],
      },
      {
        name: "refuses member ids that would corrupt the ledger keys",
        expr: '(() => { try { new Group(["A>B"]); } catch (e) { return e.message; } })()',
        expected: "ids cannot contain >",
      },
    ],
    code: `class EqualSplit {
  split(amount, people) {
    const base = Math.floor(amount / people.length);
    const extra = amount - base * people.length;
    return new Map(people.map((id, i) => [id, base + (i < extra ? 1 : 0)]));
  }
}

class ExactSplit {
  split(amount, shares) {
    return new Map(Object.entries(shares));
  }
}

class PercentSplit {
  split(amount, percents) {
    const ids = Object.keys(percents);
    const sum = Object.values(percents).reduce((a, b) => a + b, 0);
    if (sum !== 100) throw new Error("percentages add up to " + sum);
    const shares = new Map(ids.map((id) => [id, Math.floor((amount * percents[id]) / 100)]));
    let left = amount - [...shares.values()].reduce((a, b) => a + b, 0);
    for (const id of ids) {
      if (left === 0) break;
      shares.set(id, shares.get(id) + 1);
      left -= 1;
    }
    return shares;
  }
}

class Ledger {
  constructor() {
    this.owed = new Map();
  }
  owes(from, to) {
    return this.owed.get(from + ">" + to) || 0;
  }
  add(from, to, amount) {
    const back = this.owes(to, from);
    const net = amount - back;
    this.owed.delete(to + ">" + from);
    if (net > 0) this.owed.set(from + ">" + to, this.owes(from, to) + net);
    else if (net < 0) this.owed.set(to + ">" + from, -net);
  }
  net() {
    const net = new Map();
    for (const [key, amount] of this.owed) {
      const [from, to] = key.split(">");
      net.set(from, (net.get(from) || 0) - amount);
      net.set(to, (net.get(to) || 0) + amount);
    }
    for (const [id, value] of net) if (value === 0) net.delete(id);
    return net;
  }
}

function greedySettlements(net) {
  const rest = [...net].filter(([, v]) => v !== 0).map(([id, v]) => ({ id, v }));
  const moves = [];
  for (;;) {
    rest.sort((a, b) => b.v - a.v);
    const give = rest[rest.length - 1];
    const take = rest[0];
    if (!give || give.v >= 0) return moves;
    const amount = Math.min(take.v, -give.v);
    moves.push({ from: give.id, to: take.id, amount });
    take.v -= amount;
    give.v += amount;
    while (rest.length && rest[rest.length - 1].v === 0) rest.pop();
    while (rest.length && rest[0].v === 0) rest.shift();
  }
}

function minimalSettlements(net) {
  const people = [...net].filter(([, v]) => v !== 0);
  const n = people.length;
  const sum = [0];
  const best = [0];
  const last = [0];
  for (let mask = 1; mask < 1 << n; mask++) {
    sum[mask] = sum[mask & (mask - 1)] + people[31 - Math.clz32(mask & -mask)][1];
    best[mask] = -1;
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i) && best[mask ^ (1 << i)] > best[mask]) {
        best[mask] = best[mask ^ (1 << i)];
        last[mask] = i;
      }
    }
    if (sum[mask] === 0) best[mask] += 1;
  }
  const order = [];
  for (let mask = (1 << n) - 1; mask; mask ^= 1 << last[mask]) order.push(last[mask]);
  const moves = [];
  let group = [];
  for (const i of order.reverse()) {
    group.push(people[i]);
    if (group.reduce((total, [, v]) => total + v, 0) === 0) {
      moves.push(...greedySettlements(new Map(group)));
      group = [];
    }
  }
  return moves;
}

class Group {
  constructor(members) {
    if (members.some((id) => id.includes(">"))) throw new Error("ids cannot contain >");
    this.members = new Set(members);
    this.ledger = new Ledger();
    this.expenses = [];
  }
  addExpense(payer, amount, strategy, spec) {
    if (!Number.isInteger(amount) || amount <= 0) throw new Error("amount must be positive paise");
    const shares = strategy.split(amount, spec);
    let total = 0;
    for (const share of shares.values()) {
      if (!Number.isInteger(share) || share < 0) throw new Error("shares must be whole paise");
      total += share;
    }
    if (total !== amount) throw new Error("shares add up to " + total + " not " + amount);
    for (const id of [payer, ...shares.keys()]) if (!this.members.has(id)) throw new Error(id + " is not in the group");
    for (const [id, share] of shares) if (id !== payer) this.ledger.add(id, payer, share);
    this.expenses.push({ payer, amount });
  }
  settle(from, to, amount) {
    if (!Number.isInteger(amount) || amount <= 0 || amount > this.ledger.owes(from, to)) throw new Error("cannot settle " + amount);
    this.ledger.add(to, from, amount);
  }
  simplify() {
    const net = this.ledger.net();
    return net.size > 16 ? greedySettlements(net) : minimalSettlements(net);
  }
}`,
  },
  {
    id: "paytm-wallet",
    company: "paytm",
    title: "Digital wallet with atomic transfers",
    prompt:
      "Design a digital wallet in which users hold a balance, add money and send money to each other. Every movement has to keep the books correct: a transfer either happens in full or not at all, nothing is lost or created when a step fails halfway, and a repeated request must not move the money twice.",
    level: "level not stated",
    round: "lld",
    topic: "payments",
    patterns: ["Command", "Compensating action", "Lock ordering", "Idempotency key"],
    evidence: "guide",
    sources: [
      {
        label: "Paytm interview process (TechPrep, 2026)",
        url: "https://www.techprep.app/blog/paytm-interview-process",
        kind: "prep-guide",
        year: 2026,
      },
    ],
    chapters: ["sysdes-transactions-isolation", "sysdes-walkthrough-payments"],
    answer: {
      ask: "<p>Questions to ask first: are balances kept in integer minor units (paise) or decimals, is there a maximum balance per wallet, can a wallet be frozen, is there one currency, must a client retry of the same request be safe, what should happen when two transfers touch the same wallet at the same time, and do we need a history that includes failed attempts.</p><p>The prep guide only says wallet questions test transaction integrity, concurrent writes and duplicate transactions, so the rest of this scope is an assumption. Assumed scope: integer paise, one currency, a balance cap and a frozen flag per wallet, top-ups from outside the system recorded as ledger entries, transfers between two wallets, an idempotency key supplied by the caller, and an append-only ledger whose entries are COMPLETED or FAILED. Out of scope: bank links, KYC, fees, refunds, multi-currency, authentication and persistence.</p>",
      entities:
        "<ul><li><b>Wallet</b> holds an id, a balance in integer paise, a cap and a frozen flag. Its <code>debit</code> and <code>credit</code> enforce their own rules and throw a <code>WalletError</code> with a reason.</li><li><b>WalletService</b> is the orchestrator. It owns the wallets, the lock manager, the ledger and a cache of results by idempotency key, and exposes <code>open</code>, <code>topUp</code> and <code>transfer</code>. Every money movement goes through one shared <code>execute</code> method.</li><li><b>Step</b> is a plain object with <code>run</code> and <code>undo</code>, a command with its compensating action. A transfer is the list debit then credit.</li><li><b>LockManager</b> keeps one lock per wallet id with an owner. <code>tryAcquire</code> returns false instead of waiting, so a failed acquire is visible.</li><li><b>Ledger</b> is an append-only list of entries with an id, type, from, to, amount, key and status. <code>forWallet</code> returns the history of one wallet.</li><li><b>Result cache</b> maps an idempotency key to the result of its first execution.</li></ul>",
      design:
        "<p><b>Money.</b> Balances and amounts are integers in paise, so no rounding error can appear. An amount that is fractional, zero or negative throws a <code>RangeError</code> before anything is touched, which keeps bad input apart from business failures such as insufficient funds.</p><p><b>Atomic transfer.</b> The only way money moves is <code>execute(key, entry, steps, lockIds)</code>. A transfer is two steps, debit the source and credit the target. Each step that succeeds pushes its undo onto a stack. If any step throws, the stack is popped and the undo actions run in reverse order, which restores the source, and a FAILED ledger entry is appended. If every step succeeds a COMPLETED entry is appended. The invariant is that the total across all wallets changes only through top-ups and that a failed transfer changes nothing; the checks assert both. Only a <code>WalletError</code> counts as a business failure. Any other error rolls the steps back, releases the locks and is rethrown with nothing recorded, because it is a bug and not a declined transfer.</p><p>The credit step is where late failures appear, since the target may be frozen or over its cap and that is only known when the credit is tried. A design that validates everything up front still needs the rollback, because a real credit goes through a database or another service that can fail.</p><p><b>Concurrency.</b> Two transfers must not interleave their read, check and write on the same wallet. Each wallet has a lock, and <code>execute</code> acquires the locks of all wallets involved in sorted id order. Sorting matters: if one transfer locked w1 then w2 and another locked w2 then w1, each could hold one lock and wait forever for the other. A failed acquire releases whatever was taken and returns <code>busy</code> without recording anything, so the caller can retry with the same key. This single-threaded program shows the protocol only. A real service uses a database transaction that debits, credits and inserts the ledger rows together, with row locks taken in id order or an optimistic version column; the undo steps then become the transaction rollback.</p><p><b>Idempotency.</b> The result of each key is cached, so a retried request returns the same result and money does not move twice. The cache also keeps a fingerprint of the request (type, source, target and amount), so the same key sent with a different request is rejected with an error instead of quietly returning the first result. A busy result is not cached because nothing happened. A FAILED result is cached, so the same key always gives the same failure and a new attempt needs a new key. In production this cache is a unique constraint on the key in the ledger table, not process memory.</p><p><b>Trade-off.</b> Debit then credit with compensation is simple and works for in-process steps. Across services it needs a saga with durable state, because a crash between steps must be recoverable.</p>",
      extend: [
        "How would you add a transfer fee that is paid into a platform wallet inside the same atomic operation?",
        "The process crashes after the debit and before the credit. What do you persist, and what happens on restart?",
        "How would you enforce a daily spending limit for each wallet?",
        "How would the lock protocol work when several service instances share the same wallets?",
        "How would you reverse a completed transfer later, for a dispute, while keeping the ledger append-only?",
      ],
      slips:
        "<p>Using floating point for balances. Checking the balance and writing it in two separate steps with no lock, so two transfers both pass the check. Taking locks in argument order, which can deadlock opposite transfers. An undo that forgets a step or runs the steps forward instead of in reverse. Writing a ledger entry only on success, so failed attempts vanish from the history. Applying a retried request twice, or treating a reused key as proof that the request is the same. Allowing a transfer from a wallet to itself. Treating a validation error and a business failure as the same kind of problem.</p>",
    },
    checks: [
      {
        name: "moves money between two wallets",
        expr: '(() => { const mk = () => { const s = new WalletService(); s.open("w1", 100000); s.open("w2", 50000); s.open("w3", 100000); s.topUp("w1", 80000, "t1"); return s; }; const s = mk(); const r = s.transfer("w1", "w2", 15000, "k1"); return [r.ok, s.wallet("w1").balance, s.wallet("w2").balance]; })()',
        expected: [true, 65000, 15000],
      },
      {
        name: "fails without changing balances when funds are short and records the failure",
        expr: '(() => { const mk = () => { const s = new WalletService(); s.open("w1", 100000); s.open("w2", 50000); s.open("w3", 100000); s.topUp("w1", 80000, "t1"); return s; }; const s = mk(); const r = s.transfer("w1", "w2", 90000, "k1"); return [r.ok, r.reason, r.entry.status, s.wallet("w1").balance, s.wallet("w2").balance]; })()',
        expected: [false, "insufficient funds", "FAILED", 80000, 0],
      },
      {
        name: "restores the source when the credit would pass the target cap",
        expr: '(() => { const mk = () => { const s = new WalletService(); s.open("w1", 100000); s.open("w2", 50000); s.open("w3", 100000); s.topUp("w1", 80000, "t1"); return s; }; const s = mk(); const r = s.transfer("w1", "w2", 50001, "k1"); return [r.reason, s.wallet("w1").balance, s.wallet("w2").balance]; })()',
        expected: ["balance cap exceeded", 80000, 0],
      },
      {
        name: "restores the source when the target wallet is frozen",
        expr: '(() => { const mk = () => { const s = new WalletService(); s.open("w1", 100000); s.open("w2", 50000); s.open("w3", 100000); s.topUp("w1", 80000, "t1"); return s; }; const s = mk(); s.wallet("w2").frozen = true; const r = s.transfer("w1", "w2", 1000, "k1"); return [r.reason, s.wallet("w1").balance, s.total()]; })()',
        expected: ["wallet frozen", 80000, 80000],
      },
      {
        name: "returns the same result for a repeated key and moves money once",
        expr: '(() => { const mk = () => { const s = new WalletService(); s.open("w1", 100000); s.open("w2", 50000); s.open("w3", 100000); s.topUp("w1", 80000, "t1"); return s; }; const s = mk(); const a = s.transfer("w1", "w2", 1000, "k1"); const b = s.transfer("w1", "w2", 1000, "k1"); return [a === b, s.wallet("w1").balance, s.ledger.entries.length]; })()',
        expected: [true, 79000, 2],
      },
      {
        name: "reports busy while another owner holds a lock and succeeds after release",
        expr: '(() => { const mk = () => { const s = new WalletService(); s.open("w1", 100000); s.open("w2", 50000); s.open("w3", 100000); s.topUp("w1", 80000, "t1"); return s; }; const s = mk(); s.locks.tryAcquire("w2", "other"); const r1 = s.transfer("w1", "w2", 1000, "k1"); s.locks.release("w2", "other"); const r2 = s.transfer("w1", "w2", 1000, "k2"); return [r1.reason, s.locks.held.size, r2.ok, s.wallet("w1").balance]; })()',
        expected: ["busy", 0, true, 79000],
      },
      {
        name: "keeps the total constant through mixed successes and failures",
        expr: '(() => { const mk = () => { const s = new WalletService(); s.open("w1", 100000); s.open("w2", 50000); s.open("w3", 100000); s.topUp("w1", 80000, "t1"); return s; }; const s = mk(); s.transfer("w1", "w2", 10000, "a"); s.transfer("w2", "w3", 4000, "b"); s.transfer("w3", "w1", 9999999, "c"); s.transfer("w1", "w3", 20000, "d"); return [s.total(), s.wallet("w1").balance, s.wallet("w2").balance, s.wallet("w3").balance]; })()',
        expected: [80000, 50000, 6000, 24000],
      },
      {
        name: "rejects fractional, negative and zero amounts",
        expr: '(() => { const mk = () => { const s = new WalletService(); s.open("w1", 100000); s.open("w2", 50000); s.open("w3", 100000); s.topUp("w1", 80000, "t1"); return s; }; const s = mk(); const names = []; for (const amount of [0.5, -5, 0]) { try { s.transfer("w1", "w2", amount, "x" + amount); } catch (e) { names.push(e.constructor.name); } } return names; })()',
        expected: ["RangeError", "RangeError", "RangeError"],
      },
      {
        name: "lists the history of one wallet including failed attempts",
        expr: '(() => { const mk = () => { const s = new WalletService(); s.open("w1", 100000); s.open("w2", 50000); s.open("w3", 100000); s.topUp("w1", 80000, "t1"); return s; }; const s = mk(); s.transfer("w1", "w2", 1000, "k1"); s.transfer("w2", "w3", 2000, "k2"); return s.ledger.forWallet("w2").map((e) => [e.type, e.status, e.amount]); })()',
        expected: [
          ["TRANSFER", "COMPLETED", 1000],
          ["TRANSFER", "FAILED", 2000],
        ],
      },
      {
        name: "lands exactly on the cap and moves the entire remaining balance",
        expr: '(() => { const mk = () => { const s = new WalletService(); s.open("w1", 100000); s.open("w2", 50000); s.open("w3", 100000); s.topUp("w1", 80000, "t1"); return s; }; const s = mk(); const a = s.transfer("w1", "w2", 50000, "a"); const b = s.transfer("w1", "w3", 30000, "b"); return [a.ok, b.ok, s.wallet("w1").balance, s.wallet("w2").balance, s.wallet("w3").balance]; })()',
        expected: [true, true, 0, 50000, 30000],
      },
      {
        name: "rejects a reused key for a different request and moves no money",
        expr: '(() => { const mk = () => { const s = new WalletService(); s.open("w1", 100000); s.open("w2", 50000); s.open("w3", 100000); s.topUp("w1", 80000, "t1"); return s; }; const s = mk(); s.transfer("w1", "w2", 1000, "k1"); let msg; try { s.transfer("w1", "w3", 5000, "k1"); } catch (e) { msg = e.message; } return [msg, s.wallet("w1").balance, s.wallet("w3").balance, s.ledger.entries.length]; })()',
        expected: ["key k1 was used for a different request", 79000, 0, 2],
      },
      {
        name: "rolls back and rethrows an unexpected error without recording it",
        expr: '(() => { const mk = () => { const s = new WalletService(); s.open("w1", 100000); s.open("w2", 50000); s.open("w3", 100000); s.topUp("w1", 80000, "t1"); return s; }; const s = mk(); const w1 = s.wallet("w1"); let name; try { s.execute("x", { type: "TRANSFER", from: "w1", to: "w2", amount: 500 }, [{ run: () => w1.debit(500), undo: () => (w1.balance += 500) }, { run: () => { throw new TypeError("bug"); }, undo: () => {} }], ["w1", "w2"]); } catch (e) { name = e.constructor.name; } return [name, w1.balance, s.locks.held.size, s.ledger.entries.length]; })()',
        expected: ["TypeError", 80000, 0, 1],
      },
      {
        name: "undoes the steps that ran in reverse order when a later step fails",
        expr: '(() => { const mk = () => { const s = new WalletService(); s.open("w1", 100000); s.open("w2", 50000); s.open("w3", 100000); s.topUp("w1", 80000, "t1"); return s; }; const s = mk(); const log = []; const step = (n, fail) => ({ run: () => { if (fail) throw new WalletError("no"); }, undo: () => log.push(n) }); const r = s.execute("r", { type: "X", from: "w1", to: "w2", amount: 1 }, [step("u1"), step("u2"), step("u3", true)], ["w1", "w2"]); return [log, r.reason, s.ledger.entries[s.ledger.entries.length - 1].status]; })()',
        expected: [["u2", "u1"], "no", "FAILED"],
      },
      {
        name: "refuses a transfer to the same wallet or to an unknown wallet",
        expr: '(() => { const mk = () => { const s = new WalletService(); s.open("w1", 100000); s.open("w2", 50000); s.open("w3", 100000); s.topUp("w1", 80000, "t1"); return s; }; const s = mk(); const msgs = []; for (const to of ["w1", "zz"]) { try { s.transfer("w1", to, 100, "k" + to); } catch (e) { msgs.push(e.message); } } return [msgs, s.ledger.entries.length]; })()',
        expected: [["cannot transfer to the same wallet", "no wallet zz"], 1],
      },
      {
        name: "rejects a wallet cap that is not a positive whole number",
        expr: '(() => { const mk = () => { const s = new WalletService(); s.open("w1", 100000); s.open("w2", 50000); s.open("w3", 100000); s.topUp("w1", 80000, "t1"); return s; }; const s = mk(); const names = []; for (const cap of [0, -5, 1.5]) { try { s.open("x" + cap, cap); } catch (e) { names.push(e.constructor.name); } } return names; })()',
        expected: ["RangeError", "RangeError", "RangeError"],
      },
      {
        name: "does not cache a busy result so the same key works once the lock is free",
        expr: '(() => { const mk = () => { const s = new WalletService(); s.open("w1", 100000); s.open("w2", 50000); s.open("w3", 100000); s.topUp("w1", 80000, "t1"); return s; }; const s = mk(); s.locks.tryAcquire("w1", "other"); const busy = s.transfer("w1", "w2", 1000, "k1"); s.locks.release("w1", "other"); const retry = s.transfer("w1", "w2", 1000, "k1"); return [busy.reason, retry.ok, s.wallet("w2").balance, s.ledger.entries.length]; })()',
        expected: ["busy", true, 1000, 2],
      },
    ],
    code: `class WalletError extends Error {}

class Wallet {
  constructor(id, cap) {
    this.id = id;
    this.cap = cap;
    this.balance = 0;
    this.frozen = false;
  }
  debit(amount) {
    if (this.frozen) throw new WalletError("wallet frozen");
    if (this.balance < amount) throw new WalletError("insufficient funds");
    this.balance -= amount;
  }
  credit(amount) {
    if (this.frozen) throw new WalletError("wallet frozen");
    if (this.balance + amount > this.cap) throw new WalletError("balance cap exceeded");
    this.balance += amount;
  }
}

class LockManager {
  constructor() {
    this.held = new Map();
  }
  tryAcquire(id, owner) {
    if (this.held.has(id) && this.held.get(id) !== owner) return false;
    this.held.set(id, owner);
    return true;
  }
  release(id, owner) {
    if (this.held.get(id) === owner) this.held.delete(id);
  }
}

class Ledger {
  constructor() {
    this.entries = [];
  }
  append(entry) {
    const stored = { id: this.entries.length + 1, ...entry };
    this.entries.push(stored);
    return stored;
  }
  forWallet(id) {
    return this.entries.filter((e) => e.from === id || e.to === id);
  }
}

class WalletService {
  constructor() {
    this.wallets = new Map();
    this.locks = new LockManager();
    this.ledger = new Ledger();
    this.results = new Map();
  }
  open(id, cap) {
    if (!Number.isInteger(cap) || cap <= 0) throw new RangeError("cap must be positive whole minor units");
    if (this.wallets.has(id)) throw new Error("wallet exists " + id);
    this.wallets.set(id, new Wallet(id, cap));
  }
  wallet(id) {
    const wallet = this.wallets.get(id);
    if (!wallet) throw new Error("no wallet " + id);
    return wallet;
  }
  total() {
    return [...this.wallets.values()].reduce((sum, w) => sum + w.balance, 0);
  }
  topUp(id, amount, key) {
    const wallet = this.wallet(id);
    const steps = [{ run: () => wallet.credit(amount), undo: () => (wallet.balance -= amount) }];
    return this.execute(key, { type: "TOP_UP", from: "external", to: id, amount }, steps, [id]);
  }
  transfer(from, to, amount, key) {
    if (from === to) throw new Error("cannot transfer to the same wallet");
    const source = this.wallet(from);
    const target = this.wallet(to);
    const steps = [
      { run: () => source.debit(amount), undo: () => (source.balance += amount) },
      { run: () => target.credit(amount), undo: () => (target.balance -= amount) },
    ];
    return this.execute(key, { type: "TRANSFER", from, to, amount }, steps, [from, to]);
  }
  execute(key, entry, steps, lockIds) {
    if (!Number.isInteger(entry.amount) || entry.amount <= 0) throw new RangeError("amount must be whole minor units");
    const fingerprint = [entry.type, entry.from, entry.to, entry.amount].join("|");
    const prior = this.results.get(key);
    if (prior) {
      if (prior.fingerprint !== fingerprint) throw new Error("key " + key + " was used for a different request");
      return prior.result;
    }
    const owner = "tx:" + key;
    const taken = [];
    for (const id of [...lockIds].sort()) {
      if (this.locks.tryAcquire(id, owner)) {
        taken.push(id);
      } else {
        taken.forEach((held) => this.locks.release(held, owner));
        return { ok: false, reason: "busy" };
      }
    }
    const undo = [];
    let result;
    try {
      for (const step of steps) {
        step.run();
        undo.push(step.undo);
      }
      result = { ok: true, entry: this.ledger.append({ ...entry, key, status: "COMPLETED" }) };
    } catch (error) {
      while (undo.length > 0) undo.pop()();
      if (!(error instanceof WalletError)) throw error;
      result = { ok: false, reason: error.message, entry: this.ledger.append({ ...entry, key, status: "FAILED" }) };
    } finally {
      taken.forEach((id) => this.locks.release(id, owner));
    }
    this.results.set(key, { fingerprint, result });
    return result;
  }
}`,
  },
  {
    id: "meesho-inventory",
    company: "meesho",
    title: "Inventory service with stock blocking",
    prompt:
      "Design an inventory service that can add a product, add stock, block stock for an order and handle the outcome of the payment. Blocked stock cannot be sold to anyone else. When the payment succeeds the blocked stock is consumed, and when it fails the stock goes back to being available.",
    level: "SDE-3",
    round: "machine-coding",
    topic: "booking",
    patterns: ["State", "Reservation", "Idempotency key"],
    evidence: "one",
    sources: [
      {
        label: "Meesho interview process thread, SDE 3 (Blind)",
        url: "https://www.teamblind.com/post/meesho-interview-process-ktfe0jyu",
        kind: "candidate-report",
        year: 2024,
      },
    ],
    chapters: ["sysdes-transactions-isolation", "sysdes-walkthrough-payments"],
    answer: {
      ask: "<p>Questions to ask first: can one order block several products at once and must that be all or nothing, how long may stock stay blocked if the payment never answers, may the same order id call block twice because of a retry, what happens if a payment succeeds after the hold has run out, are quantities whole units, and is there one warehouse or several.</p><p>The report lists adding a product, adding inventory, blocking inventory and a payment outcome that either uses or frees the block; the hold timeout, refunds and multi-line orders are assumptions. Assumed scope: one warehouse, each product with an on-hand count and a blocked count, and available stock defined as on-hand minus blocked. Blocking several lines is atomic. A hold lasts a fixed time and unpaid holds are released by a sweep. Blocking the same order twice does not block twice. A payment that succeeds after the hold expired is refunded. Out of scope: several warehouses, prices, shipping, reordering and persistence.</p>",
      entities:
        "<ul><li><b>Product</b> has an id, a name, an on-hand count and a blocked count. Available stock is on-hand minus blocked.</li><li><b>Reservation</b> belongs to one order. It holds the lines (product and quantity), a status of BLOCKED, CONFIRMED, RELEASED or EXPIRED, and an expiry time.</li><li><b>Inventory</b> is the service with <code>addProduct</code>, <code>addStock</code>, <code>block</code>, <code>confirm</code>, <code>release</code> and <code>sweep</code>. It owns the products and the reservations.</li><li><b>OrderService</b> runs the payment flow. It blocks stock, charges, then confirms or releases, and issues a refund when confirmation fails.</li><li><b>PaymentGateway</b> is the outside collaborator with <code>charge</code> and <code>refund</code>. The fake in the code returns scripted outcomes and can advance the clock to model a slow payment.</li><li><b>Clock</b> is injected, so expiry is deterministic in tests.</li></ul>",
      design:
        "<p><b>Two counters.</b> Each product keeps on-hand stock (physically in the warehouse) and blocked stock (promised to orders that have not paid yet). Available is the difference. Blocking raises only the blocked counter, so stock cannot be sold twice and nothing is lost if the buyer walks away. Confirming lowers both counters because the goods leave. Releasing lowers only the blocked counter.</p><p><b>Atomic block.</b> <code>block</code> first sweeps expired holds, then rejects an empty order and any line whose quantity is not a positive whole number, checked per line so a negative line cannot cancel another. It merges duplicate lines by product in sorted id order, makes one pass that checks every line against available stock and only if all pass a second pass that adds to the blocked counters. A failing second line therefore leaves the first one untouched.</p><p><b>Reservation states.</b> A reservation starts BLOCKED, and that is the only state that can change. Confirm and release both go through one <code>settle</code> method, which first sweeps expired holds, then requires BLOCKED, applies the counter changes and sets the final status. A second confirm, or a release after a confirm, returns an error such as already CONFIRMED. That guard makes retries and races between a late payment callback and the sweep harmless. A full State pattern with a class per state would be heavier than four statuses and two transitions need, so a status field with a guard is the chosen trade-off.</p><p><b>Payment flow.</b> <code>OrderService.place</code> blocks first and returns REJECTED with the reason, without touching the gateway, if the block fails for example because stock is short. A repeat of an order id that is still BLOCKED returns IN_PROGRESS and one with a final status returns DUPLICATE, and neither charges again. It then charges. If the charge fails it releases the stock at once. If it succeeds it confirms. When confirmation fails because the hold expired during a slow payment, it refunds and reports REFUNDED. The order matters: never charge before stock is held, and never consume stock before the charge result is known. If the gateway call throws, the outcome is unknown, so the hold is left to expire instead of being released at once, and a reconciliation job asks the gateway what happened.</p><p><b>Idempotency.</b> Calling <code>block</code> again with the same order id while it is BLOCKED returns the same reservation and blocks nothing more, while the same id with different lines is refused. Expired holds are swept at the start of every block, so a stale BLOCKED status is never trusted. Once the reservation has a final status, the id cannot be reused.</p><p><b>Concurrency.</b> This version is single threaded, so the check and the update cannot interleave. In a database each product update is conditional, for example setting blocked to blocked plus the quantity only where on-hand minus blocked is at least the quantity, and the affected row count says whether it worked. Several products are updated in one transaction in product id order to avoid deadlocks, and a zero count rolls everything back. The sweep is a periodic job that moves BLOCKED rows past their expiry using the same guarded update, so it can race with a confirm safely: whichever changes the row from BLOCKED first wins.</p>",
      extend: [
        "How would you extend blocking to several warehouses and decide which one ships each order?",
        "How do you make the sweep safe when many workers run it at the same time?",
        "What changes if a shopper can extend a hold while sitting on the payment page?",
        "How would you show available stock on product pages without reading the hot row on every view?",
        "How would you handle a payment callback that arrives twice, or after the sweep has already released the stock?",
      ],
      slips:
        "<p>Reducing on-hand stock at block time and then trying to add it back on failure. Applying each line as it is checked, so a short second line leaves the first one blocked. Having no expiry, so abandoned checkouts hide stock forever. Confirming silently after the hold expired. Letting a second confirm consume stock twice. Calling the gateway before the stock is held. Releasing the hold the moment a gateway call times out, when the money may still have been taken. Reading available stock and writing it back in two separate steps.</p>",
    },
    checks: [
      {
        name: "blocking reduces available stock but not on-hand stock",
        expr: '(() => { const mk = (outcomes = []) => { const clock = new Clock(); const inv = new Inventory(clock, 300); inv.addProduct("p1", "Kurta"); inv.addProduct("p2", "Saree"); inv.addStock("p1", 10); inv.addStock("p2", 1); const gateway = new FakeGateway(clock, outcomes); return { clock, inv, gateway, orders: new OrderService(inv, gateway) }; }; const { inv } = mk(); inv.block("o1", [{ id: "p1", qty: 3 }]); return [inv.available("p1"), inv.product("p1").onHand]; })()',
        expected: [7, 10],
      },
      {
        name: "rejects a multi-line block as a whole when one line is short",
        expr: '(() => { const mk = (outcomes = []) => { const clock = new Clock(); const inv = new Inventory(clock, 300); inv.addProduct("p1", "Kurta"); inv.addProduct("p2", "Saree"); inv.addStock("p1", 10); inv.addStock("p2", 1); const gateway = new FakeGateway(clock, outcomes); return { clock, inv, gateway, orders: new OrderService(inv, gateway) }; }; const { inv } = mk(); const r = inv.block("o1", [{ id: "p1", qty: 3 }, { id: "p2", qty: 2 }]); return [r.ok, r.reason, inv.available("p1"), inv.available("p2")]; })()',
        expected: [false, "not enough stock for p2", 10, 1],
      },
      {
        name: "consumes the blocked stock when payment succeeds",
        expr: '(() => { const mk = (outcomes = []) => { const clock = new Clock(); const inv = new Inventory(clock, 300); inv.addProduct("p1", "Kurta"); inv.addProduct("p2", "Saree"); inv.addStock("p1", 10); inv.addStock("p2", 1); const gateway = new FakeGateway(clock, outcomes); return { clock, inv, gateway, orders: new OrderService(inv, gateway) }; }; const { inv, orders } = mk(); const r = orders.place("o1", [{ id: "p1", qty: 3 }]); return [r.status, inv.product("p1").onHand, inv.product("p1").blocked]; })()',
        expected: ["CONFIRMED", 7, 0],
      },
      {
        name: "releases the blocked stock when payment fails",
        expr: '(() => { const mk = (outcomes = []) => { const clock = new Clock(); const inv = new Inventory(clock, 300); inv.addProduct("p1", "Kurta"); inv.addProduct("p2", "Saree"); inv.addStock("p1", 10); inv.addStock("p2", 1); const gateway = new FakeGateway(clock, outcomes); return { clock, inv, gateway, orders: new OrderService(inv, gateway) }; }; const { inv, orders } = mk([{ ok: false, delay: 0 }]); const r = orders.place("o1", [{ id: "p1", qty: 3 }]); return [r.status, inv.available("p1"), inv.reservations.get("o1").status]; })()',
        expected: ["PAYMENT_FAILED", 10, "RELEASED"],
      },
      {
        name: "does not block twice for a repeated order id",
        expr: '(() => { const mk = (outcomes = []) => { const clock = new Clock(); const inv = new Inventory(clock, 300); inv.addProduct("p1", "Kurta"); inv.addProduct("p2", "Saree"); inv.addStock("p1", 10); inv.addStock("p2", 1); const gateway = new FakeGateway(clock, outcomes); return { clock, inv, gateway, orders: new OrderService(inv, gateway) }; }; const { inv } = mk(); inv.block("o1", [{ id: "p1", qty: 3 }]); inv.block("o1", [{ id: "p1", qty: 3 }]); return inv.available("p1"); })()',
        expected: 7,
      },
      {
        name: "releases an unpaid hold exactly when the hold time passes",
        expr: '(() => { const mk = (outcomes = []) => { const clock = new Clock(); const inv = new Inventory(clock, 300); inv.addProduct("p1", "Kurta"); inv.addProduct("p2", "Saree"); inv.addStock("p1", 10); inv.addStock("p2", 1); const gateway = new FakeGateway(clock, outcomes); return { clock, inv, gateway, orders: new OrderService(inv, gateway) }; }; const { inv, clock } = mk(); inv.block("o1", [{ id: "p2", qty: 1 }]); clock.advance(299); inv.sweep(); const before = inv.available("p2"); clock.advance(1); inv.sweep(); return [before, inv.available("p2"), inv.reservations.get("o1").status]; })()',
        expected: [0, 1, "EXPIRED"],
      },
      {
        name: "refunds a payment that succeeds after the hold expired",
        expr: '(() => { const mk = (outcomes = []) => { const clock = new Clock(); const inv = new Inventory(clock, 300); inv.addProduct("p1", "Kurta"); inv.addProduct("p2", "Saree"); inv.addStock("p1", 10); inv.addStock("p2", 1); const gateway = new FakeGateway(clock, outcomes); return { clock, inv, gateway, orders: new OrderService(inv, gateway) }; }; const { inv, orders, gateway } = mk([{ ok: true, delay: 400 }]); const r = orders.place("o1", [{ id: "p2", qty: 1 }]); return [r.status, r.reason, gateway.refunds, inv.product("p2").onHand, inv.available("p2")]; })()',
        expected: ["REFUNDED", "already EXPIRED", ["o1"], 1, 1],
      },
      {
        name: "lets a second order take the last unit after the first payment fails",
        expr: '(() => { const mk = (outcomes = []) => { const clock = new Clock(); const inv = new Inventory(clock, 300); inv.addProduct("p1", "Kurta"); inv.addProduct("p2", "Saree"); inv.addStock("p1", 10); inv.addStock("p2", 1); const gateway = new FakeGateway(clock, outcomes); return { clock, inv, gateway, orders: new OrderService(inv, gateway) }; }; const { orders } = mk([{ ok: false, delay: 0 }]); const first = orders.place("o1", [{ id: "p2", qty: 1 }]); const second = orders.place("o2", [{ id: "p2", qty: 1 }]); return [first.status, second.status]; })()',
        expected: ["PAYMENT_FAILED", "CONFIRMED"],
      },
      {
        name: "refuses to confirm or release a reservation twice",
        expr: '(() => { const mk = (outcomes = []) => { const clock = new Clock(); const inv = new Inventory(clock, 300); inv.addProduct("p1", "Kurta"); inv.addProduct("p2", "Saree"); inv.addStock("p1", 10); inv.addStock("p2", 1); const gateway = new FakeGateway(clock, outcomes); return { clock, inv, gateway, orders: new OrderService(inv, gateway) }; }; const { inv } = mk(); inv.block("o1", [{ id: "p1", qty: 2 }]); const a = inv.confirm("o1"); const b = inv.confirm("o1"); const c = inv.release("o1"); return [a.ok, b.reason, c.reason, inv.product("p1").onHand]; })()',
        expected: [true, "already CONFIRMED", "already CONFIRMED", 8],
      },
      {
        name: "refuses to reuse an order id after its reservation was released",
        expr: '(() => { const mk = (outcomes = []) => { const clock = new Clock(); const inv = new Inventory(clock, 300); inv.addProduct("p1", "Kurta"); inv.addProduct("p2", "Saree"); inv.addStock("p1", 10); inv.addStock("p2", 1); const gateway = new FakeGateway(clock, outcomes); return { clock, inv, gateway, orders: new OrderService(inv, gateway) }; }; const { inv } = mk(); inv.block("o1", [{ id: "p1", qty: 1 }]); inv.release("o1"); return inv.block("o1", [{ id: "p1", qty: 1 }]).reason; })()',
        expected: "order already RELEASED",
      },
      {
        name: "rejects a negative line instead of letting it cancel another line of the same product",
        expr: '(() => { const mk = (outcomes = []) => { const clock = new Clock(); const inv = new Inventory(clock, 300); inv.addProduct("p1", "Kurta"); inv.addProduct("p2", "Saree"); inv.addStock("p1", 10); inv.addStock("p2", 1); const gateway = new FakeGateway(clock, outcomes); return { clock, inv, gateway, orders: new OrderService(inv, gateway) }; }; const { inv } = mk(); const r = inv.block("o1", [{ id: "p1", qty: 5 }, { id: "p1", qty: -3 }]); return [r.reason, inv.available("p1"), inv.reservations.size]; })()',
        expected: ["bad quantity for p1", 10, 0],
      },
      {
        name: "rejects an empty order and an unknown product",
        expr: '(() => { const mk = (outcomes = []) => { const clock = new Clock(); const inv = new Inventory(clock, 300); inv.addProduct("p1", "Kurta"); inv.addProduct("p2", "Saree"); inv.addStock("p1", 10); inv.addStock("p2", 1); const gateway = new FakeGateway(clock, outcomes); return { clock, inv, gateway, orders: new OrderService(inv, gateway) }; }; const { inv } = mk(); return [inv.block("o1", []).reason, inv.block("o2", [{ id: "p9", qty: 1 }]).reason]; })()',
        expected: ["no lines", "unknown product p9"],
      },
      {
        name: "refuses the same order id with different lines while it is blocked",
        expr: '(() => { const mk = (outcomes = []) => { const clock = new Clock(); const inv = new Inventory(clock, 300); inv.addProduct("p1", "Kurta"); inv.addProduct("p2", "Saree"); inv.addStock("p1", 10); inv.addStock("p2", 1); const gateway = new FakeGateway(clock, outcomes); return { clock, inv, gateway, orders: new OrderService(inv, gateway) }; }; const { inv } = mk(); inv.block("o1", [{ id: "p1", qty: 2 }]); const r = inv.block("o1", [{ id: "p1", qty: 3 }]); return [r.reason, inv.available("p1")]; })()',
        expected: ["order o1 is blocked with different lines", 8],
      },
      {
        name: "frees an expired hold for a new order even before the sweep runs",
        expr: '(() => { const mk = (outcomes = []) => { const clock = new Clock(); const inv = new Inventory(clock, 300); inv.addProduct("p1", "Kurta"); inv.addProduct("p2", "Saree"); inv.addStock("p1", 10); inv.addStock("p2", 1); const gateway = new FakeGateway(clock, outcomes); return { clock, inv, gateway, orders: new OrderService(inv, gateway) }; }; const { inv, clock } = mk(); inv.block("o1", [{ id: "p2", qty: 1 }]); clock.advance(300); const r = inv.block("o2", [{ id: "p2", qty: 1 }]); return [r.ok, inv.reservations.get("o1").status, inv.available("p2")]; })()',
        expected: [true, "EXPIRED", 0],
      },
      {
        name: "does not revive an expired order id on retry",
        expr: '(() => { const mk = (outcomes = []) => { const clock = new Clock(); const inv = new Inventory(clock, 300); inv.addProduct("p1", "Kurta"); inv.addProduct("p2", "Saree"); inv.addStock("p1", 10); inv.addStock("p2", 1); const gateway = new FakeGateway(clock, outcomes); return { clock, inv, gateway, orders: new OrderService(inv, gateway) }; }; const { inv, clock } = mk(); inv.block("o1", [{ id: "p2", qty: 1 }]); clock.advance(300); const r = inv.block("o1", [{ id: "p2", qty: 1 }]); return [r.ok, r.reason, inv.available("p2")]; })()',
        expected: [false, "order already EXPIRED", 1],
      },
      {
        name: "does not let a second order block the last unit while the first is held",
        expr: '(() => { const mk = (outcomes = []) => { const clock = new Clock(); const inv = new Inventory(clock, 300); inv.addProduct("p1", "Kurta"); inv.addProduct("p2", "Saree"); inv.addStock("p1", 10); inv.addStock("p2", 1); const gateway = new FakeGateway(clock, outcomes); return { clock, inv, gateway, orders: new OrderService(inv, gateway) }; }; const { inv } = mk(); const a = inv.block("o1", [{ id: "p2", qty: 1 }]); const b = inv.block("o2", [{ id: "p2", qty: 1 }]); return [a.ok, b.reason, inv.product("p2").blocked, inv.product("p2").onHand]; })()',
        expected: [true, "not enough stock for p2", 1, 1],
      },
      {
        name: "answers a repeated place as in progress or duplicate without charging again",
        expr: '(() => { const mk = (outcomes = []) => { const clock = new Clock(); const inv = new Inventory(clock, 300); inv.addProduct("p1", "Kurta"); inv.addProduct("p2", "Saree"); inv.addStock("p1", 10); inv.addStock("p2", 1); const gateway = new FakeGateway(clock, outcomes); return { clock, inv, gateway, orders: new OrderService(inv, gateway) }; }; const { inv, orders, gateway } = mk([{ ok: true, delay: 0 }]); inv.block("o1", [{ id: "p1", qty: 1 }]); const pending = orders.place("o1", [{ id: "p1", qty: 1 }]); const left = gateway.outcomes.length; const done = orders.place("o2", [{ id: "p1", qty: 1 }]); const again = orders.place("o2", [{ id: "p1", qty: 1 }]); return [pending.status, left, done.status, again.status, inv.product("p1").onHand]; })()',
        expected: ["IN_PROGRESS", 1, "CONFIRMED", "DUPLICATE", 9],
      },
      {
        name: "keeps the hold when the gateway throws and frees it at expiry",
        expr: '(() => { const mk = (outcomes = []) => { const clock = new Clock(); const inv = new Inventory(clock, 300); inv.addProduct("p1", "Kurta"); inv.addProduct("p2", "Saree"); inv.addStock("p1", 10); inv.addStock("p2", 1); const gateway = new FakeGateway(clock, outcomes); return { clock, inv, gateway, orders: new OrderService(inv, gateway) }; }; const { inv, orders, gateway, clock } = mk(); gateway.charge = () => { throw new Error("timeout"); }; let msg; try { orders.place("o1", [{ id: "p1", qty: 3 }]); } catch (e) { msg = e.message; } const held = [inv.reservations.get("o1").status, inv.available("p1")]; clock.advance(300); inv.sweep(); return [msg, held, inv.reservations.get("o1").status, inv.available("p1")]; })()',
        expected: ["timeout", ["BLOCKED", 7], "EXPIRED", 10],
      },
    ],
    code: `class Clock {
  constructor() {
    this.t = 0;
  }
  now() {
    return this.t;
  }
  advance(by) {
    this.t += by;
  }
}

class Inventory {
  constructor(clock, holdSeconds) {
    this.clock = clock;
    this.holdSeconds = holdSeconds;
    this.products = new Map();
    this.reservations = new Map();
  }
  addProduct(id, name) {
    if (this.products.has(id)) throw new Error("product exists " + id);
    this.products.set(id, { id, name, onHand: 0, blocked: 0 });
  }
  addStock(id, qty) {
    if (!Number.isInteger(qty) || qty <= 0) throw new Error("quantity must be positive");
    this.product(id).onHand += qty;
  }
  product(id) {
    const product = this.products.get(id);
    if (!product) throw new Error("unknown product " + id);
    return product;
  }
  available(id) {
    const product = this.product(id);
    return product.onHand - product.blocked;
  }
  block(orderId, lines) {
    this.sweep();
    const wanted = new Map();
    for (const line of lines) {
      if (!Number.isInteger(line.qty) || line.qty <= 0) return { ok: false, reason: "bad quantity for " + line.id };
      wanted.set(line.id, (wanted.get(line.id) || 0) + line.qty);
    }
    if (wanted.size === 0) return { ok: false, reason: "no lines" };
    const sorted = [...wanted].sort((a, b) => (a[0] < b[0] ? -1 : 1));
    const existing = this.reservations.get(orderId);
    if (existing && existing.status !== "BLOCKED") {
      return { ok: false, duplicate: true, reason: "order already " + existing.status };
    }
    if (existing) {
      if (JSON.stringify(existing.lines) !== JSON.stringify(sorted)) {
        return { ok: false, reason: "order " + orderId + " is blocked with different lines" };
      }
      return { ok: true, repeat: true, reservation: existing };
    }
    for (const [id, qty] of sorted) {
      if (!this.products.has(id)) return { ok: false, reason: "unknown product " + id };
      if (this.available(id) < qty) return { ok: false, reason: "not enough stock for " + id };
    }
    for (const [id, qty] of sorted) this.product(id).blocked += qty;
    const reservation = {
      orderId,
      lines: sorted,
      status: "BLOCKED",
      expiresAt: this.clock.now() + this.holdSeconds,
    };
    this.reservations.set(orderId, reservation);
    return { ok: true, reservation };
  }
  settle(orderId, next) {
    this.sweep();
    const reservation = this.reservations.get(orderId);
    if (!reservation) return { ok: false, reason: "no reservation" };
    if (reservation.status !== "BLOCKED") return { ok: false, reason: "already " + reservation.status };
    for (const [id, qty] of reservation.lines) {
      const product = this.product(id);
      product.blocked -= qty;
      if (next === "CONFIRMED") product.onHand -= qty;
    }
    reservation.status = next;
    return { ok: true };
  }
  confirm(orderId) {
    return this.settle(orderId, "CONFIRMED");
  }
  release(orderId) {
    return this.settle(orderId, "RELEASED");
  }
  sweep() {
    for (const reservation of this.reservations.values()) {
      if (reservation.status === "BLOCKED" && reservation.expiresAt <= this.clock.now()) {
        reservation.lines.forEach(([id, qty]) => (this.product(id).blocked -= qty));
        reservation.status = "EXPIRED";
      }
    }
  }
}

class FakeGateway {
  constructor(clock, outcomes) {
    this.clock = clock;
    this.outcomes = outcomes;
    this.refunds = [];
  }
  charge() {
    const outcome = this.outcomes.shift() || { ok: true, delay: 0 };
    this.clock.advance(outcome.delay);
    return { ok: outcome.ok };
  }
  refund(orderId) {
    this.refunds.push(orderId);
  }
}

class OrderService {
  constructor(inventory, gateway) {
    this.inventory = inventory;
    this.gateway = gateway;
  }
  place(orderId, lines) {
    const held = this.inventory.block(orderId, lines);
    if (!held.ok) return { status: held.duplicate ? "DUPLICATE" : "REJECTED", reason: held.reason };
    if (held.repeat) return { status: "IN_PROGRESS" };
    if (!this.gateway.charge(orderId).ok) {
      this.inventory.release(orderId);
      return { status: "PAYMENT_FAILED" };
    }
    const done = this.inventory.confirm(orderId);
    if (!done.ok) {
      this.gateway.refund(orderId);
      return { status: "REFUNDED", reason: done.reason };
    }
    return { status: "CONFIRMED" };
  }
}`,
  },
  {
    id: "ola-logging-library",
    company: "ola",
    title: "Logging library with pluggable outputs",
    prompt:
      "Design and implement a logging library that application code calls to record messages. Messages can go to several outputs at once, such as a file, a network target or a database, and adding an output should be easy. The message format is configurable, the library should add little overhead for the caller, and the follow-up discussion covers how it handles concurrency.",
    level: "SDE-2",
    round: "lld",
    topic: "infra",
    patterns: ["Strategy", "Observer", "Producer consumer", "Bounded queue"],
    evidence: "one",
    sources: [
      {
        label: "GfG: Ola Cabs SDE-2 Set 4 (interview date not stated, page updated 2025)",
        url: "https://geeksforgeeks.org/ola-cabs-interview-experience-set-4-for-sde-2",
        kind: "candidate-report",
      },
    ],
    chapters: ["sysdes-message-queues-async", "sysdes-observability-scale"],
    answer: {
      ask: "<p>Questions to ask first: which severity levels are needed, is the threshold set per logger, per output or both, which formats and outputs are required, should a slow output ever block the caller, what happens to messages when the buffer is full, is the order of messages guaranteed, and does the library need structured fields and a flush on shutdown.</p><p>The report names a logging library with several appenders, a configurable message format and low overhead, with concurrency discussed in a later round; severity levels, the queue and the drop policy are assumptions here. Assumed scope: four levels (debug, info, warn, error) compared as numbers, a minimum level on each logger and a separate one on each output, a formatter chosen per output, two outputs (an in-memory one standing in for the console, and a file that rolls after a number of lines), structured key-value fields, child loggers with dotted names, and a bounded queue that drops new events when it is full and counts them. One drain worker keeps order. Out of scope: network outputs, configuration files, sampling and per-request context.</p>",
      entities:
        "<ul><li><b>Logger</b> has a name, a minimum level, a dispatcher and a clock. <code>log</code> compares the level first, builds the event only if it is enabled, and accepts either a message or a function that produces it. <code>child</code> makes a logger with a dotted name that shares the dispatcher.</li><li><b>Event</b> is a plain object with time, level, logger name, message and fields. The fields are copied when the event is created.</li><li><b>Dispatcher</b> owns a bounded queue and the list of appenders. <code>publish</code> adds an event or counts a drop, and <code>drain</code> hands queued events to the appenders in order. It counts drops and appender failures.</li><li><b>Appender</b> is the output interface with a level, a formatter and <code>append(line)</code>. <code>MemoryAppender</code> and <code>RollingAppender</code> implement it. Each appender is a subscriber to every event.</li><li><b>Formatter</b> is the format interface with <code>format(event)</code>. <code>TextFormatter</code> and <code>JsonFormatter</code> implement it.</li><li><b>Counter</b> is the injected clock that returns increasing numbers, so tests do not depend on real time.</li></ul>",
      design:
        "<p><b>Cheap hot path.</b> <code>Logger.log</code> compares the level before doing anything else. Below the threshold it returns false having built nothing, and a message supplied as a function is only called when the level passes, so expensive string building is skipped for disabled levels. That is what low overhead means at the call site. An unknown level throws a <code>RangeError</code> at the call, since that is a programming error. The event copies the caller's fields at that moment, because the queue formats them later and a caller that reuses its map would otherwise change lines already logged; the copy is shallow.</p><p><b>Strategy for format, pluggable outputs.</b> The formatter belongs to the appender, so the console output can be plain text while another output writes JSON, and a new format is one class. <code>JsonFormatter</code> renames a field that clashes with a reserved key, such as level or msg, to a name with a field_ prefix so the envelope cannot be overwritten. Appender is the second seam, and each carries its own threshold, so one output can take everything while another only takes errors. The dispatcher treats appenders as subscribers, which is the Observer idea without a framework.</p><p><b>Concurrency.</b> Callers must not wait on a slow disk or serialise on an output. <code>publish</code> only appends to a bounded queue and returns. A single drain worker, stepped explicitly here through <code>drain(limit)</code>, takes events in order and gives each to the appenders. One consumer means outputs never see interleaved lines and the order of accepted events is kept without a lock per appender. The real version uses a multi-producer single-consumer queue, such as a ring buffer or a queue whose lock is held only for the push, and a worker thread that wakes on a signal and drains in batches. Shutdown must drain what is left.</p><p><b>Back-pressure.</b> When the queue is full this version drops the new event and counts it, so the application is never blocked. Other policies are to drop the oldest, to block the caller, or to reserve room so errors are never dropped. The trade-off is lost lines versus stalled requests, and the drop counter makes the loss visible.</p><p><b>Failure isolation.</b> The dispatcher wraps each appender call in a try and catch. A failing appender, such as a full disk, adds to the failure count and the other appenders and later events carry on.</p><p><b>Rolling output.</b> <code>RollingAppender</code> starts a new file after a number of lines, so five lines with a limit of two make files of 2, 2 and 1 lines. A real rolling output rolls on size or time, renames the old file and deletes old ones beyond a retention count.</p>",
      extend: [
        "How would you give different loggers different levels and change them at runtime without a restart?",
        "How would you guarantee that error events are never dropped when the queue is full?",
        "How would you attach a request id to every line written while handling one request?",
        "How would you flush and stop cleanly when the process shuts down?",
        "How would you add an output that sends batches over the network and retries when the network fails?",
      ],
      slips:
        "<p>Formatting the message before checking the level. Writing synchronously under one global lock, which makes every caller wait for the slowest output. An unbounded queue that grows until memory runs out. Letting an exception from one output stop logging or crash the application. Using several writers so lines from different events interleave. Hard-coding the format inside the logger. Taking timestamps from the system clock so tests are flaky. Not flushing the queue at shutdown, so the last lines are lost. Keeping a reference to the caller's mutable fields until the worker formats them.</p>",
    },
    checks: [
      {
        name: "writes events at or above the logger level and skips lower ones",
        expr: '(() => { const text = new TextFormatter(); const json = new JsonFormatter(); const mk = (level, appenders, capacity = 100) => { const d = new Dispatcher(appenders, capacity); return { d, log: new Logger("app", level, d, new Counter()) }; }; const m = new MemoryAppender(0, text); const { d, log } = mk(LEVELS.INFO, [m]); log.debug("hidden"); log.info("hello", { user: "u1" }); d.drain(); return m.lines; })()',
        expected: ["1 INFO app: hello user=u1"],
      },
      {
        name: "skips the message function when the level is disabled",
        expr: '(() => { const text = new TextFormatter(); const json = new JsonFormatter(); const mk = (level, appenders, capacity = 100) => { const d = new Dispatcher(appenders, capacity); return { d, log: new Logger("app", level, d, new Counter()) }; }; let calls = 0; const m = new MemoryAppender(0, text); const { d, log } = mk(LEVELS.WARN, [m]); log.info(() => { calls += 1; return "costly"; }); log.error(() => { calls += 1; return "kept"; }); d.drain(); return [calls, m.lines.length]; })()',
        expected: [1, 1],
      },
      {
        name: "applies each output threshold and its own format",
        expr: '(() => { const text = new TextFormatter(); const json = new JsonFormatter(); const mk = (level, appenders, capacity = 100) => { const d = new Dispatcher(appenders, capacity); return { d, log: new Logger("app", level, d, new Counter()) }; }; const all = new MemoryAppender(LEVELS.DEBUG, text); const errs = new MemoryAppender(LEVELS.ERROR, json); const { d, log } = mk(LEVELS.DEBUG, [all, errs]); log.info("a"); log.error("b", { code: 7 }); d.drain(); return [all.lines.length, errs.lines]; })()',
        expected: [2, ['{"time":2,"level":"ERROR","logger":"app","code":7,"msg":"b"}']],
      },
      {
        name: "keeps events in the order they were logged",
        expr: '(() => { const text = new TextFormatter(); const json = new JsonFormatter(); const mk = (level, appenders, capacity = 100) => { const d = new Dispatcher(appenders, capacity); return { d, log: new Logger("app", level, d, new Counter()) }; }; const m = new MemoryAppender(0, text); const { d, log } = mk(LEVELS.DEBUG, [m]); ["x", "y", "z"].forEach((s) => log.info(s)); d.drain(); return m.lines.map((l) => l.slice(-1)); })()',
        expected: ["x", "y", "z"],
      },
      {
        name: "drops new events when the bounded queue is full and counts them",
        expr: '(() => { const text = new TextFormatter(); const json = new JsonFormatter(); const mk = (level, appenders, capacity = 100) => { const d = new Dispatcher(appenders, capacity); return { d, log: new Logger("app", level, d, new Counter()) }; }; const { d, log } = mk(LEVELS.DEBUG, [], 2); const results = [log.info("1"), log.info("2"), log.info("3")]; return [results, d.queue.length, d.dropped]; })()',
        expected: [[true, true, false], 2, 1],
      },
      {
        name: "keeps delivering to other outputs when one output throws",
        expr: '(() => { const text = new TextFormatter(); const json = new JsonFormatter(); const mk = (level, appenders, capacity = 100) => { const d = new Dispatcher(appenders, capacity); return { d, log: new Logger("app", level, d, new Counter()) }; }; const bad = { level: 0, formatter: text, append() { throw new Error("disk full"); } }; const m = new MemoryAppender(0, text); const { d, log } = mk(LEVELS.DEBUG, [bad, m]); log.info("still delivered"); d.drain(); return [m.lines.length, d.failures]; })()',
        expected: [1, 1],
      },
      {
        name: "rolls to a new file after the line limit",
        expr: '(() => { const text = new TextFormatter(); const json = new JsonFormatter(); const mk = (level, appenders, capacity = 100) => { const d = new Dispatcher(appenders, capacity); return { d, log: new Logger("app", level, d, new Counter()) }; }; const r = new RollingAppender(0, text, 2); const { d, log } = mk(LEVELS.DEBUG, [r]); for (let i = 0; i < 5; i++) log.info("m" + i); d.drain(); return r.files.map((f) => f.length); })()',
        expected: [2, 2, 1],
      },
      {
        name: "names child loggers with a dotted path",
        expr: '(() => { const text = new TextFormatter(); const json = new JsonFormatter(); const mk = (level, appenders, capacity = 100) => { const d = new Dispatcher(appenders, capacity); return { d, log: new Logger("app", level, d, new Counter()) }; }; const m = new MemoryAppender(0, text); const { d, log } = mk(LEVELS.DEBUG, [m]); log.child("db").warn("slow"); d.drain(); return m.lines; })()',
        expected: ["1 WARN app.db: slow"],
      },
      {
        name: "formats the same event as text or as JSON",
        expr: '(() => { const text = new TextFormatter(); const json = new JsonFormatter(); const mk = (level, appenders, capacity = 100) => { const d = new Dispatcher(appenders, capacity); return { d, log: new Logger("app", level, d, new Counter()) }; }; const event = { time: 1, level: 20, name: "app", message: "hi", fields: { k: 1 } }; return [text.format(event), json.format(event)]; })()',
        expected: ["1 INFO app: hi k=1", '{"time":1,"level":"INFO","logger":"app","k":1,"msg":"hi"}'],
      },
      {
        name: "drains a limited batch and leaves the rest queued",
        expr: '(() => { const text = new TextFormatter(); const json = new JsonFormatter(); const mk = (level, appenders, capacity = 100) => { const d = new Dispatcher(appenders, capacity); return { d, log: new Logger("app", level, d, new Counter()) }; }; const m = new MemoryAppender(0, text); const { d, log } = mk(LEVELS.DEBUG, [m]); for (let i = 0; i < 5; i++) log.info("m" + i); const first = d.drain(2); return [first, m.lines.length, d.queue.length, d.drain()]; })()',
        expected: [2, 2, 3, 3],
      },
      {
        name: "keeps the fields as they were when the event was logged",
        expr: '(() => { const text = new TextFormatter(); const json = new JsonFormatter(); const mk = (level, appenders, capacity = 100) => { const d = new Dispatcher(appenders, capacity); return { d, log: new Logger("app", level, d, new Counter()) }; }; const m = new MemoryAppender(0, json); const { d, log } = mk(LEVELS.DEBUG, [m]); const fields = { a: 1 }; log.info("x", fields); fields.a = 2; fields.b = 3; d.drain(); return m.lines; })()',
        expected: ['{"time":1,"level":"INFO","logger":"app","a":1,"msg":"x"}'],
      },
      {
        name: "renames fields that clash with the reserved JSON keys",
        expr: '(() => { const text = new TextFormatter(); const json = new JsonFormatter(); const mk = (level, appenders, capacity = 100) => { const d = new Dispatcher(appenders, capacity); return { d, log: new Logger("app", level, d, new Counter()) }; }; const m = new MemoryAppender(0, json); const { d, log } = mk(LEVELS.DEBUG, [m]); log.info("real", { level: "x", msg: "y", ok: 1 }); d.drain(); return JSON.parse(m.lines[0]); })()',
        expected: { time: 1, level: "INFO", logger: "app", field_level: "x", field_msg: "y", ok: 1, msg: "real" },
      },
      {
        name: "rejects an unknown level and a rolling limit of zero",
        expr: '(() => { const text = new TextFormatter(); const json = new JsonFormatter(); const mk = (level, appenders, capacity = 100) => { const d = new Dispatcher(appenders, capacity); return { d, log: new Logger("app", level, d, new Counter()) }; }; const { log } = mk(LEVELS.DEBUG, []); const out = []; for (const f of [() => log.log(15, "x"), () => log.log(undefined, "x"), () => new RollingAppender(0, text, 0)]) { try { f(); } catch (e) { out.push(e.constructor.name); } } return out; })()',
        expected: ["RangeError", "RangeError", "RangeError"],
      },
      {
        name: "treats a level equal to the threshold as enabled",
        expr: '(() => { const text = new TextFormatter(); const json = new JsonFormatter(); const mk = (level, appenders, capacity = 100) => { const d = new Dispatcher(appenders, capacity); return { d, log: new Logger("app", level, d, new Counter()) }; }; const errs = new MemoryAppender(LEVELS.ERROR, text); const { d, log } = mk(LEVELS.WARN, [errs]); const r = [log.info("a"), log.warn("b"), log.error("c")]; d.drain(); return [r, errs.lines.length]; })()',
        expected: [[false, true, true], 1],
      },
      {
        name: "accepts events again once a drain has freed the queue",
        expr: '(() => { const text = new TextFormatter(); const json = new JsonFormatter(); const mk = (level, appenders, capacity = 100) => { const d = new Dispatcher(appenders, capacity); return { d, log: new Logger("app", level, d, new Counter()) }; }; const m = new MemoryAppender(0, text); const { d, log } = mk(LEVELS.DEBUG, [m], 1); const r = [log.info("1"), log.info("2")]; d.drain(); r.push(log.info("3")); d.drain(); return [r, d.dropped, m.lines.map((l) => l.slice(-1))]; })()',
        expected: [[true, false, true], 1, ["1", "3"]],
      },
      {
        name: "counts one failure per failed append and keeps later events flowing",
        expr: '(() => { const text = new TextFormatter(); const json = new JsonFormatter(); const mk = (level, appenders, capacity = 100) => { const d = new Dispatcher(appenders, capacity); return { d, log: new Logger("app", level, d, new Counter()) }; }; const bad = { level: 0, formatter: text, append() { throw new Error("full"); } }; const m = new MemoryAppender(0, text); const { d, log } = mk(LEVELS.DEBUG, [bad, m]); log.info("1"); log.info("2"); log.info("3"); d.drain(); return [d.failures, m.lines.length]; })()',
        expected: [3, 3],
      },
      {
        name: "isolates a formatter that throws from the other outputs",
        expr: '(() => { const text = new TextFormatter(); const json = new JsonFormatter(); const mk = (level, appenders, capacity = 100) => { const d = new Dispatcher(appenders, capacity); return { d, log: new Logger("app", level, d, new Counter()) }; }; const broken = new MemoryAppender(0, { format() { throw new Error("bad format"); } }); const m = new MemoryAppender(0, text); const { d, log } = mk(LEVELS.DEBUG, [broken, m]); log.info("kept"); d.drain(); return [broken.lines.length, m.lines.length, d.failures]; })()',
        expected: [0, 1, 1],
      },
    ],
    code: `const LEVELS = { DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40 };
const NAMES = { 10: "DEBUG", 20: "INFO", 30: "WARN", 40: "ERROR" };

class Counter {
  constructor() {
    this.n = 0;
  }
  next() {
    this.n += 1;
    return this.n;
  }
}

class TextFormatter {
  format(event) {
    const extra = Object.entries(event.fields).map(([k, v]) => " " + k + "=" + v);
    return event.time + " " + NAMES[event.level] + " " + event.name + ": " + event.message + extra.join("");
  }
}

class JsonFormatter {
  format(event) {
    const out = { time: event.time, level: NAMES[event.level], logger: event.name };
    for (const [key, value] of Object.entries(event.fields)) out[key in out || key === "msg" ? "field_" + key : key] = value;
    out.msg = event.message;
    return JSON.stringify(out);
  }
}

class MemoryAppender {
  constructor(level, formatter) {
    this.level = level;
    this.formatter = formatter;
    this.lines = [];
  }
  append(line) {
    this.lines.push(line);
  }
}

class RollingAppender {
  constructor(level, formatter, maxLines) {
    this.level = level;
    if (!Number.isInteger(maxLines) || maxLines <= 0) throw new RangeError("maxLines must be positive");
    this.formatter = formatter;
    this.maxLines = maxLines;
    this.files = [[]];
  }
  append(line) {
    if (this.files[this.files.length - 1].length >= this.maxLines) this.files.push([]);
    this.files[this.files.length - 1].push(line);
  }
}

class Dispatcher {
  constructor(appenders, capacity) {
    this.appenders = appenders;
    this.capacity = capacity;
    this.queue = [];
    this.dropped = 0;
    this.failures = 0;
  }
  publish(event) {
    if (this.queue.length >= this.capacity) {
      this.dropped += 1;
      return false;
    }
    this.queue.push(event);
    return true;
  }
  drain(limit = Infinity) {
    let handled = 0;
    while (this.queue.length > 0 && handled < limit) {
      const event = this.queue.shift();
      handled += 1;
      for (const appender of this.appenders) {
        if (event.level < appender.level) continue;
        try {
          appender.append(appender.formatter.format(event), event);
        } catch (error) {
          this.failures += 1;
        }
      }
    }
    return handled;
  }
}

class Logger {
  constructor(name, level, dispatcher, clock) {
    this.name = name;
    this.level = level;
    this.dispatcher = dispatcher;
    this.clock = clock;
  }
  log(level, message, fields = {}) {
    if (!NAMES[level]) throw new RangeError("unknown level " + level);
    if (level < this.level) return false;
    const text = typeof message === "function" ? message() : message;
    const event = { time: this.clock.next(), level, name: this.name, message: text, fields: { ...fields } };
    return this.dispatcher.publish(event);
  }
  debug(message, fields) {
    return this.log(LEVELS.DEBUG, message, fields);
  }
  info(message, fields) {
    return this.log(LEVELS.INFO, message, fields);
  }
  warn(message, fields) {
    return this.log(LEVELS.WARN, message, fields);
  }
  error(message, fields) {
    return this.log(LEVELS.ERROR, message, fields);
  }
  child(suffix) {
    return new Logger(this.name + "." + suffix, this.level, this.dispatcher, this.clock);
  }
}`,
  },
  {
    id: "cred-payment-module",
    company: "cred",
    title: "Payment-processing module with errors and tests",
    prompt:
      "Implement the key features of a payment-processing package in object-oriented code. The work is judged on the design patterns it uses, its error handling and its test coverage, and the tests must run without calling a real payment provider.",
    level: "SDE-2",
    round: "machine-coding",
    topic: "payments",
    patterns: ["Strategy", "Chain of responsibility", "Decorator", "Factory"],
    evidence: "one",
    sources: [
      {
        label: "CRED SDE-2 Bangalore 2024 offer write-up (PapersAdda)",
        url: "https://papersadda.com/article/cred-sde2-bangalore-2024-payment-processor-offer/",
        kind: "candidate-report",
        year: 2024,
      },
    ],
    chapters: ["sysdes-walkthrough-payments", "sysdes-fault-tolerance"],
    answer: {
      ask: "<p>Questions to ask first: which payment methods are needed now and which later, what validation each method needs, which failures are worth retrying and how many times, whether a retry could charge the customer twice, whether refunds are full or partial, what the tests must cover, and how long the round lasts so the scope can be sized.</p><p>The write-up names the round, a payment-processing package judged on patterns, error handling and test coverage, and says its feature list is not fully disclosed; card and UPI, the error kinds and the retry rule are assumptions here. Assumed scope: card and UPI with room for more, amounts in integer paise and INR only, validation before any gateway call (a positive amount, a supported currency, a card number that passes the check digit, a well-formed UPI handle), three error kinds (validation and declined are never retried, a timeout is retried with doubling backoff up to three attempts), an idempotency key on every request, full and partial refunds, and an injected gateway so tests use a scripted fake. Out of scope: real gateway protocols, 3-D Secure, settlement, fraud rules and persistence.</p>",
      entities:
        "<ul><li><b>PaymentProcessor</b> is the entry point with <code>process(request)</code> and <code>refund</code>. It owns the payments, the idempotency map, a cache of method objects and the validator chain.</li><li><b>Request</b> is a plain object with key, amount, currency, method and instrument (the card number or UPI handle).</li><li><b>Payment</b> records the id, amount, status (CREATED, CAPTURED, FAILED, PARTIALLY_REFUNDED or REFUNDED), the refunded total, the gateway reference, the error code and the number of attempts.</li><li><b>PaymentMethod</b> is the strategy interface with <code>validate(instrument)</code> and <code>charge(request)</code>. <code>CardMethod</code> and <code>UpiMethod</code> implement it, and <code>RetryingMethod</code> implements it too while wrapping another method.</li><li><b>MethodFactory</b> maps a type name to a builder, so methods are created and registered in one place.</li><li><b>Validator</b> is the chain link with <code>check</code>, <code>setNext</code> and <code>handle</code>. <code>AmountValidator</code>, <code>CurrencyValidator</code> and <code>InstrumentValidator</code> are the links.</li><li><b>PaymentError</b> is the base error with a code and a retryable flag. <code>ValidationError</code>, <code>DeclinedError</code> and <code>TimeoutError</code> extend it.</li><li><b>Gateway</b> is the outside collaborator. <code>ScriptedGateway</code> returns outcomes from a list for tests and records the idempotency key of each call.</li></ul>",
      design:
        "<p><b>Main flow.</b> <code>process</code> rejects a request with no key, then returns the existing payment if the key was seen with the same amount, currency and method, and throws a <code>ValidationError</code> if it was seen with a different request. Otherwise it creates a CREATED payment, runs the validator chain, asks the factory for the method (cached per type) and calls <code>charge</code>. Success sets CAPTURED with the reference and attempt count. A <code>PaymentError</code> sets FAILED with its code. Anything that is not a PaymentError is a bug and is rethrown rather than hidden. The payment then stays CREATED with its key bound, so a retry sees the unresolved payment instead of charging again, and a reconciliation job has to settle it.</p><p><b>Chain of responsibility for validation.</b> Each validator checks one rule, throws a <code>ValidationError</code> and otherwise passes the request on. A new rule is one class and one <code>setNext</code>. Cheap checks come first so a bad amount never reaches instrument checks or the gateway. The last link delegates to the method's own <code>validate</code>, which is where the card check digit and the UPI format live.</p><p><b>Strategy and factory.</b> Card and UPI differ in validation and in the call they make, so the processor depends only on the PaymentMethod interface. The factory maps names to builders, so adding a wallet method is one <code>register</code> call and the processor does not change (the last check does this after the processor exists).</p><p><b>Decorator for retry.</b> <code>RetryingMethod</code> implements the same interface and wraps another method. On a retryable error it asks an injected sleeper to wait 100 then 200 and tries again, up to the maximum number of attempts. A non-retryable error such as a decline escapes at once. Retry is a cross-cutting concern, so it sits outside the card and UPI classes. Every attempt passes the same idempotency key to the gateway, and the scripted gateway records it, because retrying a charge that timed out could otherwise charge twice.</p><p><b>Error design.</b> One base error carries a machine-readable code and a retryable flag, and each cause is a subclass. Callers branch on the code or the flag, never on message text. <code>process</code> turns a <code>PaymentError</code> into the payment's status, code and reason, so callers and tests read data instead of catching exceptions. <code>refund</code> has no payment status to change when it rejects, so it throws a <code>ValidationError</code>.</p><p><b>Idempotency and refunds.</b> Payments are indexed by key, so a repeated key returns the same payment and the gateway is not called again, including for a failed one; a new attempt needs a new key. Refunds are allowed only on CAPTURED or PARTIALLY_REFUNDED payments, and the total refunded cannot exceed the captured amount. A refund here only updates the record; calling the provider's refund endpoint with its own idempotency key is the next step, since a retried refund request would otherwise be applied twice up to the captured amount.</p><p><b>Tests.</b> Everything with time or input and output is injected. The scripted gateway plays back outcomes and the sleeper records delays instead of waiting, so a test asserts calls, delays and statuses in microseconds.</p>",
      extend: [
        "How would you add a wallet method that debits an internal balance instead of calling the gateway?",
        "How would you split a payment into an authorise step and a later capture, and what new states does the payment need?",
        "How would you make the idempotency check safe when two requests with the same key arrive at the same moment?",
        "How would you add a circuit breaker so a failing gateway is not called for a while?",
        "How would you route to a backup gateway when the first one keeps timing out?",
      ],
      slips:
        "<p>Writing an if-else on the method type inside the processor. Catching every exception and returning one generic failure, so callers cannot tell a decline from a timeout. Retrying declines, or retrying without an idempotency key. Validating after the gateway call. Using floating point amounts. Sleeping for real in tests. Changing the payment status without guards, so a failed payment can be refunded. Letting refunds add up to more than was captured.</p>",
    },
    checks: [
      {
        name: "captures a valid card payment",
        expr: '(() => { const mk = (script = [], attempts = 3) => { const gateway = new ScriptedGateway(script); const sleeper = { delays: [], sleep(ms) { this.delays.push(ms); } }; const factory = new MethodFactory(); factory.register("card", () => new RetryingMethod(new CardMethod(gateway), attempts, 100, sleeper)); factory.register("upi", () => new UpiMethod(gateway)); return { gateway, sleeper, factory, processor: new PaymentProcessor(factory) }; }; const req = (over = {}) => ({ key: "k1", amount: 25000, currency: "INR", method: "card", instrument: "4242424242424242", ...over }); const { processor } = mk(); const p = processor.process(req()); return [p.status, p.ref, p.attempts]; })()',
        expected: ["CAPTURED", "txn1", 1],
      },
      {
        name: "fails validation for a bad check digit, a zero amount or a foreign currency without calling the gateway",
        expr: '(() => { const mk = (script = [], attempts = 3) => { const gateway = new ScriptedGateway(script); const sleeper = { delays: [], sleep(ms) { this.delays.push(ms); } }; const factory = new MethodFactory(); factory.register("card", () => new RetryingMethod(new CardMethod(gateway), attempts, 100, sleeper)); factory.register("upi", () => new UpiMethod(gateway)); return { gateway, sleeper, factory, processor: new PaymentProcessor(factory) }; }; const req = (over = {}) => ({ key: "k1", amount: 25000, currency: "INR", method: "card", instrument: "4242424242424242", ...over }); const { processor, gateway } = mk(); const codes = [req({ instrument: "4242424242424241" }), req({ key: "z", amount: 0 }), req({ key: "y", currency: "USD" })].map((r) => processor.process(r).code); return [codes, gateway.calls]; })()',
        expected: [["VALIDATION", "VALIDATION", "VALIDATION"], 0],
      },
      {
        name: "does not retry a declined payment",
        expr: '(() => { const mk = (script = [], attempts = 3) => { const gateway = new ScriptedGateway(script); const sleeper = { delays: [], sleep(ms) { this.delays.push(ms); } }; const factory = new MethodFactory(); factory.register("card", () => new RetryingMethod(new CardMethod(gateway), attempts, 100, sleeper)); factory.register("upi", () => new UpiMethod(gateway)); return { gateway, sleeper, factory, processor: new PaymentProcessor(factory) }; }; const req = (over = {}) => ({ key: "k1", amount: 25000, currency: "INR", method: "card", instrument: "4242424242424242", ...over }); const { processor, gateway } = mk(["decline"]); const p = processor.process(req()); return [p.status, p.code, gateway.calls]; })()',
        expected: ["FAILED", "DECLINED", 1],
      },
      {
        name: "retries timeouts with doubling backoff and then captures",
        expr: '(() => { const mk = (script = [], attempts = 3) => { const gateway = new ScriptedGateway(script); const sleeper = { delays: [], sleep(ms) { this.delays.push(ms); } }; const factory = new MethodFactory(); factory.register("card", () => new RetryingMethod(new CardMethod(gateway), attempts, 100, sleeper)); factory.register("upi", () => new UpiMethod(gateway)); return { gateway, sleeper, factory, processor: new PaymentProcessor(factory) }; }; const req = (over = {}) => ({ key: "k1", amount: 25000, currency: "INR", method: "card", instrument: "4242424242424242", ...over }); const { processor, sleeper } = mk(["timeout", "timeout"]); const p = processor.process(req()); return [p.status, p.attempts, sleeper.delays]; })()',
        expected: ["CAPTURED", 3, [100, 200]],
      },
      {
        name: "gives up after the last attempt and reports the timeout",
        expr: '(() => { const mk = (script = [], attempts = 3) => { const gateway = new ScriptedGateway(script); const sleeper = { delays: [], sleep(ms) { this.delays.push(ms); } }; const factory = new MethodFactory(); factory.register("card", () => new RetryingMethod(new CardMethod(gateway), attempts, 100, sleeper)); factory.register("upi", () => new UpiMethod(gateway)); return { gateway, sleeper, factory, processor: new PaymentProcessor(factory) }; }; const req = (over = {}) => ({ key: "k1", amount: 25000, currency: "INR", method: "card", instrument: "4242424242424242", ...over }); const { processor, gateway } = mk(["timeout", "timeout", "timeout"]); const p = processor.process(req()); return [p.status, p.code, p.attempts, gateway.calls]; })()',
        expected: ["FAILED", "GATEWAY_TIMEOUT", 3, 3],
      },
      {
        name: "returns the same payment for a repeated key without a second charge",
        expr: '(() => { const mk = (script = [], attempts = 3) => { const gateway = new ScriptedGateway(script); const sleeper = { delays: [], sleep(ms) { this.delays.push(ms); } }; const factory = new MethodFactory(); factory.register("card", () => new RetryingMethod(new CardMethod(gateway), attempts, 100, sleeper)); factory.register("upi", () => new UpiMethod(gateway)); return { gateway, sleeper, factory, processor: new PaymentProcessor(factory) }; }; const req = (over = {}) => ({ key: "k1", amount: 25000, currency: "INR", method: "card", instrument: "4242424242424242", ...over }); const { processor, gateway } = mk(); const a = processor.process(req()); const b = processor.process(req()); return [a === b, gateway.calls]; })()',
        expected: [true, 1],
      },
      {
        name: "moves from partly refunded to refunded",
        expr: '(() => { const mk = (script = [], attempts = 3) => { const gateway = new ScriptedGateway(script); const sleeper = { delays: [], sleep(ms) { this.delays.push(ms); } }; const factory = new MethodFactory(); factory.register("card", () => new RetryingMethod(new CardMethod(gateway), attempts, 100, sleeper)); factory.register("upi", () => new UpiMethod(gateway)); return { gateway, sleeper, factory, processor: new PaymentProcessor(factory) }; }; const req = (over = {}) => ({ key: "k1", amount: 25000, currency: "INR", method: "card", instrument: "4242424242424242", ...over }); const { processor } = mk(); const p = processor.process(req()); const first = processor.refund(p.id, 10000).status; const second = processor.refund(p.id, 15000).status; return [first, second]; })()',
        expected: ["PARTIALLY_REFUNDED", "REFUNDED"],
      },
      {
        name: "refuses a refund above the captured amount",
        expr: '(() => { const mk = (script = [], attempts = 3) => { const gateway = new ScriptedGateway(script); const sleeper = { delays: [], sleep(ms) { this.delays.push(ms); } }; const factory = new MethodFactory(); factory.register("card", () => new RetryingMethod(new CardMethod(gateway), attempts, 100, sleeper)); factory.register("upi", () => new UpiMethod(gateway)); return { gateway, sleeper, factory, processor: new PaymentProcessor(factory) }; }; const req = (over = {}) => ({ key: "k1", amount: 25000, currency: "INR", method: "card", instrument: "4242424242424242", ...over }); const { processor } = mk(); const p = processor.process(req()); processor.refund(p.id, 20000); try { processor.refund(p.id, 6000); } catch (e) { return [e.code, p.refunded]; } })()',
        expected: ["VALIDATION", 20000],
      },
      {
        name: "validates and charges UPI with its own rules",
        expr: '(() => { const mk = (script = [], attempts = 3) => { const gateway = new ScriptedGateway(script); const sleeper = { delays: [], sleep(ms) { this.delays.push(ms); } }; const factory = new MethodFactory(); factory.register("card", () => new RetryingMethod(new CardMethod(gateway), attempts, 100, sleeper)); factory.register("upi", () => new UpiMethod(gateway)); return { gateway, sleeper, factory, processor: new PaymentProcessor(factory) }; }; const req = (over = {}) => ({ key: "k1", amount: 25000, currency: "INR", method: "card", instrument: "4242424242424242", ...over }); const { processor } = mk(); const ok = processor.process(req({ key: "u", method: "upi", instrument: "user@upi" })); const bad = processor.process(req({ key: "v", method: "upi", instrument: "not a handle" })); return [ok.status, bad.code]; })()',
        expected: ["CAPTURED", "VALIDATION"],
      },
      {
        name: "accepts a method registered after the processor exists",
        expr: '(() => { const mk = (script = [], attempts = 3) => { const gateway = new ScriptedGateway(script); const sleeper = { delays: [], sleep(ms) { this.delays.push(ms); } }; const factory = new MethodFactory(); factory.register("card", () => new RetryingMethod(new CardMethod(gateway), attempts, 100, sleeper)); factory.register("upi", () => new UpiMethod(gateway)); return { gateway, sleeper, factory, processor: new PaymentProcessor(factory) }; }; const req = (over = {}) => ({ key: "k1", amount: 25000, currency: "INR", method: "card", instrument: "4242424242424242", ...over }); const { processor, factory, gateway } = mk(); const before = processor.process(req({ key: "n", method: "wallet", instrument: "w-1" })).code; factory.register("wallet", () => ({ validate() {}, charge: (r) => gateway.charge(r.amount) })); const after = processor.process(req({ key: "m", method: "wallet", instrument: "w-1" })).status; return [before, after]; })()',
        expected: ["VALIDATION", "CAPTURED"],
      },
      {
        name: "rejects a repeated key used for a different request without charging",
        expr: '(() => { const mk = (script = [], attempts = 3) => { const gateway = new ScriptedGateway(script); const sleeper = { delays: [], sleep(ms) { this.delays.push(ms); } }; const factory = new MethodFactory(); factory.register("card", () => new RetryingMethod(new CardMethod(gateway), attempts, 100, sleeper)); factory.register("upi", () => new UpiMethod(gateway)); return { gateway, sleeper, factory, processor: new PaymentProcessor(factory) }; }; const req = (over = {}) => ({ key: "k1", amount: 25000, currency: "INR", method: "card", instrument: "4242424242424242", ...over }); const { processor, gateway } = mk(); processor.process(req()); let msg; try { processor.process(req({ amount: 99900 })); } catch (e) { msg = e.message; } return [msg, gateway.calls, processor.payments.size]; })()',
        expected: ["key reused for a different request", 1, 1],
      },
      {
        name: "rejects a request that carries no idempotency key",
        expr: '(() => { const mk = (script = [], attempts = 3) => { const gateway = new ScriptedGateway(script); const sleeper = { delays: [], sleep(ms) { this.delays.push(ms); } }; const factory = new MethodFactory(); factory.register("card", () => new RetryingMethod(new CardMethod(gateway), attempts, 100, sleeper)); factory.register("upi", () => new UpiMethod(gateway)); return { gateway, sleeper, factory, processor: new PaymentProcessor(factory) }; }; const req = (over = {}) => ({ key: "k1", amount: 25000, currency: "INR", method: "card", instrument: "4242424242424242", ...over }); const { processor, gateway } = mk(); try { processor.process(req({ key: "" })); } catch (e) { return [e.code, gateway.calls, processor.payments.size]; } })()',
        expected: ["VALIDATION", 0, 0],
      },
      {
        name: "sends the same idempotency key to the gateway on every retry",
        expr: '(() => { const mk = (script = [], attempts = 3) => { const gateway = new ScriptedGateway(script); const sleeper = { delays: [], sleep(ms) { this.delays.push(ms); } }; const factory = new MethodFactory(); factory.register("card", () => new RetryingMethod(new CardMethod(gateway), attempts, 100, sleeper)); factory.register("upi", () => new UpiMethod(gateway)); return { gateway, sleeper, factory, processor: new PaymentProcessor(factory) }; }; const req = (over = {}) => ({ key: "k1", amount: 25000, currency: "INR", method: "card", instrument: "4242424242424242", ...over }); const { processor, gateway } = mk(["timeout", "timeout"]); processor.process(req()); return gateway.keys; })()',
        expected: ["k1", "k1", "k1"],
      },
      {
        name: "reports the first failing rule, amount before currency before instrument",
        expr: '(() => { const mk = (script = [], attempts = 3) => { const gateway = new ScriptedGateway(script); const sleeper = { delays: [], sleep(ms) { this.delays.push(ms); } }; const factory = new MethodFactory(); factory.register("card", () => new RetryingMethod(new CardMethod(gateway), attempts, 100, sleeper)); factory.register("upi", () => new UpiMethod(gateway)); return { gateway, sleeper, factory, processor: new PaymentProcessor(factory) }; }; const req = (over = {}) => ({ key: "k1", amount: 25000, currency: "INR", method: "card", instrument: "4242424242424242", ...over }); const { processor } = mk(); const reasons = [req({ key: "a", amount: 0, currency: "USD", instrument: "bad" }), req({ key: "b", currency: "USD", instrument: "bad" }), req({ key: "c", instrument: "bad" })].map((r) => processor.process(r).reason); return reasons; })()',
        expected: ["amount must be positive", "unsupported currency USD", "card number failed the check digit"],
      },
      {
        name: "rethrows an unexpected error and leaves the payment unresolved with no second charge",
        expr: '(() => { const mk = (script = [], attempts = 3) => { const gateway = new ScriptedGateway(script); const sleeper = { delays: [], sleep(ms) { this.delays.push(ms); } }; const factory = new MethodFactory(); factory.register("card", () => new RetryingMethod(new CardMethod(gateway), attempts, 100, sleeper)); factory.register("upi", () => new UpiMethod(gateway)); return { gateway, sleeper, factory, processor: new PaymentProcessor(factory) }; }; const req = (over = {}) => ({ key: "k1", amount: 25000, currency: "INR", method: "card", instrument: "4242424242424242", ...over }); const { processor, gateway } = mk(); gateway.charge = () => { throw new TypeError("bug"); }; let name; try { processor.process(req()); } catch (e) { name = e.constructor.name; } const again = processor.process(req()); return [name, again.status, processor.payments.size]; })()',
        expected: ["TypeError", "CREATED", 1],
      },
      {
        name: "refuses to refund a failed payment or an unknown payment",
        expr: '(() => { const mk = (script = [], attempts = 3) => { const gateway = new ScriptedGateway(script); const sleeper = { delays: [], sleep(ms) { this.delays.push(ms); } }; const factory = new MethodFactory(); factory.register("card", () => new RetryingMethod(new CardMethod(gateway), attempts, 100, sleeper)); factory.register("upi", () => new UpiMethod(gateway)); return { gateway, sleeper, factory, processor: new PaymentProcessor(factory) }; }; const req = (over = {}) => ({ key: "k1", amount: 25000, currency: "INR", method: "card", instrument: "4242424242424242", ...over }); const { processor } = mk(["decline"]); const p = processor.process(req()); const out = []; for (const id of [p.id, "nope"]) { try { processor.refund(id, 100); } catch (e) { out.push(e.message); } } return [p.status, out]; })()',
        expected: ["FAILED", ["payment cannot be refunded", "payment cannot be refunded"]],
      },
      {
        name: "accepts UPI handles with underscores and hyphens and rejects a card number that is too long",
        expr: '(() => { const mk = (script = [], attempts = 3) => { const gateway = new ScriptedGateway(script); const sleeper = { delays: [], sleep(ms) { this.delays.push(ms); } }; const factory = new MethodFactory(); factory.register("card", () => new RetryingMethod(new CardMethod(gateway), attempts, 100, sleeper)); factory.register("upi", () => new UpiMethod(gateway)); return { gateway, sleeper, factory, processor: new PaymentProcessor(factory) }; }; const req = (over = {}) => ({ key: "k1", amount: 25000, currency: "INR", method: "card", instrument: "4242424242424242", ...over }); const { processor } = mk(); const upi = processor.process(req({ key: "u", method: "upi", instrument: "john_doe-1@okhdfcbank" })).status; const long = processor.process(req({ key: "l", instrument: "42424242424242424242" })).code; return [upi, long]; })()',
        expected: ["CAPTURED", "VALIDATION"],
      },
    ],
    code: `class PaymentError extends Error {
  constructor(code, message, retryable) {
    super(message);
    this.code = code;
    this.retryable = retryable;
  }
}
class ValidationError extends PaymentError {
  constructor(message) {
    super("VALIDATION", message, false);
  }
}
class DeclinedError extends PaymentError {
  constructor() {
    super("DECLINED", "payment declined", false);
  }
}
class TimeoutError extends PaymentError {
  constructor() {
    super("GATEWAY_TIMEOUT", "gateway timed out", true);
  }
}

class Validator {
  setNext(next) {
    this.next = next;
    return next;
  }
  handle(request) {
    this.check(request);
    if (this.next) this.next.handle(request);
  }
}
class AmountValidator extends Validator {
  check(request) {
    if (!Number.isInteger(request.amount) || request.amount <= 0) throw new ValidationError("amount must be positive");
  }
}
class CurrencyValidator extends Validator {
  check(request) {
    if (request.currency !== "INR") throw new ValidationError("unsupported currency " + request.currency);
  }
}
class InstrumentValidator extends Validator {
  constructor(lookup) {
    super();
    this.lookup = lookup;
  }
  check(request) {
    this.lookup(request.method).validate(request.instrument);
  }
}

function luhnValid(number) {
  let sum = 0;
  [...number].reverse().forEach((char, i) => {
    let digit = Number(char);
    if (i % 2 === 1) digit = digit * 2 > 9 ? digit * 2 - 9 : digit * 2;
    sum += digit;
  });
  return number.length >= 12 && number.length <= 19 && sum % 10 === 0;
}

class CardMethod {
  constructor(gateway) {
    this.gateway = gateway;
  }
  validate(card) {
    if (!/^[0-9]+$/.test(card) || !luhnValid(card)) throw new ValidationError("card number failed the check digit");
  }
  charge(request) {
    return this.gateway.charge(request.amount, request.key);
  }
}
class UpiMethod {
  constructor(gateway) {
    this.gateway = gateway;
  }
  validate(handle) {
    if (!/^[a-z0-9._-]+@[a-z]+$/i.test(handle)) throw new ValidationError("malformed UPI handle");
  }
  charge(request) {
    return this.gateway.charge(request.amount, request.key);
  }
}

class RetryingMethod {
  constructor(inner, maxAttempts, backoff, sleeper) {
    Object.assign(this, { inner, maxAttempts, backoff, sleeper });
  }
  validate(instrument) {
    this.inner.validate(instrument);
  }
  charge(request) {
    for (let attempt = 1; ; attempt++) {
      try {
        return { ...this.inner.charge(request), attempts: attempt };
      } catch (error) {
        if (!error.retryable || attempt >= this.maxAttempts) {
          error.attempts = attempt;
          throw error;
        }
        this.sleeper.sleep(this.backoff * 2 ** (attempt - 1));
      }
    }
  }
}

class ScriptedGateway {
  constructor(script) {
    this.script = script;
    this.calls = 0;
    this.keys = [];
  }
  charge(amount, key) {
    this.calls += 1;
    this.keys.push(key);
    const outcome = this.script.shift() || "ok";
    if (outcome === "decline") throw new DeclinedError();
    if (outcome === "timeout") throw new TimeoutError();
    return { ref: "txn" + this.calls };
  }
}

class MethodFactory {
  constructor() {
    this.builders = new Map();
  }
  register(type, build) {
    this.builders.set(type, build);
  }
  create(type) {
    const build = this.builders.get(type);
    if (!build) throw new ValidationError("unsupported method " + type);
    return build();
  }
}

class PaymentProcessor {
  constructor(factory) {
    this.factory = factory;
    this.methods = new Map();
    this.payments = new Map();
    this.byKey = new Map();
    this.chain = new AmountValidator();
    this.chain.setNext(new CurrencyValidator()).setNext(new InstrumentValidator((type) => this.methodFor(type)));
  }
  methodFor(type) {
    if (!this.methods.has(type)) this.methods.set(type, this.factory.create(type));
    return this.methods.get(type);
  }
  process(request) {
    if (!request.key) throw new ValidationError("idempotency key required");
    const fingerprint = [request.amount, request.currency, request.method].join("|");
    const seen = this.byKey.get(request.key);
    if (seen) {
      if (seen.fingerprint !== fingerprint) throw new ValidationError("key reused for a different request");
      return seen.payment;
    }
    const payment = { id: "pay" + (this.payments.size + 1), amount: request.amount, status: "CREATED", refunded: 0 };
    this.payments.set(payment.id, payment);
    this.byKey.set(request.key, { fingerprint, payment });
    try {
      this.chain.handle(request);
      const result = this.methodFor(request.method).charge(request);
      Object.assign(payment, { status: "CAPTURED", ref: result.ref, attempts: result.attempts || 1 });
    } catch (error) {
      if (!(error instanceof PaymentError)) throw error;
      Object.assign(payment, { status: "FAILED", code: error.code, reason: error.message, attempts: error.attempts || 0 });
    }
    return payment;
  }
  refund(paymentId, amount) {
    const payment = this.payments.get(paymentId);
    if (!payment || !["CAPTURED", "PARTIALLY_REFUNDED"].includes(payment.status)) {
      throw new ValidationError("payment cannot be refunded");
    }
    if (!Number.isInteger(amount) || amount <= 0 || payment.refunded + amount > payment.amount) {
      throw new ValidationError("refund exceeds the captured amount");
    }
    payment.refunded += amount;
    payment.status = payment.refunded === payment.amount ? "REFUNDED" : "PARTIALLY_REFUNDED";
    return payment;
  }
}`,
  },
];
