import fs from "node:fs";
import path from "node:path";
import PptxGenJS from "pptxgenjs";

const ROOT = path.resolve("/workspace");
const OUT = path.join(ROOT, "public/downloads/SPORTIX_AI_Executive_Portfolio.pptx");
const BG = "050608";
const LIME = "C6FF00";
const FG = "F3F5F7";
const MUTED = "9AA3AD";
const SURFACE = "0E1218";

const intel = path.join(ROOT, "public/brand/sportix-intelligence.png");
const yhh = path.join(ROOT, "public/brand/yalla-hayyihom.png");
const sec = path.join(ROOT, "public/brand/sportix-security.png");

const pptx = new PptxGenJS();
pptx.defineLayout({ name: "LANDSCAPE_16x9", width: 13.333, height: 7.5 });
pptx.layout = "LANDSCAPE_16x9";
pptx.author = "SPORTIX AI";
pptx.title = "SPORTIX AI Executive Portfolio";
pptx.subject = "Intelligence infrastructure for sports, fans and experiences";

function addBase(slide, n, kicker) {
  slide.background = { color: BG };
  slide.addText(kicker.toUpperCase(), {
    x: 0.55,
    y: 0.28,
    w: 8,
    h: 0.28,
    fontSize: 10,
    fontFace: "Arial",
    color: LIME,
    bold: true,
    charSpacing: 3,
  });
  slide.addText("CONFIDENTIAL  ·  INVESTMENT DISCUSSION", {
    x: 8.2,
    y: 0.28,
    w: 4.6,
    h: 0.28,
    fontSize: 10,
    fontFace: "Arial",
    color: MUTED,
    align: "right",
  });
  slide.addText("SPORTIX AI  ·  EXECUTIVE PORTFOLIO", {
    x: 0.55,
    y: 7.12,
    w: 8,
    h: 0.22,
    fontSize: 10,
    fontFace: "Arial",
    color: MUTED,
  });
  slide.addText(String(n).padStart(2, "0") + " / 24", {
    x: 10.6,
    y: 7.12,
    w: 2.2,
    h: 0.22,
    fontSize: 10,
    fontFace: "Arial",
    color: MUTED,
    align: "right",
  });
}

function title(slide, text, y = 0.62, h = 1.2) {
  slide.addText(text, {
    x: 0.55,
    y,
    w: 12.2,
    h,
    fontSize: 32,
    fontFace: "Arial",
    color: FG,
    bold: true,
  });
}

function bullets(slide, items, y = 2.1, opts = {}) {
  slide.addText(
    items.map((t) => ({ text: t, options: { bullet: true, breakLine: true } })),
    {
      x: opts.x ?? 0.55,
      y,
      w: opts.w ?? 12.2,
      h: opts.h ?? 4.6,
      fontSize: opts.fontSize ?? 16,
      fontFace: "Arial",
      color: FG,
      valign: "top",
    },
  );
}

function card(slide, x, y, w, h, heading, body) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    fill: { color: SURFACE },
    rectRadius: 0.08,
  });
  slide.addText(heading, {
    x: x + 0.18,
    y: y + 0.16,
    w: w - 0.36,
    h: 0.4,
    fontSize: 14,
    fontFace: "Arial",
    color: LIME,
    bold: true,
  });
  slide.addText(body, {
    x: x + 0.18,
    y: y + 0.55,
    w: w - 0.36,
    h: h - 0.7,
    fontSize: 13,
    fontFace: "Arial",
    color: MUTED,
  });
}

