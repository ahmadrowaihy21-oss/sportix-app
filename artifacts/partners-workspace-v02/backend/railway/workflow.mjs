// lib/booking.ts
var BASE_TIME = Date.parse("2026-11-10T15:00:00Z");
var TTL = 3e5;
var FRESHNESS = 6e4;
var actors = {
  ADMIN: { id: "demo-admin", role: "ADMIN", tenant: "*", venues: [] },
  PARTNER: { id: "demo-partner", role: "PARTNER", tenant: "demo-tenant-a", venues: [] },
  MANAGER: { id: "demo-manager", role: "MANAGER", tenant: "demo-tenant-a", venues: ["demo-court-a"] },
  REVIEWER: { id: "demo-reviewer", role: "REVIEWER", tenant: "demo-tenant-a", venues: [] },
  HOST: { id: "demo-host", role: "HOST", tenant: "demo-athlete", venues: [] },
  SYSTEM: { id: "demo-system", role: "SYSTEM", tenant: "*", venues: [] }
};
var fixtureRoom = { id: "demo-room-01", name: "\u063A\u0631\u0641\u0629 \u0627\u0644\u0628\u0627\u062F\u0644 \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A\u0629", sport: "\u0628\u0627\u062F\u0644", city: "\u062C\u062F\u0629", players: 4, minimum: 4, start: Date.parse("2026-11-10T17:00:00Z"), end: Date.parse("2026-11-10T18:00:00Z"), host: "demo-host" };
function seedVenues() {
  const c = { tenant: "demo-tenant-a", city: "\u062C\u062F\u0629", open: 8, close: 24, available: true, maintenance: false, safe: true, eligible: true, policy: true, checkedAt: BASE_TIME, version: 1 };
  return [
    { ...c, id: "demo-court-a", name: "\u0645\u0644\u0639\u0628 \u062A\u062C\u0631\u064A\u0628\u064A A", type: "\u0645\u0644\u0639\u0628", sport: "\u0628\u0627\u062F\u0644", capacity: 4, price: 180 },
    { ...c, id: "demo-center-b", name: "\u0645\u0631\u0643\u0632 \u062A\u062C\u0631\u064A\u0628\u064A B", type: "\u0645\u0631\u0643\u0632 \u0631\u064A\u0627\u0636\u064A", sport: "\u0643\u0631\u0629 \u0642\u062F\u0645", capacity: 12, price: 280 },
    { ...c, id: "demo-academy-c", name: "\u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629 \u062A\u062C\u0631\u064A\u0628\u064A\u0629 C", type: "\u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629", sport: "\u0628\u0627\u062F\u0644", capacity: 8, price: 240, maintenance: true },
    { ...c, id: "demo-court-d", tenant: "demo-tenant-b", name: "\u0645\u0644\u0639\u0628 \u062A\u062C\u0631\u064A\u0628\u064A D", type: "\u0645\u0644\u0639\u0628", sport: "\u0628\u0627\u062F\u0644", capacity: 4, price: 200, city: "\u0627\u0644\u0631\u064A\u0627\u0636" }
  ];
}
var RuleError = class extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
};
function req(condition, code) {
  if (!condition) throw new RuleError(code);
}
function can(a, action, v) {
  if (a.role === "REVIEWER") return action === "review" && a.tenant === v.tenant;
  if (a.role === "ADMIN") return true;
  if (a.role === "SYSTEM") return action === "confirm";
  if (a.tenant !== v.tenant) return false;
  if (a.role === "PARTNER") return action !== "review";
  return a.role === "MANAGER" && a.venues.includes(v.id) && action !== "review";
}
function matchReasons(v, r) {
  const h = (t) => {
    const d = new Date(t + 108e5);
    return d.getUTCHours() + d.getUTCMinutes() / 60;
  };
  const sameDay = new Date(r.start + 108e5).toISOString().slice(0, 10) === new Date(r.end - 1 + 108e5).toISOString().slice(0, 10);
  const end = h(r.end) === 0 ? 24 : h(r.end);
  return [v.sport !== r.sport && "SPORT_MISMATCH", v.city !== r.city && "LOCATION_MISMATCH", r.players > v.capacity && "CAPACITY_EXCEEDED", r.players < r.minimum && "MIN_PLAYERS", (!sameDay || h(r.start) < v.open || end > v.close) && "OUTSIDE_SCHEDULE", !v.available && "UNAVAILABLE", v.maintenance && "MAINTENANCE_OPEN", !v.safe && "SAFETY_BLOCK", !v.eligible && "VENUE_INELIGIBLE", !v.policy && "POLICY_BLOCK"].filter(Boolean);
}
var BookingEngine = class {
  constructor(snapshot) {
    this.data = snapshot ? structuredClone(snapshot) : { now: BASE_TIME, venues: seedVenues(), bookings: [], events: [], sequence: 0, keys: {} };
  }
  id(p) {
    return `${p}-${String(++this.data.sequence).padStart(3, "0")}`;
  }
  venue(id) {
    const v = this.data.venues.find((v2) => v2.id === id);
    req(v, "NOT_FOUND");
    return v;
  }
  booking(id) {
    const b = this.data.bookings.find((b2) => b2.id === id);
    req(b, "NOT_FOUND");
    return b;
  }
  event(b, a, action, note = "") {
    this.data.events.unshift({ id: this.id("event"), at: this.data.now, booking: b.id, actor: a.id, action, state: b.state, version: b.version, note });
  }
  change(b, s, a, note = "") {
    b.state = s;
    b.version++;
    this.event(b, a, s, note);
  }
  activeHold(b) {
    return ["TEMPORARY_SLOT_HOLD", "VENUE_NOTIFIED", "CLAIMED"].includes(b.state);
  }
  blocks(b) {
    return b.state === "CONFIRMED" || this.activeHold(b) && this.data.now < b.expiresAt;
  }
  release(b) {
    delete b.lease;
    if (b.payment?.status === "AUTHORIZED") b.payment.status = "VOID_PENDING";
    if (b.payment?.status === "CAPTURED") b.payment.status = "REFUND_PENDING";
  }
  expire() {
    for (const b of this.data.bookings) if (this.activeHold(b) && this.data.now >= b.expiresAt) {
      this.release(b);
      this.change(b, "EXPIRED", actors.SYSTEM, "\u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0645\u0647\u0644\u0629 \u0644\u0627 \u064A\u0624\u0643\u062F \u0627\u0644\u062D\u062C\u0632");
    }
  }
  checkVersion(b, v) {
    req(b.version === v, "VERSION_CONFLICT");
  }
  assertMatching(v, r) {
    const reasons = matchReasons(v, r);
    req(!reasons.length, reasons[0] ?? "INVALID_INPUT");
  }
  request(room, venueId, key, a = actors.HOST) {
    req(a.role === "HOST" && room.host === a.id, "FORBIDDEN");
    req(key.trim() && Number.isInteger(room.players) && room.players > 0 && Number.isInteger(room.minimum) && room.minimum > 0 && room.start < room.end && room.start > this.data.now, "INVALID_INPUT");
    const v = this.venue(venueId), fingerprint = JSON.stringify({ room, venueId }), scoped = `${a.id}:${key}`, old = this.data.keys[scoped];
    if (old) {
      req(old.fingerprint === fingerprint, "IDEMPOTENCY_CONFLICT");
      return this.booking(old.id);
    }
    const b = { id: this.id("demo-booking"), room: structuredClone(room), venue: venueId, tenant: v.tenant, state: "REQUESTED", version: 1, price: Math.round(v.price * (room.end - room.start) / 36e5), currency: "SAR", createdBy: a.id };
    this.data.bookings.push(b);
    this.data.keys[scoped] = { fingerprint, id: b.id };
    this.event(b, a, "REQUESTED");
    return b;
  }
  hold(id, version, a = actors.HOST) {
    this.expire();
    const b = this.booking(id);
    req(a.role === "HOST" && b.createdBy === a.id, "FORBIDDEN");
    this.checkVersion(b, version);
    req(b.state === "REQUESTED", "INVALID_TRANSITION");
    const v = this.venue(b.venue);
    this.assertMatching(v, b.room);
    req(this.data.now - v.checkedAt <= FRESHNESS, "AVAILABILITY_STALE");
    const active = this.data.bookings.filter((x) => x.id !== b.id && this.blocks(x));
    req(!active.some((x) => x.room.id === b.room.id), "ROOM_ALREADY_BOOKED");
    req(!active.some((x) => x.venue === b.venue && x.room.start < b.room.end && b.room.start < x.room.end), "SLOT_CONFLICT");
    b.expiresAt = this.data.now + TTL;
    b.lease = this.id("lease");
    this.change(b, "TEMPORARY_SLOT_HOLD", a);
    return b;
  }
  checkLive(id, version) {
    this.expire();
    const b = this.booking(id);
    req(b.state !== "EXPIRED", "HOLD_EXPIRED");
    this.checkVersion(b, version);
    req(this.activeHold(b), "INVALID_TRANSITION");
    return b;
  }
  notify(id, version, a = actors.SYSTEM) {
    req(a.role === "SYSTEM", "FORBIDDEN");
    const b = this.checkLive(id, version);
    req(b.state === "TEMPORARY_SLOT_HOLD", "INVALID_TRANSITION");
    b.notification = "ACKNOWLEDGED";
    this.change(b, "VENUE_NOTIFIED", a, "\u0625\u0642\u0631\u0627\u0631 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0635\u0637\u0646\u0627\u0639\u064A\u061B \u0644\u0645 \u062A\u064F\u0631\u0633\u0644 \u0631\u0633\u0627\u0644\u0629");
    return b;
  }
  claim(id, version, a) {
    const b = this.checkLive(id, version);
    req(can(a, "claim", this.venue(b.venue)), "FORBIDDEN");
    req(b.state === "VENUE_NOTIFIED", "INVALID_TRANSITION");
    b.claimedBy = a.id;
    this.change(b, "CLAIMED", a, "Claim \u0644\u0627 \u064A\u0639\u0646\u064A Confirm");
    return b;
  }
  authorize(id, version, a = actors.SYSTEM) {
    req(a.role === "SYSTEM", "FORBIDDEN");
    const b = this.checkLive(id, version);
    b.payment = { id: this.id("demo-auth"), booking: b.id, status: "AUTHORIZED", amount: b.price, currency: "SAR", expiresAt: this.data.now + TTL };
    b.version++;
    this.event(b, a, "PAYMENT_AUTHORIZED", "\u062A\u0641\u0648\u064A\u0636 \u0627\u0635\u0637\u0646\u0627\u0639\u064A \u062F\u0648\u0646 \u062E\u0635\u0645");
    return b;
  }
  confirm(id, version, lease, a) {
    const b = this.checkLive(id, version), v = this.venue(b.venue);
    req(can(a, "confirm", v), "FORBIDDEN");
    req(["VENUE_NOTIFIED", "CLAIMED"].includes(b.state), "INVALID_TRANSITION");
    req(b.lease === lease, "LEASE_MISMATCH");
    this.assertMatching(v, b.room);
    req(this.data.now - v.checkedAt <= FRESHNESS, "AVAILABILITY_STALE");
    const p = b.payment;
    req(p && p.booking === b.id && p.status === "AUTHORIZED" && p.expiresAt > this.data.now && p.amount === b.price && p.currency === b.currency, "PAYMENT_REQUIRED");
    req(!this.data.bookings.some((x) => x.id !== b.id && this.blocks(x) && x.venue === b.venue && x.room.start < b.room.end && b.room.start < x.room.end), "SLOT_CONFLICT");
    this.change(b, "CONFIRMED", a, "\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0642\u0641\u0644 \u0625\u0644\u0649 \u062D\u062C\u0632 \u062D\u0635\u0631\u064A\u061B \u0627\u0644\u062A\u062D\u0635\u064A\u0644 \u062E\u0627\u0631\u062C \u0627\u0644\u0645\u062D\u0627\u0643\u0627\u0629");
    return b;
  }
  reject(id, version, reason, evidence, a) {
    this.expire();
    const b = this.booking(id);
    this.checkVersion(b, version);
    req(can(a, "claim", this.venue(b.venue)), "FORBIDDEN");
    req(["REQUESTED", "TEMPORARY_SLOT_HOLD", "VENUE_NOTIFIED", "CLAIMED"].includes(b.state), "INVALID_TRANSITION");
    req(["MAINTENANCE_OPEN", "SAFETY_BLOCK", "CAPACITY_EXCEEDED", "UNAVAILABLE", "VENUE_INELIGIBLE", "POLICY_BLOCK"].includes(reason) && evidence.trim().length >= 5, "REASON_REQUIRED");
    b.reason = reason;
    this.release(b);
    this.change(b, "VALID_REJECT", a, `${reason} \xB7 ${evidence}`);
    return b;
  }
  cancel(id, version, a) {
    this.expire();
    const b = this.booking(id);
    this.checkVersion(b, version);
    req(a.role === "HOST" && b.createdBy === a.id || can(a, "manage", this.venue(b.venue)), "FORBIDDEN");
    req(!["CANCELLED", "EXPIRED", "VALID_REJECT"].includes(b.state), "INVALID_TRANSITION");
    this.release(b);
    this.change(b, "CANCELLED", a, "\u062A\u062D\u0631\u064A\u0631 \u0627\u0644\u0645\u0648\u0631\u062F\u061B \u0645\u0639\u0627\u0644\u062C\u0629 \u0645\u0627\u0644\u064A\u0629 \u0645\u0646\u0641\u0635\u0644\u0629 \u0628\u062D\u0633\u0628 \u0627\u0644\u0633\u064A\u0627\u0633\u0629");
    return b;
  }
  advance(ms) {
    req(ms >= 0, "INVALID_INPUT");
    this.data.now += ms;
    this.expire();
  }
  refresh(id, a) {
    const v = this.venue(id);
    req(can(a, "manage", v), "FORBIDDEN");
    v.checkedAt = this.data.now;
    v.version++;
  }
  updateVenue(id, patch, a) {
    const v = this.venue(id);
    req(can(a, "manage", v), "FORBIDDEN");
    const n = { ...v, ...patch };
    req(Number.isInteger(n.capacity) && n.capacity > 0 && n.price > 0 && n.open >= 0 && n.close <= 24 && n.open < n.close, "INVALID_INPUT");
    Object.assign(v, patch, { version: v.version + 1 });
  }
  snapshot() {
    return structuredClone(this.data);
  }
};

