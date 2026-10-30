# Master Guide: Generating GovTech PDF Pitch Decks with Claude
### Specialized for "Seva-Parakh" (MorMati Labs) — Seva First Innovation Challenge 2026

---

## 1. Executive Summary & Objective

This guide is specifically engineered to direct **Anthropic's Claude models** (Claude 3.5 Sonnet, Claude Opus 3.5/5.5) to produce a **magazine-grade, 6-slide widescreen (16:9) PDF pitch deck**.

### Why Claude Models Require a Dedicated Guide
1. **Preventing Generic "AI Startup" Tropes:** Claude tends to default to standard SaaS tropes (purple gradients, floaty drop-shadows, buzzwords like "revolutionizing" or "game-changing"). For government jury evaluation (MahaIT, MSInS, Zilla Parishad), the tone must be **bureaucratic, deterministic, evidence-backed, and audit-ready**.
2. **Preventing Multi-Page PDF Spills:** When generating HTML/CSS for PDF export, AI models frequently cause slides to overflow vertically, turning a 6-slide deck into an awkward 8-page document with orphan lines. This guide provides exact deterministic CSS pagination constraints.
3. **Artifact-Driven Direct Export:** Claude’s Artifact system allows it to render raw, self-contained HTML/CSS directly. Using browser print (`Ctrl + P` $\rightarrow$ "Save as PDF"), you obtain a vector-crisp 1080p PDF without external compilation tools.

---

## 2. Technical Stack & PDF Rendering Architecture

The optimal mechanism for Claude to generate a presentation deck is **Single-File Print-Ready HTML5 + CSS (with optional Tailwind CDN & Embedded SVGs)**.

### CSS Foundation for Zero-Spill 16:9 PDF Export
Claude must embed this exact CSS block inside the `<head>` of the artifact:

```css
@page {
  size: 16in 9in; /* Standard 16:9 widescreen presentation */
  margin: 0;      /* Suppresses browser default headers/footers */
}

@media print {
  html, body {
    width: 16in;
    height: 9in;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .slide {
    width: 16in !important;
    height: 9in !important;
    max-height: 9in !important;
    page-break-after: always !important;
    break-after: page !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
    position: relative !important;
  }
}

/* Screen Preview Styling */
@media screen {
  body {
    background-color: #0f172a;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    padding: 32px 0;
  }
  .slide {
    width: 16in;
    height: 9in;
    background: #ffffff;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
  }
}
```

---

## 3. Civic Precision Design System & Color Tokens

Claude must strictly observe these design tokens. No deviation to generic blue or purple gradients.

| Token | Name | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Canvas** | Pure White / Alabaster | `#FFFFFF` / `#F8F7F4` | Slide 2–6 background |
| **Primary** | Ashoka Civic Navy | `#1E3A8A` / `#0F172A` | Slide 1 background, headers, major cards |
| **Secondary** | Mati Terracotta / Ochre | `#D97706` / `#B45309` | Vernacular highlights, SLM tags, callouts |
| **Success** | Republic Green | `#15803D` / `#16A34A` | Validations, 0% hallucination badges, pass metrics |
| **Alert** | Scrutiny Crimson | `#B91C1C` / `#DC2626` | Defect callouts, preventable rejection costs |
| **Slate / Body**| Bureau Dark Slate | `#334155` / `#1E293B` | Body copy, table cells, secondary descriptions |
| **Border / Rule**| Subtle Zinc | `#E2E8F0` / `#CBD5E1` | Card outlines, table separators (1px solid) |

### Typography Guidelines for Claude
* **Display/Headings:** `Plus Jakarta Sans`, `Inter`, or `system-ui, -apple-system, sans-serif`
* **Letter Spacing:** `-0.025em` on headings for authoritative weight.
* **Weights:** `font-extrabold` (800) for hero metrics, `font-bold` (700) for headers, `font-normal` (400) or `font-medium` (500) for body.
* **Alignment Rule:** Strict left alignment. Never center-align narrative text.

---

