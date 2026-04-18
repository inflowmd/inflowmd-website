export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function daysAgo(days: number, from: Date = new Date()): Date {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

export function currentPeriod(days = 28) {
  const end = daysAgo(1);
  const start = daysAgo(days);
  return { startDate: toISODate(start), endDate: toISODate(end) };
}

export function previousPeriod(days = 28) {
  const end = daysAgo(days + 1);
  const start = daysAgo(days * 2);
  return { startDate: toISODate(start), endDate: toISODate(end) };
}

export function monthsBack(months: number) {
  const end = new Date();
  const start = new Date(end);
  start.setUTCMonth(start.getUTCMonth() - months + 1);
  start.setUTCDate(1);
  return { startDate: toISODate(start), endDate: toISODate(end) };
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function monthLabel(yearMonth: string): string {
  // yearMonth is YYYYMM or YYYY-MM
  const clean = yearMonth.replace("-", "");
  const year = clean.slice(0, 4);
  const month = parseInt(clean.slice(4, 6), 10);
  const label = MONTH_SHORT[month - 1] ?? "?";
  const nowYear = new Date().getUTCFullYear();
  return year === String(nowYear) ? label : `${label} ${year.slice(2)}`;
}

export function monthKeyFromDate(dateStr: string): string {
  // dateStr is YYYY-MM-DD
  return dateStr.slice(0, 7).replace("-", "");
}
