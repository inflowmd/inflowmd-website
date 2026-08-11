/** One row from data/hps-practices.json — the real conference attendee list. */
export interface Attendee {
  name: string;
  city: string;
  state: string;
  /** Empty string when no website could be found for this attendee. */
  url: string;
}

/** True when this attendee has no website on file — a finding, not an error. */
export function hasNoWebsite(a: Attendee): boolean {
  return !a.url.trim();
}

/** Case-insensitive match against name, city, and state — "chatt" finds
 *  Chattanooga entries by city as readily as by practice name. */
export function attendeeMatches(a: Attendee, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    a.name.toLowerCase().includes(q) ||
    a.city.toLowerCase().includes(q) ||
    a.state.toLowerCase().includes(q)
  );
}

/** First letter for the browse grid's sticky headers; non-letters group under "#". */
export function letterOf(a: Attendee): string {
  const ch = a.name.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(ch) ? ch : "#";
}
