export type WorkbenchMode = 'audit' | 'decoder' | 'escalation';
export type StateJurisdiction = 'cg' | 'mh';
export type DialectKey = 'chhattisgarhi' | 'marathi' | 'hindi';
export type Tone = 'pass' | 'warn' | 'fail';

export interface CitationText {
  title: string;
  clause: string;
  excerpt: string;
}

export interface Citation {
  tag: string;
  /** Chhattisgarh wording (also the default for other states). */
  cg: CitationText;
  /** Optional Maharashtra-specific wording. */
  mh?: CitationText;
}

export interface DocRow {
  title: string;
  subtitle: string;
  status: Tone;
  badge: string;
  /** Finding ids this document affects (used for cross-highlighting). */
  findings: string[];
}

export interface Finding {
  id: string;
  status: Tone;
  label: string;
  summary: string;
  citation?: Citation;
  /** Shown instead of a citation link when there is no source to open. */
  tag?: string;
}

export interface Step {
  title: string;
  subtitle: string;
}

export interface ModeData {
  label: string;
  docTitle: string;
  confidence: number;
  verdict: { tone: Tone; title: string; sub: string };
  docs: DocRow[];
  findings: Finding[];
  quotes: Record<DialectKey, string>;
  steps: Step[];
}

export const STATE_OPTIONS: { id: StateJurisdiction; label: string }[] = [
  { id: 'cg', label: 'Chhattisgarh' },
  { id: 'mh', label: 'Maharashtra' },
];

export const SCHEME_OPTIONS: string[] = [
  'Post-Matric Scholarship',
  'Non-Creamy Layer Renewal',
  'Hosteller Maintenance Allowance',
];

export const LANGS: { key: DialectKey; label: string; speech: string }[] = [
  { key: 'chhattisgarhi', label: 'छत्तीसगढ़ी', speech: 'hi-IN' },
  { key: 'marathi', label: 'मराठी', speech: 'mr-IN' },
  { key: 'hindi', label: 'हिन्दी', speech: 'hi-IN' },
];

export const CONFIDENCE_THRESHOLD = 85;
export const VOICE_DURATION_SEC = 12;

