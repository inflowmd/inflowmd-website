"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { LazyMotion, domAnimation, m, useInView, useReducedMotion } from "framer-motion";

/* ============================================================
   Why we build it this way — the third piece.

   The deck argues three things (visibility, performance, vein
   education). The audit measures the first two against a real
   practice site. This page is what a doctor lands on from the
   report's "How we fix all of this" button, and it has one job:
   explain why those numbers are a property of the architecture
   rather than a to-do list.

   It therefore shares the deck's and the report's visual language
   exactly — navy ground, lime accent, brand blue as the secondary,
   the deck's dot-grid texture and act-label numbering — so it reads
   as the same product rather than as a technology blog post.

   This is also the ONLY page that names Next.js, React and Vercel.
   /pitch and /audit are deliberately architecture-neutral: they say
   "modern architecture" so the argument survives whatever we build
   on next. The names live here, where a doctor who wants to go and
   look them up can.
   ============================================================ */

const NAVY = "#081C34";
const LIME = "#84B83B";
const BLUE = "#3B6FBF";

/** Where a booked call goes. Same calendar the audit report opens. */
const CALENDLY_URL = "https://calendly.com/inflowmd/strategy-call";

/* ---------- shared pieces ---------- */

/**
 * The deck's entrance, at reading pace rather than presentation pace:
 * 16px and 600ms, once, on the way in. The deck rises 30px because it is
 * read from six feet away; this is read at a desk.
 */
function Rise({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay, ease: [0.22, 0.7, 0.3, 1] }}
        className={className}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

/**
 * The deck's act marker, reused as the section number: "01 — WHEN THE PAGE
 * GETS MADE" is the same object as "01 — VISIBILITY" on the booth screen.
 */
function SectionMark({ number, label }: { number?: string; label: string }) {
  return (
    <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.26em]">
      {/* The two closing sections are not part of the numbered argument, so
          they carry the label alone rather than a dash standing in for a
          number they do not have. */}
      {number && (
        <>
          <span className="text-white/35">{number}</span>
          <span className="text-white/20"> — </span>
        </>
      )}
      <span style={{ color: LIME }}>{label}</span>
    </div>
  );
}

/** Ambient ground, fixed behind everything — the audit's mesh, the deck's dots. */
function Ambient() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <div
        className="mesh-blob-1 absolute -top-40 -left-40 w-[46vw] h-[46vw] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(132,184,59,0.20), transparent 70%)",
          filter: "blur(90px)",
        }}
      />
      <div
        className="mesh-blob-2 absolute -bottom-32 -right-24 w-[48vw] h-[48vw] rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(18,54,94,0.85), transparent 70%)",
          filter: "blur(100px)",
        }}
      />
      <div
        className="mesh-blob-3 absolute top-1/3 left-1/2 w-[36vw] h-[36vw] rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, rgba(59,111,191,0.22), transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div className="pitch-dotgrid absolute inset-0 opacity-[0.28]" />
    </div>
  );
}

/**
 * Section shell. One column, one rhythm: mark, heading, lede, then the
 * visual, then the argument in prose beneath it.
 */
function Section({
  number,
  label,
  heading,
  lede,
  children,
}: {
  number: string;
  label: string;
  heading: React.ReactNode;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <section className="why-section py-16 sm:py-24 lg:py-28">
      <Rise>
        <SectionMark number={number} label={label} />
        <h2 className="mt-5 text-[clamp(30px,4.4vw,54px)] font-extrabold leading-[1.08] tracking-tight max-w-[16em]">
          {heading}
        </h2>
        <p className="mt-5 text-lg sm:text-2xl font-light leading-snug text-white/60 max-w-[32em]">
          {lede}
        </p>
      </Rise>
      {children}
    </section>
  );
}

/** Body copy under a visual. Narrow measure — this is read, not scanned. */
function Prose({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`mt-10 sm:mt-12 max-w-[46em] text-base sm:text-lg leading-relaxed text-white/75 space-y-5 ${className}`}
    >
      {children}
    </div>
  );
}

/** The lime half of a two-tone line — the deck's own emphasis. */
function Hi({ children }: { children: React.ReactNode }) {
  return <span style={{ color: LIME }}>{children}</span>;
}

/* ---------- hero ---------- */

/**
 * Where they are, in three words. A doctor arrives here from the report's
 * button, and the first thing the page has to do is place itself in a
 * sequence they have already half-walked.
 */