// 01 Cover
{
  const s = pptx.addSlide();
  s.background = { color: BG };
  s.addImage({ path: intel, x: 0.4, y: 1.2, w: 3.6, h: 4.45 });
  s.addText("EXECUTIVE PORTFOLIO", {
    x: 4.4,
    y: 1.6,
    w: 8.3,
    h: 0.3,
    fontSize: 12,
    fontFace: "Arial",
    color: LIME,
    bold: true,
    charSpacing: 3,
  });
  s.addText("Intelligence infrastructure for sports, fans & experiences.", {
    x: 4.4,
    y: 2.05,
    w: 8.3,
    h: 2.2,
    fontSize: 32,
    fontFace: "Arial",
    color: FG,
    bold: true,
  });
  s.addText(
    "A depth document for investment and capital-structuring discussion. Founding / Pre-Launch Execution Stage. Prepared for Equivator · Faisal Alsanie · investment partners.",
    {
      x: 4.4,
      y: 4.4,
      w: 8.3,
      h: 1.2,
      fontSize: 14,
      fontFace: "Arial",
      color: MUTED,
    },
  );
  s.addImage({ path: yhh, x: 4.4, y: 5.9, w: 1.1, h: 1.1 });
  s.addImage({ path: sec, x: 5.7, y: 6.15, w: 2.2, h: 0.7 });
  s.addText("01 / 24", {
    x: 10.6,
    y: 7.12,
    w: 2.2,
    h: 0.22,
    fontSize: 10,
    fontFace: "Arial",
    color: MUTED,
    align: "right",
  });
}

// 02
{
  const s = pptx.addSlide();
  addBase(s, 2, "The big idea");
  title(s, "One intelligence company.\nMultiple scalable applications.");
  card(s, 0.55, 2.2, 3.0, 4.4, "SPORTIX AI SYSTEMS", "Core intelligence layer\nAI · Computer Vision\nData · MLOps\nConfidence · Evidence\nGoverned AI services");
  card(s, 3.7, 2.2, 3.0, 4.4, "SPORTIX ECOSYSTEM", "Sports intelligence\nSPORT ID · Participation\nTalent · Development\nCommunity · Venues\nMarketplace · Rewards");
  card(s, 6.85, 2.2, 3.0, 4.4, "YALLA HAYYIHOM", "Fan & visitor intelligence\nEvents · Culture\nTourism · Destinations\nMobility · Community\nCultural Passport");
  card(s, 10.0, 2.2, 2.8, 4.4, "SECURITY SYSTEMS", "Progressive digital trust\nEmbedded first\nShared infrastructure\nEnterprise digital trust\nFuture B2B — not day one");
}

// 03
{
  const s = pptx.addSlide();
  addBase(s, 3, "Why this exists");
  title(s, "The journeys are real.\nThe infrastructure is not.");
  card(s, 0.55, 2.2, 6.0, 4.5, "ATHLETE — a career made of fragments", "School records, club minutes, federation pathways, unstructured video, disconnected rewards, identity that resets at every institution.");
  card(s, 6.75, 2.2, 6.0, 4.5, "VISITOR — an experience that ends at the gate", "Tickets do not become a relationship. Culture, sport and mobility live in different apps. Memories leave with the camera roll.");
}

// 04
{
  const s = pptx.addSlide();
  addBase(s, 4, "Master ecosystem");
  title(s, "One core. Four layers. Shared evidence.");
  bullets(s, [
    "SPORTIX AI is the parent intelligence company.",
    "SPORTIX AI SYSTEMS is the core: AI, computer vision, data, MLOps, confidence, governed services.",
    "SPORTIX ECOSYSTEM is sports intelligence: identity, participation, development, community, commerce.",
    "YALLA HAYYIHOM is fan, visitor and experience intelligence.",
    "SPORTIX AI SECURITY SYSTEMS is progressive — an envelope, not a day-one operating company.",
  ]);
}

// 05
{
  const s = pptx.addSlide();
  addBase(s, 5, "SPORTIX AI SYSTEMS");
  title(s, "The core is a governed intelligence layer.");
  bullets(s, [
    "Capture & sensors — quality is a first-class input.",
    "Data intelligence — session objects, identity binding, longitudinal stores.",
    "Model infrastructure — training, evaluation, versioning, promotion gates.",
    "Computer vision — detect, track, pose/action, evidence extraction.",
    "AI interpretation — contextual estimates, not universal scores.",
    "Confidence & evidence — every score carries a traceable pack.",
    "MLOps & orchestration — pipelines, monitoring, rollback.",
    "Governed AI services — the commercial interface that inherits policy.",
  ]);
}

