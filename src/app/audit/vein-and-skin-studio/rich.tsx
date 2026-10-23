import type { ReactNode } from "react";

/**
 * Route-local inline renderer for the approved copy. Supports exactly three
 * marks — **bold**, *italic* and [text](url) — because those are the only
 * ones the approved document uses. Deliberately not a markdown parser: a
 * general one would be a licence to put arbitrary markup into copy that has
 * been approved as plain text.
 *
 * LINKS ARE THE POINT OF CARE HERE. Every href is emitted byte-for-byte as
 * it appears in the source document: no normalising, no trailing-slash
 * tidying, no encoding. Each opens in a new tab with rel="noopener
 * noreferrer", and nothing in this file can turn a source URL into a
 * different destination.
 */

const LINK = /(\[[^\]]+\]\([^)]+\))/g;
const EMPH = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

function emphasise(text: string, keyPrefix: string, light: boolean): ReactNode[] {
  return text
    .split(EMPH)
    .filter(Boolean)
    .map((part, i) => {
      const key = `${keyPrefix}-e${i}`;
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={key} className={light ? "font-bold text-slate-900" : "font-bold text-white"}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={key}>{part.slice(1, -1)}</em>;
      }
      return <span key={key}>{part}</span>;
    });
}

export default function Rich({ text, light = false }: { text: string; light?: boolean }) {
  const parts = text.split(LINK).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (m) {
          const [, label, href] = m;
          return (
            <a
              key={`l${i}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={
                light
                  ? "text-accent underline decoration-slate-300 underline-offset-2 hover:decoration-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  : "text-accent-light underline decoration-white/25 underline-offset-2 hover:decoration-accent-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-light"
              }
            >
              {label}
            </a>
          );
        }
        return <span key={`t${i}`}>{emphasise(part, `t${i}`, light)}</span>;
      })}
    </>
  );
}