function Trail() {
  const steps = ["The deck", "Your audit", "The architecture"] as const;
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-3 gap-y-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.24em]">
      {steps.map((step, i) => (
        <span key={step} className="inline-flex items-center gap-3">
          {i > 0 && <span className="text-white/20">→</span>}
          <span style={i === 2 ? { color: LIME } : undefined} className={i < 2 ? "text-white/30" : ""}>
            {step}
          </span>
        </span>
      ))}
    </div>
  );
}

function Hero() {
  return (
    <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 lg:pt-28">
      <Rise>
        <Trail />
      </Rise>
      <Rise delay={0.08}>
        <h1 className="mt-8 text-[clamp(36px,6.4vw,78px)] font-extrabold leading-[1.04] tracking-tight max-w-[14em]">
          You saw the scores. Here&rsquo;s why they&rsquo;re <Hi>structural</Hi>.
        </h1>
      </Rise>
      <Rise delay={0.16}>
        <p className="mt-8 text-lg sm:text-2xl font-light leading-snug text-white/60 max-w-[34em]">
          Nothing in your report was a tuning problem. Those numbers come from two decisions made
          before a single page exists — when the page gets made, and where it lives. Everything
          below follows from them.
        </p>
      </Rise>
    </section>
  );
}

/* ---------- the bridge: the deck's three, mapped to one build ---------- */

/** The deck's own recap icons, redrawn here so the pillars are recognisably
 *  the same three objects a doctor watched on the booth screen. */
const PILLAR_ICONS = {
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-5.2-5.2" />
    </>
  ),
  gauge: (
    <>
      <path d="M3.5 18a9 9 0 1 1 17 0" />
      <path d="M12 18 16.5 9.5" />
      <circle cx="12" cy="18" r="1.4" />
    </>
  ),
  click: (
    <>
      <rect x="3" y="4" width="13" height="9" rx="2.5" />
      <path d="m12.5 12.5 8 3.2-3.4 1.3-1.3 3.4z" />
    </>
  ),
} as const;

const PILLARS = [
  {
    icon: "search",
    name: "Visibility",
    deck: "Be found by patients and AI",
    here: "A page that arrives complete is a page an assistant can quote.",
    measured: "Measured in your audit",
  },
  {
    icon: "gauge",
    name: "Performance",
    deck: "Every second costs conversions",
    here: "A file that already exists has nothing left to assemble.",
    measured: "Measured in your audit",
  },
  {
    icon: "click",
    name: "Vein Education",
    deck: "Turn visitors into screenings",
    here: "Stage guides, symptom checkers and assessments are built as part of the site.",
    measured: "Not something an audit scores",
  },
] as const;

function Pillars() {
  return (
    <section className="py-16 sm:py-20 border-t border-white/10">
      <Rise>
        <h2 className="text-[clamp(26px,3.4vw,44px)] font-extrabold leading-tight tracking-tight max-w-[18em]">
          Three things, one architecture.
        </h2>
        <p className="mt-5 text-base sm:text-xl font-light leading-snug text-white/60 max-w-[38em]">
          The deck showed you three. Your audit put a number on the first two. All three are
          downstream of the same decision about how the site is built.
        </p>
      </Rise>
      <div className="mt-12 grid gap-8 sm:gap-6 sm:grid-cols-3">
        {PILLARS.map((p, i) => (
          <Rise key={p.name} delay={0.08 * i}>
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
              <svg
                viewBox="0 0 24 24"
                className="h-9 w-9"
                fill="none"
                stroke={LIME}
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {PILLAR_ICONS[p.icon]}
              </svg>
              <div className="mt-5 text-xl sm:text-2xl font-extrabold" style={{ color: LIME }}>
                {p.name}
              </div>
              <div className="mt-1 text-sm text-white/40">{p.deck}</div>
              <p className="mt-4 text-base leading-relaxed text-white/80">{p.here}</p>
              <div className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
                {p.measured}
              </div>
            </div>
          </Rise>
        ))}
      </div>
    </section>
  );
}

/**
 * The generous frame, placed before the first comparison so it colours all
 * four of them. A doctor has to be able to change platforms without it
 * meaning they were wrong to have chosen the old one.
 */
function EraNote() {
  return (
    <Rise>
      <div
        className="rounded-2xl border-l-2 py-6 pl-6 pr-6 sm:pl-8"
        style={{ borderColor: `${BLUE}99`, background: "rgba(59,111,191,0.06)" }}
      >
        <p className="text-base sm:text-lg leading-relaxed text-white/70 max-w-[46em]">
          None of what follows is a knock on WordPress. It was built for a different era of the
          web — blogs, desktop browsers, and search engines content to wait a few seconds.
          Mobile-first indexing arrived years later; AI search, years after that. Most practice
          sites are running a 2010 architecture against 2026 expectations, and doing it well was
          never the point of the platform.
        </p>
      </div>
    </Rise>
  );
}

