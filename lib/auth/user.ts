import { createClient } from "@/lib/supabase/server";

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "tenant";
  created_at: string;
};

export async function getAuthenticatedProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return null;

  return profile as UserProfile;
}

export async function requireAuthenticatedProfile(
  allowedRoles?: ("admin" | "tenant")[]
): Promise<UserProfile> {
  const profile = await getAuthenticatedProfile();

  if (!profile) {
    throw new Error("UNAUTHENTICATED");
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    throw new Error("FORBIDDEN");
  }

  return profile;
}