## 4. Slide-by-Slide Content & Layout Specification

### Slide 1: Title Slide (Civic Authority)
* **Background:** Deep Civic Navy (`#0F172A` with `#1E3A8A` subtle geometric grid lines).
* **Tagline Badge:** `SEVA FIRST INNOVATION CHALLENGE 2026 • GOVTECH TRACK` (Gold/Ochre bordered badge).
* **Title:** **SEVA-PARAKH** (Font size: 64pt, Bold, White).
* **Sub-title:** by **MorMati Labs** (Solo Student Innovator — B.Tech CSE, NIT Raipur).
* **One-Line Value Proposition:** A vernacular pre-submission document audit and rejection-decoder tool that helps citizens and operators catch application defects before portal upload.
* **Visual Anchor:** Clean SVG isometric/flat illustration showing a scanned document passing through an automated scan beam into a verified checkmark with Marathi & Chhattisgarhi audio waveforms.
* **Footer:** Objective: Reducing government scrutiny overhead and DBT failure rates.

---

### Slide 2: The Problem (Systemic Bottlenecks & Evidence)
* **Visual Structure:** 2-Column Split (55% Narrative & Data, 45% High-Impact Metric Cards).
* **Problem Narrative:**
  * **Root Cause:** Thousands of scholarship and welfare applications get marked "Sent Back" or fail DBT payout not due to ineligibility, but due to preventable submission defects (cross-document name mismatches, expired certificates, unmapped NPCI bank accounts).
  * **Linguistic Barrier:** Rural citizens cannot interpret cryptic portal error codes (e.g., *MahaDBT Code 402: Revenue Certificate Expiry Mismatch*).
  * **Affected Stakeholders:** Rural students, Aaple Sarkar / Lok Seva Kendra VLEs, and District Scrutiny Clerks across Maharashtra and Chhattisgarh.
* **Synthetic Benchmark Evidence (100-Case Evaluation):**
  * Existing state e-District & DBT portals blindly accept files with expired validity dates and phonetic name variants, shifting 100% of the validation burden to human scrutiny officers.
* **Right Column Metric Cards:**
  * **Card 1 (Crimson Alert):** `30%+` Govt Scrutiny Workload caused entirely by preventable document submission defects.
  * **Card 2 (Ochre Warning):** `₹150 – ₹300` Citizen Cash Burn per rejected application in repeat travel, re-scanning, and wage loss.
  * **Card 3 (Slate Neutral):** `10–15 Mins` Operator Time wasted per submission trying to diagnose rejection notices.

---

### Slide 3: Solution & Innovation (The Hero Architecture Slide)
* **Guiding Thesis:** **"Rules Decide. AI Explains."**
* **Visual Structure:** Asymmetric Split (38% Left Column for Engine & Comparison; 62% Right Column for Dashboard UI Artifact).
* **Architecture Flow (3 Steps):**
  1. **Step 1: Local Ingestion & OCR:** Scanned PDF/JPG ingested on-device; Aadhaar numbers masked client-side before processing.
  2. **Step 2: Deterministic Rule Engine (0% Hallucination):** Cross-checks certificate issue/expiry dates against official Government Resolutions (GRs) and performs Indic cross-script phonetic matching.
  3. **Step 3: Regional SLM Decoder:** Converts technical rejection clauses into natural spoken Chhattisgarhi, Marathi, and Hindi audio guidance.
* **Comparison Matrix Table:**
  | Metric | Standard Portal Flow | Seva-Parakh Workbench |
  | :--- | :--- | :--- |
  | **Pre-Check Cost** | ₹150+ lost in repeat trips | **< ₹0.15** per automated check |
  | **Verification Speed**| 12–15 mins manual review | **< 4 seconds** local validation |
  | **Language Delivery** | English / Complex Marathi codes | **Spoken Native Dialect Audio (TTS)** |
  | **Policy Grounding** | None at upload time | **Direct Govt Resolution (GR) Citation** |