/* ---------- 01: when the page gets made ---------- */

const THEIR_STEPS = [
  "Patient asks for the page",
  "Server starts PHP",
  "Database queried for the content",
  "Plugins filter the result, in order",
  "Theme assembles the HTML",
  "The page begins to arrive",
] as const;

/**
 * The chain, walked. Theirs loops — that is the entire point of the visual,
 * since the work is not slow so much as repeated — and ours resolves once
 * and stays resolved.
 *
 * Reduced motion gets the finished state of both: every step lit, no walk.
 */
function AssemblyLanes() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-120px" });
  const reduce = useReducedMotion();
  const [step, setStep] = useState(-1);

  // Every state change goes through a timer, the resets included: setting
  // state straight from an effect body cascades an extra render, and the
  // linter is right to flag it. A 0ms timer lands on the next tick and
  // behaves identically here — the same rule the deck follows.
  useEffect(() => {
    const timers: number[] = [];
    const later = (fn: () => void) => timers.push(window.setTimeout(fn, 0));
    const cleanup = () => timers.forEach((t) => window.clearTimeout(t));

    if (reduce) {
      later(() => setStep(THEIR_STEPS.length));
      return cleanup;
    }
    if (!inView) {
      later(() => setStep(-1));
      return cleanup;
    }
    let i = 0;
    later(() => setStep(0));
    const walk = window.setInterval(() => {
      i = i >= THEIR_STEPS.length ? 0 : i + 1;
      setStep(i);
    }, 620);
    return () => {
      cleanup();
      window.clearInterval(walk);
    };
  }, [inView, reduce]);

  return (
    <div ref={ref} className="mt-12 grid gap-5 lg:grid-cols-2 lg:items-stretch">
      {/* Theirs — every visit, from the top */}
      <div className="flex flex-col rounded-2xl border border-white/10 bg-black/25 p-6 sm:p-8">
        <div className="flex items-baseline justify-between gap-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            A typical practice site
          </div>
          <div
            className="text-[11px] font-bold uppercase tracking-[0.18em] shrink-0"
            style={{ color: "#ffa400" }}
          >
            On every visit
          </div>
        </div>
        <ol className="mt-6 space-y-1">
          {THEIR_STEPS.map((text, i) => {
            const lit = step >= i;
            const active = step === i;
            return (
              <li key={text} className="flex items-center gap-4 py-2">
                <span
                  className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums transition-all duration-300"
                  style={{
                    background: lit ? "rgba(255,164,0,0.16)" : "rgba(255,255,255,0.04)",
                    color: lit ? "#ffa400" : "rgba(255,255,255,0.3)",
                    boxShadow: active ? "0 0 0 3px rgba(255,164,0,0.18)" : "none",
                  }}
                >
                  {i + 1}
                </span>
                <span
                  className="text-sm sm:text-base leading-snug transition-colors duration-300"
                  style={{ color: lit ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)" }}
                >
                  {text}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="mt-6 border-t border-white/10 pt-5 text-sm leading-relaxed text-white/45">
          Six steps, and the patient waits through all of them. The next patient waits through them
          again.
        </p>
      </div>

      {/* Ours — done once, then handed over */}
      <div
        className="flex flex-col rounded-2xl border-2 p-6 sm:p-8"
        style={{ borderColor: `${LIME}66`, background: `${LIME}0f` }}
      >
        <div className="flex items-baseline justify-between gap-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            Yours
          </div>
          <div
            className="text-[11px] font-bold uppercase tracking-[0.18em] shrink-0"
            style={{ color: LIME }}
          >
            Once, when we publish
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-center gap-3">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              style={{ background: LIME }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <span className="text-sm sm:text-base text-white/80">
              All six steps — run at build time, before anyone visits
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4 py-2">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums"
            style={{ background: `${LIME}26`, color: LIME }}
          >
            1
          </span>
          <span className="text-sm sm:text-base text-white/90">Patient asks for the page</span>
        </div>
        <div className="flex items-center gap-4 py-2">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums"
            style={{ background: `${LIME}26`, color: LIME }}
          >
            2
          </span>
          <span className="text-sm sm:text-base font-semibold text-white">
            The page is already a file. It sends.
          </span>
        </div>

        <p className="mt-auto pt-6 text-sm leading-relaxed text-white/55">
          <span className="block border-t border-white/10 pt-5">
            Two steps, and the second is the network doing what it is good at. There is nothing left
            to assemble.
          </span>
        </p>
      </div>
    </div>
  );
}

function WhenSection() {
  return (
    <Section
      number="01"
      label="When the page gets made"
      heading={
        <>
          A typical practice site doesn&rsquo;t have pages. It has{" "}
          <Hi>instructions for making them</Hi>.
        </>
      }
      lede="Yours was made once, before anyone asked for it. That single difference is where the rest of this page comes from."
    >
      <AssemblyLanes />
      <Prose>
        <p>
          On most practice sites the page you see did not exist a moment earlier. The request wakes
          a PHP process, the process asks a database for the content, twenty or thirty plugins each
          take a turn filtering the result, the theme turns what survives into HTML, and only then
          does anything start travelling to the patient. It is not that any one step is slow. It is
          that all of them run again for the next patient, and the one after that.
        </p>
        <p>
          Your site is built with <strong className="font-semibold text-white">Next.js</strong>, and
          that same assembly happens once — when we publish. Pages are composed from{" "}
          <strong className="font-semibold text-white">React</strong> components, rendered to
          finished HTML at build time, and stored as files. When a patient asks for a page, there is
          no database call, no plugin chain and no rendering. The file already exists, and it is
          sent.
        </p>
        <p>
          Everything else on this page is a consequence of that. Speed, because there is no work
          left to do. Readability, because the content is in the file rather than in a set of
          instructions for producing it. Stability, because most of what can break was never part of
          answering the request.
        </p>
      </Prose>
    </Section>
  );
}

/* ---------- 02: where the page lives ---------- */

/**
 * The network, drawn.
 *
 * Deliberately not a map: a recognisable coastline invites a doctor to check
 * whether their own city has a dot, which is not the claim. The field is the
 * deck's dot texture with the nodes promoted out of it — one distant server on
 * the left panel, a scattering of them on the right — and the animated packet
 * is the only thing that differs between the two.
 */
function NetworkField({ variant, compact = false }: { variant: "single" | "edge"; compact?: boolean }) {
  const reduce = useReducedMotion();
  const single = variant === "single";

  // Two shapes of the same lattice. Wide is the page's own proportion; the
  // compact one is close to square, because a sixteen-column field squeezed
  // into a phone leaves every node and label too small to read — and this is
  // the diagram that most needs to be legible.
  const COLS = compact ? 8 : 16;
  const ROWS = compact ? 7 : 5;
  const cell = 40;
  const w = COLS * cell;
  const h = ROWS * cell + 34; // room for the labels under the bottom row

  const dots: Array<{ x: number; y: number }> = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      dots.push({ x: c * cell + cell / 2, y: r * cell + cell / 2 });
    }
  }

  const at = (c: number, r: number) => ({ x: cell * c, y: cell * r });

  /** The patient. */
  const patient = compact ? at(1.5, 1.5) : at(1.5, 2.5);
  /** Their one datacenter, as far from the patient as the field allows. */
  const datacenter = compact ? at(5.5, 5.5) : at(13.5, 1.5);
  /** Ours: a spread, the first of which is the patient's neighbour. */
  const edges = compact
    ? [at(2.5, 2.5), at(5.5, 0.5), at(6.5, 3.5), at(4.5, 4.5), at(1.5, 5.5), at(6.5, 6.5), at(3.5, 6.5)]
    : [
        at(4.5, 2.5),
        at(6.5, 0.5),
        at(8.5, 3.5),
        at(9.5, 1.5),
        at(9.5, 4.5),
        at(11.5, 0.5),
        at(12.5, 3.5),
        at(14.5, 1.5),
        at(14.5, 4.5),
      ];
  const target = single ? datacenter : edges[0];

  // Above the node in the compact field: the route leaves the patient
  // diagonally there and would otherwise run through its own caption.
  const label = (x: number, y: number, text: string, above = false) => (
    <text
      x={x}
      y={above ? y - 26 : y + 32}
      textAnchor="middle"
      fontSize="12"
      fontWeight="700"
      letterSpacing="1.6"
      fill="rgba(255,255,255,0.45)"
    >
      {text}
    </text>
  );

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-auto"
      role="img"
      aria-label={
        single
          ? "A patient at one corner of the field and a single server at the far side, the request crossing the whole distance."
          : "The same patient with servers spread across the field, the nearest one a short hop away."
      }
    >
      {/* the field */}
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="1.7" fill="rgba(255,255,255,0.11)" />
      ))}

      {/* the route */}
      <path
        d={`M${patient.x} ${patient.y} L${target.x} ${target.y}`}
        stroke={single ? "rgba(255,164,0,0.6)" : `${LIME}cc`}
        strokeWidth="2.4"
        strokeDasharray="7 9"
        strokeLinecap="round"
        fill="none"
        className={reduce ? undefined : single ? "why-route-slow" : "why-route-fast"}
      />

      {/* servers */}
      {single ? (
        <g>
          <circle cx={datacenter.x} cy={datacenter.y} r="18" fill="rgba(255,164,0,0.12)" />
          <circle cx={datacenter.x} cy={datacenter.y} r="8" fill="#ffa400" />
          {label(datacenter.x, datacenter.y, "THEIR ONE SERVER")}
        </g>
      ) : (
        edges.map((e, i) => (
          <g key={i}>
            <circle cx={e.x} cy={e.y} r={i === 0 ? 18 : 12} fill={`${LIME}24`} />
            <circle cx={e.x} cy={e.y} r={i === 0 ? 8 : 5.5} fill={LIME} />
            {i === 0 && label(e.x, e.y, "NEAREST COPY")}
          </g>
        ))
      )}

      {/* the patient */}
      <g>
        <circle cx={patient.x} cy={patient.y} r="17" fill="rgba(255,255,255,0.10)" />
        <circle cx={patient.x} cy={patient.y} r="7" fill="#fff" />
        {label(patient.x, patient.y, "PATIENT", compact)}
      </g>
    </svg>
  );
}

