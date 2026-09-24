"""
Builds the actual downloadable 20-page market research PDF, server-side,
with real matplotlib charts embedded -- fulfilling the "generates a full
20-page market research PDF with charts" requirement without depending on
the browser (html2canvas) at all.
"""
from __future__ import annotations
import io
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    Image as RLImage, ListFlowable, ListItem, HRFlowable,
)
from reportlab.lib.enums import TA_LEFT

from models import ResearchReport
from pdf.chart_utils import render_chart_for_page

ACCENT = colors.HexColor("#4F46E5")
DARK = colors.HexColor("#0F172A")
MUTED = colors.HexColor("#64748B")
LIGHT_BG = colors.HexColor("#F1F5F9")

CALLOUT_COLORS = {
    "info": colors.HexColor("#DBEAFE"),
    "warning": colors.HexColor("#FEF3C7"),
    "success": colors.HexColor("#D1FAE5"),
    "opportunity": colors.HexColor("#EDE9FE"),
}


def _build_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("ReportTitle", parent=styles["Title"], fontSize=22,
                               textColor=DARK, spaceAfter=4))
    styles.add(ParagraphStyle("ReportSubtitle", parent=styles["Normal"], fontSize=12,
                               textColor=MUTED, spaceAfter=16))
    styles.add(ParagraphStyle("PageTitle", parent=styles["Heading1"], fontSize=17,
                               textColor=DARK, spaceAfter=2))
    styles.add(ParagraphStyle("PageSubheading", parent=styles["Normal"], fontSize=10.5,
                               textColor=ACCENT, spaceAfter=12))
    styles.add(ParagraphStyle("BodyText2", parent=styles["Normal"], fontSize=10,
                               leading=15, spaceAfter=8, alignment=TA_LEFT))
    styles.add(ParagraphStyle("BulletText", parent=styles["Normal"], fontSize=10, leading=14))
    styles.add(ParagraphStyle("MetricLabel", parent=styles["Normal"], fontSize=8,
                               textColor=MUTED))
    styles.add(ParagraphStyle("MetricValue", parent=styles["Normal"], fontSize=13,
                               textColor=DARK, leading=16))
    styles.add(ParagraphStyle("CalloutTitle", parent=styles["Normal"], fontSize=10.5,
                               textColor=DARK, spaceAfter=3))
    styles.add(ParagraphStyle("CalloutBody", parent=styles["Normal"], fontSize=9.5,
                               textColor=DARK, leading=13))
    styles.add(ParagraphStyle("FooterText", parent=styles["Normal"], fontSize=8,
                               textColor=MUTED))
    return styles


def _key_metrics_table(metrics, styles):
    cells = []
    for m in metrics:
        badge = f'<br/><font size="7" color="#4F46E5">{m.badge}</font>' if m.badge else ""
        cell = Paragraph(
            f'<font size="8" color="#64748B">{m.label}</font><br/>'
            f'<font size="13" color="#0F172A"><b>{m.value}</b></font>{badge}',
            styles["Normal"],
        )
        cells.append(cell)
    # up to 4 per row
    rows = [cells[i:i + 4] for i in range(0, len(cells), 4)]
    t = Table(rows, colWidths=[1.7 * inch] * max(len(r) for r in rows) if rows else None)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return t


def _data_table(table_data, styles):
    header = [Paragraph(f"<b>{h}</b>", styles["BulletText"]) for h in table_data.headers]
    rows = [header]
    for row in table_data.rows:
        rows.append([Paragraph(str(cell), styles["BulletText"]) for cell in row])
    t = Table(rows, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), ACCENT),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def _callout(box, styles):
    bg = CALLOUT_COLORS.get(box.type, LIGHT_BG)
    inner = [
        Paragraph(f"<b>{box.title}</b>", styles["CalloutTitle"]),
        Paragraph(box.content, styles["CalloutBody"]),
    ]
    t = Table([[inner]], colWidths=[6.6 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
    ]))
    return t


def build_pdf(report: ResearchReport) -> bytes:
    styles = _build_styles()
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=LETTER,
        leftMargin=0.65 * inch, rightMargin=0.65 * inch,
        topMargin=0.7 * inch, bottomMargin=0.6 * inch,
        title=f"{report.startupInput.title} - Market Research Report",
    )

    story = []

    # ---- Cover page ----
    story.append(Spacer(1, 1.6 * inch))
    story.append(Paragraph(report.startupInput.title, styles["ReportTitle"]))
    story.append(Paragraph("Autonomus Market Research & Competitive Intelligence Report",
                            styles["ReportSubtitle"]))
    story.append(HRFlowable(width="100%", color=colors.HexColor("#E2E8F0"), thickness=1))
    story.append(Spacer(1, 0.3 * inch))
    story.append(_key_metrics_table([
        type("M", (), {"label": "Opportunity Score", "value": f"{report.opportunityScore}/100",
                        "badge": report.viabilityRating}),
        type("M", (), {"label": "Target Industry", "value": report.startupInput.targetIndustry, "badge": None}),
        type("M", (), {"label": "Target Region", "value": report.startupInput.targetRegion, "badge": None}),
        type("M", (), {"label": "Business Model", "value": report.startupInput.businessModel, "badge": None}),
    ], styles))
    story.append(Spacer(1, 0.25 * inch))
    story.append(Paragraph(report.executiveSummary, styles["BodyText2"]))
    story.append(Spacer(1, 0.4 * inch))
    story.append(Paragraph(
        f"Generated {report.createdAt[:10]} &middot; {report.sourcesScrapedCount} sources scraped "
        f"&middot; {report.reviewsSynthesizedCount} reviews synthesized &middot; 20-page autonomous dossier",
        styles["FooterText"],
    ))
    story.append(PageBreak())

    # ---- Report pages ----
    for page in report.pages:
        story.append(Paragraph(f"{page.pageNumber:02d} / 20", styles["FooterText"]))
        story.append(Paragraph(page.title, styles["PageTitle"]))
        story.append(Paragraph(page.subheading, styles["PageSubheading"]))

        if page.keyMetrics:
            story.append(_key_metrics_table(page.keyMetrics, styles))
            story.append(Spacer(1, 10))

        for para in page.paragraphs:
            story.append(Paragraph(para, styles["BodyText2"]))

        if page.bulletPoints:
            items = [ListItem(Paragraph(b, styles["BulletText"]), leftIndent=10) for b in page.bulletPoints]
            story.append(ListFlowable(items, bulletType="bullet", start="circle", leftIndent=14))
            story.append(Spacer(1, 8))

        if page.tableData:
            story.append(_data_table(page.tableData, styles))
            story.append(Spacer(1, 10))

        if page.chartType:
            try:
                png_bytes = render_chart_for_page(
                    page,
                    market=report.marketSizing,
                    sentiment=report.reviewSentiment,
                    finance=report.unitEconomics,
                    competitors=report.competitors,
                )
                if png_bytes:
                    img = RLImage(io.BytesIO(png_bytes), width=5.6 * inch, height=3.0 * inch)
                    img.hAlign = "CENTER"
                    story.append(Spacer(1, 4))
                    story.append(img)
                    story.append(Spacer(1, 8))
            except Exception:
                pass  # never let a chart failure break the whole PDF

        if page.calloutBox:
            story.append(Spacer(1, 6))
            story.append(_callout(page.calloutBox, styles))

        story.append(PageBreak())

    doc.build(story)
    return buf.getvalue()
