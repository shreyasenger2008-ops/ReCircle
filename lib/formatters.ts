/**
 * Centralized formatting helpers for ReCircle Fair
 * Uniform Date, Currency, and Status formatting across all screens
 */

/**
 * Format currency with Indian grouping (e.g., ₹2,800, ₹1,450) or Lakhs (e.g. ₹42 L)
 */
export function formatCurrency(amount: number | string | undefined | null, compact = false): string {
  const num = typeof amount === "string" ? parseFloat(amount) : Number(amount || 0);
  if (isNaN(num)) return "₹0";

  if (compact && Math.abs(num) >= 100000) {
    const inLakhs = num / 100000;
    const formatted = inLakhs % 1 === 0 ? inLakhs.toString() : inLakhs.toFixed(1);
    return `₹${formatted} L`;
  }

  return `₹${Math.round(num).toLocaleString("en-IN")}`;
}

/**
 * Format dates strictly as "DD MMM YYYY" (e.g., 10 Oct 2026)
 */
export function formatDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return "10 Oct 2026";
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return "10 Oct 2026";
    
    const day = String(d.getDate()).padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return "10 Oct 2026";
  }
}

/**
 * Format status keys into human-readable labels (e.g., "on_the_way" -> "On the way")
 */
export function formatStatus(status: string | undefined | null, lang: "en" | "hi" | "kn" = "en"): string {
  const normalized = (status || "").toLowerCase().trim();

  if (lang === "hi") {
    switch (normalized) {
      case "pending": return "लंबित (Pending)";
      case "accepted": return "स्वीकार किया गया";
      case "on_the_way": return "रास्ते में (On the way)";
      case "picked_up": return "कलेक्शन हुआ";
      case "completed": return "पूरा हुआ";
      case "cancelled": return "रद्द";
      case "disputed": return "विवादित";
      case "all": return "सभी (All)";
      default: return normalized.replace(/_/g, " ");
    }
  }

  switch (normalized) {
    case "pending": return "Pending";
    case "accepted": return "Accepted";
    case "on_the_way": return "On the way";
    case "picked_up": return "Picked up";
    case "completed": return "Completed";
    case "cancelled": return "Cancelled";
    case "disputed": return "Disputed";
    case "all": return "All";
    default: return normalized.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