function WhereSection() {
  return (
    <Section
      number="02"
      label="Where the page lives"
      heading={
        <>
          Their site is in <Hi>one building</Hi>. Yours is in a few hundred.
        </>
      }
      lede="Distance is a fixed cost on every request, and shared hosting charges it to whichever patient lives furthest away."
    >
      <div className="mt-12 space-y-5">
        <div className="rounded-2xl border border-white/10 bg-black/25 p-6 sm:p-9">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
              A typical practice site — one server, one datacenter
            </div>
            <div
              className="text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "#ffa400" }}
            >
              Every request makes the trip
            </div>
          </div>
          <div className="mt-7">
            <div className="hidden sm:block">
              <NetworkField variant="single" />
            </div>
            <div className="sm:hidden">
              <NetworkField variant="single" compact />
            </div>
          </div>
          <p className="mt-7 border-t border-white/10 pt-5 text-sm sm:text-base leading-relaxed text-white/50 max-w-[46em]">
            The request crosses the whole distance and the response crosses it back — before the
            first pixel, and again for most of what the page needs after it.
          </p>
        </div>

        <div
          className="rounded-2xl border-2 p-6 sm:p-9"
          style={{ borderColor: `${LIME}66`, background: `${LIME}0f` }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
              Yours — a copy on every continent
            </div>
            <div
              className="text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color: LIME }}
            >
              The nearest one answers
            </div>
          </div>
          <div className="mt-7">
            <div className="hidden sm:block">
              <NetworkField variant="edge" />
            </div>
            <div className="sm:hidden">
              <NetworkField variant="edge" compact />
            </div>
          </div>
          <p className="mt-7 border-t border-white/10 pt-5 text-sm sm:text-base leading-relaxed text-white/60 max-w-[46em]">
            Whichever copy is closest to the patient is the one that answers. Distance stops being a
            variable in how fast your site feels.
          </p>
        </div>
      </div>

      <Prose>
        <p>
          A practice site on shared hosting exists in exactly one place. If that server is in
          Virginia and the patient is in Sacramento, every request makes the trip — and a web page
          is not one request. It is the page, then the stylesheet, then the fonts, then the images,
          each waiting on the one before it. The patient in the next town over never notices. The
          one three time zones away notices every time.
        </p>
        <p>
          Because your pages are finished files, they can be copied. We publish them to{" "}
          <strong className="font-semibold text-white">Vercel</strong>&rsquo;s edge network, which
          keeps them on servers spread across the world, and a request is answered by the closest
          one holding a copy. Nothing is fetched from head office, because there is no head office
          in the path.
        </p>
        <p>
          This is the least abstract point on this page. Speed here is not optimisation. It is
          geography.
        </p>
      </Prose>
    </Section>
  );
}

/* ---------- 03: why AI can read it ---------- */

/** A line of pretend markup. Colour carries the meaning, not the syntax. */
function CodeLine({
  children,
  tone = "muted",
  indent = 0,
}: {
  children: React.ReactNode;
  tone?: "muted" | "live" | "ghost";
  indent?: number;
}) {
  const color =
    tone === "live" ? "rgba(255,255,255,0.92)" : tone === "ghost" ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.5)";
  return (
    <div
      className="whitespace-pre font-mono text-[11px] sm:text-[13px] leading-[1.9]"
      style={{ color, paddingLeft: indent * 14 }}
    >
      {children}
    </div>
  );
}

