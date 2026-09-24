"""
Agent 4: Strategic Positioning Agent (SWOT + Porter's Five Forces)
"""
from models import StartupIdeaInput, Competitor, ReviewSentiment, MarketSizing, StrategyOutput
from pipeline.gemini_client import generate_structured


def run_strategy_agent(
    idea: StartupIdeaInput,
    competitors: list[Competitor],
    sentiment: ReviewSentiment,
    market: MarketSizing,
) -> StrategyOutput:
    prompt = f"""
You are a Strategic Positioning Agent, part of an autonomous market research
system. Build a SWOT analysis and Porter's Five Forces assessment grounded in
everything the pipeline has learned so far.

STARTUP IDEA:
- Title: {idea.title}
- Description: {idea.description}
- Business Model: {idea.businessModel}

CONTEXT FROM EARLIER AGENTS:
- Competitors: {', '.join(c.name for c in competitors)} (market shares: {', '.join(f'{c.name} {c.marketSharePct}%' for c in competitors)})
- Customer sentiment: {sentiment.overallPositivePct}% positive, top complaints: {', '.join(sentiment.topComplaintsAndPainPoints[:3])}
- Unmet customer needs: {', '.join(sentiment.unmetCustomerNeeds[:3])}
- Market: TAM ${market.tamValueBillions}B, {market.cagrPercentage}% CAGR
- Macro risks: {', '.join(market.macroRisks[:3])}

TASK:
1. SWOT: 3-5 items each for Strengths, Weaknesses, Opportunities, Threats
   -- ground Opportunities in the unmet customer needs and Threats in the
   macro risks / incumbent strength above.
2. Porter's Five Forces: for buyerPower, supplierPower, threatOfNewEntrants,
   threatOfSubstitutes, competitiveRivalry -- give a score 1-5 (5 = force is
   strongest/most intense) and a one-sentence rationale for each.

Return ONLY the structured JSON.
"""
    return generate_structured(prompt, StrategyOutput, temperature=0.4)
