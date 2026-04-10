import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

export default async function TenantDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    await requireAuthenticatedProfile(["admin"]);
  } catch {
    redirect("/logowanie");
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  const { data: assignments } = await supabase
    .from("tenant_assignments")
    .select("*, apartments(*)")
    .eq("tenant_user_id", id);

  return (
    <main style={{ padding: "2rem" }}>
      <AdminTopbar />

      <h1>{tenant?.email}</h1>

      <h2>Przypisania</h2>
      {assignments?.map((a) => (
        <div key={a.id}>
          {a.apartments?.name} ({a.start_date} → {a.end_date || "teraz"})
        </div>
      ))}
    </main>
  );
}