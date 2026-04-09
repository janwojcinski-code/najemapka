import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRedirectPathForRole } from "@/lib/auth/roles";
import type { UserRole } from "@/types";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  apartment_id?: string | null;
  created_at?: string;
};

export async function getCurrentUserProfile(): Promise<ProfileRow | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  console.log("SSR user:", user?.id, user?.email, userError);

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, apartment_id, created_at")
    .eq("id", user.id)
    .maybeSingle();

  console.log("SSR profile:", profile, profileError);

  if (profileError) {
    return null;
  }

  return (profile as ProfileRow | null) ?? null;
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