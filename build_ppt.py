"""Builds Seva_Parakh_Pitch_Deck.pptx from the Seva First template using content of the PDF pitch."""
import copy
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.util import Pt

SRC = "Seva-First-Innovation-Challenge-PPT-Template.pptx"
OUT = "Seva_Parakh_Pitch_Deck.pptx"
DARK = RGBColor(0x26, 0x32, 0x38)

prs = Presentation(SRC)
S = [list(s.shapes) for s in prs.slides]


def setp(shape, text, size=None, dark=False, bold=None):
    """Replace text keeping the first run's formatting. '\n' creates new paragraphs."""
    tf = shape.text_frame
    p0 = tf.paragraphs[0]
    for p in tf.paragraphs[1:]:
        p._p.getparent().remove(p._p)
    for r in p0.runs[1:]:
        r._r.getparent().remove(r._r)
    template_p = copy.deepcopy(p0._p)
    lines = text.split("\n")
    for i, line in enumerate(lines):
        if i == 0:
            p = p0
        else:
            new = copy.deepcopy(template_p)
            tf._txBody.append(new)
            p = tf.paragraphs[-1]
        if p.runs:
            r = p.runs[0]
        else:
            r = p.add_run()
        r.text = line
        if size:
            r.font.size = Pt(size)
        if dark:
            r.font.color.rgb = DARK
        if bold is not None:
            r.font.bold = bold
    tf.word_wrap = True


def remove(shape):
    shape._element.getparent().remove(shape._element)


# ---------- Slide 1: Title ----------
DARK = RGBColor(0xFF, 0xFF, 0xFF)
s = S[0]
setp(s[0], "SEVA FIRST INNOVATION CHALLENGE 2026  •  GOVTECH TRACK  •  SF-2026-MORM")
setp(s[1], "SEVA-PARAKH", dark=True)
setp(s[2], "A vernacular pre-submission document audit & rejection-decoder tool that helps "
           "citizens and CSC operators catch application defects BEFORE portal upload.\n"
           "by MorMati Labs  |  Jayesh Sahu, B.Tech CSE, NIT Raipur", dark=True, size=12)
setp(s[4], "At a glance")
setp(s[5], "Deterministic Rule Engine – 100% policy grounded, zero AI hallucination\n"
           "Validates dates, GR circulars & spelling via regex + GR index\n"
           "Regional SLM + vernacular audio (Chhattisgarhi & Marathi)\n"
           "Pilot: 50 Aaple Sarkar Kendras\n"
           "Budget: ₹9.5 L (within ₹10 L Work Order cap)", size=11)

s[2].top = s[1].top + 700000
# ---------- Slide 2: Problem ----------
DARK = RGBColor(0x26, 0x32, 0x38)
s = S[1]
setp(s[7], "Scholarship & DBT applications get \"sent back\" not for ineligibility but for "
           "preventable defects: expired income certificates, name spelling variances "
           "(Sahu vs Saw) and unlinked NPCI bank accounts.", size=10, dark=True)
setp(s[10], "Rural students and first-generation applicants, plus Aaple Sarkar / Lok Seva "
            "Kendra VLE operators, in Maharashtra & Chhattisgarh.", size=10, dark=True)
setp(s[13], "100-case synthetic benchmark: e-District & DBT portals accept defective PDFs at "
            "upload, shifting 100% of verification to scrutiny clerks. Each defect wastes "
            "12–15 min of operator time.", size=10, dark=True)
setp(s[16], "Portals do no pre-upload checks; chatbots only recite scheme rules and CANNOT "
            "cross-audit scanned documents or verify certificate dates against circulars.",
     size=10, dark=True)
DARK = RGBColor(0xFF, 0xFF, 0xFF)
setp(s[18], "30%+", dark=True)
setp(s[19], "of government scrutiny clerk effort spent re-opening & rejecting preventable "
            "clerical defects", dark=True)
setp(s[21], "₹150–₹300 lost per citizen per rejection in bus trips, re-scanning and lost wages.",
     dark=True)

# ---------- Slide 3: Solution ----------
DARK = RGBColor(0x26, 0x32, 0x38)
s = S[2]
setp(s[6], "\"Rules Decide. AI Explains.\" Seva-Parakh audits scanned documents on-device "
           "before upload: a deterministic engine checks validity against State GR circulars, "
           "and a quantized regional SLM explains any rejection as spoken Chhattisgarhi / "
           "Marathi advice. Latency < 400 ms on a dual-core CPU, zero cloud PII leakage.",
     size=10, dark=True)
setp(s[11], "Drop & Redact")
setp(s[12], "Client-side OCR; auto-masks 12-digit Aadhaar", size=8, dark=True)
setp(s[17], "Rule Engine")
setp(s[18], "Checks expiry vs GR circulars & cross-script spelling", size=8, dark=True)
setp(s[23], "Audio Advice")
setp(s[24], "PASS/FAIL/WARN + spoken dialect guidance", size=8, dark=True)
table = [sh for sh in prs.slides[2].shapes if sh.has_table][0].table
rows = [
    ("Cost", "₹150+ lost / trip", "< ₹0.15 / audit"),
    ("Speed / time", "12–15 min manual", "< 4 sec automated"),
    ("Reach / access", "Cryptic SMS codes", "Spoken dialect audio"),
    ("Ease of use", "Clerk-side scrutiny", "Pre-upload, at the VLE"),
]
for ri, row in enumerate(rows, start=1):
    for ci, val in enumerate(row):
        cell = table.cell(ri, ci)
        para = cell.text_frame.paragraphs[0]
        run = para.runs[0] if para.runs else para.add_run()
        for r in para.runs[1:]:
            r._r.getparent().remove(r._r)
        run.text = val
        if ci > 0:
            run.font.color.rgb = DARK
