"""
Agent 2: Customer Review & Sentiment Synthesis Agent

Consumes the competitor list from the Discovery Agent and simulates mining
G2 / Trustpilot / Reddit / Capterra reviews of those specific competitors to
surface sentiment, loved features, complaints, and switching triggers.
"""
from models import StartupIdeaInput, Competitor, ReviewOutput
from pipeline.gemini_client import generate_structured


def run_review_agent(idea: StartupIdeaInput, competitors: list[Competitor]) -> ReviewOutput:
    competitor_names = ", ".join(c.name for c in competitors)
    competitor_context = "\n".join(
        f"- {c.name} ({c.type}): G2 {c.g2Rating}/5, Trustpilot {c.trustpilotRating}/5, "
        f"{c.reviewCount} reviews. Weaknesses: {', '.join(c.keyWeaknesses)}"
        for c in competitors
    )

    prompt = f"""
You are a Customer Review & Sentiment Synthesis Agent, part of an autonomous
market research system. Simulate mining and synthesizing customer reviews
from G2, Trustpilot, Reddit, Capterra, and ProductHunt specifically for the
competitors below, in the context of this startup idea.

STARTUP IDEA:
- Title: {idea.title}
- Description: {idea.description}
- Target Industry: {idea.targetIndustry}

COMPETITORS ALREADY IDENTIFIED (ground your synthesis in these, especially
their known weaknesses):
{competitor_context}

TASK:
Produce an aggregated sentiment synthesis across all {len(competitors)}
competitors ({competitor_names}) combined:
- overallPositivePct / overallNegativePct / neutralPct (should sum to ~100)
- topLovedFeatures: what reviewers consistently praise across these tools
- topComplaintsAndPainPoints: recurring frustrations (tie these to the
  weaknesses listed above where relevant)
- commonSwitchingTriggers: what makes customers leave/switch tools
- unmetCustomerNeeds: gaps a new entrant could exploit
- sampleCount: a realistic total review sample size analyzed (500-3000)

Also return `reviewsSynthesizedCount`, a realistic count of individual reviews
processed (should be close to or equal to sampleCount).

Return ONLY the structured JSON.
"""
    return generate_structured(prompt, ReviewOutput, temperature=0.4)
