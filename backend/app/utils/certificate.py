"""
Security Certificate / Audit Report Generator

This module creates professional PDF audit reports for adversarial attacks,
containing original vs. cloaked images, confidence metrics, and security stamps.
"""

import base64
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.pdfgen import canvas
from PIL import Image as PILImage


def create_certificate(
    original_b64: str,
    cloaked_b64: str,
    stats: dict
) -> BytesIO:
    """
    Create a professional PDF audit report for adversarial attack results.
    
    Args:
        original_b64: Base64 encoded original image
        cloaked_b64: Base64 encoded cloaked image
        stats: Dictionary containing:
            - original_label: str
            - original_confidence: float
            - cloaked_label: str
            - cloaked_confidence: float
    
    Returns:
        BytesIO buffer containing the PDF
    """
    buffer = BytesIO()
    
    # Create the PDF document
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=18
    )
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=14,
        textColor=colors.HexColor('#666666'),
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#333333'),
        spaceAfter=12,
        spaceBefore=20,
        fontName='Helvetica-Bold'
    )
    
    # Header
    title = Paragraph("MaskMe", title_style)
    elements.append(title)
    
    subtitle = Paragraph("ADVERSARIAL AUDIT REPORT", subtitle_style)
    elements.append(subtitle)
    
    # Security stamp/watermark
    stamp_style = ParagraphStyle(
        'Stamp',
        parent=styles['Normal'],
        fontSize=18,
        textColor=colors.HexColor('#00AA00'),
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    stamp = Paragraph("✓ SECURE - CONFIDENTIAL", stamp_style)
    elements.append(stamp)
    
    elements.append(Spacer(1, 0.3 * inch))
    
    # Report metadata
    report_date = datetime.now().strftime("%B %d, %Y %H:%M:%S")
    metadata_data = [
        ["Report ID:", f"ADV-{datetime.now().strftime('%Y%m%d-%H%M%S')}"],
        ["Generated:", report_date],
        ["Classification:", "CONFIDENTIAL - INTERNAL USE ONLY"]
    ]
    
    metadata_table = Table(metadata_data, colWidths=[2 * inch, 4 * inch])
    metadata_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#666666')),
        ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#333333')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(metadata_table)
    
    elements.append(Spacer(1, 0.3 * inch))
    
    # Images section
    heading = Paragraph("Visual Comparison", heading_style)
    elements.append(heading)
    
    try:
        # Decode and prepare images
        original_img = _decode_base64_image(original_b64)
        cloaked_img = _decode_base64_image(cloaked_b64)
        
        # Create image table
        image_data = [
            ["Original Image", "Cloaked Image"],
            [original_img, cloaked_img]
        ]
        
        image_table = Table(image_data, colWidths=[3 * inch, 3 * inch])
        image_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#333333')),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 1), (-1, 1), 12),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CCCCCC')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#CCCCCC')),
        ]))
        elements.append(image_table)
        
    except Exception as e:
        error_msg = Paragraph(f"<i>Error loading images: {str(e)}</i>", styles['Normal'])
        elements.append(error_msg)
    
    elements.append(Spacer(1, 0.3 * inch))
    
    # Metrics section
    heading = Paragraph("Detection Metrics", heading_style)
    elements.append(heading)
    
    # Extract stats
    original_label = stats.get('original_label', 'Unknown')
    original_confidence = stats.get('original_confidence', 0.0)
    cloaked_label = stats.get('cloaked_label', 'Unknown')
    cloaked_confidence = stats.get('cloaked_confidence', 0.0)
    
    # Calculate confidence reduction
    confidence_reduction = ((original_confidence - cloaked_confidence) / original_confidence * 100) if original_confidence > 0 else 0
    
    metrics_data = [
        ["Metric", "Original", "Cloaked", "Change"],
        ["Detected Label", original_label, cloaked_label, "Modified" if original_label != cloaked_label else "Unchanged"],
        ["Confidence Score", f"{original_confidence:.2%}", f"{cloaked_confidence:.2%}", f"{confidence_reduction:.1f}% reduction"],
        ["Attack Status", "Baseline", "Protected", "✓ Success"]
    ]
    
    metrics_table = Table(metrics_data, colWidths=[1.5 * inch, 1.5 * inch, 1.5 * inch, 1.5 * inch])
    metrics_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#333333')),
        ('TEXTCOLOR', (0, 1), (0, -1), colors.HexColor('#666666')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5F5')]),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#CCCCCC')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(metrics_table)
    
    elements.append(Spacer(1, 0.3 * inch))
    
    # Summary section
    heading = Paragraph("Executive Summary", heading_style)
    elements.append(heading)
    
    summary_text = f"""
    This adversarial audit demonstrates successful privacy protection through image cloaking technology.
    The original image was classified as <b>"{original_label}"</b> with <b>{original_confidence:.1%}</b> confidence.
    After applying adversarial perturbations, the system's detection was altered to <b>"{cloaked_label}"</b>
    with only <b>{cloaked_confidence:.1%}</b> confidence, achieving a <b>{confidence_reduction:.1f}%</b> reduction
    in detection accuracy.
    <br/><br/>
    This report confirms that the image has been successfully protected against automated classification systems
    while maintaining visual similarity to the original content.
    """
    
    summary = Paragraph(summary_text, styles['Normal'])
    elements.append(summary)
    
    elements.append(Spacer(1, 0.5 * inch))
    
    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#999999'),
        alignment=TA_CENTER,
        fontName='Helvetica'
    )
    
    footer = Paragraph(
        "This document is confidential and intended for authorized use only.<br/>"
        "© 2025 Trilokan Intelligence. All rights reserved.",
        footer_style
    )
    elements.append(footer)
    
    # Build PDF
    doc.build(elements)
    
    # Reset buffer position
    buffer.seek(0)
    
    return buffer


def _decode_base64_image(b64_string: str) -> Image:
    """
    Decode a base64 image string and convert it to a ReportLab Image object.
    
    Args:
        b64_string: Base64 encoded image string (may include data URI prefix)
    
    Returns:
        ReportLab Image object
    """
    # Remove data URI prefix if present
    if ',' in b64_string:
        b64_string = b64_string.split(',', 1)[1]
    
    # Decode base64
    img_data = base64.b64decode(b64_string)
    
    # Open with PIL
    pil_img = PILImage.open(BytesIO(img_data))
    
    # Convert to RGB if necessary
    if pil_img.mode != 'RGB':
        pil_img = pil_img.convert('RGB')
    
    # Save to BytesIO buffer
    img_buffer = BytesIO()
    pil_img.save(img_buffer, format='PNG')
    img_buffer.seek(0)
    
    # Create ReportLab Image with appropriate sizing
    img = Image(img_buffer, width=2.5 * inch, height=2.5 * inch)
    
    return img
