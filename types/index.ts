export type UserRole = "admin" | "tenant";

export type UtilityType = "cold_water" | "hot_water" | "electricity" | "gas";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  apartment_id: string | null;
  created_at: string;
}

export interface Apartment {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  area_m2: number | null;
  tenant_name?: string;
}

export interface MeterReading {
  id: string;
  apartment_id: string;
  reading_date: string;
  utility_type: UtilityType;
  value: number;
  previous_value: number | null;
  usage: number | null;
  photo_path: string | null;
  created_by: string;
  status: "submitted" | "approved" | "rejected";
}

export interface UtilityPrice {
  id: string;
  utility_type: UtilityType;
  supplier_name: string | null;
  unit_net: number;
  vat_rate: number;
  unit_gross: number;
  unit_label: string;
  valid_from: string;
  valid_to: string | null;
  is_active: boolean;
}

export interface Settlement {
  id: string;
  apartment_id: string;
  period_month: string;
  total_amount: number;
  status: "draft" | "unpaid" | "paid";
  issue_date: string;
}
