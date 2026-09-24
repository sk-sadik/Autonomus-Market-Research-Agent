"""
Pydantic models mirroring src/types.ts in the frontend EXACTLY (field names,
nesting, camelCase) so responses can be sent straight to the React app
without any transformation.
"""
from __future__ import annotations
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Input
# ---------------------------------------------------------------------------

class StartupIdeaInput(BaseModel):
    title: str
    description: str
    targetIndustry: str = "General Technology"
    targetRegion: str = "Global"
    targetPriceRange: Optional[str] = "Unspecified"
    businessModel: Literal["B2B", "B2C", "B2B2C", "Marketplace", "Hardware/SaaS"] = "B2B"
    depthLevel: Literal["standard", "deep_dive", "exhaustive_20_page"] = "exhaustive_20_page"


# ---------------------------------------------------------------------------
# Competitors
# ---------------------------------------------------------------------------

class CompetitorPricingTier(BaseModel):
    name: str
    price: str
    billingPeriod: str
    keyFeatures: List[str]


class Competitor(BaseModel):
    id: str
    name: str
    type: Literal["Direct", "Indirect", "Emerging", "Incumbent"]
    website: str
    description: str
    estimatedRevenue: str
    marketSharePct: float
    pricingModel: str
    startingPrice: str
    pricingTiers: List[CompetitorPricingTier]
    keyStrengths: List[str]
    keyWeaknesses: List[str]
    g2Rating: float
    trustpilotRating: float
    reviewCount: int


class DiscoveryOutput(BaseModel):
    """Raw output of the Web Intelligence / Discovery agent."""
    competitors: List[Competitor]
    sourcesScrapedCount: int


# ---------------------------------------------------------------------------
# Review sentiment
# ---------------------------------------------------------------------------

class ReviewSentiment(BaseModel):
    # NOTE: no default here on purpose -- the Gemini structured-output API
    # rejects any schema field that carries a "default" value.
    source: str
    sampleCount: int
    overallPositivePct: float
    overallNegativePct: float
    neutralPct: float
    topLovedFeatures: List[str]
    topComplaintsAndPainPoints: List[str]
    commonSwitchingTriggers: List[str]
    unmetCustomerNeeds: List[str]


class ReviewOutput(BaseModel):
    reviewSentiment: ReviewSentiment
    reviewsSynthesizedCount: int


# ---------------------------------------------------------------------------
# Market sizing
# ---------------------------------------------------------------------------

class MarketProjectionYear(BaseModel):
    year: str
    tam: float
    sam: float
    som: float


class MarketSizing(BaseModel):
    tamValueBillions: float
    samValueBillions: float
    somValueMillions: float
    cagrPercentage: float
    projectionYears: List[MarketProjectionYear]
    keyDrivers: List[str]
    macroRisks: List[str]


# ---------------------------------------------------------------------------
# SWOT / Porter's Five Forces
# ---------------------------------------------------------------------------

class SWOTItem(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    opportunities: List[str]
    threats: List[str]


class ForceScore(BaseModel):
    score: float
    rationale: str


class PortersFiveForces(BaseModel):
    buyerPower: ForceScore
    supplierPower: ForceScore
    threatOfNewEntrants: ForceScore
    threatOfSubstitutes: ForceScore
    competitiveRivalry: ForceScore


class StrategyOutput(BaseModel):
    swot: SWOTItem
    portersForces: PortersFiveForces


# ---------------------------------------------------------------------------
# Unit economics
# ---------------------------------------------------------------------------

class YearProjection(BaseModel):
    year: str
    users: int
    revenueMillions: float
    arrMillions: float


class FinancialUnitEconomics(BaseModel):
    targetARPU: str
    estimatedCAC: str
    estimatedLTV: str
    paybackPeriodMonths: float
    grossMarginPct: float
    threeYearProjections: List[YearProjection]


# ---------------------------------------------------------------------------
# Executive summary
# ---------------------------------------------------------------------------

class ExecutiveOutput(BaseModel):
    opportunityScore: float = Field(ge=0, le=100)
    viabilityRating: Literal["Exceptional", "High Potential", "Moderate / Niche", "High Risk"]
    executiveSummary: str


# ---------------------------------------------------------------------------
# Report pages
# ---------------------------------------------------------------------------

# NOTE: none of the Optional fields below carry a "= None" default. The
# Gemini structured-output API rejects any schema field with a "default"
# value (including an implicit None default), so every field the
# report-writer agent's schema touches must be declared as required-but-
# nullable instead. Gemini will emit `null` for fields that don't apply to
# a given page, which round-trips through Pydantic fine since the type is
# still Optional[...].

class KeyMetric(BaseModel):
    label: str
    value: str
    badge: Optional[str]


class TableData(BaseModel):
    headers: List[str]
    rows: List[List[str]]


class CalloutBox(BaseModel):
    title: str
    content: str
    type: Literal["info", "warning", "success", "opportunity"]


class ResearchPageContent(BaseModel):
    pageNumber: int
    title: str
    sectionCategory: str
    subheading: str
    paragraphs: List[str]
    bulletPoints: Optional[List[str]]
    keyMetrics: Optional[List[KeyMetric]]
    tableData: Optional[TableData]
    chartType: Optional[Literal[
        "bar_tam", "line_growth", "pie_sentiment", "radar_features", "pricing_dist"
    ]]
    calloutBox: Optional[CalloutBox]


class ReportPagesOutput(BaseModel):
    pages: List[ResearchPageContent]


# ---------------------------------------------------------------------------
# Agent execution log (drives the AgentPipelineConsole UI)
# ---------------------------------------------------------------------------

class AgentLogStep(BaseModel):
    id: str
    timestamp: str
    phase: Literal[
        "INIT", "WEB_SCRAPE", "PRICING_ANALYSIS", "REVIEW_SYNTHESIS",
        "MARKET_MODELING", "REPORT_GENERATION", "COMPLETE",
    ]
    title: str
    detail: str
    status: Literal["pending", "in_progress", "completed", "failed"]
    dataExtracted: Optional[str] = None


# ---------------------------------------------------------------------------
# Final assembled report (== ResearchReport in types.ts)
# ---------------------------------------------------------------------------

class ResearchReport(BaseModel):
    id: str
    createdAt: str
    startupInput: StartupIdeaInput
    opportunityScore: float
    viabilityRating: str
    executiveSummary: str
    competitors: List[Competitor]
    reviewSentiment: ReviewSentiment
    marketSizing: MarketSizing
    swot: SWOTItem
    portersForces: PortersFiveForces
    unitEconomics: FinancialUnitEconomics
    pages: List[ResearchPageContent]
    agentExecutionLog: List[AgentLogStep]
    sourcesScrapedCount: int
    reviewsSynthesizedCount: int


class AnalyzeResponse(BaseModel):
    success: bool
    report: Optional[ResearchReport] = None
    error: Optional[str] = None
    details: Optional[str] = None