import { createClient } from "@/lib/supabase/server";

export type AdminDashboardData = {
  apartmentsCount: number;
  newThisWeek: number;
  activeAssignmentsCount: number;
  pendingReadingsCount: number;
  pendingSettlementsCount: number;
  totalMonthlyCost: number;
  costChangePercent: number;
  recentApartments: {
    id: string;
    name: string;
    address: string;
    tenantName: string | null;
  }[];
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = await createClient();

  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  const [apartments, newApartments, assignments, readings, pendingSettlements, currentSettlements, lastSettlements] =
    await Promise.all([
      supabase.from("apartments").select("id, name, address"),
      supabase
        .from("apartments")
        .select("id", { count: "exact" })
        .gte("created_at", oneWeekAgo.toISOString()),
      supabase
        .from("tenant_assignments")
        .select("id", { count: "exact" })
        .is("end_date", null),
      supabase
        .from("meter_readings")
        .select("id", { count: "exact" })
        .is("cold_water", null),
      supabase
        .from("settlements")
        .select("id, total_amount", { count: "exact" })
        .eq("status", "pending"),
      supabase
        .from("settlements")
        .select("total_amount")
        .eq("month", now.getMonth() + 1)
        .eq("year", now.getFullYear()),
      supabase
        .from("settlements")
        .select("total_amount")
        .eq("month", now.getMonth() === 0 ? 12 : now.getMonth())
        .eq("year", now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()),
    ]);

  const first4 = (apartments.data ?? []).slice(0, 4);
  const aptIds = first4.map((a) => a.id);

  const { data: tenantAssignments } = await supabase
    .from("tenant_assignments")
    .select("apartment_id, tenant_user_id")
    .in("apartment_id", aptIds)
    .is("end_date", null);

  const tenantIds = (tenantAssignments ?? []).map((ta) => ta.tenant_user_id);
  const { data: tenantProfiles } =
    tenantIds.length > 0
      ? await supabase.from("profiles").select("id, full_name").in("id", tenantIds)
      : { data: [] };

  const tenantMap: Record<string, string> = {};
  (tenantAssignments ?? []).forEach((ta) => {
    const profile = (tenantProfiles ?? []).find((p) => p.id === ta.tenant_user_id);
    if (profile) tenantMap[String(ta.apartment_id)] = profile.full_name;
  });

  const currentCost = (currentSettlements.data ?? []).reduce(
    (sum, s) => sum + (s.total_amount ?? 0), 0
  );
  const lastCost = (lastSettlements.data ?? []).reduce(
    (sum, s) => sum + (s.total_amount ?? 0), 0
  );
  const costChangePercent =
    lastCost > 0 ? Math.round(((currentCost - lastCost) / lastCost) * 100) : 0;

  return {
    apartmentsCount: apartments.data?.length ?? 0,
    newThisWeek: newApartments.count ?? 0,
    activeAssignmentsCount: assignments.count ?? 0,
    pendingReadingsCount: readings.count ?? 0,
    pendingSettlementsCount: pendingSettlements.count ?? 0,
    totalMonthlyCost: currentCost,
    costChangePercent,
    recentApartments: first4.map((a) => ({
      id: String(a.id),
      name: a.name ?? "",
      address: a.address ?? "",
      tenantName: tenantMap[String(a.id)] ?? null,
    })),
  };
}
