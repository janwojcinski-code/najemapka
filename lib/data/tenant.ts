import { createClient } from "@/lib/supabase/server";

export type TenantDashboardData = {
  assignment: {
    id: string;
    apartment_id: string;
    apartment_name: string;
    apartment_address: string;
  } | null;
  recentReadings: {
    id: string;
    reading_date: string;
    cold_water: number | null;
    hot_water: number | null;
    electricity: number | null;
    gas: number | null;
  }[];
  recentSettlements: {
    id: string;
    total_amount: number;
    status: string;
    month: number;
    year: number;
  }[];
};

export async function getTenantDashboardData(
  tenantId: string
): Promise<TenantDashboardData> {
  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from("tenant_assignments")
    .select(`id, apartment_id, apartments ( id, name, address )`)
    .eq("tenant_user_id", tenantId)
    .is("end_date", null)
    .single();

  if (!assignment) {
    return { assignment: null, recentReadings: [], recentSettlements: [] };
  }

  const apt = Array.isArray(assignment.apartments)
    ? assignment.apartments[0]
    : assignment.apartments;

  const [readingsRes, settlementsRes] = await Promise.all([
    supabase
      .from("meter_readings")
      .select("id, reading_date, cold_water, hot_water, electricity, gas")
      .eq("apartment_id", assignment.apartment_id)
      .order("reading_date", { ascending: false })
      .limit(5),
    supabase
      .from("settlements")
      .select("id, total_amount, status, month, year")
      .eq("apartment_id", assignment.apartment_id)
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .limit(5),
  ]);

  return {
    assignment: {
      id: String(assignment.id),
      apartment_id: String(assignment.apartment_id),
      apartment_name: apt?.name ?? "Brak nazwy",
      apartment_address: apt?.address ?? "Brak adresu",
    },
    recentReadings: readingsRes.data ?? [],
    recentSettlements: settlementsRes.data ?? [],
  };
}
