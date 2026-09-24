"""
Agent 3: Market Sizing & Financial Modeling Agent

Builds TAM/SAM/SOM and a 5-year projection, grounded in the competitor
revenue/market-share figures already discovered.
"""
from models import StartupIdeaInput, Competitor, MarketSizing
from pipeline.gemini_client import generate_structured


def run_market_sizing_agent(idea: StartupIdeaInput, competitors: list[Competitor]) -> MarketSizing:
    revenue_context = "\n".join(
        f"- {c.name}: est. revenue {c.estimatedRevenue}, market share {c.marketSharePct}%"
        for c in competitors
    )

    prompt = f"""
You are a Market Sizing & Financial Modeling Agent, part of an autonomous
market research system. Build a TAM/SAM/SOM model grounded in the competitor
revenue figures already gathered.

STARTUP IDEA:
- Title: {idea.title}
- Description: {idea.description}
- Target Industry: {idea.targetIndustry}
- Target Region: {idea.targetRegion}
- Business Model: {idea.businessModel}

KNOWN COMPETITOR REVENUE DATA (use as a sanity check / anchor for your sizing):
{revenue_context}

TASK:
- tamValueBillions: Total Addressable Market in $ Billions
- samValueBillions: Serviceable Addressable Market in $ Billions
- somValueMillions: Serviceable Obtainable Market (realistic 3yr capture) in $ Millions
- cagrPercentage: 5-year CAGR %
- projectionYears: a 5-year projection table (2025 through 2029) with tam/sam/som
  values for each year showing growth trajectory
- keyDrivers: 3-5 macro/market drivers fueling growth
- macroRisks: 3-5 macro risks that could suppress the market

Return ONLY the structured JSON.
"""
    return generate_structured(prompt, MarketSizing, temperature=0.35)
