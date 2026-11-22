import type { Plan } from "@/src/features/Chat/types/plans";

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMonthGridDates(month: Date): Date[] {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());
  const cellCount = Math.ceil((firstDay.getDay() + lastDay.getDate()) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

export function groupPlansByLocalDate(plans: Plan[]): Map<string, Plan[]> {
  const grouped = new Map<string, Plan[]>();
  for (const plan of plans) {
    const key = localDateKey(new Date(plan.startAt));
    const dayPlans = grouped.get(key) ?? [];
    dayPlans.push(plan);
    grouped.set(key, dayPlans);
  }
  for (const dayPlans of grouped.values()) {
    dayPlans.sort((left, right) => Date.parse(left.startAt) - Date.parse(right.startAt));
  }
  return grouped;
}
