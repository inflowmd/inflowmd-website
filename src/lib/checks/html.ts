/**
 * Minimal, permissive HTML extraction helpers.
 *
 * These are deliberately forgiving about quote style, attribute order and
 * self-closing syntax: a parsing miss here would turn into a false "you're
 * missing this" verdict, which is the one outcome we will not risk.
 */

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

export function decodeEntities(input: string): string {
  return input
    .replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (m) => ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_, code: string) => {
      const n = Number(code);
      return Number.isFinite(n) ? String.fromCodePoint(n) : _;
    });
}

/** Strips comments so commented-out markup is never counted as present. */
export function stripComments(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

/** Reads an attribute from a single tag string, any quoting style. */
export function getAttr(tag: string, attr: string): string | null {
  const re = new RegExp(
    `\\b${attr}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'\`=<>]+))`,
    "i"
  );
  const m = tag.match(re);
  if (!m) return null;
  const raw = m[2] ?? m[3] ?? m[4] ?? "";
  return decodeEntities(raw).trim();
}

/** True when the tag carries the attribute at all, even if empty. */
export function hasAttr(tag: string, attr: string): boolean {
  return new RegExp(`\\b${attr}\\b`, "i").test(tag);
}

export function getTitle(html: string): string | null {
  const m = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (!m) return null;
  return decodeEntities(m[1].replace(/\s+/g, " ")).trim();
}

/** Finds a meta tag's content by name, property or http-equiv. */
export function getMeta(html: string, ...names: string[]): string | null {
  const wanted = names.map((n) => n.toLowerCase());
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const key = (
      getAttr(tag, "name") ??
      getAttr(tag, "property") ??
      getAttr(tag, "http-equiv") ??
      ""
    ).toLowerCase();
    if (wanted.includes(key)) {
      const content = getAttr(tag, "content");
      if (content) return content;
    }
  }
  return null;
}

/**
 * Returns every matching meta tag's content, not just the first.
 * Pages routinely carry several `generator` tags — the CMS plus each plugin —
 * and reading only the first one mistakes a plugin for the platform.
 */
export function getMetaAll(html: string, ...names: string[]): string[] {
  const wanted = names.map((n) => n.toLowerCase());
  const out: string[] = [];
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const key = (
      getAttr(tag, "name") ??
      getAttr(tag, "property") ??
      getAttr(tag, "http-equiv") ??
      ""
    ).toLowerCase();
    if (wanted.includes(key)) {
      const content = getAttr(tag, "content");
      if (content) out.push(content);
    }
  }
  return out;
}

/** Finds a <link> href by rel value. */
export function getLinkHref(html: string, rel: string): string | null {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const relValue = (getAttr(tag, "rel") ?? "").toLowerCase();
    if (relValue.split(/\s+/).includes(rel.toLowerCase())) {
      const href = getAttr(tag, "href");
      if (href) return href;
    }
  }
  return null;
}

export interface Heading {
  level: number;
  text: string;
}

export function getHeadings(html: string): Heading[] {
  const out: Heading[] = [];
  const re = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1\s*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = decodeEntities(m[2].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ")).trim();
    out.push({ level: Number(m[1]), text });
  }
  return out;
}

export interface HeadingOrderIssue {
  fromLevel: number;
  toLevel: number;
}

/**
 * Returns the first skipped-level jump (e.g. H2 -> H4), or null if the
 * document steps down one level at a time.
 */
export function findHeadingSkip(headings: Heading[]): HeadingOrderIssue | null {
  let previous: number | null = null;
  for (const h of headings) {
    if (previous !== null && h.level > previous + 1) {
      return { fromLevel: previous, toLevel: h.level };
    }
    previous = h.level;
  }
  return null;
}

export interface ImageAltStats {
  total: number;
  withAlt: number;
}

/** Counts images carrying non-empty alt text. */
export function getImageAltStats(html: string): ImageAltStats {
  const tags = html.match(/<img\b[^>]*>/gi) ?? [];
  let withAlt = 0;
  for (const tag of tags) {
    const alt = getAttr(tag, "alt");
    if (alt && alt.length > 0) withAlt++;
  }
  return { total: tags.length, withAlt };
}

export interface JsonLdExtraction {
  /** Successfully parsed blocks. */
  blocks: unknown[];
  /** How many ld+json script tags were present in the markup. */
  found: number;
  /** How many of those we could not parse. */
  parseFailures: number;
}

/**
 * Extracts every JSON-LD block, reporting parse failures separately.
 *
 * The distinction matters: "no structured data" is a finding, but "structured
 * data we could not read" is not — reporting the second as the first would be
 * a false accusation.
 */
export function getJsonLd(html: string): JsonLdExtraction {
  const blocks: unknown[] = [];
  let found = 0;
  let parseFailures = 0;
  const re =
    /<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script\s*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const raw = m[1].trim();
    if (!raw) continue;
    found++;
    try {
      blocks.push(JSON.parse(raw));
    } catch {
      parseFailures++;
    }
  }
  return { blocks, found, parseFailures };
}

/** Word count of the page's main content, ignoring chrome and code. */
export function getContentWordCount(html: string): number {
  let body = html
    .replace(/<script[\s\S]*?<\/script\s*>/gi, " ")
    .replace(/<style[\s\S]*?<\/style\s*>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript\s*>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg\s*>/gi, " ");

  // Prefer the semantic main region when the site provides one.
  const main =
    body.match(/<main\b[^>]*>([\s\S]*?)<\/main\s*>/i) ??
    body.match(/<article\b[^>]*>([\s\S]*?)<\/article\s*>/i);
  if (main) {
    body = main[1];
  } else {
    const bodyMatch = body.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i);
    if (bodyMatch) body = bodyMatch[1];
    body = body
      .replace(/<nav[\s\S]*?<\/nav\s*>/gi, " ")
      .replace(/<header[\s\S]*?<\/header\s*>/gi, " ")
      .replace(/<footer[\s\S]*?<\/footer\s*>/gi, " ");
  }

  const text = decodeEntities(body.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
  if (!text) return 0;
  return text.split(" ").filter((w) => /[a-z0-9]/i.test(w)).length;
}
