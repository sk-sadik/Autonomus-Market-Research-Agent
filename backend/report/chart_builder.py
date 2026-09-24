import os
import logging
from typing import Dict, Any, List
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for headless rendering
import matplotlib.pyplot as plt

logger = logging.getLogger("backend.report.chart_builder")

def build_charts(chart_data: Dict[str, Any], output_dir: str) -> List[str]:
    """
    Build matplotlib charts from chart_data dict and save PNG images into output_dir.
    Returns list of absolute file paths to generated chart PNGs.
    """
    os.makedirs(output_dir, exist_ok=True)
    generated_chart_paths = []

    # Chart 1: Competitor Pricing Breakdown
    try:
        competitor_pricing = chart_data.get("competitor_pricing", {
            "Competitor A": 99,
            "Competitor B": 249,
            "Competitor C": 499,
            "Our Startup (Proposed)": 149
        })
        
        plt.figure(figsize=(7, 4))
        names = list(competitor_pricing.keys())
        prices = [float(v) for v in competitor_pricing.values()]
        colors = ["#4A90E2", "#50E3C2", "#F5A623", "#7ED321"][:len(names)]
        
        bars = plt.bar(names, prices, color=colors, width=0.5)
        plt.title("Competitor Monthly Pricing Comparison ($)", fontsize=13, fontweight="bold", pad=12)
        plt.ylabel("Monthly Price ($)", fontsize=10)
        plt.grid(axis="y", linestyle="--", alpha=0.5)
        
        for bar in bars:
            yval = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2.0, yval + (max(prices)*0.02), f"${yval:.0f}", ha="center", va="bottom", fontweight="bold")
            
        plt.tight_layout()
        chart1_path = os.path.join(output_dir, "competitor_pricing.png")
        plt.savefig(chart1_path, dpi=200)
        plt.close()
        generated_chart_paths.append(chart1_path)
    except Exception as e:
        logger.error(f"Error generating competitor pricing chart: {e}")

    # Chart 2: Market Sizing (TAM / SAM / SOM)
    try:
        market_sizing = chart_data.get("market_sizing", {
            "TAM": 12.5,
            "SAM": 3.2,
            "SOM": 0.45
        })
        
        plt.figure(figsize=(7, 4))
        stages = list(market_sizing.keys())
        values = [float(v) for v in market_sizing.values()]
        
        bars = plt.bar(stages, values, color=["#1E88E5", "#42A5F5", "#90CAF9"], width=0.5)
        plt.title("Market Opportunity: TAM / SAM / SOM ($ Billions)", fontsize=13, fontweight="bold", pad=12)
        plt.ylabel("Market Size ($ Billions)", fontsize=10)
        plt.grid(axis="y", linestyle="--", alpha=0.5)
        
        for bar in bars:
            yval = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2.0, yval + (max(values)*0.02), f"${yval:.2f}B", ha="center", va="bottom", fontweight="bold")
            
        plt.tight_layout()
        chart2_path = os.path.join(output_dir, "market_sizing.png")
        plt.savefig(chart2_path, dpi=200)
        plt.close()
        generated_chart_paths.append(chart2_path)
    except Exception as e:
        logger.error(f"Error generating market sizing chart: {e}")

    # Chart 3: Customer Sentiment Distribution
    try:
        sentiment = chart_data.get("sentiment_distribution", {
            "Positive": 55,
            "Neutral": 25,
            "Negative": 20
        })
        
        plt.figure(figsize=(6, 4))
        labels = list(sentiment.keys())
        sizes = [float(v) for v in sentiment.values()]
        colors = ["#66BB6A", "#FFA726", "#EF5350"]
        
        plt.pie(sizes, labels=labels, autopct="%1.1f%%", colors=colors, startangle=140, explode=(0.05, 0, 0))
        plt.title("Customer Review Sentiment Breakdown", fontsize=13, fontweight="bold", pad=12)
        
        plt.tight_layout()
        chart3_path = os.path.join(output_dir, "sentiment_distribution.png")
        plt.savefig(chart3_path, dpi=200)
        plt.close()
        generated_chart_paths.append(chart3_path)
    except Exception as e:
        logger.error(f"Error generating sentiment distribution chart: {e}")

    return generated_chart_paths