* **Right Column UI Artifact:** An inline SVG/CSS mockup of the Seva-Parakh audit screen showing:
  * Document Checklist (Income Cert Expired ✕, Aadhaar ✓, Caste Cert ✓).
  * Citation Badge (`GR Clause 4B - Revenue Dept`).
  * Vernacular audio player bar with waveform (`Chhattisgarhi voice guidance active`).

---

### Slide 4: Feasibility & Implementation
* **Visual Structure:** 3-Column Grid (Technical Architecture, Unit Economics & Budget, Milestones) with Bottom Government Partner Bar.
* **Column 1: Production Tech Stack:**
  * Client-side OCR + PII Redaction (PaddleOCR / Tesseract WASM).
  * Deterministic Python/FastAPI Rule Engine (Zero LLM hallucination on dates).
  * Source-Grounded RAG with GR Master Circulars index.
  * Quantized Regional SLM (Llama-3-8B / Indic-Mistral fine-tune) + Bhashini Indic TTS/ASR.
* **Column 2: Cost & Deployment Model:**
  * **Hardware/Center Setup:** ₹800 – ₹1,000 one-off setup (works on existing low-end VLE dual-core PCs).
  * **Operating Cost:** ~₹200/month per Seva Kendra.
  * **Pilot Budget (₹10 Lakh Work Order):** Allocated ₹9.5 Lakhs for a 50-Center District Pilot over 6 months.
* **Column 3: 12-Month Deployment Timeline:**
  * **Months 1–3:** Finalize MahaDBT Rule Packs & 10-center Aaple Sarkar trial.
  * **Months 4–6:** 50-Center Block Pilot in border district (CG/MH border: Gondia/Rajnandgaon).
  * **Months 7–12:** Direct API integration with State e-Governance infrastructure.
* **Bottom Partner Row:** Endorsed by / Integrating with: MahaIT, SEEID / MSInS, Zilla Parishad Social Welfare Dept, and CSC / Aaple Sarkar Kendra Network.

---

### Slide 5: Impact & Scalability
* **Visual Structure:** Top 3 Stat Statues + Bottom Split (Social Inclusion vs. Technical Scalability).
* **Top Metric Callouts:**
  * `75,000+` Beneficiaries Reached in Year 1 across 50 pilot centers.
  * `88% – 94%` Prevented Rejection Rate measured on synthetic benchmark cases.
  * `1.5 Hours/Day` Freed per VLE Operator, increasing daily citizen throughput by 25%.
* **Bottom Left: Social & Administrative Impact:**
  * **Linguistic Inclusion:** Closes the digital divide for first-generation rural applicants who cannot read portal English/official Marathi.
  * **Administrative Relief:** Directly reduces duplicate grievance petitions and scrutiny backlog at Tehsil & District Welfare Offices.
* **Bottom Right: State-Agnostic Scalability:**
  * **Modular Rule Packs:** Clean separation of core validation engine from state jurisdiction configs (`/seva_rules/mh_mahadbt.json` vs. `/seva_rules/cg_edistrict.json`).
  * Ready for rapid rollout across 38,000+ Aaple Sarkar Kendras across Maharashtra.

---

### Slide 6: Team, Track Record & Work Order Request
* **Visual Structure:** 2-Column Split (45% Team Credibility, 55% Request for Support & Work Order Commitment).
* **Left Column: Team Profiles:**
  * **Jayesh Sahu** — Solo Innovator & Developer, MorMati Labs.
    * B.Tech Computer Science & Engineering, National Institute of Technology (NIT) Raipur.
    * Specialization: Quantized SLM deployment, Indic NLP, deterministic GovTech validation workflows.
  * **Faculty Mentor** — NIT Raipur (Advisory on Distributed Systems & Systems Security).
  * **Current Validation:** Functional working prototype with 100-case synthetic validation benchmark completed.