// 06
{
  const s = pptx.addSlide();
  addBase(s, 6, "From data to intelligence");
  title(s, "AI proposes. People decide.");
  bullets(s, [
    "Evidence → Validation → AI → Confidence → Human decision.",
    "No score without evidence.",
    "No evidence without capture quality.",
    "No production promotion without benchmark, calibration and field validation.",
    "SPORTIX AI is not designed to autonomously select or reject athletes.",
  ]);
}

// 07
{
  const s = pptx.addSlide();
  addBase(s, 7, "SPORTIX Ecosystem");
  title(s, "A continuous sports system — not a feature list.");
  card(s, 0.55, 2.15, 4.0, 4.5, "Identity & participation", "SPORT ID\nGO SPORTIX\nMatch / Activity Rooms\nCommunity");
  card(s, 4.7, 2.15, 4.0, 4.5, "Intelligence & development", "SPORTIX Vision\nSmart Evaluation\nSmart Coaching\nTalent Discovery");
  card(s, 8.85, 2.15, 3.95, 4.5, "Commerce & institutions", "Rewards\nMarketplace\nPartners / Sponsors\nClubs · Academies · Venues");
}

// 08
{
  const s = pptx.addSlide();
  addBase(s, 8, "Athlete user journey");
  title(s, "The app loop. Not the career pathway.");
  bullets(s, [
    "Connect → Build SPORT ID → Discover / Join → Play / Train → Verify → Record → Understand → Progress → Reward → Recognize → Optional share → Redeem → Return.",
    "Intelligence loop: Participation → Verified evidence → SPORT ID → AI-enabled insight → Opportunity / reward → Motivation → More participation.",
    "SPORT ID is the spine of the product loop.",
  ]);
}

// 09
{
  const s = pptx.addSlide();
  addBase(s, 9, "Athlete development pathway");
  title(s, "School to national team — one identity underneath.");
  bullets(s, [
    "School → Academy → Club → Federation → National Team.",
    "This is the institutional pathway. It is not the app journey.",
    "SPORT ID + SPORTIX AI are designed as the continuity layer. Institutions change. The record does not reset.",
  ]);
}

// 10
{
  const s = pptx.addSlide();
  addBase(s, 10, "Football talent intelligence");
  title(s, "Sensing load must match the environment.");
  card(s, 0.55, 2.15, 4.0, 3.6, "Schools — cameras first", "Vision is primary. Foot sensors only for shortlisted candidates. No GNSS, UWB, smart balls or insoles on every student.");
  card(s, 4.7, 2.15, 4.0, 3.6, "Academies — development", "Vision + foot nodes + body GNSS / IMU. Optional UWB / LPS. Longitudinal development.");
  card(s, 8.85, 2.15, 3.95, 3.6, "Pro clubs — redundant fusion", "Vision + body + foot + UWB / LPS + optional specialist sensors.");
  s.addText("There is no universal player score. Evaluation = PLAYER × ROLE × GAME MODEL × OPPONENT × PHASE × CONTEXT × DEVELOPMENT STAGE.", {
    x: 0.55,
    y: 5.9,
    w: 12.2,
    h: 0.9,
    fontSize: 14,
    fontFace: "Arial",
    color: FG,
  });
}

// 11
{
  const s = pptx.addSlide();
  addBase(s, 11, "SPORTIX Computer Vision");
  title(s, "An evidence factory. Not an autonomous selector.");
  bullets(s, [
    "Capture → Quality → Detect → Track → Pose / Action → Extract evidence → Measure → Estimate confidence → AI interpretation → Human review → Outcome feedback.",
    "If capture quality fails, interpretation does not proceed as elite evidence.",
    "Models do not select or reject athletes. Coaches, scouts and officials remain on the path.",
  ]);
}

// 12
{
  const s = pptx.addSlide();
  addBase(s, 12, "Sensor innovation");
  title(s, "Physical nodes. Same intelligence core.");
  card(s, 0.55, 2.15, 6.0, 4.5, "Football — three-level sensing", "Hardware follows the question being asked. Not a uniform kit. Engineering specification. Validation required.");
  card(s, 6.75, 2.15, 6.0, 4.5, "SPORTIX Padel Sensor — proposed", "Sensor → Session → SPORTIX App → AI Gateway → Vision + sensor fusion → Evidence → SPORT ID / community / rewards / partner value.\nNot manufactured. Not field-validated.");
}

