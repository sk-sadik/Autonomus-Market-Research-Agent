"""
Agent 5: Unit Economics & Financial Projection Agent
"""
from models import StartupIdeaInput, MarketSizing, FinancialUnitEconomics
from pipeline.gemini_client import generate_structured


def run_finance_agent(idea: StartupIdeaInput, market: MarketSizing) -> FinancialUnitEconomics:
    prompt = f"""
You are a Unit Economics & Financial Modeling Agent, part of an autonomous
market research system.

STARTUP IDEA:
- Title: {idea.title}
- Description: {idea.description}
- Business Model: {idea.businessModel}
- Target Price Range: {idea.targetPriceRange}

MARKET CONTEXT:
- SOM (3yr obtainable market): ${market.somValueMillions}M
- CAGR: {market.cagrPercentage}%

TASK:
Model realistic unit economics for this business:
- targetARPU (as a string with currency/period, e.g. "$4,800/yr")
- estimatedCAC (customer acquisition cost, as a currency string)
- estimatedLTV (lifetime value, as a currency string; should be well above CAC
  for a healthy business, ideally 3x+)
- paybackPeriodMonths
- grossMarginPct
- threeYearProjections: for 3 sequential years, project user count, revenue
  in $ Millions, and ARR in $ Millions, showing realistic growth consistent
  with the market's SOM ceiling above.

Return ONLY the structured JSON.
"""
    return generate_structured(prompt, FinancialUnitEconomics, temperature=0.35)
