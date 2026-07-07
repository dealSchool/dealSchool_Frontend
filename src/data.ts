import { JourneyStage, Mentor, MemoPage } from "./types";

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: "stage-1",
    num: "P1",
    title: "Phase 1 — The Ecosystem",
    duration: "Weeks 1 - 2",
    summary: "Build the map before evaluating deals. Understand startups, markets and venture ecosystems.",
    focusAreas: ["Understanding VC Fund Math", "Venture Economics", "Market Landscapes"],
    skillsAcquired: ["Eco-Mapping", "Sizing Paradigms", "Venture Dynamics"]
  },
  {
    id: "stage-2",
    num: "P2",
    title: "Phase 2 — Screening & Evaluation",
    duration: "Weeks 3 - 4",
    summary: "Shadow real pitch calls. Develop screening instincts. Learn how investors evaluate opportunities.",
    focusAreas: ["Shadowing Pitch Calls", "Screening Metrics", "Opportunity Assessments"],
    skillsAcquired: ["Metric Auditing", "screening instincts", "evaluation models"]
  },
  {
    id: "stage-3",
    num: "P3",
    title: "Phase 3 — The Founder Side",
    duration: "Weeks 5 - 6",
    summary: "Understand founders deeply. Shift from evaluating decks to evaluating people.",
    focusAreas: ["Founder Conversations", "Qualitative Sizing", "Undercurrent Triggers"],
    skillsAcquired: ["Founder Assessment", "Reference Checking", "Team Calibration"]
  },
  {
    id: "stage-4",
    num: "P4",
    title: "Phase 4 — Due Diligence & Deal Mechanics",
    duration: "Weeks 7 - 10",
    summary: "The work between the pitch and the investment. Deep dive into diligence and deal structures.",
    focusAreas: ["Data room audits", "Term sheet analysis", "Waterfall payouts"],
    skillsAcquired: ["Due Diligence", "diligence sheets", "deal frameworks"]
  },
  {
    id: "stage-5",
    num: "W10",
    title: "Week 10 — The Experience",
    duration: "Week 10",
    summary: "Something you'll have to experience for yourself. Details available inside the brochure.",
    focusAreas: ["Brochure Material", "Active Simulations", "Live Presentations"],
    skillsAcquired: ["Venture Immersion", "Experience Day", "Brochure Access"]
  }
];

export interface FounderProfile {
  name: string;
  role: string;
  background: string[];
  companies: string[];
  investments: string[];
  community: string;
  education: string[];
}

export const FOUNDERS_DATA: FounderProfile[] = [
  {
    name: "Rishab Agrawal",
    role: "",
    background: [],
    companies: [],
    investments: [],
    community: "",
    education: []
  },
  {
    name: "Tusshaar Chawla",
    role: "",
    background: [],
    companies: [],
    investments: [],
    community: "",
    education: []
  }
];

export const MENTORS: Mentor[] = [
  {
    name: "Vikram Middha",
    role: "Founding Partner",
    firm: "Middha Ventures",
    background: "Ex-Venture Partner at Lightspeed Alpha, early investor in 3 Decacorns. Stanford MBA.",
    monochromeImage: "VM",
    details: "Vikram founded Middha Ventures to bridge the gap between high-potential professional talent and venture funding frameworks. He has personally deployed over India, UK & Singapore channels."
  },
  {
    name: "Elena Rostova",
    role: "General Partner",
    firm: "Apex Capital (ex-Sequoia)",
    background: "Specialist in DeepTech & AI Orchestration. Former researcher at Cambridge Automation Lab.",
    monochromeImage: "ER",
    details: "Elena spent 6 years at leading global VC firms directing hardware & autonomous systems practices. She has served on 14 boards and represents technical due diligence at its highest caliber."
  },
  {
    name: "Marcus Vance",
    role: "Venture Partner",
    firm: "Middha Ventures (Founder of CloudScale)",
    background: "Founding engineer, scaled CloudScale to a $1.2B IPO. Technical Architect of repute.",
    monochromeImage: "MV",
    details: "Marcus advises DealSchool fellows on code safety, infrastructure costs, and raw API evaluations. He helps analysts look beyond the slide deck and straight into a company's production code."
  },
  {
    name: "Dr. Aris Thorne",
    role: "Director of Research",
    firm: "Biotech Frontier Partners",
    background: "MD/PhD, ex-MIT Media Lab. Invests exclusively in biological software and climate platforms.",
    monochromeImage: "AT",
    details: "Aris teaches the mechanics of life sciences and regulatory-moat startups. He acts as our reference for complex FDA processes, clinical data auditing, and computational biology stacks."
  }
];

export const MEMO_SUB_PAGES: MemoPage[] = [
  {
    title: "The Core Problem Statement",
    tag: "Problem Analysis",
    content: "An investment cannot exist without a severe, structural pain point. Modern investment memos must isolate why general solutions fail, quantifying the operational drag caused by the current paradigm.",
    evidence: [
      "Target audience experiences acute, recurring operational failure.",
      "Regulatory changes create compliance emergencies.",
      "The legacy system imposes high coordination taxes."
    ],
    metricLabel: "Average Legacy Drag",
    metricVal: "40% cost friction"
  },
  {
    title: "Market Size & Expansion Dynamics",
    tag: "TAM & Dynamics",
    content: "Forget passive industry estimates. Rigorous venture analysis requires a bottom-up evaluation: Average revenue per corporate user scaled across verifiable, high-intent customer counts.",
    evidence: [
      "Calculated TAM via contract sizes (ACV) rather than generic reports.",
      "Identified adjacent expansion channels (SAM) within 18 months.",
      "Confirmed regulatory catalysts that accelerate early adoption curves."
    ],
    metricLabel: "Validated Bottom-Up TAM",
    metricVal: "$12.4 Billion"
  },
  {
    title: "Competitive Moating",
    tag: "Defensibility Moat",
    content: "Startups always face competition. We look for 'asymmetric advantages'—whether deep technical complexity, data feedback loops, or API-level integration locks that prevent customer switching.",
    evidence: [
      "Proprietary compiler modifications or physical patent protections.",
      "Workflow software locking in key decision-makers.",
      "Data integration nodes that become self-reinforcing over time."
    ],
    metricLabel: "Integration Sticky-LTV",
    metricVal: "7.8x CAC Standard"
  },
  {
    title: "The Conviction Verdict",
    tag: "Investment Decision",
    content: "The thesis combines diligence findings into a definitive underwriting action. Under what pricing, deal size, and ownership targets does this startup return the overall fund size?",
    evidence: [
      "Priced at a reasonable post-money multiple relative to actual ARR.",
      "Co-invested alongside Tier-1 lead institutional partners.",
      "Structured with clean governance controls and liquidation preferences."
    ],
    metricLabel: "Target IRR Profile",
    metricVal: "35% annualized Return"
  }
];