// 13
{
  const s = pptx.addSlide();
  addBase(s, 13, "Yalla Hayyihom");
  title(s, "Fan, visitor and experience intelligence.");
  s.addImage({ path: yhh, x: 10.6, y: 0.7, w: 2.1, h: 2.1 });
  bullets(s, [
    "Sibling application of SPORTIX AI SYSTEMS. Distinct brand. Shared evidence, identity and trust rules.",
    "Events, culture, tourism, destinations, mobility, community, rewards, memory.",
    "Cultural Passport and Experience Map are retention instruments, not badges for sale.",
  ]);
}

// 14
{
  const s = pptx.addSlide();
  addBase(s, 14, "Visitor journey");
  title(s, "The visit is a lifecycle. Not a ticket scan.");
  bullets(s, [
    "Discover → Connect / Ticket → Know me → Plan → Travel ready → Arrive → Navigate → Experience → Explore → Participate → Verify → Stamp → Reward → Capture → Remember → Share → Next adventure → Return.",
    "Open / non-ticketed locations: geofence may confirm arrival.",
    "Ticketed / controlled-entry venues: ENTRY_VERIFIED must come from the authorised ticketing / access-control system. GPS alone does not prove entry at a gated venue.",
  ]);
}

// 15
{
  const s = pptx.addSlide();
  addBase(s, 15, "Cultural Passport");
  title(s, "Verified presence becomes memory — then return.");
  bullets(s, [
    "Cultural Passport — stamps earned, not badges bought.",
    "Experience Map — personalised discovery across events, neighbourhoods, heritage and partner places.",
    "Verified visits, memories, rewards, event community, personalised journeys, post-event retention.",
  ]);
}

// 16
{
  const s = pptx.addSlide();
  addBase(s, 16, "SPORTIX AI Security Systems");
  title(s, "Trust is a roadmap. Not a spin-out.");
  s.addImage({ path: sec, x: 9.6, y: 0.55, w: 3.2, h: 1.1 });
  bullets(s, [
    "Phase 1 — Embedded Security inside SPORTIX and Yalla Hayyihom.",
    "Phase 2 — Shared Security Infrastructure.",
    "Phase 3 — Enterprise Digital Trust.",
    "Phase 4 — Potential B2B commercialization. Not existing revenue. Not a day-one P&L.",
    "Built first to secure the ecosystem. Commercialized only when capability and market readiness justify it.",
  ], 2.0);
}

// 17
{
  const s = pptx.addSlide();
  addBase(s, 17, "Commercial engine");
  title(s, "Several engines. Two applications. One core.");
  card(s, 0.55, 2.15, 6.0, 4.5, "SPORTIX", "B2C / B2B subscriptions\nEnterprise contracts\nVenue & booking\nMarketplace commissions\nAI / analytics services\nSponsorship programs (B2C, B2B, B2G-linked)\nNative sponsored posts, challenges, offers, activations");
  card(s, 6.75, 2.15, 6.0, 4.5, "YALLA HAYYIHOM", "Booking / marketplace commissions\nPartner campaigns and featured placements\nSponsorship and referral revenue\nTravel / mobility / hospitality referrals\nInstitutional dashboards\nB2B / government contracts\nEvent activation packages");
}

// 18
{
  const s = pptx.addSlide();
  addBase(s, 18, "Who pays");
  title(s, "Value is collected where the system creates it.");
  bullets(s, [
    "B2C — athletes, fans, visitors: subscriptions, bookings, marketplace.",
    "B2B — clubs, academies, venues: software, dashboards, AI/analytics.",
    "Institutional / federation: enterprise contracts, pathway intelligence.",
    "B2G / destination operators: dashboards, event packages, visitor intelligence.",
    "Sponsors: programs, activations, native posts — verified audiences.",
    "Partners: commissions, featured placements, referrals.",
    "Designed commercial map. Not a statement of current contracted revenue.",
  ]);
}