// lib/market.ts
var marketActors = {
  ADMIN: { id: "demo-admin", role: "ADMIN", tenant: "*", modules: ["ROOMS", "COUPONS", "PRODUCTS", "IMPACT"] },
  PARTNER: { id: "demo-partner", role: "PARTNER", tenant: "demo-tenant-a", modules: ["ROOMS", "COUPONS", "PRODUCTS", "IMPACT"] },
  MANAGER: { id: "demo-manager", role: "MANAGER", tenant: "demo-tenant-a", modules: ["ROOMS"] },
  REVIEWER: { id: "demo-reviewer", role: "REVIEWER", tenant: "demo-tenant-a", modules: ["ROOMS", "COUPONS", "PRODUCTS", "IMPACT"] },
  FOREIGN: { id: "demo-foreign", role: "PARTNER", tenant: "demo-tenant-b", modules: ["COUPONS", "PRODUCTS", "IMPACT"] }
};
function ensure(value, code) {
  if (!value) throw new RuleError(code);
}
function seedMarket() {
  return { now: BASE_TIME, sequence: 0, organization: { id: "demo-tenant-a", approved: true, modules: ["ROOMS", "COUPONS", "PRODUCTS", "IMPACT"] }, listings: [
    { id: "demo-coupon", tenant: "demo-tenant-a", module: "COUPONS", kind: "COUPON", name: "\u0643\u0648\u0628\u0648\u0646 \u062D\u0635\u0629 \u062A\u062C\u0631\u064A\u0628\u064A\u0629", priceMinor: 8e3, stock: 10, capacity: 1, status: "PUBLISHED", submittedBy: "demo-partner", reviewedBy: "demo-reviewer", version: 1 },
    { id: "demo-subscription", tenant: "demo-tenant-a", module: "COUPONS", kind: "SUBSCRIPTION", name: "\u0627\u0634\u062A\u0631\u0627\u0643 \u062A\u062C\u0631\u064A\u0628\u064A \xB7 4 \u062D\u0635\u0635", priceMinor: 24e3, stock: 10, capacity: 4, status: "PUBLISHED", submittedBy: "demo-partner", reviewedBy: "demo-reviewer", version: 1 },
    { id: "demo-product", tenant: "demo-tenant-a", module: "PRODUCTS", kind: "PRODUCT", name: "\u0645\u0636\u0631\u0628 \u062A\u062C\u0631\u064A\u0628\u064A", priceMinor: 16e3, stock: 2, capacity: 0, status: "PUBLISHED", submittedBy: "demo-partner", reviewedBy: "demo-reviewer", version: 1 },
    { id: "demo-impact", tenant: "demo-tenant-a", module: "IMPACT", kind: "NONPROFIT", name: "\u0645\u0628\u0627\u062F\u0631\u0629 \u0631\u064A\u0627\u0636\u064A\u0629 \u062A\u062C\u0631\u064A\u0628\u064A\u0629", priceMinor: 0, stock: 0, capacity: 3, status: "DRAFT", submittedBy: "demo-partner", version: 1 },
    { id: "demo-event", tenant: "demo-tenant-a", module: "IMPACT", kind: "COMMERCIAL_EVENT", name: "\u0641\u0639\u0627\u0644\u064A\u0629 \u062A\u062C\u0631\u064A\u0628\u064A\u0629 \u0645\u062C\u0627\u0646\u064A\u0629", priceMinor: 0, stock: 0, capacity: 5, status: "DRAFT", submittedBy: "demo-partner", version: 1 }
  ], orders: [], entitlements: [], registrations: [] };
}
var MarketEngine = class {
  constructor(state) {
    this.data = structuredClone(state || seedMarket());
  }
  id(prefix) {
    return `demo-${prefix}-${++this.data.sequence}`;
  }
  listing(id) {
    const l = this.data.listings.find((x) => x.id === id);
    ensure(l, "NOT_FOUND");
    return l;
  }
  order(id) {
    const o = this.data.orders.find((x) => x.id === id);
    ensure(o, "NOT_FOUND");
    return o;
  }
  scope(a, l, review = false) {
    ensure(a, "FORBIDDEN");
    ensure(a.role === "ADMIN" || a.tenant === l.tenant, "FORBIDDEN");
    ensure(a.modules.includes(l.module), "MODULE_FORBIDDEN");
    ensure(review ? ["ADMIN", "REVIEWER"].includes(a.role) : ["ADMIN", "PARTNER", "MANAGER"].includes(a.role), "FORBIDDEN");
    ensure(this.data.organization.approved && this.data.organization.modules.includes(l.module), "MODULE_DISABLED");
  }
  version(actual, expected) {
    ensure(actual === expected, "VERSION_CONFLICT");
  }
  publication(id, action, version, a) {
    const l = this.listing(id);
    this.scope(a, l, action === "approve");
    this.version(l.version, version);
    if (action === "submit") {
      ensure(["DRAFT", "PAUSED"].includes(l.status), "INVALID_TRANSITION");
      l.status = "IN_REVIEW";
      l.submittedBy = a.id;
      delete l.reviewedBy;
    }
    if (action === "approve") {
      ensure(l.status === "IN_REVIEW", "INVALID_TRANSITION");
      ensure(l.submittedBy !== a.id, "SELF_APPROVAL");
      l.status = "APPROVED";
      l.reviewedBy = a.id;
    }
    if (action === "publish") {
      ensure(l.status === "APPROVED" && l.reviewedBy && l.reviewedBy !== l.submittedBy, "APPROVAL_REQUIRED");
      l.status = "PUBLISHED";
    }
    if (action === "pause") {
      ensure(l.status === "PUBLISHED", "INVALID_TRANSITION");
      l.status = "PAUSED";
    }
    l.version++;
    return l;
  }
  edit(id, priceMinor, stock, capacity, version, a) {
    const l = this.listing(id);
    this.scope(a, l);
    this.version(l.version, version);
    ensure(l.status === "DRAFT", "EDIT_REQUIRES_DRAFT");
    ensure([priceMinor, stock, capacity].every((n) => Number.isSafeInteger(n) && n >= 0 && n <= 1e6), "INVALID_INPUT");
    ensure(l.module !== "IMPACT" || priceMinor === 0 && capacity > 0, "PAID_IMPACT_DISABLED");
    l.priceMinor = priceMinor;
    l.stock = stock;
    l.capacity = capacity;
    l.version++;
    return l;
  }
  reserve(id, quantity, a) {
    this.expire();
    const l = this.listing(id);
    this.scope(a, l);
    ensure(l.status === "PUBLISHED" && l.kind === "PRODUCT", "INVALID_TRANSITION");
    ensure(Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 20, "INVALID_INPUT");
    ensure(l.stock >= quantity, "OUT_OF_STOCK");
    l.stock -= quantity;
    l.version++;
    const o = { id: this.id("order"), listingId: id, tenant: l.tenant, quantity, amountMinor: l.priceMinor * quantity, state: "RESERVED", expiresAt: this.data.now + 3e5, payment: "NONE", version: 1 };
    this.data.orders.push(o);
    return o;
  }
  orderAction(id, action, version, a) {
    this.expire();
    const o = this.order(id), l = this.listing(o.listingId);
    this.scope(a, l);
    this.version(o.version, version);
    const from = { authorize: "RESERVED", confirm: "PAYMENT_AUTHORIZED", ship: "CONFIRMED", deliver: "SHIPPED", return: "DELIVERED", refund: "RETURN_REQUESTED" };
    if (action === "cancel") {
      ensure(["RESERVED", "PAYMENT_AUTHORIZED", "CONFIRMED"].includes(o.state), "INVALID_TRANSITION");
      l.stock += o.quantity;
      l.version++;
      o.state = "CANCELLED";
      if (o.payment === "AUTHORIZED") o.payment = "VOID_PENDING";
      if (o.payment === "CAPTURED") o.payment = "REFUND_PENDING";
    } else {
      ensure(o.state === from[action], "INVALID_TRANSITION");
      if (action === "authorize") {
        o.state = "PAYMENT_AUTHORIZED";
        o.payment = "AUTHORIZED";
      }
      if (action === "confirm") {
        ensure(o.payment === "AUTHORIZED" && o.expiresAt > this.data.now, "PAYMENT_REQUIRED");
        o.state = "CONFIRMED";
      }
      if (action === "ship") {
        ensure(o.payment === "AUTHORIZED", "PAYMENT_REQUIRED");
        o.payment = "CAPTURED";
        o.state = "SHIPPED";
      }
      if (action === "deliver") o.state = "DELIVERED";
      if (action === "return") o.state = "RETURN_REQUESTED";
      if (action === "refund") {
        o.state = "REFUND_PENDING";
        o.payment = "REFUND_PENDING";
      }
    }
    o.version++;
    return o;
  }
  issue(id, a) {
    const l = this.listing(id);
    this.scope(a, l);
    ensure(l.status === "PUBLISHED" && ["COUPON", "SUBSCRIPTION"].includes(l.kind), "INVALID_TRANSITION");
    ensure(l.stock > 0, "OUT_OF_STOCK");
    l.stock--;
    l.version++;
    const e = { id: this.id("entitlement"), listingId: id, tenant: l.tenant, kind: l.kind, uses: l.kind === "COUPON" ? 1 : 4, expiresAt: this.data.now + 30 * 864e5, state: "ACTIVE", version: 1 };
    this.data.entitlements.push(e);
    return e;
  }
  redeem(id, version, a) {
    this.expire();
    const e = this.data.entitlements.find((x) => x.id === id);
    ensure(e, "NOT_FOUND");
    this.scope(a, this.listing(e.listingId));
    this.version(e.version, version);
    ensure(e.state === "ACTIVE" && e.uses > 0 && e.expiresAt > this.data.now, "ENTITLEMENT_INACTIVE");
    e.uses--;
    if (e.uses === 0) e.state = "REDEEMED";
    e.version++;
    return e;
  }
  register(id, member, a) {
    const l = this.listing(id);
    this.scope(a, l);
    ensure(l.status === "PUBLISHED" && l.module === "IMPACT", "INVALID_TRANSITION");
    ensure(/^demo-member-[1-9][0-9]?$/.test(member), "SYNTHETIC_ONLY");
    ensure(l.priceMinor === 0, "PAID_IMPACT_DISABLED");
    ensure(!this.data.registrations.some((r2) => r2.listingId === id && r2.member === member), "DUPLICATE_REGISTRATION");
    ensure(this.data.registrations.filter((r2) => r2.listingId === id).length < l.capacity, "CAPACITY_EXCEEDED");
    const r = { id: this.id("registration"), listingId: id, member };
    this.data.registrations.push(r);
    return r;
  }
  expire() {
    for (const o of this.data.orders) if (["RESERVED", "PAYMENT_AUTHORIZED"].includes(o.state) && o.expiresAt <= this.data.now) {
      const l = this.listing(o.listingId);
      l.stock += o.quantity;
      l.version++;
      o.state = "EXPIRED";
      if (o.payment === "AUTHORIZED") o.payment = "VOID_PENDING";
      o.version++;
    }
    for (const e of this.data.entitlements) if (e.state === "ACTIVE" && e.expiresAt <= this.data.now) {
      e.state = "EXPIRED";
      e.version++;
    }
  }
  advance(ms) {
    ensure(Number.isSafeInteger(ms) && ms > 0 && ms <= 31 * 864e5, "INVALID_INPUT");
    this.data.now += ms;
    this.expire();
  }
};

