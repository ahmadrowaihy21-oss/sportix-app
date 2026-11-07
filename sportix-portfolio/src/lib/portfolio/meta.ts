export type SlideId =
  | "cover"
  | "big-idea"
  | "why"
  | "ecosystem-map"
  | "ai-systems"
  | "data-to-intelligence"
  | "sportix-ecosystem"
  | "athlete-journey"
  | "athlete-pathway"
  | "football-talent"
  | "computer-vision"
  | "sensor-innovation"
  | "yalla-hayyihom"
  | "visitor-journey"
  | "cultural-passport"
  | "security"
  | "commercial"
  | "who-pays"
  | "flywheel"
  | "ip"
  | "stage"
  | "roadmap"
  | "expansion"
  | "close";

export type SlideMeta = {
  id: SlideId;
  n: number;
  title: string;
  kicker: string;
  objective: string;
  message: string;
  source: string;
  visual: string;
};

export const SLIDES: SlideMeta[] = [
  {
    id: "cover",
    n: 1,
    title: "Cover",
    kicker: "SPORTIX AI",
    objective: "Establish brand, classification and the portfolio’s purpose in one glance.",
    message: "Intelligence infrastructure for sports, fans and experiences.",
    source: "Brand system; founding / pre-launch execution stage as specified.",
    visual: "Cinematic stadium plate, official SPORTIX AI SYSTEMS mark, three brand lockups.",
  },
  {
    id: "big-idea",
    n: 2,
    title: "The Big Idea",
    kicker: "Corporate architecture",
    objective: "Show one company with multiple applications — not four startups.",
    message: "One intelligence core. Multiple market applications. Multiple revenue engines.",
    source: "Master structure: SPORTIX AI → Systems, Ecosystem, Yalla Hayyihom, Security.",
    visual: "Center node with four distinct brand applications.",
  },
  {
    id: "why",
    n: 3,
    title: "Why This Exists",
    kicker: "The problem",
    objective: "Make the fragmentation of athlete and visitor journeys felt, then name the continuity layer.",
    message: "Identity, evidence and intelligence are disconnected. SPORTIX AI is designed as the layer that holds them together.",
    source: "Athlete and visitor journey specifications.",
    visual: "Two broken journeys, one unifying spine.",
  },
  {
    id: "ecosystem-map",
    n: 4,
    title: "Master Ecosystem Map",
    kicker: "Architecture",
    objective: "Map the four operating layers and how they share one core.",
    message: "SPORTIX AI SYSTEMS sits underneath every application. Security is progressive, not a day-one spin-out.",
    source: "Master structure and security roadmap.",
    visual: "Four-pillar architecture with shared core and security envelope.",
  },
  {
    id: "ai-systems",
    n: 5,
    title: "SPORTIX AI SYSTEMS",
    kicker: "Intelligence core",
    objective: "Show the designed intelligence stack without claiming production deployment.",
    message: "The parent company commercialises applications. The core is a governed intelligence layer.",
    source: "Core intelligence layer specification.",
    visual: "Layered stack from capture to governed services.",
  },
  {
    id: "data-to-intelligence",
    n: 6,
    title: "From Data to Intelligence",
    kicker: "Decision architecture",
    objective: "Prove the evidence-first philosophy and the human decision terminal.",
    message: "No score without evidence. AI supports the human decision; it does not replace it.",
    source: "Evidence → validation → AI → confidence → human decision loop.",
    visual: "Horizontal evidence pipeline with a human review gate.",
  },
  {
    id: "sportix-ecosystem",
    n: 7,
    title: "SPORTIX Ecosystem",
    kicker: "Sports intelligence",
    objective: "Show selected product depth without a 98-box catalogue.",
    message: "A continuous participation, identity, development, community and commerce ecosystem.",
    source: "Selected capability families from the ecosystem specification.",
    visual: "Three families: identity & play, intelligence & development, commerce & partners.",
  },
  {
    id: "athlete-journey",
    n: 8,
    title: "Athlete User Journey",
    kicker: "SPORTIX app",
    objective: "Show the real app loop, distinct from the long-term development pathway.",
    message: "SPORT ID is the continuity object inside a closed motivation loop.",
    source: "Master user loop: Connect → … → Return.",
    visual: "Phased loop with SPORT ID as the spine.",
  },
  {
    id: "athlete-pathway",
    n: 9,
    title: "Athlete Development Pathway",
    kicker: "Long-term pathway",
    objective: "Separate the institutional pathway from the app journey.",
    message: "SPORT ID + SPORTIX AI are designed as the continuity layer from school to national team.",
    source: "School → Academy → Club → Federation → National Team.",
    visual: "Linear pathway over a persistent identity bar.",
  },
  {
    id: "football-talent",
    n: 10,
    title: "Football Talent Intelligence",
    kicker: "Sensing architecture",
    objective: "Show three sensing loads and the contextual evaluation thesis.",
    message: "There is no universal player score. Sensing load must match the environment.",
    source: "Schools / academies / pro clubs sensing architecture.",
    visual: "Three-column sensing stack plus evaluation formula.",
  },
  {
    id: "computer-vision",
    n: 11,
    title: "SPORTIX Computer Vision",
    kicker: "Evidence-first vision",
    objective: "Present the CV loop as an evidence factory, not an autonomous selector.",
    message: "No production promotion without benchmark, calibration and field validation.",
    source: "Capture → … → outcome feedback loop.",
    visual: "Eleven-step evidence loop.",
  },
  {
    id: "sensor-innovation",
    n: 12,
    title: "SPORTIX Sensor Innovation",
    kicker: "Selected case studies",
    objective: "Show football sensing logic and the proposed padel evidence node without overclaiming manufacture.",
    message: "Physical sensors are evidence nodes inside the same intelligence core — proposed, not yet manufactured.",
    source: "Football three-level sensing; SPORTIX Padel Sensor case study.",
    visual: "Two case panels with a shared fusion path.",
  },
  {
    id: "yalla-hayyihom",
    n: 13,
    title: "Yalla Hayyihom",
    kicker: "Experience intelligence",
    objective: "Introduce YHH as a sibling application of the same intelligence core.",
    message: "Fan, visitor and experience intelligence — culture, events, tourism, mobility and memory.",
    source: "Yalla Hayyihom positioning and capability clusters.",
    visual: "Official YHH mark with capability constellation.",
  },
  {
    id: "visitor-journey",
    n: 14,
    title: "Visitor Journey",
    kicker: "YHH lifecycle",
    objective: "Show the complete visitor loop and the attendance verification rule.",
    message: "GPS may confirm arrival at open sites. Gated venues require authorised entry verification.",
    source: "Discover → … → Return journey; attendance rule.",
    visual: "Phased visitor lifecycle with a verification callout.",
  },
  {
    id: "cultural-passport",
    n: 15,
    title: "Cultural Passport & Experience Intelligence",
    kicker: "Culture + tourism",
    objective: "Make Cultural Passport and Experience Map tangible as retention instruments.",
    message: "Verified presence becomes memory, reward and the reason to return.",
    source: "Cultural Passport, Experience Map, post-event retention.",
    visual: "Passport metaphor + discovery map, gold/emerald register.",
  },
  {
    id: "security",
    n: 16,
    title: "SPORTIX AI Security Systems",
    kicker: "Digital trust",
    objective: "Present security as a progressive capability, not a live B2B P&L.",
    message: "Built first to secure the ecosystem. Commercialised only when capability and market readiness justify it.",
    source: "Four-phase security roadmap.",
    visual: "Phase ladder with four trust domains.",
  },
  {
    id: "commercial",
    n: 17,
    title: "Commercial Engine",
    kicker: "How value is created",
    objective: "Show several revenue engines and separate native ads from corporate sponsorship.",
    message: "Multiple engines, two applications, one core — subscriptions, marketplace, AI services, sponsorship and activations.",
    source: "SPORTIX and YHH revenue families.",
    visual: "Twin commercial stacks with a native-vs-strategic callout.",
  },
  {
    id: "who-pays",
    n: 18,
    title: "Who Pays",
    kicker: "Demand map",
    objective: "Make the payer landscape explicit across B2C, B2B, B2G, sponsors and partners.",
    message: "Value is collected from the people who use the system and the institutions that need the intelligence.",
    source: "Payer categories specified for both applications.",
    visual: "Payer × offer matrix.",
  },
  {
    id: "flywheel",
    n: 19,
    title: "Platform Flywheel",
    kicker: "Compounding system",
    objective: "Show why the architecture can scale without looking like a collection of apps.",
    message: "Participation creates evidence. Evidence creates intelligence. Intelligence creates value, revenue and more participation.",
    source: "Participation → data → intelligence → value → revenue → growth.",
    visual: "Six-node flywheel around the intelligence core.",
  },
  {
    id: "ip",
    n: 20,
    title: "IP & Defensibility",
    kicker: "Protection mix",
    objective: "Present the IP landscape with qualified language and a mixed-protection strategy.",
    message: "Defensibility is architecture, data, network effects and a mixed IP strategy — not a patent count headline.",
    source: "97 identified invention themes / patent candidates; patent vs trade secret vs copyright vs know-how vs brand.",
    visual: "Five-layer protection mix plus invention-theme framing.",
  },
  {
    id: "stage",
    n: 21,
    title: "Current Stage",
    kicker: "Honesty of maturity",
    objective: "Separate completed design work from validation gates.",
    message: "Founding / pre-launch execution stage. Significant design is complete. Production claims are not.",
    source: "Completed work vs explicitly excluded claims.",
    visual: "Two-column maturity ledger.",
  },
  {
    id: "roadmap",
    n: 22,
    title: "Execution Roadmap",
    kicker: "How it gets built",
    objective: "Show a disciplined path from build to scale without fake dates.",
    message: "Build → validate → pilot → revenue → scale. Each gate is evidence, not a slide.",
    source: "Execution pathway specified for the portfolio.",
    visual: "Five-stage roadmap with workstreams.",
  },
  {
    id: "expansion",
    n: 23,
    title: "Saudi → GCC → Global",
    kicker: "Expansion thesis",
    objective: "Position Saudi Arabia as launch environment and proving ground, not as an official endorsement.",
    message: "Designed for environments such as Vision 2030 and World Cup 2034 readiness — then GCC, then global sport and experience markets.",
    source: "Saudi launch environment; Vision 2030 / 2034 themes, carefully qualified.",
    visual: "Three-ring expansion with civic plate.",
  },
  {
    id: "close",
    n: 24,
    title: "Closing",
    kicker: "Invitation",
    objective: "Leave the reader with the thesis and a reason for a second meeting.",
    message: "Built in Saudi Arabia. Designed for global scale. The depth is in the system, not in the pitch.",
    source: "Closing statement specified for the portfolio.",
    visual: "Quiet closing field, official marks, next-discussion prompt.",
  },
];

export const SLIDE_COUNT = SLIDES.length;
