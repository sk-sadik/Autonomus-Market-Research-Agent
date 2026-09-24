"""
Pipeline Orchestrator

Runs all 7 agents in sequence, timing each stage and building the
`agentExecutionLog` the frontend's AgentPipelineConsole displays. This is the
single entry point the API layer calls.
"""
from __future__ import annotations
import time
import logging
from datetime import datetime, timezone

from models import StartupIdeaInput, ResearchReport, AgentLogStep
from pipeline.discovery_agent import run_discovery_agent
from pipeline.review_agent import run_review_agent
from pipeline.market_sizing_agent import run_market_sizing_agent
from pipeline.strategy_agent import run_strategy_agent
from pipeline.finance_agent import run_finance_agent
from pipeline.summary_agent import run_summary_agent
from pipeline.report_writer_agent import run_report_writer_agent

logger = logging.getLogger("agents.orchestrator")


def _ts() -> str:
    return datetime.now(timezone.utc).strftime("%H:%M:%S")


def run_pipeline(idea: StartupIdeaInput) -> ResearchReport:
    t0 = time.monotonic()
    log: list[AgentLogStep] = []

    def stamp(step_id, phase, title, detail, status="completed", data=None):
        log.append(AgentLogStep(
            id=step_id, timestamp=_ts(), phase=phase,
            title=title, detail=detail, status=status, dataExtracted=data,
        ))

    stamp("l1", "INIT", "Task Initialized",
          f'Received startup idea "{idea.title}". Planning autonomous research pipeline.')

    # --- Agent 1: Discovery -------------------------------------------------
    logger.info("Running discovery agent...")
    discovery = run_discovery_agent(idea)
    stamp("l2", "WEB_SCRAPE", "Web Crawl & Competitor Discovery",
          f"Identified {len(discovery.competitors)} competitors after analyzing "
          f"{discovery.sourcesScrapedCount} web sources in {idea.targetRegion}.",
          data=f"{discovery.sourcesScrapedCount} sources")

    stamp("l3", "PRICING_ANALYSIS", "Pricing Matrix Extraction",
          "Extracted pricing tiers, billing models, and feature gates for all "
          f"{len(discovery.competitors)} competitors.")

    # --- Agent 2: Reviews -----------------------------------------------------
    logger.info("Running review agent...")
    review = run_review_agent(idea, discovery.competitors)
    stamp("l4", "REVIEW_SYNTHESIS", "Review & Pain-Point Mining",
          f"Synthesized {review.reviewsSynthesizedCount} reviews across G2, "
          "Trustpilot, and Reddit. "
          f"{review.reviewSentiment.overallPositivePct}% positive sentiment detected.",
          data=f"{review.reviewsSynthesizedCount} reviews")

    # --- Agent 3: Market sizing ----------------------------------------------
    logger.info("Running market sizing agent...")
    market = run_market_sizing_agent(idea, discovery.competitors)
    stamp("l5", "MARKET_MODELING", "TAM/SAM/SOM Sizing",
          f"Modeled ${market.tamValueBillions}B TAM with {market.cagrPercentage}% "
          "5-year CAGR projection.")

    # --- Agent 4: Strategy (SWOT + Porter) -----------------------------------
    logger.info("Running strategy agent...")
    strategy = run_strategy_agent(idea, discovery.competitors, review.reviewSentiment, market)
    stamp("l6", "MARKET_MODELING", "SWOT & Competitive Forces Analysis",
          "Completed SWOT matrix and Porter's Five Forces scoring.")

    # --- Agent 5: Finance -----------------------------------------------------
    logger.info("Running finance agent...")
    finance = run_finance_agent(idea, market)
    stamp("l7", "MARKET_MODELING", "Unit Economics Modeling",
          f"Projected CAC {finance.estimatedCAC} vs LTV {finance.estimatedLTV}, "
          f"{finance.paybackPeriodMonths}mo payback period.")

    # --- Agent 6: Executive summary -------------------------------------------
    logger.info("Running executive summary agent...")
    executive = run_summary_agent(idea, discovery.competitors, review.reviewSentiment,
                                   market, strategy, finance)
    stamp("l8", "REPORT_GENERATION", "Executive Assessment",
          f"Opportunity Score: {executive.opportunityScore}/100 "
          f"({executive.viabilityRating}).")

    # --- Agent 7: Report writer -------------------------------------------------
    logger.info("Running report writer agent...")
    pages = run_report_writer_agent(idea, discovery.competitors, review.reviewSentiment,
                                     market, strategy, finance, executive)
    stamp("l9", "REPORT_GENERATION", "20-Page Report Compilation",
          f"Formatted {len(pages)} structured report pages with charts, tables, "
          "and callouts.")

    stamp("l10", "COMPLETE", "Pipeline Complete",
          f"Autonomous research completed in {time.monotonic() - t0:.1f}s.")

    report = ResearchReport(
        id=f"report-{int(time.time() * 1000)}",
        createdAt=datetime.now(timezone.utc).isoformat(),
        startupInput=idea,
        opportunityScore=executive.opportunityScore,
        viabilityRating=executive.viabilityRating,
        executiveSummary=executive.executiveSummary,
        competitors=discovery.competitors,
        reviewSentiment=review.reviewSentiment,
        marketSizing=market,
        swot=strategy.swot,
        portersForces=strategy.portersForces,
        unitEconomics=finance,
        pages=pages,
        agentExecutionLog=log,
        sourcesScrapedCount=discovery.sourcesScrapedCount,
        reviewsSynthesizedCount=review.reviewsSynthesizedCount,
    )
    logger.info("Pipeline complete in %.1fs", time.monotonic() - t0)
    return report