// lib/workflow.ts
function seedWorkflow() {
  return { schema: 2, revision: 0, market: seedMarket(), rooms: new BookingEngine().snapshot(), audit: [], outbox: [], receipts: {} };
}
function execute(state, cmd) {
  ensure(cmd && typeof cmd === "object" && typeof cmd.key === "string" && /^[A-Za-z0-9_-]{8,100}$/.test(cmd.key), "INVALID_KEY");
  ensure(typeof cmd.op === "string" && Object.hasOwn(marketActors, cmd.role), "FORBIDDEN");
  const { key, ...payload } = cmd, fingerprint = JSON.stringify(payload), old = state.receipts[key];
  if (old) {
    ensure(old.fingerprint === fingerprint, "IDEMPOTENCY_CONFLICT");
    return { state, result: old.result, replayed: true };
  }
  ensure(Object.keys(state.receipts).length < 1e3, "SANDBOX_LIMIT");
  const next = structuredClone(state), m = new MarketEngine(next.market), b = new BookingEngine(next.rooms), a = marketActors[cmd.role];
  let result;
  const id = cmd.id || "", v = cmd.version ?? -1;
  if (cmd.op.startsWith("listing.")) {
    const op = cmd.op.split(".")[1];
    ensure(["submit", "approve", "publish", "pause", "edit"].includes(op), "UNKNOWN_COMMAND");
    result = op === "edit" ? m.edit(id, cmd.priceMinor, cmd.stock, cmd.capacity, v, a) : m.publication(id, op, v, a);
  } else if (cmd.op === "order.reserve") result = m.reserve(id, cmd.quantity, a);
  else if (cmd.op.startsWith("order.")) {
    const op = cmd.op.split(".")[1];
    ensure(["authorize", "confirm", "ship", "deliver", "return", "refund", "cancel"].includes(op), "UNKNOWN_COMMAND");
    result = m.orderAction(id, op, v, a);
  } else if (cmd.op === "entitlement.issue") result = m.issue(id, a);
  else if (cmd.op === "entitlement.redeem") result = m.redeem(id, v, a);
  else if (cmd.op === "impact.register") result = m.register(id, cmd.member || "", a);
  else if (cmd.op === "clock.advance") {
    ensure(a.role === "ADMIN", "FORBIDDEN");
    m.advance(cmd.ms);
    b.advance(cmd.ms);
    result = { now: m.data.now };
  } else if (cmd.op === "rooms.request") {
    ensure(a.role === "PARTNER" || a.role === "ADMIN", "FORBIDDEN");
    let start = Math.floor(b.data.now / 864e5) * 864e5 + 17 * 36e5;
    if (start <= b.data.now) start += 864e5;
    const r = { ...fixtureRoom, id: `demo-room-${next.revision}`, start, end: start + 36e5 };
    result = b.request(r, "demo-court-a", key);
  } else if (cmd.op === "rooms.hold") {
    ensure(a.role === "PARTNER" || a.role === "ADMIN", "FORBIDDEN");
    result = b.hold(id, v);
  } else if (cmd.op === "rooms.notify") {
    ensure(a.role === "ADMIN", "FORBIDDEN");
    result = b.notify(id, v);
  } else if (cmd.op === "rooms.authorize") {
    ensure(a.role === "ADMIN", "FORBIDDEN");
    result = b.authorize(id, v);
  } else if (cmd.op === "rooms.confirm") {
    ensure(a.role === "ADMIN", "FORBIDDEN");
    result = b.confirm(id, v, b.booking(id).lease || "", actors.SYSTEM);
  } else if (cmd.op === "rooms.cancel") {
    ensure(a.role === "ADMIN" || a.role === "PARTNER", "FORBIDDEN");
    result = b.cancel(id, v, actors[cmd.role]);
  } else if (cmd.op === "rooms.refresh") {
    ensure(a.role === "ADMIN" || a.role === "PARTNER", "FORBIDDEN");
    b.refresh("demo-court-a", actors[cmd.role]);
    result = { refreshed: true };
  } else throw new Error("UNKNOWN_COMMAND");
  next.market = m.data;
  next.rooms = b.snapshot();
  next.revision++;
  const event = { id: `evt-${next.revision}`, type: cmd.op, at: (/* @__PURE__ */ new Date()).toISOString(), aggregateId: id || String(result?.id || "workspace"), actor: a.id, synthetic: true, delivery: "DISABLED" };
  next.audit.push(event);
  next.outbox.push(event);
  next.receipts[key] = { fingerprint, result: structuredClone(result) };
  return { state: next, result, replayed: false };
}
export {
  execute,
  seedWorkflow
};