setp(s[-1], "100% deterministic policy validation coupled with quantized Indic dialect "
            "fine-tunes – rules decide, AI only explains, so zero hallucinated rejections.",
     size=10, dark=True)

# ---------- Slide 4: Feasibility ----------
s = S[3]
stage = s[11]  # Working Prototype oval
stage.fill.solid()
stage.fill.fore_color.rgb = RGBColor(0x2E, 0x7D, 0x32)
stage.text_frame.text = "✔"
r = stage.text_frame.paragraphs[0].runs[0]
r.font.size = Pt(12); r.font.bold = True; r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
setp(s[12], "Working Prototype ✔", bold=True)
setp(s[19], "• OCR: PaddleOCR / Tesseract WASM with on-device Aadhaar masking\n"
            "• Engine: Python regex + date arithmetic on GR master circulars\n"
            "• SLM: Quantized Indic-Mistral/Llama3 + Bhashini TTS/ASR\n"
            "• Runs on low-spec dual-core PCs", size=8.5, dark=True)
setp(s[22], "• Setup: ₹800–1,000 / center\n"
            "• Run cost: ~₹200 / month / Kendra\n"
            "• 50-center, 6-month pilot: ₹9.50 Lakh total – fits ₹10 L cap\n"
            "• No GPU cloud required", size=8.5, dark=True)
setp(s[25], "• M1–3: MahaDBT rules; 10-center Aaple Sarkar sandbox\n"
            "• M4–6: 50-center pilot, CG/MH border belt, 25,000 verifications\n"
            "• M7–12: State IT portal API integration; statewide procurement prep",
     size=8.5, dark=True)
setp(s[28], "• MahaIT & Aaple Sarkar Network\n"
            "• MSInS / SEEID Incubation\n"
            "• Zilla Parishad Social Welfare\n"
            "• CSC Network", size=8.5, dark=True)

# ---------- Slide 5: Impact ----------
s = S[4]
setp(s[6], "75,000+", dark=True)
setp(s[8], "across 50 pilot centers in Year 1", dark=True)
setp(s[10], "88–94%", dark=True)
setp(s[11], "Defects prevented")
setp(s[12], "on 100 synthetic cases; check time 15 min → 4 sec", dark=True)
setp(s[14], "1.5 hrs / day", dark=True)
setp(s[15], "Saved per VLE operator")
setp(s[16], "+25% daily throughput for 50+ VLE livelihoods", dark=True)
setp(s[19], "Translates cryptic, English bureaucratic rejection codes into spoken "
            "Chhattisgarhi / Marathi – closing the digital divide for rural, non-English "
            "and first-generation applicants. Aadhaar masked on-device for privacy.",
     size=9.5, dark=True)
setp(s[22], "Zero recurring per-user cloud licensing; runs on existing VLE center PCs at "
            "~₹200/month. Funded via department work orders / per-center subscription "
            "under State IT budgets.", size=9.5, dark=True)
setp(s[25], "State-agnostic engine: a new state needs only one JSON rule pack "
            "(e.g. mh_mahadbt.json ↔ cg_edistrict.json). Ready for rollout across "
            "38,000+ Aaple Sarkar Kendras.", size=9.5, dark=True)

# ---------- Slide 6: Team & Support ----------
DARK = RGBColor(0xFF, 0xFF, 0xFF)
s = S[5]
setp(s[6], "JS")
setp(s[7], "Jayesh Sahu", dark=True)
setp(s[8], "Founder & Lead Developer, MorMati Labs (Solo Innovator)", size=7, dark=True)
setp(s[9], "B.Tech CSE, NIT Raipur – Quantized SLMs, Indic NLP, GovTech validation",
     size=7, dark=True)
setp(s[12], "FM")
setp(s[13], "Faculty Mentor", dark=True)
setp(s[14], "Advisor, Dept. of CSE, NIT Raipur", size=7, dark=True)
setp(s[15], "Systems security, zero-leakage PII architecture & data verification",
     size=7, dark=True)
for sh in s[16:28]:  # unused team cards 3 & 4
    remove(sh)
mentor = s[28]
mentor.top = s[16].top
mentor.height = s[16].height + 600000
setp(mentor, "Traction: Working prototype built & benchmarked on a 100-case synthetic "
             "validation set (88–94% defects caught).\n"
             "\"The ₹10 Lakh Work Order will bridge our validated Chhattisgarhi prototype "
             "into a production-grade, 50-center MahaDBT Marathi deployment.\"",
     size=10, dark=True)
for i in (31, 33, 35, 37, 39):
    s[i].fill.solid(); s[i].fill.fore_color.rgb = RGBColor(0xF2, 0x8C, 0x28)
DARK = RGBColor(0x26, 0x32, 0x38)
setp(s[32], "Mentorship & GovTech scrutiny circular access")
setp(s[34], "50-Center pilot mandate (Aaple Sarkar)")
setp(s[36], "₹10 Lakh Work Order / grant")
setp(s[38], "Incubation (MSInS / SEEID)")
setp(s[40], "Edge calibration & field testing support")
setp(s[41], "Challenge support takes Seva-Parakh from prototype to a 50-center pilot, "
            "eliminating preventable welfare rejections before portal upload.",
     size=9.5, dark=True)
setp(s[42], "Thank you  |  MorMati Labs, NIT Raipur  |  contact@mormati.in")

prs.save(OUT)
print("saved", OUT)


