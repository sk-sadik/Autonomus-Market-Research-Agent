"""
Renders each `chartType` from a ResearchPageContent page into a PNG image
(in-memory) using matplotlib, so the server-side PDF has real charts rather
than relying on the browser to draw them.
"""
from __future__ import annotations
import io
from typing import Optional

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from models import ResearchPageContent, MarketSizing, ReviewSentiment, FinancialUnitEconomics, Competitor

ACCENT = "#4F46E5"
ACCENT2 = "#F97316"
ACCENT3 = "#10B981"
MUTED = "#94A3B8"


def _fig_to_png_bytes(fig) -> bytes:
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=170, bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return buf.read()


def chart_bar_tam(market: MarketSizing) -> bytes:
    fig, ax = plt.subplots(figsize=(6, 3.2))
    labels = ["TAM ($B)", "SAM ($B)", "SOM ($M \u00f7 1000)"]
    values = [market.tamValueBillions, market.samValueBillions, market.somValueMillions / 1000]
    ax.bar(labels, values, color=[ACCENT, ACCENT2, ACCENT3])
    for i, v in enumerate(values):
        ax.text(i, v, f"{v:.2f}", ha="center", va="bottom", fontsize=9)
    ax.set_title("Market Sizing: TAM / SAM / SOM")
    ax.set_ylabel("$ Billions")
    fig.tight_layout()
    return _fig_to_png_bytes(fig)


def chart_line_growth(market: Optional[MarketSizing] = None, finance: Optional[FinancialUnitEconomics] = None) -> bytes:
    fig, ax = plt.subplots(figsize=(6, 3.2))
    if finance and finance.threeYearProjections:
        years = [p.year for p in finance.threeYearProjections]
        arr = [p.arrMillions for p in finance.threeYearProjections]
        ax.plot(years, arr, marker="o", color=ACCENT, linewidth=2)
        ax.set_ylabel("ARR ($ Millions)")
        ax.set_title("3-Year ARR Growth Projection")
    elif market and market.projectionYears:
        years = [p.year for p in market.projectionYears]
        tam = [p.tam for p in market.projectionYears]
        sam = [p.sam for p in market.projectionYears]
        ax.plot(years, tam, marker="o", label="TAM", color=ACCENT)
        ax.plot(years, sam, marker="o", label="SAM", color=ACCENT2)
        ax.legend()
        ax.set_ylabel("$ Billions")
        ax.set_title("5-Year Market Growth Projection")
    fig.tight_layout()
    return _fig_to_png_bytes(fig)


def chart_pie_sentiment(sentiment: ReviewSentiment) -> bytes:
    fig, ax = plt.subplots(figsize=(4.2, 4.2))
    values = [sentiment.overallPositivePct, sentiment.overallNegativePct, sentiment.neutralPct]
    labels = ["Positive", "Negative", "Neutral"]
    colors = [ACCENT3, "#EF4444", MUTED]
    ax.pie(values, labels=labels, colors=colors, autopct="%1.0f%%", startangle=90)
    ax.set_title("Customer Sentiment Breakdown")
    fig.tight_layout()
    return _fig_to_png_bytes(fig)


def chart_radar_features(competitors: list[Competitor]) -> bytes:
    import numpy as np
    metrics = ["G2 Rating", "Trustpilot", "Market Share", "Review Volume"]
    fig = plt.figure(figsize=(5, 5))
    ax = fig.add_subplot(111, polar=True)

    def norm(c: Competitor):
        return [
            c.g2Rating / 5,
            c.trustpilotRating / 5,
            min(c.marketSharePct / 40, 1),
            min(c.reviewCount / 5000, 1),
        ]

    angles = [n / float(len(metrics)) * 2 * 3.14159 for n in range(len(metrics))]
    angles += angles[:1]
    colors = [ACCENT, ACCENT2, ACCENT3]
    for i, c in enumerate(competitors[:3]):
        vals = norm(c)
        vals += vals[:1]
        ax.plot(angles, vals, color=colors[i % len(colors)], linewidth=2, label=c.name)
        ax.fill(angles, vals, color=colors[i % len(colors)], alpha=0.15)
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(metrics, fontsize=8)
    ax.set_yticklabels([])
    ax.legend(loc="upper right", bbox_to_anchor=(1.3, 1.1), fontsize=8)
    ax.set_title("Competitor Feature/Strength Radar", fontsize=10)
    fig.tight_layout()
    return _fig_to_png_bytes(fig)


def chart_pricing_dist(competitors: list[Competitor]) -> bytes:
    import re
    fig, ax = plt.subplots(figsize=(6, 3.2))
    names, prices = [], []
    for c in competitors:
        match = re.search(r"[\d,]+(\.\d+)?", c.startingPrice.replace(",", ""))
        if match:
            names.append(c.name)
            prices.append(float(match.group(0)))
    if prices:
        ax.bar(names, prices, color=ACCENT)
        for i, v in enumerate(prices):
            ax.text(i, v, f"${v:,.0f}", ha="center", va="bottom", fontsize=8)
    ax.set_title("Competitor Starting Price Comparison")
    ax.set_ylabel("Starting Price ($)")
    plt.xticks(rotation=15, ha="right", fontsize=8)
    fig.tight_layout()
    return _fig_to_png_bytes(fig)


def render_chart_for_page(
    page: ResearchPageContent,
    *,
    market: MarketSizing,
    sentiment: ReviewSentiment,
    finance: FinancialUnitEconomics,
    competitors: list[Competitor],
) -> Optional[bytes]:
    """Dispatch to the right chart renderer based on page.chartType."""
    if page.chartType == "bar_tam":
        return chart_bar_tam(market)
    if page.chartType == "line_growth":
        return chart_line_growth(market=market, finance=finance)
    if page.chartType == "pie_sentiment":
        return chart_pie_sentiment(sentiment)
    if page.chartType == "radar_features":
        return chart_radar_features(competitors)
    if page.chartType == "pricing_dist":
        return chart_pricing_dist(competitors)
    return None
