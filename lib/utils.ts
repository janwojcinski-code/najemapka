import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2
  }).format(value);
}

export function formatMonth(month: string) {
  return new Intl.DateTimeFormat("pl-PL", { month: "long", year: "numeric" }).format(new Date(`${month}-01`));
}

export function utilityLabel(type: string) {
  const map: Record<string, string> = {
    cold_water: "Zimna woda",
    hot_water: "Ciepła woda",
    electricity: "Prąd",
    gas: "Gaz"
  };

  return map[type] ?? type;
}

export function utilityUnit(type: string) {
  const map: Record<string, string> = {
    cold_water: "m³",
    hot_water: "m³",
    electricity: "kWh",
    gas: "m³"
  };

  return map[type] ?? "";
}
