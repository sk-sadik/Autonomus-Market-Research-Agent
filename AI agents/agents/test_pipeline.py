"""
Quick standalone test: run the full agent pipeline from the command line
(no server needed) and dump the resulting report + a PDF to disk.

Usage:
    python test_pipeline.py
"""
import json
import logging
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")

from models import StartupIdeaInput
from pipeline.orchestrator import run_pipeline
from pdf.pdf_builder import build_pdf


def main():
    idea = StartupIdeaInput(
        title="ShelfSense AI",
        description=(
            "An AI copilot for independent grocery stores that automatically "
            "reorders inventory, predicts shrinkage/spoilage, and negotiates "
            "supplier pricing using real-time sales and market data."
        ),
        targetIndustry="Retail Technology / SaaS",
        targetRegion="North America",
        targetPriceRange="$99-$499/mo",
        businessModel="B2B",
        depthLevel="exhaustive_20_page",
    )

    print(f'\nRunning autonomous research pipeline for "{idea.title}"...\n')
    report = run_pipeline(idea)

    with open("sample_report.json", "w") as f:
        f.write(report.model_dump_json(indent=2))
    print(f"Wrote sample_report.json ({len(report.pages)} pages, "
          f"opportunity score {report.opportunityScore}/100)")

    pdf_bytes = build_pdf(report)
    with open("sample_report.pdf", "wb") as f:
        f.write(pdf_bytes)
    print(f"Wrote sample_report.pdf ({len(pdf_bytes):,} bytes)")


if __name__ == "__main__":
    main()