export const MODES: Record<WorkbenchMode, ModeData> = {
  // ==========================================================================
  // MODE 1: PRE-SUBMISSION AUDIT
  // ==========================================================================
  audit: {
    label: 'Pre-Submission Audit',
    docTitle: 'Documents',
    confidence: 96,
    verdict: { tone: 'fail', title: 'Hold submission', sub: '2 preventable rejection risks found' },
    docs: [
      {
        title: 'Identity Proof (Aadhaar)',
        subtitle: 'Ramesh Kumar Sahu · DOB 14/08/2006 · [Aadhaar Redacted]',
        status: 'pass',
        badge: 'Verified',
        findings: ['f2', 'f3'],
      },
      {
        title: 'Income Certificate',
        subtitle: 'Ramesh Sahu · Valid till 31/03/2025 · ₹42,000/yr',
        status: 'fail',
        badge: 'Expired · Name mismatch',
        findings: ['f1', 'f2'],
      },
      {
        title: 'Caste Certificate',
        subtitle: 'Ramesh Kumar Sahu · OBC (Non-Creamy)',
        status: 'pass',
        badge: 'Verified',
        findings: ['f3'],
      },
      {
        title: 'Bank Passbook (DBT)',
        subtitle: 'Ramesh Kumar Sahu · SBI · NPCI seeded',
        status: 'pass',
        badge: 'Verified',
        findings: ['f2', 'f3'],
      },
    ],
    findings: [
      {
        id: 'f1',
        status: 'fail',
        label: 'Expired certificate',
        summary:
          'Income certificate expired 31 Mar 2025; FY 2026-27 needs one valid to 31 Mar 2027.',
        citation: {
          tag: 'GR Clause 4B',
          cg: {
            title: 'CG Post-Matric Scholarship Master Circular 2026-27',
            clause: 'Clause 4(B) · Revenue certificate validity',
            excerpt:
              'Income certificates for Academic Session 2026-27 must remain valid through 31 March 2027. Certificates expiring on 31 March 2025 are rejected at District Scrutiny.',
          },
          mh: {
            title: 'MahaDBT GR 2026 · Social Justice & OBC Welfare',
            clause: 'GR Clause 4(B) · Tahsildar income certificate',
            excerpt:
              'सन २०२६-२७ करिता उत्पन्नाचा दाखला दि. ३१ मार्च २०२७ पर्यंत वैध असणे बंधनकारक आहे. दि. ३१/०३/२०२५ रोजी मुदत संपलेले दाखले ग्राह्य नाहीत.',
          },
        },
      },
      {
        id: 'f2',
        status: 'warn',
        label: 'Name variance',
        summary: 'Income cert reads "Ramesh Sahu" — middle name "Kumar" missing vs ID and bank.',
        citation: {
          tag: 'Scrutiny Rule §2.1',
          cg: {
            title: 'e-District & DBT Name Alignment Guideline',
            clause: '§2.1 · Cross-document name consistency',
            excerpt:
              'Where a revenue certificate omits a middle name present on Aadhaar and bank records, the application is flagged for manual query unless corrected before upload.',
          },
          mh: {
            title: 'MahaDBT Desk-Officer Scrutiny Manual',
            clause: '§2.1 · Aadhaar-to-certificate name match',
            excerpt:
              'If the income certificate omits the middle name shown on Aadhaar & bank records, Desk-1 returns the application for correction.',
          },
        },
      },
      {
        id: 'f3',
        status: 'pass',
        label: 'Eligibility & documents',
        summary: 'Income ₹42,000 is under the ₹2.5L limit; caste and bank checks passed.',
        tag: '3 of 4 passed',
      },
    ],
    quotes: {
      chhattisgarhi:
        "भइया रमेश, अभी छात्रवृत्ति फॉर्म जमा झन करव। तुँहर आय प्रमाण पत्र के तारीख 31 मार्च 2025 के सिरा गे हे। पहिली नवा आय प्रमाण पत्र बनवा के लाव अउ ओमा अपन पूरा नाम 'रमेश कुमार साहू' लिखवाहू।",
      marathi:
        "रमेश भाऊ, हा शिष्यवृत्ती अर्ज आत्ताच सबमिट करू नका. तुमच्या उत्पन्नाच्या दाखल्याची मुदत ३१ मार्च २०२५ रोजी संपली आहे. आधी नवीन दाखला काढा आणि त्यावर पूर्ण नाव 'रमेश कुमार साहू' असेच लिहा.",
      hindi:
        "भाई रमेश, अभी छात्रवृत्ति फॉर्म जमा न करें। आपके आय प्रमाण पत्र की वैधता 31 मार्च 2025 को समाप्त हो गई है। पहले नया आय प्रमाण पत्र बनवाएं और उसमें पूरा नाम 'रमेश कुमार साहू' दर्ज करवाएं।",
    },
    steps: [
      { title: 'Renew income certificate', subtitle: 'Apply at Tehsil for FY 2026-27' },
      { title: 'Fix middle name', subtitle: 'Write "Ramesh Kumar Sahu" as on Aadhaar' },
      { title: 'Re-audit & submit', subtitle: 'Bring the new certificate back' },
    ],
  },

  // ==========================================================================
  // MODE 2: REJECTION DECODER
  // ==========================================================================
  decoder: {
    label: 'Rejection Decoder',
    docTitle: 'Portal status',
    confidence: 98,
    verdict: {
      tone: 'warn',
      title: 'Payment blocked at bank',
      sub: 'Approved, but the account is not NPCI-seeded for DBT',
    },
    docs: [
      {
        title: 'Application status',
        subtitle: 'PMS-2026-8841 · Ramesh Kumar Sahu',
        status: 'pass',
        badge: 'Approved',
        findings: ['f3'],
      },
      {
        title: 'DBT payment',
        subtitle: 'NPCI_MAPPER_SEEDING_INACTIVE · ₹18,400',
        status: 'fail',
        badge: 'Halted',
        findings: ['f1'],
      },
      {
        title: 'Bank account (SBI)',
        subtitle: 'Ramesh Kumar Sahu · SBIN0004122',
        status: 'warn',
        badge: 'Mapper inactive',
        findings: ['f1', 'f2'],
      },
      {
        title: 'Aadhaar seed',
        subtitle: 'Ramesh Kumar Sahu · [Aadhaar Redacted]',
        status: 'pass',
        badge: 'Verified',
        findings: ['f2'],
      },
    ],
    findings: [
      {
        id: 'f1',
        status: 'fail',
        label: 'NPCI mapper inactive',
        summary: 'Account is not linked to the NPCI Aadhaar mapper, so DBT credit fails.',
        citation: {
          tag: 'NPCI Rule §3.4',
          cg: {
            title: 'NPCI Aadhaar Payment Bridge & PFMS DBT Circular',
            clause: '§3.4 · NPCI_MAPPER_SEEDING_INACTIVE',
            excerpt:
              'Aadhaar KYC at a branch does not enable DBT. The bank must activate the NPCI mapper flag via the DBT Seeding Mandate Form (Annexure-I).',
          },
        },
      },
      {
        id: 'f2',
        status: 'warn',
        label: 'KYC ≠ DBT seeding',
        summary: 'Aadhaar KYC is active, but the bank’s DBT mapper flag is off.',
        citation: {
          tag: 'IBA SOP §1.8',
          cg: {
            title: 'IBA Welfare DBT Seeding SOP',
            clause: '§1.8 · Core banking NPCI flag',
            excerpt:
              'Branches must use the NPCI Mapper Seeding menu, not plain customer-ID linking. Sync completes within 48 hours.',
          },
        },
      },
      {
        id: 'f3',
        status: 'pass',
        label: 'Sanction intact',
        summary: '₹18,400 approval is safe — do not file a duplicate application.',
        tag: 'Auto-retry',
      },
    ],
    quotes: {
      chhattisgarhi:
        'भइया रमेश, तुँहर छात्रवृत्ति पास हो गे हे, फेर बैंक खाता एनपीसीआई डीबीटी ले लिंक नइ हे। आज ही बैंक भा डाकघर जाके आधार सीडिंग फॉर्म जमा करव, तभे पइसा खाता म आही।',
      marathi:
        'रमेश भाऊ, तुमची शिष्यवृत्ती मंजूर झाली आहे, पण बँक खात्याला NPCI आधार सीडिंग नसल्यामुळे पैसे थांबले आहेत. बँकेत जाऊन DBT सीडिंग फॉर्म जमा करा.',
      hindi:
        'भाई रमेश, आपकी छात्रवृत्ति स्वीकृत है, लेकिन बैंक खाते में NPCI आधार सीडिंग निष्क्रिय होने से भुगतान रुका है। बैंक जाकर तुरंत DBT सीडिंग फॉर्म जमा करें।',
    },
    steps: [
      { title: 'Visit bank or post office', subtitle: 'Carry passbook and Aadhaar' },
      { title: 'Submit mandate form', subtitle: 'Signed NPCI DBT seeding form' },
      { title: 'Confirm seeding', subtitle: 'Payment retries within 48 hrs' },
    ],
  },

  // ==========================================================================
  // MODE 3: LOW-CONFIDENCE ESCALATION
  // ==========================================================================
  escalation: {
    label: 'Low-Confidence',
    docTitle: 'Documents',
    confidence: 42,
    verdict: {
      tone: 'warn',
      title: 'Sent to operator',
      sub: 'Confidence 42% is below the 85% threshold — AI abstained',
    },
    docs: [
      {
        title: 'Identity Proof (Aadhaar)',
        subtitle: 'Ramesh Kumar Sahu · [Aadhaar Redacted]',
        status: 'pass',
        badge: 'Verified',
        findings: ['f3'],
      },
      {
        title: 'Income Certificate',
        subtitle: 'Handwritten · faded seal · crease over barcode',
        status: 'warn',
        badge: 'Unreadable',
        findings: ['f1', 'f2'],
      },
      {
        title: 'Caste Certificate',
        subtitle: 'Ramesh Kumar Sahu · OBC (Non-Creamy)',
        status: 'pass',
        badge: 'Verified',
        findings: ['f3'],
      },
      {
        title: 'Bank Passbook (DBT)',
        subtitle: 'Ramesh Kumar Sahu · SBI · NPCI seeded',
        status: 'pass',
        badge: 'Verified',
        findings: ['f3'],
      },
    ],
    findings: [
      {
        id: 'f1',
        status: 'warn',
        label: 'AI abstained',
        summary: 'Seal readability 42% is under the 85% safety threshold.',
        citation: {
          tag: 'Safety Rule §1.2',
          cg: {
            title: 'MorMati Civic AI Safety Standard',
            clause: '§1.2 · Abstain below 85% confidence',
            excerpt:
              'When OCR confidence falls below 85% (faded stamps, handwriting), Seva-Parakh makes no pass/fail call and hands the case to the operator.',
          },
        },
      },
      {
        id: 'f2',
        status: 'warn',
        label: 'Barcode unreadable',
        summary: 'e-District security number hidden by a fold crease.',
        tag: 'Manual lookup',
      },
      {
        id: 'f3',
        status: 'pass',
        label: 'Other documents',
        summary: 'Identity, caste and bank documents passed cleanly.',
        tag: '3 of 4 passed',
      },
    ],
    quotes: {
      chhattisgarhi:
        'भइया रमेश, तुँहर प्रमाण पत्र के सील अउ अक्षर साफ नइ दिखत हे। मशीन अंदाजा नइ लगावय, एखर सेती ऑपरेटर भइया ह सरकारी पोर्टल म एकर खुद जांच करही।',
      marathi:
        'रमेश भाऊ, या दाखल्यावरील शिक्का अस्पष्ट आहे. चुकीचा सल्ला टाळण्यासाठी मशीनने निर्णय थांबवला असून ऑपरेटर आता पोर्टलवर स्वतः तपासणी करतील.',
      hindi:
        'भाई रमेश, आपके प्रमाण पत्र की मुहर धुंधली है। गलत सलाह से बचने के लिए सिस्टम ने निर्णय रोक दिया है, अब ऑपरेटर पोर्टल पर स्वयं जांच करेंगे।',
    },
    steps: [
      { title: 'Operator portal check', subtitle: 'Verify serial on e-District' },
      { title: 'Flatten & re-scan', subtitle: '300 DPI, crease pressed flat' },
      { title: 'Operator override', subtitle: 'Attach a verification note' },
    ],
  },
};
