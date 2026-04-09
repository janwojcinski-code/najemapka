import { createClient } from "@/lib/supabase/server";

export type AdminDashboardData = {
  apartmentsCount: number;
  activeAssignmentsCount: number;
  pendingReadingsCount: number;
  pendingSettlementsCount: number;
  recentApartments: {
    id: string;
    name: string;
    address: string;
  }[];
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = await createClient();

  const [apartments, assignments, readings, settlements] = await Promise.all([
    supabase.from("apartments").select("id, name, address"),
    supabase
      .from("tenant_assignments")
      .select("id", { count: "exact" })
      .is("end_date", null),
    supabase
      .from("meter_readings")
      .select("id", { count: "exact" })
      .eq("status", "pending"),
    supabase
      .from("settlements")
      .select("id", { count: "exact" })
      .eq("status", "pending"),
  ]);

  return {
    apartmentsCount: apartments.data?.length ?? 0,
    activeAssignmentsCount: assignments.count ?? 0,
    pendingReadingsCount: readings.count ?? 0,
    pendingSettlementsCount: settlements.count ?? 0,
    recentApartments: (apartments.data ?? [])
      .slice(0, 4)
      .map((a) => ({
        id: String(a.id),
        name: a.name ?? "",
        address: a.address ?? "",
      })),
  };
}
