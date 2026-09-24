export interface StartupIdeaInput {
  title: string;
  description: string;
  targetIndustry: string;
  targetRegion: string;
  targetPriceRange?: string;
  businessModel: 'B2B' | 'B2C' | 'B2B2C' | 'Marketplace' | 'Hardware/SaaS';
  depthLevel: 'standard' | 'deep_dive' | 'exhaustive_20_page';
}

export interface CompetitorPricingTier {
  name: string;
  price: string;
  billingPeriod: string;
  keyFeatures: string[];
}

export interface Competitor {
  id: string;
  name: string;
  type: 'Direct' | 'Indirect' | 'Emerging' | 'Incumbent';
  website: string;
  description: string;
  estimatedRevenue: string;
  marketSharePct: number;
  pricingModel: string;
  startingPrice: string;
  pricingTiers: CompetitorPricingTier[];
  keyStrengths: string[];
  keyWeaknesses: string[];
  g2Rating: number;
  trustpilotRating: number;
  reviewCount: number;
}

export interface ReviewSentiment {
  source: 'G2' | 'Trustpilot' | 'Reddit' | 'Capterra' | 'ProductHunt';
  sampleCount: number;
  overallPositivePct: number;
  overallNegativePct: number;
  neutralPct: number;
  topLovedFeatures: string[];
  topComplaintsAndPainPoints: string[];
  commonSwitchingTriggers: string[];
  unmetCustomerNeeds: string[];
}

export interface MarketSizing {
  tamValueBillions: number;
  samValueBillions: number;
  somValueMillions: number;
  cagrPercentage: number;
  projectionYears: { year: string; tam: number; sam: number; som: number }[];
  keyDrivers: string[];
  macroRisks: string[];
}

export interface SWOTItem {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface PortersFiveForces {
  buyerPower: { score: number; rationale: string };
  supplierPower: { score: number; rationale: string };
  threatOfNewEntrants: { score: number; rationale: string };
  threatOfSubstitutes: { score: number; rationale: string };
  competitiveRivalry: { score: number; rationale: string };
}

export interface FinancialUnitEconomics {
  targetARPU: string;
  estimatedCAC: string;
  estimatedLTV: string;
  paybackPeriodMonths: number;
  grossMarginPct: number;
  threeYearProjections: {
    year: string;
    users: number;
    revenueMillions: number;
    arrMillions: number;
  }[];
}

export interface ResearchPageContent {
  pageNumber: number;
  title: string;
  sectionCategory:
    | 'Executive Summary'
    | 'Problem & Industry Landscape'
    | 'Customer Personas'
    | 'TAM/SAM/SOM Sizing'
    | 'Competitor Landscape'
    | 'Competitor Pricing Matrix'
    | 'Feature Comparison Matrix'
    | 'Review & Sentiment Synthesis'
    | 'Churn Drivers & Gaps'
    | 'Value Prop & Moat'
    | 'SWOT Analysis'
    | 'Porters Five Forces'
    | 'Go-To-Market Strategy'
    | 'Unit Economics'
    | 'Regulatory & IP'
    | 'Product Roadmap & MVP'
    | 'Risk Mitigation'
    | 'Strategic Recommendations'
    | 'Web Sources & Citations'
    | 'Methodology & Agent Log';
  subheading: string;
  paragraphs: string[];
  bulletPoints?: string[];
  keyMetrics?: { label: string; value: string; badge?: string }[];
  tableData?: { headers: string[]; rows: (string | number)[][] };
  chartType?: 'bar_tam' | 'line_growth' | 'pie_sentiment' | 'radar_features' | 'pricing_dist';
  calloutBox?: { title: string; content: string; type: 'info' | 'warning' | 'success' | 'opportunity' };
}

export interface ResearchReport {
  id: string;
  createdAt: string;
  startupInput: StartupIdeaInput;
  opportunityScore: number; // 0 - 100
  viabilityRating: 'Exceptional' | 'High Potential' | 'Moderate / Niche' | 'High Risk';
  executiveSummary: string;
  competitors: Competitor[];
  reviewSentiment: ReviewSentiment;
  marketSizing: MarketSizing;
  swot: SWOTItem;
  portersForces: PortersFiveForces;
  unitEconomics: FinancialUnitEconomics;
  pages: ResearchPageContent[];
  agentExecutionLog: AgentLogStep[];
  sourcesScrapedCount: number;
  reviewsSynthesizedCount: number;
  pdfDownloadUrl?: string;
}

export interface AgentLogStep {
  id: string;
  timestamp: string;
  phase: 'INIT' | 'WEB_SCRAPE' | 'PRICING_ANALYSIS' | 'REVIEW_SYNTHESIS' | 'MARKET_MODELING' | 'REPORT_GENERATION' | 'COMPLETE';
  title: string;
  detail: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  dataExtracted?: string;
}