function CrawlerPanes() {
  return (
    <div className="mt-12 grid gap-5 lg:grid-cols-2 lg:items-stretch">
      {/* assembled in the browser */}
      <div className="flex flex-col rounded-2xl border border-white/10 bg-black/25 p-6 sm:p-8 overflow-hidden">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
          What a crawler receives from a browser-assembled site
        </div>
        <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-5 overflow-x-auto">
          <CodeLine tone="muted">&lt;body&gt;</CodeLine>
          <CodeLine tone="ghost" indent={1}>
            &lt;div id=&quot;root&quot;&gt;&lt;/div&gt;
          </CodeLine>
          <CodeLine tone="ghost" indent={1}>
            &lt;script src=&quot;/app.js&quot;&gt;&lt;/script&gt;
          </CodeLine>
          <CodeLine tone="muted">&lt;/body&gt;</CodeLine>
        </div>
        <p className="mt-auto pt-6 text-sm leading-relaxed text-white/45">
          The content is real, but it arrives only once the browser runs the JavaScript. An
          assistant that reads what the server sent finds an empty container and moves on.
        </p>
      </div>

      {/* delivered complete */}
      <div
        className="flex flex-col rounded-2xl border-2 p-6 sm:p-8 overflow-hidden"
        style={{ borderColor: `${LIME}66`, background: `${LIME}0f` }}
      >
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
          What a crawler receives from yours
        </div>
        <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-5 overflow-x-auto">
          <CodeLine tone="muted">&lt;body&gt;</CodeLine>
          <CodeLine tone="live" indent={1}>
            &lt;h1&gt;Varicose Vein Treatment&lt;/h1&gt;
          </CodeLine>
          <CodeLine tone="live" indent={1}>
            &lt;h2&gt;Who should be evaluated&lt;/h2&gt;
          </CodeLine>
          <CodeLine tone="live" indent={1}>
            &lt;p&gt;CVI is progressive&hellip;&lt;/p&gt;
          </CodeLine>
          <CodeLine tone="live" indent={1}>
            &lt;script type=&quot;application/ld+json&quot;&gt;
          </CodeLine>
          <CodeLine tone="live" indent={2}>
            &quot;@type&quot;: &quot;MedicalBusiness&quot;,
          </CodeLine>
          <CodeLine tone="live" indent={2}>
            &quot;medicalSpecialty&quot;: &quot;Phlebology&quot;
          </CodeLine>
          <CodeLine tone="muted">&lt;/body&gt;</CodeLine>
        </div>
        <p className="mt-auto pt-6 text-sm leading-relaxed text-white/55">
          Headings, content and medical schema are in the file itself. Nothing has to be executed
          for an assistant to know what this practice is and what it treats.
        </p>
      </div>
    </div>
  );
}

