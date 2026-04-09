import type { Apartment, MeterReading, Settlement, UtilityPrice } from "@/types";

export const apartments: Apartment[] = [
  { id: "a1", code: "12A", name: "ul. Słoneczna 15", address: "ul. Słoneczna 15/12A", city: "Warszawa", area_m2: 42, tenant_name: "Jan Kowalski" },
  { id: "a2", code: "04", name: "ul. Morska 2", address: "ul. Morska 2/4", city: "Gdańsk", area_m2: 58, tenant_name: "Anna Nowak" },
  { id: "a3", code: "45C", name: "ul. Polna 88", address: "ul. Polna 88/45C", city: "Kraków", area_m2: 34, tenant_name: "Marek Zakrzewski" }
];

export const prices: UtilityPrice[] = [
  { id: "p1", utility_type: "electricity", supplier_name: "TAURON", unit_net: 0.74, vat_rate: 23, unit_gross: 0.91, unit_label: "PLN/kWh", valid_from: "2024-01-01", valid_to: null, is_active: true },
  { id: "p2", utility_type: "cold_water", supplier_name: "Wodociągi Miejskie", unit_net: 11.53, vat_rate: 8, unit_gross: 12.45, unit_label: "PLN/m³", valid_from: "2024-01-01", valid_to: null, is_active: true },
  { id: "p3", utility_type: "hot_water", supplier_name: "MPEC", unit_net: 31.67, vat_rate: 8, unit_gross: 34.2, unit_label: "PLN/m³", valid_from: "2024-01-01", valid_to: null, is_active: true },
  { id: "p4", utility_type: "gas", supplier_name: "PGNiG", unit_net: 0.18, vat_rate: 23, unit_gross: 0.22, unit_label: "PLN/kWh", valid_from: "2024-01-01", valid_to: null, is_active: true }
];

export const settlements: Settlement[] = [
  { id: "s1", apartment_id: "a1", period_month: "2024-05", total_amount: 124.50, status: "unpaid", issue_date: "2024-05-15" },
  { id: "s2", apartment_id: "a1", period_month: "2024-04", total_amount: 312.15, status: "paid", issue_date: "2024-04-10" },
  { id: "s3", apartment_id: "a1", period_month: "2024-03", total_amount: 298.40, status: "paid", issue_date: "2024-03-08" }
];

export const readings: MeterReading[] = [
  { id: "r1", apartment_id: "a1", reading_date: "2024-05-12", utility_type: "cold_water", value: 142.5, previous_value: 140.1, usage: 2.4, photo_path: null, created_by: "u1", status: "approved" },
  { id: "r2", apartment_id: "a1", reading_date: "2024-05-10", utility_type: "electricity", value: 3421, previous_value: 3436, usage: -15, photo_path: null, created_by: "u1", status: "approved" },
  { id: "r3", apartment_id: "a1", reading_date: "2024-05-12", utility_type: "gas", value: 1204.88, previous_value: 1189.12, usage: 15.76, photo_path: null, created_by: "u1", status: "submitted" }
];