* **Right Column: ₹10 Lakh Work Order Commitment:**
  * **What We Seek:**
    * [x] **Pilot Deployment Approval:** Access to 50 Aaple Sarkar Kendras in pilot district.
    * [x] **MahaIT/e-District Scrutiny Guidelines:** Access to edge-case rule circulars.
    * [x] **Challenge Work Order:** ₹10 Lakhs grant funding to sustain cloud infrastructure, local hardware calibration, and field researcher allowances.
* **Closing Statement (Prominent Navy Box):**
  *"The ₹10 Lakh Work Order will bridge our validated Chhattisgarhi prototype into a production-grade, 50-center MahaDBT Marathi deployment — eliminating preventable rejections for thousands of rural citizens."*
* **Contact:** MorMati Labs • NIT Raipur • contact@mormati.in

---

## 5. Master Prompt Template for Claude

Copy and paste the exact prompt below into **Claude 3.5 Sonnet or Claude Opus** to generate the complete, self-contained HTML slide deck ready to save as PDF.

```markdown
You are an elite GovTech Designer and Principal Frontend Engineer. 
Generate a complete, production-ready, single-file HTML/CSS presentation deck for the "Seva First Innovation Challenge 2026" based on the project "Seva-Parakh" (by MorMati Labs).

STRICT OUTPUT CONSTRAINTS:
1. Provide the complete code in a single standalone HTML artifact. Include Tailwind CSS CDN and custom @media print rules.
2. The presentation MUST contain exactly 6 widescreen (16:9) slides.
3. Use the CSS print specification below to ensure that when the user presses Ctrl+P (Print to PDF), each slide occupies exactly one 16in x 9in landscape page with zero margin overflow or extra blank pages:
   @page { size: 16in 9in; margin: 0; }
   @media print {
     html, body { width: 16in; height: 9in; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
     .slide { width: 16in !important; height: 9in !important; max-height: 9in !important; page-break-after: always !important; break-after: page !important; overflow: hidden !important; box-sizing: border-box !important; position: relative !important; }
   }
4. Color Palette:
   - Primary Dark/Navy: #0F172A and #1E3A8A (Ashoka Civic Navy)
   - Canvas/Light: #FFFFFF and #F8FAFC
   - Regional Accent: #D97706 / #B45309 (Mati Terracotta)
   - Success: #15803D (Forest/Republic Green)
   - Alert: #B91C1C (Scrutiny Crimson)
5. Tone: Objective, authoritative, evidence-backed, GovTech-focused. No startup fluff or ungrounded AI buzzwords.
6. All placeholders MUST be replaced with exact, detailed data from the Seva-Parakh project:
   - Solo Founder: Jayesh Sahu (B.Tech CSE, NIT Raipur) | MorMati Labs
   - Prototype Stage: Working Prototype with 100-case synthetic evaluation benchmark completed
   - Cost: ₹800-₹1000 setup, ~₹200/mo operating cost, ₹9.5 Lakh pilot budget within the ₹10 Lakh Work Order
   - USP: "Rules Decide. AI Explains." Deterministic OCR + Python Engine + Local Regional SLM (Chhattisgarhi/Marathi audio) + Official GR Citations.
7. Render rich inline visual UI mockups, comparison tables, process micro-flows, and metric cards using clean Tailwind/HTML/SVG. Do not use external image links that could fail to load.

Generate the complete HTML file now.
```

---

## 6. How to Export to PDF with 100% Precision

1. Open the generated HTML file in **Google Chrome**, **Microsoft Edge**, or **Brave**.
2. Press **`Ctrl + P`** (or `Cmd + P` on macOS).
3. Set the print configuration:
   * **Destination:** `Save as PDF`
   * **Layout:** `Landscape`
   * **Paper Size:** `Letter` or `Tabloid` / `Custom (16 x 9 in)` (if available, or select `A4` with `Fit to printable area` disabled / `Default`)
   * **Margins:** **`None`** (Critical: prevents Chrome from adding 0.4in borders)
   * **Options:** Check **`Background graphics`** (Critical: renders colors and badges)
4. Click **Save**. You will have an immaculate, professional 6-page GovTech Pitch Deck PDF.