function AiSection() {
  return (
    <Section
      number="03"
      label="Why AI can read it"
      heading={
        <>
          Crawlers don&rsquo;t wait for JavaScript. They read{" "}
          <Hi>what the server hands them</Hi>.
        </>
      }
      lede="Your audit scored one category on exactly this. It is the category where the architecture does the most work."
    >
      <CrawlerPanes />
      <Prose>
        <p>
          When ChatGPT, Perplexity or Google&rsquo;s AI results consider a practice, they read the
          document the server returned. Some crawlers run JavaScript; many do not, and the ones that
          do give it a budget. Anything that only appears after the browser has assembled the page
          is, to a large share of them, not there.
        </p>
        <p>
          Because your pages are complete before they are requested, there is no second stage.
          Headings arrive in order, the content arrives with them, and the medical schema — the
          block that states in machine-readable terms that this is a vein practice, what it treats
          and where it does it — is in the same file. That is what the{" "}
          <em className="not-italic font-semibold text-white">
            &ldquo;Is your website optimized for AI?&rdquo;
          </em>{" "}
          score in your report was measuring, and why the fix for a low one is rarely a plugin.
        </p>
        <p>
          It is worth being clear that this is not only a WordPress problem. Plenty of modern,
          expensive sites are built as browser applications and have the same blind spot for the
          opposite reason. The question is never how new the site is. It is what the server sends.
        </p>
      </Prose>
    </Section>
  );
}

/* ---------- 04: why there's less to break ---------- */

const THEIR_SURFACE = [
  "An admin login page, on a known URL",
  "A database holding every page",
  "A PHP runtime executing on request",
  "Twenty to thirty plugins with server permissions",
  "A theme and page builder, each updating on their own schedule",
  "An uploads directory that accepts files",
] as const;

const OUR_SURFACE = [
  "Files on a content network",
  "One form endpoint we own and monitor",
] as const;

