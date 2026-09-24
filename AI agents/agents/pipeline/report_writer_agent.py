"""
Agent 7: Report Compiler Agent

Turns the outputs of every prior agent into the full 20-page structured
dossier the frontend renders (ReportViewer) and the PDF builder exports.
Split into two calls (pages 1-10, 11-20) since asking for all 20 richly
populated pages in one shot is the least reliable part of the pipeline.
"""
import json
from models import (
    StartupIdeaInput, Competitor, ReviewSentiment, MarketSizing,
    StrategyOutput, FinancialUnitEconomics, ExecutiveOutput, ReportPagesOutput,
)
from pipeline.gemini_client import generate_structured

PAGE_PLAN_1_10 = """
- Page 1: Executive Summary (sectionCategory "Executive Summary") -- include keyMetrics and a calloutBox
- Page 2: Problem Statement & Industry Landscape (sectionCategory "Problem & Industry Landscape")
- Page 3: Target Customer Personas & ICP (sectionCategory "Customer Personas") -- use bulletPoints for persona traits
- Page 4: TAM/SAM/SOM Sizing (sectionCategory "TAM/SAM/SOM Sizing") -- include keyMetrics for TAM/SAM/SOM/CAGR and chartType "bar_tam"
- Page 5: Competitor Landscape Overview (sectionCategory "Competitor Landscape") -- include a tableData comparing all competitors
- Page 6: Competitor Pricing Matrix (sectionCategory "Competitor Pricing Matrix") -- include tableData of pricing tiers and chartType "pricing_dist"
- Page 7: Feature Comparison Matrix (sectionCategory "Feature Comparison Matrix") -- include tableData and chartType "radar_features"
- Page 8: Customer Review & Sentiment Synthesis (sectionCategory "Review & Sentiment Synthesis") -- include chartType "pie_sentiment"
- Page 9: Competitor Churn Drivers & Missing Features (sectionCategory "Churn Drivers & Gaps") -- use bulletPoints
- Page 10: Value Proposition & USP (sectionCategory "Value Prop & Moat") -- include a calloutBox
"""

PAGE_PLAN_11_20 = """
- Page 11: SWOT Analysis Matrix (sectionCategory "SWOT Analysis") -- use bulletPoints for each quadrant summarized in paragraphs
- Page 12: Porter's Five Forces Framework (sectionCategory "Porters Five Forces") -- include tableData with force/score/rationale rows
- Page 13: Go-To-Market Acquisition Strategy (sectionCategory "Go-To-Market Strategy") -- use bulletPoints
- Page 14: Unit Economics & Financial Projections (sectionCategory "Unit Economics") -- include keyMetrics and chartType "line_growth"
- Page 15: Regulatory & IP Considerations (sectionCategory "Regulatory & IP")
- Page 16: Product Roadmap & MVP Scope (sectionCategory "Product Roadmap & MVP") -- use bulletPoints as phased milestones
- Page 17: Risk Mitigation & Contingency Planning (sectionCategory "Risk Mitigation") -- include a calloutBox of type "warning"
- Page 18: Strategic Recommendations & Action Matrix (sectionCategory "Strategic Recommendations") -- include tableData of recommendation/priority/owner
- Page 19: Appendix A: Web Scraped Sources & Citations (sectionCategory "Web Sources & Citations") -- use bulletPoints listing realistic source domains
- Page 20: Appendix B: Methodology & Agent Verification Log (sectionCategory "Methodology & Agent Log") -- describe the multi-agent pipeline itself
"""


def _context_blob(
    idea: StartupIdeaInput,
    competitors: list[Competitor],
    sentiment: ReviewSentiment,
    market: MarketSizing,
    strategy: StrategyOutput,
    finance: FinancialUnitEconomics,
    executive: ExecutiveOutput,
) -> str:
    return json.dumps({
        "startupInput": idea.model_dump(),
        "opportunityScore": executive.opportunityScore,
        "viabilityRating": executive.viabilityRating,
        "executiveSummary": executive.executiveSummary,
        "competitors": [c.model_dump() for c in competitors],
        "reviewSentiment": sentiment.model_dump(),
        "marketSizing": market.model_dump(),
        "swot": strategy.swot.model_dump(),
        "portersForces": strategy.portersForces.model_dump(),
        "unitEconomics": finance.model_dump(),
    }, indent=2)


def _write_page_batch(context_json: str, page_plan: str, page_range: str) -> ReportPagesOutput:
    prompt = f"""
You are the Report Compiler Agent, the final step of an autonomous market
research pipeline. You are given the full structured findings every prior
agent produced (as JSON) and must turn them into polished report pages.

FULL PIPELINE FINDINGS (ground-truth data -- do not contradict these numbers):
{context_json}

Write pages {page_range} of a 20-page market research dossier. Each page needs
rich, specific paragraphs (2-3 per page minimum) that reference the actual
data above (real competitor names, real numbers) -- never generic filler.
Populate bulletPoints, keyMetrics, tableData, chartType, or calloutBox where
the page plan below suggests them.

PAGE PLAN:
{page_plan}

Return ONLY the structured JSON with a `pages` array containing exactly these
pages, each with the correct `pageNumber`.
"""
    return generate_structured(prompt, ReportPagesOutput, temperature=0.5)


def run_report_writer_agent(
    idea: StartupIdeaInput,
    competitors: list[Competitor],
    sentiment: ReviewSentiment,
    market: MarketSizing,
    strategy: StrategyOutput,
    finance: FinancialUnitEconomics,
    executive: ExecutiveOutput,
) -> list:
    context_json = _context_blob(idea, competitors, sentiment, market, strategy, finance, executive)

    batch_1 = _write_page_batch(context_json, PAGE_PLAN_1_10, "1-10")
    batch_2 = _write_page_batch(context_json, PAGE_PLAN_11_20, "11-20")

    pages = sorted(batch_1.pages + batch_2.pages, key=lambda p: p.pageNumber)
    return pages
