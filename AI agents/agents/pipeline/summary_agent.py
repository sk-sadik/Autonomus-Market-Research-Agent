"""
Agent 6: Executive Assessment Agent

The last analytical agent -- looks at everything the pipeline has produced
and issues the final Opportunity Score, Viability Rating, and Executive
Summary. Deliberately runs last so its verdict is grounded in real data
rather than a first impression.
"""
from models import (
    StartupIdeaInput, Competitor, ReviewSentiment, MarketSizing,
    StrategyOutput, FinancialUnitEconomics, ExecutiveOutput,
)
from pipeline.gemini_client import generate_structured


def run_summary_agent(
    idea: StartupIdeaInput,
    competitors: list[Competitor],
    sentiment: ReviewSentiment,
    market: MarketSizing,
    strategy: StrategyOutput,
    finance: FinancialUnitEconomics,
) -> ExecutiveOutput:
    prompt = f"""
You are the Executive Assessment Agent, the final analytical step of an
autonomous market research pipeline. Synthesize ALL findings below into a
final investment verdict.

STARTUP IDEA: {idea.title} -- {idea.description}

FINDINGS:
- {len(competitors)} competitors identified, top player: {competitors[0].name if competitors else 'N/A'}
  ({competitors[0].marketSharePct if competitors else 0}% share)
- Customer sentiment: {sentiment.overallPositivePct}% positive / {sentiment.overallNegativePct}% negative
- Unmet needs: {', '.join(sentiment.unmetCustomerNeeds[:3])}
- Market: TAM ${market.tamValueBillions}B, SOM ${market.somValueMillions}M, CAGR {market.cagrPercentage}%
- SWOT opportunities: {', '.join(strategy.swot.opportunities[:2])}
- SWOT threats: {', '.join(strategy.swot.threats[:2])}
- Competitive rivalry score: {strategy.portersForces.competitiveRivalry.score}/5
- Unit economics: CAC {finance.estimatedCAC}, LTV {finance.estimatedLTV}, payback {finance.paybackPeriodMonths}mo

TASK:
- opportunityScore: 0-100, weighing market size/growth, competitive intensity,
  unit economics health, and unmet-need strength
- viabilityRating: one of "Exceptional", "High Potential", "Moderate / Niche",
  "High Risk" -- consistent with the score
- executiveSummary: a punchy 3-4 sentence paragraph covering market size,
  incumbent flaws/gaps this idea can exploit, and the core investment thesis

Return ONLY the structured JSON.
"""
    return generate_structured(prompt, ExecutiveOutput, temperature=0.3)