function SurfaceCompare() {
  return (
    <div className="mt-12 grid gap-5 lg:grid-cols-2 lg:items-stretch">
      <div className="flex flex-col rounded-2xl border border-white/10 bg-black/25 p-6 sm:p-8">
        <div className="flex items-baseline justify-between gap-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            Running on a typical practice site
          </div>
          <div className="text-2xl font-extrabold tabular-nums" style={{ color: "#ffa400" }}>
            {THEIR_SURFACE.length}
          </div>
        </div>
        <ul className="mt-6 space-y-2.5">
          {THEIR_SURFACE.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm sm:text-base text-white/70"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div
        className="flex flex-col rounded-2xl border-2 p-6 sm:p-8"
        style={{ borderColor: `${LIME}66`, background: `${LIME}0f` }}
      >
        <div className="flex items-baseline justify-between gap-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            Running on yours
          </div>
          <div className="text-2xl font-extrabold tabular-nums" style={{ color: LIME }}>
            {OUR_SURFACE.length}
          </div>
        </div>
        <ul className="mt-6 space-y-2.5">
          {OUR_SURFACE.map((item) => (
            <li
              key={item}
              className="rounded-lg border px-4 py-3 text-sm sm:text-base text-white/90"
              style={{ borderColor: `${LIME}40`, background: "rgba(0,0,0,0.2)" }}
            >
              {item}
            </li>
          ))}
        </ul>
        {/* The short list is the argument, so the space under it gets the
            sentence rather than being left as a hole beside a long one. */}
        <div className="mt-auto pt-8">
          <p className="text-xl sm:text-2xl font-extrabold leading-snug">
            That is the <Hi>entire list</Hi>.
          </p>
          <p className="mt-4 border-t border-white/10 pt-5 text-sm leading-relaxed text-white/55">
            Not a claim that nothing can go wrong. A claim that there is dramatically less of it to
            go wrong on.
          </p>
        </div>
      </div>
    </div>
  );
}

function StabilitySection() {
  return (
    <Section
      number="04"
      label="Why there's less to break"
      heading={
        <>
          Most of what fails on a practice site <Hi>isn&rsquo;t there</Hi> on yours.
        </>
      }
      lede="Not a security lecture — a smaller machine with fewer moving parts, and fewer emails that begin with the word urgent."
    >
      <SurfaceCompare />
      <Prose>
        <p>
          The things that take practice sites offline are rarely dramatic. A plugin updates itself
          and a page stops rendering. Two plugins disagree after an update and the contact form
          quietly stops sending. An abandoned plugin picks up a vulnerability and the site starts
          serving something nobody wrote. A database gets corrupted and the last good backup is from
          a fortnight ago.
        </p>
        <p>
          None of those failure modes have anywhere to happen here. There is no database holding
          your content, no login page to guess a password at, and nothing executing on the server
          when a patient asks for a page — because the page was finished before they asked. The
          working parts that remain are files on a network and one form endpoint we own.
        </p>
        <p>
          Anything on the internet can be attacked, and we would rather say that plainly than sell
          you invulnerability. What we can say precisely is that the surface is a fraction of the
          size, that it does not grow every time a plugin author ships an update, and that in
          practice this is the difference between maintenance being something you think about and
          something you don&rsquo;t.
        </p>
      </Prose>
    </Section>
  );
}

/* ---------- the objection ---------- */

const UPDATE_POINTS = [
  {
    title: "You send it, in whatever form suits you",
    body: "An email, a text, a marked-up PDF. New provider, changed hours, a paragraph you want reworded.",
  },
  {
    title: "It is live the same day",
    body: "Usually within the hour. Publishing rebuilds the affected pages and pushes them to the network.",
  },
  {
    title: "There is nothing for you to log into",
    body: "No page builder to fight, no editor to learn, no plugin conflict to debug at nine at night.",
  },
] as const;

function UpdateAnswer() {
  return (
    <section className="py-16 sm:py-24 border-t border-white/10">
      <Rise>
        <SectionMark label="The obvious question" />
        <h2 className="mt-5 text-[clamp(28px,4vw,50px)] font-extrabold leading-[1.08] tracking-tight max-w-[16em]">
          &ldquo;Can I still update my content?&rdquo;
        </h2>
        <p className="mt-6 text-xl sm:text-3xl font-extrabold leading-snug max-w-[22em]">
          Yes — <Hi>you send it to us and we publish it</Hi>.
        </p>
      </Rise>
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {UPDATE_POINTS.map((p, i) => (
          <Rise key={p.title} delay={0.08 * i}>
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-base sm:text-lg font-bold leading-snug text-white">{p.title}</div>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-white/60">{p.body}</p>
            </div>
          </Rise>
        ))}
      </div>
      <Rise>
        <p className="mt-10 max-w-[46em] text-base sm:text-lg leading-relaxed text-white/70">
          It is a fair thing to ask about, and worth knowing before you decide rather than
          discovering afterwards: this is a trade. You give up editing pages yourself, and you get a
          site with nothing on it that can be broken by editing pages yourself. Practices that have
          spent an afternoon inside a page builder tend to consider that a good deal.
        </p>
      </Rise>
    </section>
  );
}

/* ---------- the names ---------- */

const STACK = [
  ["Next.js", "The framework the site is built with. It renders your pages to finished HTML before anyone visits."],
  ["React", "How those pages are composed — the assessments, the stage guides and the booking flows are built as parts, not installed as plugins."],
  ["Vercel", "The network your pages are published to, which keeps a copy near every patient."],
] as const;

function Names() {
  return (
    <section className="py-16 sm:py-20 border-t border-white/10">
      <Rise>
        <SectionMark label="The names, since you'll hear them" />
        <p className="mt-5 max-w-[46em] text-base sm:text-lg leading-relaxed text-white/70">
          Three names, and they are the whole stack. There is no plugin list underneath them, which
          is most of the point.
        </p>
      </Rise>
      <div className="mt-9 grid gap-5 sm:grid-cols-3">
        {STACK.map(([name, what], i) => (
          <Rise key={name} delay={0.07 * i}>
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-lg font-extrabold" style={{ color: BLUE }}>
                {name}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{what}</p>
            </div>
          </Rise>
        ))}
      </div>
      <Rise>
        <p className="mt-8 text-sm leading-relaxed text-white/35 max-w-[46em]">
          The same architecture is behind OpenAI, Netflix, Nike and the Washington Post. It is not
          exotic; it is simply newer than the platform most practice sites were built on.
        </p>
      </Rise>
    </section>
  );
}

/* ---------- close ---------- */

declare global {
  interface Window {
    Calendly?: { initPopupWidget(options: { url: string }): void };
  }
}

/**
 * The two ways out, weighted the same — the audit report's own close, so a
 * doctor arriving from that page finds the same pair of cards waiting.
 *
 * The call is A LINK, not a button, for the reason the report gives: the
 * popup is Calendly's script talking to Calendly's script, and if widget.js
 * has not landed the href still books the call.
 */
function Close() {
  function openPopup(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!window.Calendly?.initPopupWidget) return; // let the href do its job
    e.preventDefault();
    window.Calendly.initPopupWidget({ url: CALENDLY_URL });
  }

  return (
    <section className="py-16 sm:py-24 border-t border-white/10">
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" />
      <link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css" />

      <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
        <div
          className="flex h-full flex-col items-center justify-center rounded-2xl border-2 p-8 sm:p-10 text-center"
          style={{ borderColor: `${LIME}66`, background: "rgba(0,0,0,0.25)" }}
        >
          <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight text-balance">
            Haven&rsquo;t run yours yet?
          </h2>
          <p className="text-white/60 text-base sm:text-lg mt-2 mb-6">
            Thirty seconds, on your own domain, using Google&rsquo;s own measurement.
          </p>
          <a
            href="/audit"
            className="w-full max-w-sm inline-flex items-center justify-center rounded-xl px-8 font-extrabold text-lg transition-opacity hover:opacity-90"
            style={{ background: LIME, color: NAVY, minHeight: 64 }}
          >
            Run your practice&rsquo;s audit
          </a>
        </div>

        <div
          className="flex h-full flex-col items-center justify-center rounded-2xl border-2 p-8 sm:p-10 text-center"
          style={{ borderColor: `${LIME}66`, background: "rgba(0,0,0,0.25)" }}
        >
          <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight text-balance">Prefer to talk?</h2>
          <p className="text-white/60 text-base sm:text-lg mt-2 mb-6">
            Book a 15-minute call — we&rsquo;ll walk through your findings together.
          </p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={openPopup}
            className="w-full max-w-sm inline-flex items-center justify-center rounded-xl px-8 font-extrabold text-lg transition-opacity hover:opacity-90"
            style={{ background: LIME, color: NAVY, minHeight: 64 }}
          >
            Book a strategy call
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- page ---------- */

export default function WhyNextjsClient() {
  return (
    <main className="relative min-h-screen text-white" style={{ background: NAVY }}>
      <Ambient />
      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 sm:px-10 lg:px-12 pb-20">
        <Hero />
        <Pillars />
        <div className="pt-12 sm:pt-16">
          <EraNote />
        </div>
        <WhenSection />
        <WhereSection />
        <AiSection />
        <StabilitySection />
        <UpdateAnswer />
        <Names />
        <Close />
      </div>
    </main>
  );
}
