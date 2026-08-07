import type { AuditData } from "./types";
import { veinIty } from "./vein-ity";

const AUDITS: Record<string, AuditData> = {
  [veinIty.slug]: veinIty,
};

export function getAudit(slug: string): AuditData | null {
  return AUDITS[slug] ?? null;
}

export function getAllAuditSlugs(): string[] {
  return Object.keys(AUDITS);
}

export { getRecommendation } from "./recommendation";
export type { RecommendationData } from "./recommendation";
