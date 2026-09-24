import os
import logging
from typing import List, Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

logger = logging.getLogger("backend.report.pdf_assembler")

def build_pdf_report(
    startup_idea: str,
    report_prose: str,
    chart_paths: List[str],
    competitor_data: Dict[str, Any],
    review_summaries: Dict[str, Any],
    output_pdf_path: str
) -> str:
    """
    Assemble report prose and matplotlib charts into a professional PDF dossier.
    """
    os.makedirs(os.path.dirname(output_pdf_path), exist_ok=True)
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=letter,
        rightMargin=0.5 * inch,
        leftMargin=0.5 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    PRIMARY = colors.HexColor("#1E293B")
    ACCENT = colors.HexColor("#2563EB")
    TEXT_DARK = colors.HexColor("#334155")
    BG_LIGHT = colors.HexColor("#F8FAFC")
    
    # Custom Typography Styles
    styles.add(ParagraphStyle("ReportTitle", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=24, leading=28, textColor=PRIMARY, spaceAfter=8))
    styles.add(ParagraphStyle("ReportSubTitle", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=13, leading=16, textColor=ACCENT, spaceAfter=15))
    styles.add(ParagraphStyle("SectionHeading", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=16, leading=20, textColor=PRIMARY, spaceBefore=14, spaceAfter=8, keepWithNext=True))
    styles.add(ParagraphStyle("SubSectionHeading", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=12, leading=15, textColor=ACCENT, spaceBefore=10, spaceAfter=4, keepWithNext=True))
    styles.add(ParagraphStyle("BodyCustom", parent=styles["Normal"], fontName="Helvetica", fontSize=10, leading=14, textColor=TEXT_DARK, spaceAfter=8))
    styles.add(ParagraphStyle("BulletCustom", parent=styles["Normal"], fontName="Helvetica", fontSize=10, leading=14, textColor=TEXT_DARK, leftIndent=12, firstLineIndent=-8, spaceAfter=4))
    styles.add(ParagraphStyle("CalloutText", parent=styles["Normal"], fontName="Helvetica-Oblique", fontSize=10, leading=14, textColor=PRIMARY))

    elements = []

    # Title Banner / Header
    elements.append(Paragraph("AUTONOMOUS MARKET RESEARCH DOSSIER", styles["ReportSubTitle"]))
    elements.append(Paragraph(f"Strategic Intelligence Report: {startup_idea[:70]}", styles["ReportTitle"]))
    elements.append(HRFlowable(width="100%", thickness=2, color=ACCENT, spaceBefore=4, spaceAfter=15))

    # Executive Summary Card / Startup Idea
    idea_box = [
        [Paragraph("<b>Target Venture Concept:</b>", styles["BodyCustom"])],
        [Paragraph(startup_idea, styles["BodyCustom"])]
    ]
    idea_table = Table(idea_box, colWidths=[7.0 * inch])
    idea_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    elements.append(idea_table)
    elements.append(Spacer(1, 15))

    # Parse and format the Report Prose
    import html
    lines = report_prose.split("\n")
    for line in lines:
        raw_clean = line.strip()
        if not raw_clean:
            continue
        if raw_clean.startswith("### "):
            text = html.escape(raw_clean.replace("### ", ""))
            elements.append(Paragraph(text, styles["SubSectionHeading"]))
        elif raw_clean.startswith("## ") or raw_clean.startswith("# "):
            header_text = html.escape(raw_clean.replace("## ", "").replace("# ", ""))
            elements.append(Paragraph(header_text, styles["SectionHeading"]))
            elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E2E8F0"), spaceBefore=2, spaceAfter=6))
        elif raw_clean.startswith("- ") or raw_clean.startswith("* "):
            text = html.escape(raw_clean[2:])
            elements.append(Paragraph(f"• {text}", styles["BulletCustom"]))
        else:
            text = html.escape(raw_clean)
            elements.append(Paragraph(text, styles["BodyCustom"]))

    elements.append(Spacer(1, 15))

    # Embed Generated Visual Charts
    if chart_paths:
        elements.append(Paragraph("Market Visualizations & Quantitative Metrics", styles["SectionHeading"]))
        elements.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceBefore=2, spaceAfter=10))

        for cpath in chart_paths:
            if os.path.exists(cpath):
                img = Image(cpath, width=6.2 * inch, height=3.5 * inch)
                elements.append(KeepTogether([img, Spacer(1, 12)]))

    # Append Competitors & Sentiment Tables
    competitors_list = competitor_data.get("competitors", [])
    if competitors_list:
        elements.append(Paragraph("Competitor Landscape Matrix", styles["SectionHeading"]))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E2E8F0"), spaceBefore=2, spaceAfter=8))
        
        table_data = [["Competitor Name", "Pricing Tier", "Core Strengths", "Known Weaknesses"]]
        for comp in competitors_list:
            table_data.append([
                Paragraph(html.escape(str(comp.get("name", "N/A"))), styles["BodyCustom"]),
                Paragraph(html.escape(str(comp.get("pricing", "N/A"))), styles["BodyCustom"]),
                Paragraph(html.escape(str(comp.get("strengths", "N/A"))), styles["BodyCustom"]),
                Paragraph(html.escape(str(comp.get("weaknesses", "N/A"))), styles["BodyCustom"]),
            ])
            
        comp_table = Table(table_data, colWidths=[1.5 * inch, 1.3 * inch, 2.2 * inch, 2.2 * inch])
        comp_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), PRIMARY),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ('PADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        elements.append(comp_table)

    # Footer Callback for Page Numbers
    def add_header_footer(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.HexColor("#64748B"))
        # Header
        canvas.drawString(36, letter[1] - 25, "Autonomus Market Research Agent | Market Research Dossier")
        canvas.setStrokeColor(colors.HexColor("#E2E8F0"))
        canvas.setLineWidth(0.5)
        canvas.line(36, letter[1] - 30, letter[0] - 36, letter[1] - 30)
        # Footer
        page_num = canvas.getPageNumber()
        canvas.drawString(36, 25, f"Page {page_num}")
        canvas.drawRightString(letter[0] - 36, 25, "Confidential — Generated by Autonomous Research Agent")
        canvas.line(36, 35, letter[0] - 36, 35)
        canvas.restoreState()

    doc.build(elements, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
    logger.info(f"Report PDF built successfully at {output_pdf_path}")
    return output_pdf_path