// 19
{
  const s = pptx.addSlide();
  addBase(s, 19, "Platform flywheel");
  title(s, "Participation is the raw material. Intelligence is the product.");
  bullets(s, [
    "Participation → Data → Intelligence → Value → Revenue → Growth → Participation.",
    "The flywheel only turns if evidence remains honest. Fake scores break the loop.",
  ]);
}

// 20
{
  const s = pptx.addSlide();
  addBase(s, 20, "IP & defensibility");
  title(s, "Architecture, data, network — then patents, carefully.");
  bullets(s, [
    "97 identified invention themes / patent candidates. Not 97 patents. Not filed. Not granted.",
    "Patent vs trade secret vs software/copyright vs data/model know-how vs brand/trademark.",
    "Claim charts, model weights and sensitive algorithms are withheld from this portfolio.",
  ]);
}

// 21
{
  const s = pptx.addSlide();
  addBase(s, 21, "Current stage");
  title(s, "Founding / pre-launch execution.");
  card(s, 0.55, 2.15, 6.0, 4.5, "Significant work completed in", "Product vision and architecture\nTechnical architecture and engineering specifications\nUser journeys and prototypes\nRevenue models and integration architecture\nAI / CV design and sensor architecture\nIP landscape and patent candidates\nPilot, validation and commercialization planning");
  card(s, 6.75, 2.15, 6.0, 4.5, "Not claimed", "All AI models trained\nAll systems production-deployed\nHardware manufactured / certified\nCompleted operational pilots as traction\nNamed major partnerships unless evidenced\nPatents filed or granted\nPhase-4 security revenue");
}

// 22
{
  const s = pptx.addSlide();
  addBase(s, 22, "Execution roadmap");
  title(s, "Each gate is evidence. Not a date on a slide.");
  bullets(s, [
    "Build → Validate → Pilot → Revenue → Scale.",
    "Workstreams: Product, Intelligence, Trust, Commercial, IP.",
    "Models do not skip the validation gate. Phase 4 security stays gated.",
  ]);
}

// 23
{
  const s = pptx.addSlide();
  addBase(s, 23, "Saudi → GCC → Global");
  title(s, "Built for this environment. Designed to leave it.");
  bullets(s, [
    "Saudi Arabia is the launch environment and strategic proving ground.",
    "Designed to support, and potentially aligned with, Vision 2030 and World Cup 2034 readiness — not an official endorsement.",
    "GCC expansion is earned from Saudi evidence.",
    "Global scale follows environments that look like the original proving ground.",
  ]);
}

// 24
{
  const s = pptx.addSlide();
  s.background = { color: BG };
  s.addText("CLOSING", {
    x: 0.55,
    y: 1.6,
    w: 12,
    h: 0.3,
    fontSize: 12,
    fontFace: "Arial",
    color: LIME,
    bold: true,
    charSpacing: 3,
  });
  s.addText("Built in Saudi Arabia.\nDesigned for global scale.", {
    x: 0.55,
    y: 2.1,
    w: 12,
    h: 1.8,
    fontSize: 36,
    fontFace: "Arial",
    color: FG,
    bold: true,
  });
  s.addText(
    "One intelligence core. Multiple market applications. Multiple revenue engines.\nThe pitch deck argues for the investment. This portfolio shows the system.",
    {
      x: 0.55,
      y: 4.1,
      w: 12,
      h: 1.1,
      fontSize: 16,
      fontFace: "Arial",
      color: MUTED,
    },
  );
  s.addImage({ path: intel, x: 0.55, y: 5.6, w: 1.6, h: 1.3 });
  s.addImage({ path: yhh, x: 2.4, y: 5.55, w: 1.15, h: 1.4 });
  s.addImage({ path: sec, x: 3.8, y: 5.85, w: 2.2, h: 0.85 });
  s.addText("24 / 24", {
    x: 10.6,
    y: 7.12,
    w: 2.2,
    h: 0.22,
    fontSize: 10,
    fontFace: "Arial",
    color: MUTED,
    align: "right",
  });
}

await pptx.writeFile({ fileName: OUT });
console.log("wrote", OUT);
