import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRedirectPathForRole } from "@/lib/auth/roles";
import type { UserRole } from "@/types";

export type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  created_at?: string;
};

export type TenantAssignmentRow = {
  id: string;
  tenant_id: string;
  apartment_id: string;
  is_active: boolean | null;
};

export async function getCurrentUserProfile(): Promise<ProfileRow | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Błąd odczytu public.profiles: ${profileError.message}`);
  }

  return (profile as ProfileRow | null) ?? null;
}

export async function requireAuthenticatedProfile(
  allowedRole?: UserRole
): Promise<ProfileRow> {
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

export async function getActiveTenantAssignment(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tenant_assignments")
    .select("id, tenant_id, apartment_id, is_active")
    .eq("tenant_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Błąd odczytu tenant_assignments: ${error.message}`);
  }

  return (data as TenantAssignmentRow | null) ?? null;
}

export async function getAdminDashboardData() {
  const supabase = await createClient();

  const [
    apartmentsResponse,
    readingsResponse,
    settlementsResponse,
    assignmentsResponse,
    pricesResponse
  ] = await Promise.all([
    supabase
      .from("apartments")
      .select("id, name, address, city, created_at")
      .order("created_at", { ascending: false })
      .limit(6),

    supabase
      .from("meter_readings")
      .select("id, apartment_id, utility_type, reading_date, value, status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),

    supabase
      .from("settlements")
      .select("id, apartment_id, period_month, total_amount, status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),

    supabase
      .from("tenant_assignments")
      .select("id, tenant_id, apartment_id, is_active"),

    supabase
      .from("utility_prices")
      .select("id, utility_type, gross_price, valid_from, valid_to")
      .order("valid_from", { ascending: false })
      .limit(8)
  ]);

  if (apartmentsResponse.error) {
    throw new Error(`Błąd apartments: ${apartmentsResponse.error.message}`);
  }

  if (readingsResponse.error) {
    throw new Error(`Błąd meter_readings: ${readingsResponse.error.message}`);
  }

  if (settlementsResponse.error) {
    throw new Error(`Błąd settlements: ${settlementsResponse.error.message}`);
  }

  if (assignmentsResponse.error) {
    throw new Error(`Błąd tenant_assignments: ${assignmentsResponse.error.message}`);
  }

  if (pricesResponse.error) {
    throw new Error(`Błąd utility_prices: ${pricesResponse.error.message}`);
  }

  const apartments = apartmentsResponse.data ?? [];
  const readings = readingsResponse.data ?? [];
  const settlements = settlementsResponse.data ?? [];
  const assignments = assignmentsResponse.data ?? [];
  const prices = pricesResponse.data ?? [];

  const draftSettlements = settlements.filter((item: { status?: string | null }) => item.status === "draft");
  const pendingReadings = readings.filter((item: { status?: string | null }) => item.status === "submitted");

  return {
    apartments,
    readings,
    settlements,
    assignments,
    prices,
    stats: {
      apartmentsCount: apartments.length,
      activeAssignmentsCount: assignments.filter((item: { is_active?: boolean | null }) => !!item.is_active).length,
      pendingReadingsCount: pendingReadings.length,
      draftSettlementsCount: draftSettlements.length
    }
  };
}

export async function getTenantDashboardData(userId: string) {
  const supabase = await createClient();
  const assignment = await getActiveTenantAssignment(userId);

  if (!assignment) {
    return {
      assignment: null,
      apartment: null,
      readings: [],
      settlements: []
    };
  }

  const [apartmentResponse, readingsResponse, settlementsResponse] = await Promise.all([
    supabase
      .from("apartments")
      .select("id, name, address, city, created_at")
      .eq("id", assignment.apartment_id)
      .maybeSingle(),

    supabase
      .from("meter_readings")
      .select("id, apartment_id, utility_type, reading_date, value, status, created_at")
      .eq("apartment_id", assignment.apartment_id)
      .order("created_at", { ascending: false })
      .limit(8),

    supabase
      .from("settlements")
      .select("id, apartment_id, period_month, total_amount, status, created_at")
      .eq("apartment_id", assignment.apartment_id)
      .order("created_at", { ascending: false })
      .limit(8)
  ]);

  if (apartmentResponse.error) {
    throw new Error(`Błąd apartments: ${apartmentResponse.error.message}`);
  }

  if (readingsResponse.error) {
    throw new Error(`Błąd meter_readings: ${readingsResponse.error.message}`);
  }

  if (settlementsResponse.error) {
    throw new Error(`Błąd settlements: ${settlementsResponse.error.message}`);
  }

  return {
    assignment,
    apartment: apartmentResponse.data ?? null,
    readings: readingsResponse.data ?? [],
    settlements: settlementsResponse.data ?? []
  };
}