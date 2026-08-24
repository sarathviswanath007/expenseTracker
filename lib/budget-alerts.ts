export type AlertStatus = "ok" | "warning" | "exceeded";

export function getCategoryAlertStatus(
  spent: number,
  allocated: number,
  thresholdPercent: number,
): AlertStatus {
  if (allocated <= 0) {
    return spent > 0 ? "exceeded" : "ok";
  }
  if (spent > allocated) {
    return "exceeded";
  }
  const percent = (spent / allocated) * 100;
  if (percent >= thresholdPercent) {
    return "warning";
  }
  return "ok";
}
