export const DUE_DAY = 10;

export function getDueDateForMonth(year: number, month: number) {
  return new Date(year, month - 1, DUE_DAY);
}

export function stripTime(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function diffInDays(from: Date, to: Date) {
  const ms = stripTime(to).getTime() - stripTime(from).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function getCurrentBillingDueDate(today = new Date()) {
  return getDueDateForMonth(today.getFullYear(), today.getMonth() + 1);
}

export function getTenantDeadlineState(today = new Date()) {
  const dueDate = getCurrentBillingDueDate(today);
  const daysUntilDue = diffInDays(today, dueDate);
  const daysOverdue = diffInDays(dueDate, today);

  return {
    dueDate,
    isBeforeDue: daysUntilDue >= 0,
    isOverdue: daysUntilDue < 0,
    daysUntilDue: Math.max(daysUntilDue, 0),
    daysOverdue: Math.max(daysOverdue, 0),
  };
}

export function shouldSendReminder(today = new Date()) {
  const { isOverdue, daysOverdue } = getTenantDeadlineState(today);

  if (!isOverdue) return false;

  // 13, 16, 19, 22... czyli 3 dni po terminie i potem co 3 dni
  return daysOverdue > 0 && daysOverdue % 3 === 0;
}

export function formatPolishDate(date: Date) {
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
  });
}