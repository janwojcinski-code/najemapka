import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRedirectPathForRole } from "@/lib/auth/roles";
import type { Apartment, MeterReading, Profile, Settlement, UserRole } from "@/types";

type ProfileRow = Pick<Profile, "id" | "full_name" | "role" | "apartment_id" | "created_at"> & {
  email?: string | null;
};

type ReadingWithApartment = MeterReading & {
  apartments?: Pick<Apartment, "id" | "name" | "code"> | null;
};

type SettlementWithApartment = Settlement & {
  apartments?: Pick<Apartment, "id" | "name" | "code"> | null;
};

export async function getCurrentUserProfile(): Promise<ProfileRow | null> {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, apartment_id, created_at, email")
    .eq("id", user.id)
    .maybeSingle();

  return profile as ProfileRow | null;
}

export async function requireAuthenticatedProfile(allowedRole?: UserRole) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/logowanie?error=missing_profile");
  }

  if (profile.role !== "admin" && profile.role !== "tenant") {
    redirect("/logowanie?error=unknown_role");
  }

  if (allowedRole && profile.role !== allowedRole) {
    redirect(getRedirectPathForRole(profile.role));
  }

  return profile;
}

export async function getAdminDashboardData() {
  const supabase = await createClient();

  const [
    apartmentsResponse,
    readingsResponse,
    settlementsResponse,
    pendingSettlementsResponse,
    currentMonthSettlementsResponse,
    latestReadingsResponse
  ] = await Promise.all([
    supabase.from("apartments").select("id, code, name, address, city, area_m2").order("created_at", { ascending: false }),
    supabase.from("meter_readings").select("id, status, reading_date"),
    supabase.from("settlements").select("id, status, total_amount, issue_date"),
    supabase.from("settlements").select("id").eq("status", "draft"),
    supabase
      .from("settlements")
      .select("id, total_amount")
      .gte("period_month", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10))
      .lt("period_month", new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().slice(0, 10)),
    supabase
      .from("meter_readings")
      .select("id, apartment_id, reading_date, utility_type, value, previous_value, usage, photo_path, created_by, status, apartments(id, name, code)")
      .order("reading_date", { ascending: false })
      .limit(6)
  ]);

  const apartments = (apartmentsResponse.data ?? []) as Apartment[];
  const readings = (readingsResponse.data ?? []) as Pick<MeterReading, "id" | "status" | "reading_date">[];
  const settlements = (settlementsResponse.data ?? []) as Pick<Settlement, "id" | "status" | "total_amount" | "issue_date">[];
  const pendingSettlements = pendingSettlementsResponse.data ?? [];
  const currentMonthSettlements = (currentMonthSettlementsResponse.data ?? []) as Pick<Settlement, "id" | "total_amount">[];
  const latestReadings = (latestReadingsResponse.data ?? []) as ReadingWithApartment[];

  const missingReadingsCount = readings.filter((item) => item.status === "submitted").length;
  const totalCurrentMonthCost = currentMonthSettlements.reduce((sum, item) => sum + Number(item.total_amount ?? 0), 0);

  return {
    apartments,
    latestReadings,
    stats: {
      apartmentsCount: apartments.length,
      missingReadingsCount,
      pendingSettlementsCount: pendingSettlements.length,
      totalCurrentMonthCost
    }
  };
}

export async function getTenantDashboardData(profile: ProfileRow) {
  const supabase = await createClient();

  if (!profile.apartment_id) {
    return {
      apartment: null,
      latestReadings: [] as MeterReading[],
      latestSettlements: [] as Settlement[],
      estimatedCost: 0,
      latestSettlementDate: null as string | null
    };
  }

  const [apartmentResponse, readingsResponse, settlementsResponse] = await Promise.all([
    supabase
      .from("apartments")
      .select("id, code, name, address, city, area_m2")
      .eq("id", profile.apartment_id)
      .maybeSingle(),
    supabase
      .from("meter_readings")
      .select("id, apartment_id, reading_date, utility_type, value, previous_value, usage, photo_path, created_by, status")
      .eq("apartment_id", profile.apartment_id)
      .order("reading_date", { ascending: false })
      .limit(4),
    supabase
      .from("settlements")
      .select("id, apartment_id, period_month, total_amount, status, issue_date")
      .eq("apartment_id", profile.apartment_id)
      .order("period_month", { ascending: false })
      .limit(3)
  ]);

  const apartment = (apartmentResponse.data ?? null) as Apartment | null;
  const latestReadings = (readingsResponse.data ?? []) as MeterReading[];
  const latestSettlements = (settlementsResponse.data ?? []) as Settlement[];

  return {
    apartment,
    latestReadings,
    latestSettlements,
    estimatedCost: Number(latestSettlements[0]?.total_amount ?? 0),
    latestSettlementDate: latestSettlements[0]?.issue_date ?? null
  };
}
