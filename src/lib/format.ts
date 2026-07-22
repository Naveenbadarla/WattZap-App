/** Indian currency & number formatting helpers. */

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ₹45,000 / ₹1.8 lakh / ₹1.2 crore */
export function formatINR(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  if (abs >= 1_00_00_000) {
    const cr = abs / 1_00_00_000;
    return `${sign}₹${trim(cr)} crore`;
  }
  if (abs >= 1_00_000) {
    const lakh = abs / 1_00_000;
    return `${sign}₹${trim(lakh)} lakh`;
  }
  return `${sign}₹${inr.format(abs)}`;
}

/** Always full digits with Indian grouping: ₹1,24,500 */
export function formatINRFull(value: number): string {
  const sign = value < 0 ? "−" : "";
  return `${sign}₹${inr.format(Math.abs(value))}`;
}

function trim(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
}

export function formatNumber(value: number): string {
  return inr.format(value);
}

export function formatKwh(value: number): string {
  return `${inr.format(Math.round(value))} kWh`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatMonth(month: string): string {
  // "2026-03" -> "Mar 2026"
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function percent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}
