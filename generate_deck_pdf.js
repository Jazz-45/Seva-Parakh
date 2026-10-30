import fs from 'node:fs';
import path from 'node:path';

// Clean, zero-dependency PDF 1.4 Generator for 16:9 Widescreen Pitch Deck (960 x 540 pt)
class PitchDeckPDFBuilder {
  constructor() {
    this.width = 960;
    this.height = 540;
    this.objects = [];
    this.pages = [];
  }

  // Convert hex color to PDF RGB floats (0.0 to 1.0)
  hexToRgb(hex) {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)}`;
  }

  escapePdfText(text) {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/[^\x20-\x7E]/g, (char) => {
        // Map common unicode to safe ASCII equivalents for standard PDF fonts
        if (char === '₹') return 'Rs.';
        if (char === '•') return '*';
        if (char === '—' || char === '–') return '-';
        if (char === '✓' || char === '✔') return '[PASS]';
        if (char === '✕' || char === '✗') return '[FAIL]';
        if (char === '⚠') return '[WARN]';
        if (char === '☑') return '[X]';
        if (char === '→') return '->';
        if (char === '<') return '<';
        if (char === '>') return '>';
        return ' ';
      });
  }

  createSlide() {
    const ops = [];

    // Helper: translate top-down Y (0 at top, 540 at bottom) to PDF Y (0 at bottom, 540 at top)
    const toPdfY = (topY) => this.height - topY;

    const slideApi = {
      // Draw filled & stroked rectangle
      rect: (x, topY, w, h, fillColor = null, strokeColor = null, lineWidth = 1) => {
        const pdfY = toPdfY(topY + h);
        ops.push('q');
        if (fillColor) {
          ops.push(`${this.hexToRgb(fillColor)} rg`);
        }
        if (strokeColor) {
          ops.push(`${this.hexToRgb(strokeColor)} RG`);
          ops.push(`${lineWidth} w`);
        }
        ops.push(`${x} ${pdfY} ${w} ${h} re`);
        if (fillColor && strokeColor) {
          ops.push('B');
        } else if (fillColor) {
          ops.push('f');
        } else if (strokeColor) {
          ops.push('S');
        }
        ops.push('Q');
      },

      // Draw horizontal line
      line: (x1, topY1, x2, topY2, strokeColor = '#E2E8F0', lineWidth = 1) => {
        const py1 = toPdfY(topY1);
        const py2 = toPdfY(topY2);
        ops.push('q');
        ops.push(`${this.hexToRgb(strokeColor)} RG`);
        ops.push(`${lineWidth} w`);
        ops.push(`${x1} ${py1} m ${x2} ${py2} l S`);
        ops.push('Q');
      },

      // Render text string
      text: (str, x, topY, options = {}) => {
        const {
          font = 'F1', // F1 = Helvetica, F2 = Helvetica-Bold
          size = 12,
          color = '#1E293B',
          align = 'left',
          width = 0
        } = options;

        const safeStr = this.escapePdfText(str);
        const pdfY = toPdfY(topY);

        ops.push('BT');
        ops.push(`/${font} ${size} Tf`);
        ops.push(`${this.hexToRgb(color)} rg`);
        ops.push(`1 0 0 1 ${x} ${pdfY} Tm`);
        ops.push(`(${safeStr}) Tj`);
        ops.push('ET');
      },

      // Render a badge with background pill and text
      badge: (label, x, topY, bgColor = '#F1F5F9', textColor = '#0F172A', borderColor = '#CBD5E1', fontSize = 9) => {
        const padX = 10;
        const padY = 4;
        const textWidth = label.length * (fontSize * 0.55);
        const boxW = textWidth + padX * 2;
        const boxH = fontSize + padY * 2;

        slideApi.rect(x, topY, boxW, boxH, bgColor, borderColor, 1);
        slideApi.text(label, x + padX, topY + fontSize + 1, {
          font: 'F2',
          size: fontSize,
          color: textColor
        });
        return boxW;
      },

      getOperations: () => ops.join('\n')
    };

    return slideApi;
  }

  buildSlide1() {
    const s = this.createSlide();
    // Dark Civic Navy Background
    s.rect(0, 0, 960, 540, '#090E17');

    // Subtle Grid background lines
    for (let x = 60; x < 900; x += 120) {
      s.line(x, 0, x, 540, '#111827', 0.5);
    }
    for (let y = 60; y < 500; y += 90) {
      s.line(0, y, 960, y, '#111827', 0.5);
    }

    // Top Header Badge
    s.badge('SEVA FIRST INNOVATION CHALLENGE 2026 * GOVTECH TRACK', 60, 45, '#1E293B', '#F8FAFC', '#334155', 9);
    s.badge('CANDIDATE: SF-2026-MORM', 780, 45, '#292015', '#F59E0B', '#78350F', 9);

    // Main Titles
    s.text('SEVA-PARAKH', 60, 150, { font: 'F2', size: 52, color: '#FFFFFF' });
    s.text('by MorMati Labs', 60, 190, { font: 'F2', size: 20, color: '#D97706' });
    s.text('Solo Student Innovator - B.Tech CSE, NIT Raipur', 230, 190, { font: 'F1', size: 14, color: '#94A3B8' });

    // Value Proposition Statement
    s.text('A vernacular pre-submission document audit and rejection-decoder tool that helps', 60, 240, { font: 'F1', size: 16, color: '#E2E8F0' });
    s.text('citizens and operators catch application defects BEFORE portal upload.', 60, 265, { font: 'F2', size: 16, color: '#FBBF24' });

    // Architecture Anchor Cards
    s.rect(60, 310, 390, 85, '#0F172A', '#1E3A8A', 1.5);
    s.text('DETERMINISTIC RULE ENGINE', 80, 335, { font: 'F2', size: 12, color: '#38BDF8' });
    s.text('100% Policy Grounded (Zero AI Hallucination)', 80, 355, { font: 'F2', size: 11, color: '#FFFFFF' });
    s.text('Validates dates, circulars & spelling via regex & GR index.', 80, 375, { font: 'F1', size: 10, color: '#94A3B8' });

    s.rect(480, 310, 420, 85, '#0F172A', '#B45309', 1.5);
    s.text('REGIONAL SLM & VERNACULAR AUDIO', 500, 335, { font: 'F2', size: 12, color: '#FBBF24' });
    s.text('Quantized Edge Model (Chhattisgarhi & Marathi)', 500, 355, { font: 'F2', size: 11, color: '#FFFFFF' });
    s.text('Translates cryptic administrative error codes into spoken advice.', 500, 375, { font: 'F1', size: 10, color: '#94A3B8' });

    // Bottom Decorative Bar
    s.rect(0, 528, 960, 12, '#D97706');
    s.line(60, 470, 900, 470, '#1E293B', 1);
    s.text('Founder: Jayesh Sahu | MorMati Labs | Pre-Submission Verification Architecture', 60, 495, { font: 'F1', size: 10, color: '#64748B' });
    s.text('Pilot Scale: 50 Aaple Sarkar Kendras | Work Order Cap: Rs. 10 Lakhs', 550, 495, { font: 'F1', size: 10, color: '#64748B' });

    return s.getOperations();
  }

  buildSlide2() {
    const s = this.createSlide();
    // Canvas background
    s.rect(0, 0, 960, 540, '#F8FAFC');

    // Slide Header
    s.badge('PROBLEM STATEMENT', 60, 35, '#FEE2E2', '#B91C1C', '#FECACA', 9);
    s.text('Slide 02 / 06', 840, 47, { font: 'F2', size: 10, color: '#64748B' });
    s.text('The Problem: Preventable Rejection Overhead', 60, 85, { font: 'F2', size: 26, color: '#0F172A' });
    s.text('Applications fail DBT & scholarships not due to ineligibility, but due to preventable document defects.', 60, 110, { font: 'F1', size: 13, color: '#475569' });

    // Left Column Cards
    s.rect(60, 140, 470, 105, '#FFFFFF', '#E2E8F0', 1);
    s.text('WHY APPLICATIONS GET "SENT BACK"', 80, 165, { font: 'F2', size: 11, color: '#B91C1C' });
    s.text('Thousands of scholarship and welfare applications fail scrutiny due to', 80, 188, { font: 'F1', size: 11, color: '#1E293B' });
    s.text('clerical errors: expired income certificates, name spelling variances', 80, 206, { font: 'F1', size: 11, color: '#1E293B' });
    s.text('(e.g., Sahu vs Saw), and unlinked NPCI bank accounts.', 80, 224, { font: 'F1', size: 11, color: '#1E293B' });

    s.rect(60, 260, 470, 115, '#FFFFFF', '#E2E8F0', 1);
    s.text('THE 100-CASE SYNTHETIC TECHNICAL BENCHMARK', 80, 285, { font: 'F2', size: 11, color: '#D97706' });
    s.text('In our benchmark evaluation across 100 synthetic government dossiers,', 80, 308, { font: 'F1', size: 11, color: '#1E293B' });
    s.text('standard e-District and DBT portals blindly accept defective PDFs at upload,', 80, 326, { font: 'F1', size: 11, color: '#1E293B' });
    s.text('shifting 100% of the verification burden onto human scrutiny clerks.', 80, 344, { font: 'F2', size: 11, color: '#0F172A' });

    s.rect(60, 390, 470, 70, '#0F172A', null, 0);
    s.text('THE EXISTING AI FALLACY', 80, 415, { font: 'F2', size: 10, color: '#F59E0B' });
    s.text('Chatbots only recite scheme rules. They CANNOT cross-audit physical', 80, 435, { font: 'F1', size: 11, color: '#E2E8F0' });
    s.text('scanned documents or verify certificate issue dates against circulars.', 80, 452, { font: 'F1', size: 11, color: '#E2E8F0' });

    // Right Column: Metric Callout Cards
    s.rect(560, 140, 340, 95, '#FFFFFF', '#E2E8F0', 1);
    s.rect(560, 140, 6, 95, '#DC2626');
    s.text('30%+', 585, 185, { font: 'F2', size: 36, color: '#DC2626' });
    s.text('Govt Scrutiny Clerk Overhead', 585, 208, { font: 'F2', size: 12, color: '#0F172A' });
    s.text('Clerks re-open & reject preventable clerical defects.', 585, 224, { font: 'F1', size: 10, color: '#64748B' });

    s.rect(560, 250, 340, 95, '#FFFFFF', '#E2E8F0', 1);
    s.rect(560, 250, 6, 95, '#D97706');
    s.text('Rs. 150 - Rs. 300', 585, 295, { font: 'F2', size: 28, color: '#D97706' });
    s.text('Cash Burn Per Citizen Per Rejection', 585, 318, { font: 'F2', size: 12, color: '#0F172A' });
    s.text('Lost in multiple bus trips, re-scanning, and wages.', 585, 334, { font: 'F1', size: 10, color: '#64748B' });

    s.rect(560, 360, 340, 100, '#FFFFFF', '#E2E8F0', 1);
    s.rect(560, 360, 6, 95, '#334155');
    s.text('12 - 15 Mins', 585, 405, { font: 'F2', size: 28, color: '#334155' });
    s.text('Wasted Per Operator Per Defect', 585, 428, { font: 'F2', size: 12, color: '#0F172A' });
    s.text('Manual document squinting creates center backlogs.', 585, 444, { font: 'F1', size: 10, color: '#64748B' });

    // Footer
    s.rect(0, 528, 960, 12, '#CBD5E1');
    s.line(60, 485, 900, 485, '#E2E8F0', 1);
    s.text('Beneficiaries: Rural students & Aaple Sarkar / Lok Seva Kendra VLEs | States: Maharashtra & Chhattisgarh', 60, 508, { font: 'F1', size: 10, color: '#64748B' });

    return s.getOperations();
  }

  buildSlide3() {
    const s = this.createSlide();
    // Canvas background
    s.rect(0, 0, 960, 540, '#FFFFFF');

    // Slide Header
    s.badge('CORE INNOVATION', 60, 35, '#FEF3C7', '#B45309', '#FDE68A', 9);
    s.badge('DETERMINISTIC RULES + REGIONAL SLM', 185, 35, '#DBEAFE', '#1E40AF', '#BFDBFE', 9);
    s.text('Slide 03 / 06', 840, 47, { font: 'F2', size: 10, color: '#64748B' });
    s.text('Our Solution: "Rules Decide. AI Explains."', 60, 85, { font: 'F2', size: 26, color: '#0F172A' });

    // Left Column: 3-step micro-flow and comparison table
    s.rect(60, 125, 400, 55, '#F8FAFC', '#E2E8F0', 1);
    s.badge('1', 75, 137, '#1E3A8A', '#FFFFFF', '#1E3A8A', 10);
    s.text('Drop & On-Device Redact', 110, 147, { font: 'F2', size: 11, color: '#0F172A' });
    s.text('Client-side OCR extracts text and auto-masks 12-digit Aadhaar.', 110, 165, { font: 'F1', size: 9, color: '#475569' });

    s.rect(60, 190, 400, 55, '#F8FAFC', '#E2E8F0', 1);
    s.badge('2', 75, 202, '#D97706', '#FFFFFF', '#D97706', 10);
    s.text('Deterministic Rule Engine (0% Hallucination)', 110, 212, { font: 'F2', size: 11, color: '#0F172A' });
    s.text('Validates expiry dates against State GR circulars & cross-script spelling.', 110, 230, { font: 'F1', size: 9, color: '#475569' });

    s.rect(60, 255, 400, 55, '#F8FAFC', '#E2E8F0', 1);
    s.badge('3', 75, 267, '#15803D', '#FFFFFF', '#15803D', 10);
    s.text('Vernacular Audio Guidance', 110, 277, { font: 'F2', size: 11, color: '#0F172A' });
    s.text('Quantized SLM translates rejections into spoken Chhattisgarhi/Marathi.', 110, 295, { font: 'F1', size: 9, color: '#475569' });

    // Comparison Table
    s.rect(60, 325, 400, 135, '#F8FAFC', '#E2E8F0', 1);
    s.rect(60, 325, 400, 25, '#F1F5F9');
    s.text('METRIC', 75, 342, { font: 'F2', size: 9, color: '#475569' });
    s.text('STANDARD FLOW', 170, 342, { font: 'F2', size: 9, color: '#475569' });
    s.text('SEVA-PARAKH WORKBENCH', 290, 342, { font: 'F2', size: 9, color: '#1E3A8A' });

    s.line(60, 350, 460, 350, '#E2E8F0', 1);
    s.text('Validation Cost', 75, 372, { font: 'F1', size: 10, color: '#0F172A' });
    s.text('Rs. 150+ lost/trip', 170, 372, { font: 'F1', size: 10, color: '#DC2626' });
    s.text('< Rs. 0.15 / audit', 290, 372, { font: 'F2', size: 10, color: '#15803D' });

    s.line(60, 388, 460, 388, '#F1F5F9', 1);
    s.text('Check Time', 75, 410, { font: 'F1', size: 10, color: '#0F172A' });
    s.text('12-15 mins manual', 170, 410, { font: 'F1', size: 10, color: '#64748B' });
    s.text('< 4 seconds automated', 290, 410, { font: 'F2', size: 10, color: '#15803D' });

    s.line(60, 426, 460, 426, '#F1F5F9', 1);
    s.text('Citizen Next Step', 75, 448, { font: 'F1', size: 10, color: '#0F172A' });
    s.text('Cryptic code', 170, 448, { font: 'F1', size: 10, color: '#64748B' });
    s.text('Spoken Dialect Audio', 290, 448, { font: 'F2', size: 10, color: '#D97706' });

    // Right Column: Mock UI Dashboard Artifact
    s.rect(480, 125, 420, 335, '#0F172A', '#1E293B', 1.5);
    s.rect(480, 125, 420, 30, '#1E293B');
    s.text('SEVA-PARAKH WORKBENCH v1.2', 500, 145, { font: 'F2', size: 10, color: '#94A3B8' });
    s.badge('STATE: CG / MH', 780, 131, '#1E3A8A', '#FFFFFF', '#3B82F6', 8);

    // Scanned Ingestion Box
    s.rect(500, 170, 380, 80, '#090E17', '#1E293B', 1);
    s.text('DOCUMENT CHECKLIST (PRE-SUBMISSION)', 515, 188, { font: 'F2', size: 9, color: '#94A3B8' });
    s.text('[PASS]  Aadhaar Proof (Masked) - Ramesh Kumar Sahu', 515, 208, { font: 'F1', size: 9, color: '#4ADE80' });
    s.text('[FAIL]  Income Cert - Expired 31/03/2025 (FY26-27 Req)', 515, 226, { font: 'F2', size: 9, color: '#F87171' });
    s.text('[WARN] Caste Cert - Phonetic match: Sahu vs Saw', 515, 242, { font: 'F1', size: 9, color: '#FBBF24' });

    // GR Citation Box
    s.rect(500, 260, 380, 75, '#090E17', '#1E293B', 1);
    s.text('OFFICIAL CIRCULAR CITATION: GR CLAUSE 4B', 515, 278, { font: 'F2', size: 9, color: '#F59E0B' });
    s.text('Tribal Development Circular (FY 2026-27):', 515, 298, { font: 'F2', size: 8, color: '#E2E8F0' });
    s.text('"Income certificates submitted for Session 2026-27 must be valid', 515, 314, { font: 'F1', size: 8, color: '#94A3B8' });
    s.text('through 31 March 2027. Earlier certificates are rejected at scrutiny."', 515, 328, { font: 'F1', size: 8, color: '#94A3B8' });

    // Vernacular Audio Player Bar
    s.rect(500, 345, 380, 50, '#1E293B', '#D97706', 1);
    s.badge('AUDIO', 515, 358, '#D97706', '#FFFFFF', '#D97706', 8);
    s.text('Vernacular Audio Guidance Active (Chhattisgarhi SLM):', 570, 365, { font: 'F2', size: 9, color: '#FDE68A' });
    s.text('"Tuhar aay praman patra 31 March ke sira ge he, nawa banwawav..."', 570, 382, { font: 'F1', size: 8, color: '#E2E8F0' });

    s.text('Engine Latency: < 400ms on edge dual-core CPU | Zero Cloud PII Leakage', 500, 420, { font: 'F1', size: 8, color: '#64748B' });

    // Footer
    s.rect(0, 528, 960, 12, '#D97706');
    s.line(60, 485, 900, 485, '#E2E8F0', 1);
    s.text('Key USP: 100% Deterministic policy validation coupled with quantized Indic dialect fine-tunes.', 60, 508, { font: 'F1', size: 10, color: '#64748B' });

    return s.getOperations();
  }

  buildSlide4() {
    const s = this.createSlide();
    s.rect(0, 0, 960, 540, '#F8FAFC');

    s.badge('IMPLEMENTATION & BUDGET', 60, 35, '#DBEAFE', '#1E40AF', '#BFDBFE', 9);
    s.badge('WORKING PROTOTYPE VERIFIED', 230, 35, '#DCFCE7', '#15803D', '#BBF7D0', 9);
    s.text('Slide 04 / 06', 840, 47, { font: 'F2', size: 10, color: '#64748B' });
    s.text('Feasibility & Grounded Unit Economics', 60, 85, { font: 'F2', size: 26, color: '#0F172A' });

    // 3 Columns Grid
    // Col 1: Tech Stack
    s.rect(60, 125, 260, 290, '#FFFFFF', '#E2E8F0', 1);
    s.text('01 / TECH STACK', 80, 150, { font: 'F2', size: 10, color: '#1E3A8A' });
    s.text('Edge Production Stack', 80, 175, { font: 'F2', size: 14, color: '#0F172A' });

    s.text('Client-Side OCR:', 80, 205, { font: 'F2', size: 10, color: '#0F172A' });
    s.text('PaddleOCR / Tesseract WASM with', 80, 222, { font: 'F1', size: 9, color: '#64748B' });
    s.text('on-device 12-digit Aadhaar masking.', 80, 237, { font: 'F1', size: 9, color: '#64748B' });

    s.text('Deterministic Engine:', 80, 265, { font: 'F2', size: 10, color: '#0F172A' });
    s.text('Python regex + date arithmetic;', 80, 282, { font: 'F1', size: 9, color: '#64748B' });
    s.text('official GR policy master circulars.', 80, 297, { font: 'F1', size: 9, color: '#64748B' });

    s.text('Regional SLM:', 80, 325, { font: 'F2', size: 10, color: '#0F172A' });
    s.text('Quantized Indic-Mistral/Llama3 with', 80, 342, { font: 'F1', size: 9, color: '#64748B' });
    s.text('Bhashini TTS/ASR voice pipelines.', 80, 357, { font: 'F1', size: 9, color: '#64748B' });

    s.text('Hardware: Low-spec dual-core PCs.', 80, 395, { font: 'F2', size: 8, color: '#15803D' });

    // Col 2: Budget Breakdown
    s.rect(350, 125, 260, 290, '#FFFFFF', '#E2E8F0', 1);
    s.text('02 / UNIT ECONOMICS', 370, 150, { font: 'F2', size: 10, color: '#D97706' });
    s.text('Rs. 9.5L Pilot Budget', 370, 175, { font: 'F2', size: 14, color: '#0F172A' });

    s.rect(370, 195, 220, 45, '#F8FAFC', '#E2E8F0', 1);
    s.text('Setup Cost per Center', 380, 212, { font: 'F1', size: 9, color: '#64748B' });
    s.text('Rs. 800 - Rs. 1,000', 380, 230, { font: 'F2', size: 11, color: '#0F172A' });

    s.rect(370, 250, 220, 45, '#F8FAFC', '#E2E8F0', 1);
    s.text('Monthly Run Cost / Kendra', 380, 267, { font: 'F1', size: 9, color: '#64748B' });
    s.text('~ Rs. 200 / month', 380, 285, { font: 'F2', size: 11, color: '#0F172A' });

    s.rect(370, 305, 220, 75, '#FEF3C7', '#FDE68A', 1);
    s.text('50-CENTER PILOT (6 MOS)', 380, 322, { font: 'F2', size: 9, color: '#B45309' });
    s.text('Rs. 9.50 Lakhs Total', 380, 345, { font: 'F2', size: 16, color: '#B45309' });
    s.text('Fits Rs. 10L Work Order Cap', 380, 365, { font: 'F2', size: 9, color: '#15803D' });

    s.text('Zero expensive GPU cloud required.', 370, 395, { font: 'F2', size: 8, color: '#15803D' });

    // Col 3: Roadmap
    s.rect(640, 125, 260, 290, '#FFFFFF', '#E2E8F0', 1);
    s.text('03 / 12-MONTH TIMELINE', 660, 150, { font: 'F2', size: 10, color: '#15803D' });
    s.text('Execution Milestones', 660, 175, { font: 'F2', size: 14, color: '#0F172A' });

    s.text('Months 01 - 03: MahaDBT Rules', 660, 205, { font: 'F2', size: 10, color: '#0F172A' });
    s.text('Finalize Maharashtra scholarship circulars;', 660, 222, { font: 'F1', size: 9, color: '#64748B' });
    s.text('10-center Aaple Sarkar sandbox trial.', 660, 237, { font: 'F1', size: 9, color: '#64748B' });

    s.text('Months 04 - 06: 50-Center Pilot', 660, 265, { font: 'F2', size: 10, color: '#0F172A' });
    s.text('Deploy across CG/MH border district belt;', 660, 282, { font: 'F1', size: 9, color: '#64748B' });
    s.text('target 25,000 real verifications.', 660, 297, { font: 'F1', size: 9, color: '#64748B' });

    s.text('Months 07 - 12: State Scale-Up', 660, 325, { font: 'F2', size: 10, color: '#0F172A' });
    s.text('API integration with State IT portals;', 660, 342, { font: 'F1', size: 9, color: '#64748B' });
    s.text('prep for statewide public procurement.', 660, 357, { font: 'F1', size: 9, color: '#64748B' });

    s.text('Target: Statewide expansion.', 660, 395, { font: 'F2', size: 8, color: '#1E3A8A' });

    // Bottom Government Partner Banner
    s.rect(60, 430, 840, 45, '#FFFFFF', '#E2E8F0', 1);
    s.text('TARGET GOV PARTNERS:', 80, 457, { font: 'F2', size: 9, color: '#475569' });
    s.text('* MahaIT & Aaple Sarkar Network    * MSInS / SEEID Incubation    * Zilla Parishad Social Welfare    * CSC Network', 220, 457, { font: 'F2', size: 9, color: '#0F172A' });

    // Footer
    s.rect(0, 528, 960, 12, '#CBD5E1');
    s.line(60, 490, 900, 490, '#E2E8F0', 1);
    s.text('Budget compliant with Seva First Innovation Challenge Rs. 10 Lakh Work Order guidelines.', 60, 510, { font: 'F1', size: 10, color: '#64748B' });

    return s.getOperations();
  }

  buildSlide5() {
    const s = this.createSlide();
    s.rect(0, 0, 960, 540, '#FFFFFF');

    s.badge('IMPACT & SCALE', 60, 35, '#DCFCE7', '#15803D', '#BBF7D0', 9);
    s.text('Slide 05 / 06', 840, 47, { font: 'F2', size: 10, color: '#64748B' });
    s.text('Systemic Impact & Scalability', 60, 85, { font: 'F2', size: 26, color: '#0F172A' });

    // Top 3 Impact Metric Cards (Navy Dark background with vibrant stats)
    s.rect(60, 125, 260, 140, '#0F172A', null, 0);
    s.text('75,000+', 80, 175, { font: 'F2', size: 36, color: '#F59E0B' });
    s.text('Beneficiaries Reached (Yr 1)', 80, 205, { font: 'F2', size: 12, color: '#FFFFFF' });
    s.text('Across 50 pilot centers; preventing', 80, 225, { font: 'F1', size: 9, color: '#94A3B8' });
    s.text('wrongful rejection of rural students.', 80, 240, { font: 'F1', size: 9, color: '#94A3B8' });

    s.rect(350, 125, 260, 140, '#0F172A', null, 0);
    s.text('88% - 94%', 370, 175, { font: 'F2', size: 36, color: '#4ADE80' });
    s.text('Prevented Defect Rate', 370, 205, { font: 'F2', size: 12, color: '#FFFFFF' });
    s.text('Evaluated on 100 synthetic cases;', 370, 225, { font: 'F1', size: 9, color: '#94A3B8' });
    s.text('catches validity & spelling issues.', 370, 240, { font: 'F1', size: 9, color: '#94A3B8' });

    s.rect(640, 125, 260, 140, '#0F172A', null, 0);
    s.text('1.5 Hours', 660, 175, { font: 'F2', size: 36, color: '#38BDF8' });
    s.text('Daily Time Saved Per VLE', 660, 205, { font: 'F2', size: 12, color: '#FFFFFF' });
    s.text('Frees operators from manual checking;', 660, 225, { font: 'F1', size: 9, color: '#94A3B8' });
    s.text('increases daily throughput by 25%.', 660, 240, { font: 'F1', size: 9, color: '#94A3B8' });

    // Bottom Half: Social Equity and State-Agnostic Scalability
    s.rect(60, 290, 400, 165, '#F8FAFC', '#E2E8F0', 1);
    s.text('SOCIAL EQUITY & LINGUISTIC INCLUSION', 80, 318, { font: 'F2', size: 11, color: '#D97706' });
    s.text('Standard portals disenfranchise non-English and non-standard Marathi', 80, 345, { font: 'F1', size: 10, color: '#334155' });
    s.text('speakers through cold SMS rejection notices with bureaucratic error codes.', 80, 363, { font: 'F1', size: 10, color: '#334155' });
    s.text('Seva-Parakh bridges this digital chasm by translating scrutiny findings', 80, 388, { font: 'F1', size: 10, color: '#334155' });
    s.text('into spoken, conversational regional dialects (Chhattisgarhi / Marathi).', 80, 406, { font: 'F2', size: 10, color: '#0F172A' });
    s.text('Result: Closes the digital divide for first-generation applicants.', 80, 432, { font: 'F2', size: 9, color: '#15803D' });

    s.rect(480, 290, 420, 165, '#F8FAFC', '#E2E8F0', 1);
    s.text('STATE-AGNOSTIC MODULAR ARCHITECTURE', 500, 318, { font: 'F2', size: 11, color: '#1E3A8A' });
    s.text('The core deterministic engine is fully separated from state-specific policies.', 500, 345, { font: 'F1', size: 10, color: '#334155' });
    s.text('Expanding to a new state requires only authoring a single JSON rule pack:', 500, 363, { font: 'F1', size: 10, color: '#334155' });
    s.rect(500, 380, 380, 28, '#F1F5F9', '#CBD5E1', 1);
    s.text('/seva_rules/mh_mahadbt.json  <->  /seva_rules/cg_edistrict.json', 515, 398, { font: 'F2', size: 9, color: '#1E293B' });
    s.text('Ready for statewide rollout across 38,000+ Aaple Sarkar Kendras.', 500, 432, { font: 'F2', size: 9, color: '#15803D' });

    // Footer
    s.rect(0, 528, 960, 12, '#15803D');
    s.line(60, 485, 900, 485, '#E2E8F0', 1);
    s.text('Zero recurring per-user cloud licensing fees. Fully sustainable on local VLE center processing.', 60, 508, { font: 'F1', size: 10, color: '#64748B' });

    return s.getOperations();
  }

  buildSlide6() {
    const s = this.createSlide();
    s.rect(0, 0, 960, 540, '#FFFFFF');

    s.badge('TEAM & PARTNERSHIP', 60, 35, '#F1F5F9', '#475569', '#CBD5E1', 9);
    s.text('Slide 06 / 06', 840, 47, { font: 'F2', size: 10, color: '#64748B' });
    s.text('Team, Traction & Rs. 10L Work Order Request', 60, 85, { font: 'F2', size: 26, color: '#0F172A' });

    // Left Column: Team Profiles
    s.rect(60, 125, 400, 180, '#F8FAFC', '#E2E8F0', 1);
    s.badge('SOLO INNOVATOR', 80, 140, '#FEF3C7', '#B45309', '#FDE68A', 8);
    s.text('Jayesh Sahu', 80, 180, { font: 'F2', size: 18, color: '#0F172A' });
    s.text('Lead Developer & Founder, MorMati Labs', 80, 198, { font: 'F2', size: 11, color: '#D97706' });
    s.text('B.Tech Computer Science & Engineering, NIT Raipur', 80, 215, { font: 'F1', size: 10, color: '#64748B' });
    s.text('Specialization: Quantized SLM deployment, Indic NLP, and deterministic', 80, 238, { font: 'F1', size: 10, color: '#334155' });
    s.text('GovTech validation. Built and benchmarked the Seva-Parakh engine.', 80, 255, { font: 'F1', size: 10, color: '#334155' });
    s.text('Working prototype evaluated with 100-case synthetic validation.', 80, 280, { font: 'F2', size: 9, color: '#15803D' });

    s.rect(60, 320, 400, 85, '#F8FAFC', '#E2E8F0', 1);
    s.badge('FACULTY ADVISORY', 80, 335, '#DBEAFE', '#1E40AF', '#BFDBFE', 8);
    s.text('Faculty Mentor - Dept. of CSE, NIT Raipur', 80, 370, { font: 'F2', size: 12, color: '#0F172A' });
    s.text('Advising on systems security, zero-leakage PII architectures & data verification.', 80, 388, { font: 'F1', size: 9, color: '#64748B' });

    // Right Column: Work Order Request Checklist & Closing Pitch
    s.rect(480, 125, 420, 160, '#F8FAFC', '#E2E8F0', 1);
    s.text('WHAT WE SEEK FROM SEVA FIRST CHALLENGE:', 500, 148, { font: 'F2', size: 11, color: '#0F172A' });

    s.text('[X]  Rs. 10 Lakh Work Order / Grant:', 500, 178, { font: 'F2', size: 10, color: '#15803D' });
    s.text('Fully covers edge calibration, training, and 50-center pilot support.', 530, 194, { font: 'F1', size: 9, color: '#64748B' });

    s.text('[X]  50-Center Pilot Mandate:', 500, 218, { font: 'F2', size: 10, color: '#15803D' });
    s.text('Official clearance to deploy workbench in select Aaple Sarkar Kendras.', 530, 234, { font: 'F1', size: 9, color: '#64748B' });

    s.text('[X]  GovTech Scrutiny Circular Access:', 500, 258, { font: 'F2', size: 10, color: '#15803D' });
    s.text('Direct access to edge-case clerk rejection checklists to expand rules.', 530, 274, { font: 'F1', size: 9, color: '#64748B' });

    // Concluding Pitch Box (Civic Navy)
    s.rect(480, 300, 420, 105, '#0F172A', '#1E3A8A', 1.5);
    s.text('COMMITMENT TO THE SEVA FIRST JURY:', 500, 325, { font: 'F2', size: 9, color: '#F59E0B' });
    s.text('"The Rs. 10 Lakh Work Order will bridge our validated Chhattisgarhi', 500, 348, { font: 'F2', size: 10, color: '#FFFFFF' });
    s.text('prototype into a production-grade, 50-center MahaDBT Marathi deployment -', 500, 365, { font: 'F2', size: 10, color: '#FFFFFF' });
    s.text('eliminating preventable welfare rejections before portal upload."', 500, 382, { font: 'F2', size: 10, color: '#FBBF24' });

    // Contact & Footer
    s.rect(0, 528, 960, 12, '#D97706');
    s.line(60, 485, 900, 485, '#E2E8F0', 1);
    s.text('MorMati Labs | National Institute of Technology Raipur | Contact: contact@mormati.in', 60, 508, { font: 'F1', size: 10, color: '#64748B' });

    return s.getOperations();
  }

  // Compile full PDF file buffer
  generate() {
    const slideStreams = [
      this.buildSlide1(),
      this.buildSlide2(),
      this.buildSlide3(),
      this.buildSlide4(),
      this.buildSlide5(),
      this.buildSlide6()
    ];

    const bodyParts = [];
    const offsets = [];
    let currentOffset = 0;

    const addObj = (str) => {
      offsets.push(currentOffset);
      const buf = Buffer.from(str, 'utf-8');
      bodyParts.push(buf);
      currentOffset += buf.length;
    };

    const header = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
    bodyParts.push(Buffer.from(header, 'utf-8'));
    currentOffset += header.length;

    // Obj 1: Catalog
    addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

    // Obj 2: Pages Parent (Kids 3, 5, 7, 9, 11, 13)
    addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R 5 0 R 7 0 R 9 0 R 11 0 R 13 0 R] /Count 6 >>\nendobj\n');

    // Obj 15: Font F1 (Helvetica)
    // Obj 16: Font F2 (Helvetica-Bold)

    // Generate Page & Content Stream objects
    // Pages: 3, 5, 7, 9, 11, 13
    // Streams: 4, 6, 8, 10, 12, 14
    for (let i = 0; i < 6; i++) {
      const pageObjNum = 3 + i * 2;
      const streamObjNum = pageObjNum + 1;
      const streamContent = slideStreams[i];
      const streamLen = Buffer.byteLength(streamContent, 'utf-8');

      // Page Object
      addObj(`${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.width} ${this.height}] /Contents ${streamObjNum} 0 R /Resources << /Font << /F1 15 0 R /F2 16 0 R >> >> >>\nendobj\n`);

      // Content Stream Object
      addObj(`${streamObjNum} 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream\nendobj\n`);
    }

    // Font Objects
    addObj('15 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n');
    addObj('16 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n');

    // XRef Table
    const startXref = currentOffset;
    let xref = `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`;
    for (const offset of offsets) {
      xref += offset.toString().padStart(10, '0') + ' 00000 n \n';
    }

    xref += `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
    bodyParts.push(Buffer.from(xref, 'utf-8'));

    return Buffer.concat(bodyParts);
  }
}

// Run generation
const builder = new PitchDeckPDFBuilder();
const pdfBuffer = builder.generate();
const outPath = path.resolve('C:/Users/JAYESH/Desktop/SevaChallenge/Seva_Parakh_Pitch_Deck.pdf');
fs.writeFileSync(outPath, pdfBuffer);
console.log(`[SUCCESS] PDF generated at: ${outPath} (${pdfBuffer.length} bytes)`);
