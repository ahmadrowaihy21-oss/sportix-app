export type Claim = {
  claim: string;
  location: string;
  risk: string;
  required: string;
};

export const CLAIMS_REQUIRING_VALIDATION: Claim[] = [
  {
    claim: "97 identified invention themes / patent candidates",
    location: "Slide 20 — IP & Defensibility",
    risk: "The count can be read as a patent portfolio if the qualifier is dropped in conversation.",
    required: "Internal invention-theme register, counsel review, and a decision on which themes remain candidates vs. trade secret.",
  },
  {
    claim: "SPORTIX Padel Sensor as a physical evidence node",
    location: "Slide 12 — Sensor Innovation",
    risk: "Readers may infer a manufactured, certified product.",
    required: "Engineering specification pack, BOM hypothesis, lab protocol. Do not present samples as products until they exist.",
  },
  {
    claim: "Three-level football sensing architecture (schools / academies / pro)",
    location: "Slide 10",
    risk: "May be heard as already instrumented across those environments.",
    required: "Pilot designs, capture-quality benchmarks, and a written policy that schools stay camera-first.",
  },
  {
    claim: "Computer vision loop including pose/action and confidence",
    location: "Slide 11",
    risk: "May be heard as production-grade models already trained and promoted.",
    required: "Benchmark plan, calibration protocol, field-validation gates before any production promotion.",
  },
  {
    claim: "ENTRY_VERIFIED from authorised ticketing / access-control",
    location: "Slide 14",
    risk: "Implies integrations with ticketing vendors that are not contracted.",
    required: "Named integration targets under NDA; no public vendor claims until agreements exist.",
  },
  {
    claim: "Cultural Passport / Experience Map",
    location: "Slide 15",
    risk: "May be heard as a live consumer product.",
    required: "Prototype evidence and a destination pilot design.",
  },
  {
    claim: "Revenue engines (subscriptions, marketplace, sponsorship, B2G)",
    location: "Slides 17–18",
    risk: "A designed map can be mistaken for current revenue.",
    required: "Keep language as designed architecture. Introduce figures only from a financial model under NDA.",
  },
  {
    claim: "Phase 4 potential B2B security commercialization",
    location: "Slide 16",
    risk: "May be modelled as near-term security ARR.",
    required: "Keep Phase 4 gated. Do not put it in a base-case revenue build.",
  },
  {
    claim: "Relevance to Vision 2030 and World Cup 2034 readiness",
    location: "Slide 23",
    risk: "Can be misread as official government alignment or endorsement.",
    required: "Use only the qualified language in the portfolio. No ministry, federation or 2034 marks without evidence.",
  },
  {
    claim: "SPORT ID as a continuity layer from school to national team",
    location: "Slides 8–9",
    risk: "Implies institutional write-access and data-sharing that does not yet exist.",
    required: "Data-governance design, consent model, and pilot institutions before any public continuity claim.",
  },
  {
    claim: "Governed AI services as a commercial interface",
    location: "Slide 05",
    risk: "May be heard as an existing API product.",
    required: "Service catalogue remains target architecture until a versioned interface exists.",
  },
  {
    claim: "Native sponsored posts inside the SPORTIX feed",
    location: "Slide 17",
    risk: "Implies a live audience and an ads stack.",
    required: "Do not present media-kit numbers until there is a real feed and a real audience.",
  },
];

export const NDA_ONLY: { item: string; reason: string }[] = [
  {
    item: "Patent claim charts, draft claims and invention disclosures",
    reason: "Public disclosure can destroy novelty. Candidates are mentioned; charts are not.",
  },
  {
    item: "Model architectures, weights, training recipes and evaluation sets",
    reason: "Core know-how. Belongs in a technical diligence room, not a travelling portfolio.",
  },
  {
    item: "Sensor fusion algorithms, calibration constants, UWB/LPS layouts",
    reason: "Trade secret. The portfolio shows the sensing philosophy, not the method.",
  },
  {
    item: "Named target partners, federations, clubs, venues or ministries",
    reason: "Until evidenced, names create implied endorsement and relationship risk.",
  },
  {
    item: "Full financial model, cap table, use-of-proceeds detail",
    reason: "Lives with the pitch and the data room, not in this architecture portfolio.",
  },
  {
    item: "Security control catalogues, threat models, pentest results",
    reason: "Useful in diligence; harmful if published ahead of a control environment.",
  },
  {
    item: "Personal data schemas, athlete minors policy drafts, consent ledgers",
    reason: "Sensitive by nature. Summarise the principle; share the policy under NDA.",
  },
  {
    item: "Unreleased prototype recordings, athlete footage, visitor traces",
    reason: "Likeness and privacy. No operational evidence is faked or pasted into this deck.",
  },
  {
    item: "Vendor shortlists (ticketing, cloud, GNSS, insole, camera OEMs)",
    reason: "Commercial sensitivity. Architecture is shown; suppliers are not.",
  },
  {
    item: "Detailed 98-component product catalogue",
    reason: "Overwhelms the reader and leaks roadmap. Selected families are enough.",
  },
];
