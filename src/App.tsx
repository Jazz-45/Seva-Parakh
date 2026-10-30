import { useState, useEffect, useRef, useMemo } from 'react';
import {
  WorkbenchMode,
  StateJurisdiction,
  DialectKey,
  Tone,
  MODES,
  STATE_OPTIONS,
  SCHEME_OPTIONS,
  LANGS,
  CONFIDENCE_THRESHOLD,
  VOICE_DURATION_SEC,
} from './data/sevaData';

const TONE: Record<Tone, { fg: string; bg: string }> = {
  pass: { fg: 'var(--pass)', bg: 'var(--pass-bg)' },
  warn: { fg: 'var(--warn)', bg: 'var(--warn-bg)' },
  fail: { fg: 'var(--fail)', bg: 'var(--fail-bg)' },
};

const WAVE = [10, 16, 22, 14, 24, 20, 12, 22, 16, 10];
const RING_CIRCUMFERENCE = 2 * Math.PI * 26; // r = 26

/** Hover target used to cross-highlight documents and findings. */
type Highlight = { findings: string[]; docs: number[] } | null;

export function App() {
  const [mode, setMode] = useState<WorkbenchMode>('audit');
  const [statePack, setStatePack] = useState<StateJurisdiction>('cg');
  const [scheme, setScheme] = useState<string>(SCHEME_OPTIONS[0]);
  const [dialect, setDialect] = useState<DialectKey>('chhattisgarhi');

  const [isScanning, setIsScanning] = useState(false);
  const [visibleRows, setVisibleRows] = useState(3);
  const [confidence, setConfidence] = useState(0);
  const [displayConfidence, setDisplayConfidence] = useState(0);

  const [openCitation, setOpenCitation] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<Highlight>(null);
  const [doneSteps, setDoneSteps] = useState<boolean[]>([false, false, false]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds, fractional

  const [toast, setToast] = useState<string | null>(null);

  const tickRef = useRef<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  const data = MODES[mode];
  const verdict = data.verdict;
  const quote = data.quotes[dialect];
  const words = useMemo(() => quote.split(' '), [quote]);

  // ---------------------------------------------------------------- helpers
  const later = (fn: () => void, ms: number) => {
    timeoutsRef.current.push(window.setTimeout(fn, ms));
  };

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((p) => (p === msg ? null : p)), 2400);
  };

  const stopVoice = () => {
    setIsPlaying(false);
    setElapsed(0);
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  // Count the confidence number up alongside the 600ms ring animation.
  useEffect(() => {
    const from = displayConfidence;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 600);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayConfidence(Math.round(from + (confidence - from) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confidence]);

  const runAudit = (nextMode: WorkbenchMode, withScan = true) => {
    timeoutsRef.current.forEach(window.clearTimeout);
    timeoutsRef.current = [];
    stopVoice();
    setHighlight(null);

    if (withScan) setIsScanning(true);
    setVisibleRows(0);
    setConfidence(0);
    later(() => setConfidence(MODES[nextMode].confidence), 150);

    const start = withScan ? 300 : 40;
    [1, 2, 3].forEach((n, i) => later(() => setVisibleRows(n), start + i * 80));
    if (withScan) later(() => setIsScanning(false), 1200);
  };

  // Initial audit on mount.
  useEffect(() => {
    runAudit('audit', true);
    return () => {
      timeoutsRef.current.forEach(window.clearTimeout);
      stopVoice();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeMode = (next: WorkbenchMode) => {
    if (next === mode) return;
    setMode(next);
    setOpenCitation(null);
    setDoneSteps([false, false, false]);
    runAudit(next);
  };

  const changeState = (next: StateJurisdiction) => {
    setStatePack(next);
    if (next === 'mh' && dialect === 'chhattisgarhi') setDialect('marathi');
    if (next === 'cg' && dialect === 'marathi') setDialect('chhattisgarhi');
    runAudit(mode, false);
  };

  const changeDialect = (next: DialectKey) => {
    if (isPlaying) stopVoice();
    setDialect(next);
  };

  // ---------------------------------------------------------------- voice
  const toggleVoice = () => {
    if (isPlaying) return stopVoice();
    setIsPlaying(true);
    setElapsed(0);

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(quote);
        u.lang = LANGS.find((l) => l.key === dialect)?.speech ?? 'hi-IN';
        u.rate = 0.95;
        window.speechSynthesis.speak(u);
      } catch {
        /* visual read-along still works without speech */
      }
    }

    const t0 = performance.now();
    tickRef.current = window.setInterval(() => {
      const sec = (performance.now() - t0) / 1000;
      if (sec >= VOICE_DURATION_SEC) {
        stopVoice();
        return;
      }
      setElapsed(sec);
    }, 120);
  };

  const spokenIndex = isPlaying
    ? Math.floor((elapsed / VOICE_DURATION_SEC) * words.length)
    : -1;

  // ---------------------------------------------------------------- cross-highlight
  const hoverDoc = (index: number) =>
    setHighlight({ findings: data.docs[index].findings, docs: [index] });

  const hoverFinding = (id: string) =>
    setHighlight({
      findings: [id],
      docs: data.docs.map((d, i) => (d.findings.includes(id) ? i : -1)).filter((i) => i >= 0),
    });

  const linkClass = (lit: boolean) =>
    highlight ? (lit ? 'is-lit' : 'is-dim') : '';

  // ---------------------------------------------------------------- misc
  const doneCount = doneSteps.filter(Boolean).length;

  const shareSlip = () => {
    const text = `Seva-Parakh Pre-Check\n"${quote}"\n\n${data.steps
      .map((s, i) => `${i + 1}. ${s.title} — ${s.subtitle}`)
      .join('\n')}`;
    navigator.clipboard?.writeText(text);
    showToast('WhatsApp slip copied');
  };

  const vTone = TONE[verdict.tone];
  const confColor =
    confidence === 0
      ? 'var(--tan)'
      : confidence >= CONFIDENCE_THRESHOLD
      ? 'var(--pass)'
      : 'var(--warn)';

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
      {/* ================= TOP BAR ================= */}
      <header className="h-[68px] shrink-0 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3 w-[300px]">
          <img
            src="/logo.svg"
            alt="Seva-Parakh Logo"
            className="w-9 h-9 rounded-xl shadow-xs object-contain"
          />
          <div className="leading-tight">
            <div className="text-[17px] font-bold">Seva-Parakh</div>
            <div className="text-[12px] text-[var(--ink-3)] font-medium">by MorMati Labs</div>
          </div>
        </div>

        <nav className="flex items-center p-1 rounded-full bg-[var(--well)]">
          {(Object.keys(MODES) as WorkbenchMode[]).map((id) => {
            const active = mode === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => changeMode(id)}
                className={`h-9 px-5 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-[var(--surface)] text-[var(--ink)] shadow-[0_1px_3px_rgba(58,42,32,0.14)]'
                    : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
                }`}
              >
                {MODES[id].label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-4 w-[300px]">
          <div className="relative">
            <select
              aria-label="State"
              value={statePack}
              onChange={(e) => changeState(e.target.value as StateJurisdiction)}
              className="h-9 pl-4 pr-9 rounded-full bg-[var(--surface)] border border-[var(--line)] text-[13px] font-semibold text-[var(--ink)] focus:outline-none cursor-pointer"
            >
              {STATE_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--ink-3)]">
              ▼
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--ink-2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--pass)]" />
            On-device
          </div>
        </div>
      </header>

      {/* ================= WORKSPACE ================= */}
      <main className="flex-1 min-h-0 px-8 pb-3 flex gap-6">
        {/* ---------- LEFT: DOCUMENTS ---------- */}
        <section className="w-[38%] min-h-0 relative bg-[var(--surface)] rounded-[20px] p-7 flex flex-col overflow-hidden shadow-[0_1px_2px_rgba(58,42,32,0.04)]">
          {isScanning && <div className="scan-line" />}

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[18px] font-bold">{data.docTitle}</h2>
              <div className="relative mt-1 inline-block">
                <select
                  aria-label="Scheme"
                  value={scheme}
                  onChange={(e) => setScheme(e.target.value)}
                  className="bg-transparent pr-4 text-[13px] text-[var(--ink-2)] font-medium focus:outline-none cursor-pointer"
                >
                  {SCHEME_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[8px] text-[var(--ink-3)]">
                  ▼
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                runAudit(mode);
                showToast('Audit completed in 1.4s');
              }}
              className="h-10 px-5 rounded-full bg-[var(--cocoa)] hover:bg-[var(--cocoa-dark)] text-[#FFF7EE] text-[13px] font-semibold transition-colors cursor-pointer"
            >
              Run audit
            </button>
          </div>

          <p className="text-[12px] text-[var(--ink-3)] mt-5 mb-2">
            Hover a document to see the rules it affects
          </p>

          <ul
            key={mode}
            className="flex-1 min-h-0 flex flex-col gap-1.5 fade-in"
            onMouseLeave={() => setHighlight(null)}
          >
            {data.docs.map((d, i) => {
              const t = TONE[d.status];
              const lit = !!highlight?.docs.includes(i);
              return (
                <li
                  key={d.title}
                  onMouseEnter={() => hoverDoc(i)}
                  className={`linkable flex items-center gap-4 px-4 py-3.5 rounded-2xl ${linkClass(lit)}`}
                  style={{ background: d.status === 'pass' ? 'transparent' : t.bg }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.fg }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold truncate">{d.title}</div>
                    <div className="text-[13px] text-[var(--ink-2)] truncate mt-0.5">
                      {d.subtitle}
                    </div>
                  </div>
                  <span className="text-[12px] font-semibold shrink-0" style={{ color: t.fg }}>
                    {d.badge}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Confidence ring */}
          <div className="pt-5 mt-4 border-t border-[var(--line)] flex items-center gap-4">
            <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 -rotate-90">
              <circle cx="32" cy="32" r="26" fill="none" stroke="var(--well)" strokeWidth="6" />
              <circle
                className="ring-arc"
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke={confColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - confidence / 100)}
              />
            </svg>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-[22px] font-bold tabular-nums" style={{ color: confColor }}>
                  {displayConfidence}%
                </span>
                <span className="text-[13px] font-medium text-[var(--ink-2)]">confidence</span>
              </div>
              <p className="text-[12px] text-[var(--ink-3)] mt-0.5">
                {confidence === 0
                  ? `Threshold for automatic advice: ${CONFIDENCE_THRESHOLD}%`
                  : confidence >= CONFIDENCE_THRESHOLD
                  ? `Above the ${CONFIDENCE_THRESHOLD}% threshold for automatic advice`
                  : `Below ${CONFIDENCE_THRESHOLD}% — handed to the operator`}
              </p>
            </div>
          </div>
        </section>

        {/* ---------- RIGHT ---------- */}
        <section className="w-[62%] min-h-0 flex flex-col gap-5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Verdict + findings */}
          <div className="shrink-0 bg-[var(--surface)] rounded-[20px] p-7 shadow-[0_1px_2px_rgba(58,42,32,0.04)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-[18px] font-bold"
                  style={{ background: vTone.bg, color: vTone.fg }}
                >
                  {verdict.tone === 'fail' ? '✕' : '!'}
                </div>
                <div>
                  <h2 className="text-[20px] font-bold" style={{ color: vTone.fg }}>
                    {verdict.title}
                  </h2>
                  <p className="text-[13.5px] text-[var(--ink-2)] mt-0.5">{verdict.sub}</p>
                </div>
              </div>
              <span className="text-[12px] font-medium text-[var(--ink-3)] mt-1">
                Rules decide · AI explains
              </span>
            </div>

            <ul className="mt-4" onMouseLeave={() => setHighlight(null)}>
              {data.findings.map((f, i) => {
                const t = TONE[f.status];
                const shown = i < visibleRows;
                const lit = !!highlight?.findings.includes(f.id);
                const cite = f.citation ? f.citation[statePack] ?? f.citation.cg : null;
                const isOpen = openCitation === f.id;
                return (
                  <li
                    key={`${mode}-${f.id}`}
                    onMouseEnter={() => hoverFinding(f.id)}
                    className={`linkable rounded-xl border-t border-[var(--line)] ${
                      shown ? 'row-in' : 'opacity-0'
                    } ${linkClass(lit)}`}
                  >
                    <div className="flex items-center gap-4 py-3 px-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.fg }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-semibold">{f.label}</div>
                        <div className="text-[13px] text-[var(--ink-2)] mt-0.5">{f.summary}</div>
                      </div>
                      {f.citation ? (
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setOpenCitation(isOpen ? null : f.id)}
                          className="shrink-0 whitespace-nowrap text-[13px] font-semibold text-[var(--cocoa)] cursor-pointer"
                        >
                          {f.citation.tag} {isOpen ? '▴' : '▾'}
                        </button>
                      ) : (
                        <span className="shrink-0 whitespace-nowrap text-[13px] font-medium text-[var(--ink-3)]">
                          {f.tag}
                        </span>
                      )}
                    </div>

                    {cite && (
                      <div className={`cite ${isOpen ? 'open' : ''}`}>
                        <div>
                          <div className="ml-6 mb-3 rounded-2xl p-4 bg-[var(--well)]">
                            <div className="text-[13px] font-semibold">{cite.title}</div>
                            <div className="text-[12px] text-[var(--ink-2)] mt-0.5">
                              {cite.clause}
                            </div>
                            <p className="deva text-[13.5px] mt-2 mb-0">“{cite.excerpt}”</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Citizen explanation */}
          <div className="flex-1 bg-[#FBF1E6] rounded-[20px] p-7 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold">Citizen explanation</h3>
              <div className="flex items-center p-1 rounded-full bg-[#F2E2D1]">
                {LANGS.map((l) => {
                  const active = dialect === l.key;
                  return (
                    <button
                      key={l.key}
                      type="button"
                      onClick={() => changeDialect(l.key)}
                      className={`deva h-8 px-4 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
                        active
                          ? 'bg-[var(--clay)] text-[#FFF7EE]'
                          : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
                      }`}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 flex items-center gap-6 py-4">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={toggleVoice}
                  aria-label={isPlaying ? 'Pause voice' : 'Play voice'}
                  className="w-14 h-14 rounded-full bg-[var(--clay)] hover:bg-[#A9663F] text-[#FFF7EE] text-[18px] flex items-center justify-center transition-colors cursor-pointer shadow-[0_4px_12px_rgba(192,122,80,0.28)]"
                >
                  {isPlaying ? '❚❚' : '▶'}
                </button>
                <svg className="w-[72px] h-6" viewBox="0 0 80 28" aria-hidden>
                  {WAVE.map((h, i) => {
                    const bh = isPlaying ? h : 6;
                    return (
                      <rect
                        key={i}
                        x={i * 8 + 2}
                        y={(28 - bh) / 2}
                        width="4"
                        height={bh}
                        rx="2"
                        fill={isPlaying ? 'var(--clay)' : 'var(--tan)'}
                        className={isPlaying ? 'wave-live' : ''}
                        style={isPlaying ? { animationDelay: `${i * 0.08}s` } : undefined}
                      />
                    );
                  })}
                </svg>
                <span className="text-[12px] font-medium text-[var(--ink-3)] tabular-nums">
                  0:{String(isPlaying ? Math.floor(elapsed) : VOICE_DURATION_SEC).padStart(2, '0')}
                </span>
              </div>

              <blockquote
                key={`${mode}-${dialect}`}
                className={`deva fade-in m-0 text-[16px] font-medium text-[var(--ink)] border-l-2 border-[var(--tan)] pl-6 ${
                  isPlaying ? 'reading' : ''
                }`}
              >
                {words.map((w, i) => (
                  <span key={i}>
                    <span
                      className={`word ${i <= spokenIndex ? 'said' : ''} ${
                        i === spokenIndex ? 'now' : ''
                      }`}
                    >
                      {w}
                    </span>{' '}
                  </span>
                ))}
              </blockquote>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-semibold">What to do next</span>
              <span
                className="text-[12px] font-medium"
                style={{ color: doneCount === 3 ? 'var(--pass)' : 'var(--ink-3)' }}
              >
                {doneCount === 3 ? 'All done — ready to return' : `${doneCount} of 3 done`}
              </span>
            </div>

            <div className="flex items-stretch gap-4">
              <ol className="flex-1 grid grid-cols-3 gap-3 m-0 p-0 list-none">
                {data.steps.map((s, i) => {
                  const done = doneSteps[i];
                  return (
                    <li key={`${mode}-${i}`}>
                      <button
                        type="button"
                        aria-pressed={done}
                        onClick={() =>
                          setDoneSteps((prev) => prev.map((v, j) => (j === i ? !v : v)))
                        }
                        className="w-full h-full text-left flex gap-3 items-start rounded-2xl px-4 py-3 bg-[var(--surface)] cursor-pointer"
                      >
                        <span
                          className="w-5 h-5 mt-0.5 rounded-full shrink-0 flex items-center justify-center text-[12px] font-bold transition-colors"
                          style={{
                            background: done ? 'var(--cocoa)' : 'transparent',
                            border: `1.5px solid ${done ? 'var(--cocoa)' : 'var(--tan)'}`,
                            color: '#FFF7EE',
                          }}
                        >
                          {done ? '✓' : ''}
                        </span>
                        <span className={done ? 'line-through text-[var(--ink-3)]' : ''}>
                          <span className="block text-[13px] font-semibold">
                            {i + 1}. {s.title}
                          </span>
                          <span className="block text-[12px] text-[var(--ink-2)] mt-0.5">
                            {s.subtitle}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              <div className="flex flex-col justify-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={shareSlip}
                  className="h-9 px-4 rounded-full bg-[var(--surface)] text-[12.5px] font-semibold text-[var(--ink)] hover:bg-white transition-colors cursor-pointer"
                >
                  WhatsApp slip
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Preparing report for print')}
                  className="h-9 px-4 rounded-full bg-[var(--cocoa)] hover:bg-[var(--cocoa-dark)] text-[12.5px] font-semibold text-[#FFF7EE] transition-colors cursor-pointer"
                >
                  Print report
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="h-9 shrink-0 flex items-center justify-center text-[12px] text-[var(--ink-3)]">
        Seva-Parakh is an AI-assisted pre-submission check. Final decisions remain with government
        authorities.
      </footer>

      {toast && (
        <div className="fixed bottom-12 right-8 z-50 bg-[var(--ink)] text-[#FFF7EE] px-4 py-2.5 rounded-full text-[13px] font-medium fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
