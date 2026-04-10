import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

export default async function AdminTenantsPage() {
  try {
    await requireAuthenticatedProfile(["admin"]);
  } catch {
    redirect("/logowanie");
  }

  const supabase = await createClient();

  const { data: tenants } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("role", "tenant")
    .order("email", { ascending: true });

  const { data: assignments } = await supabase
    .from("tenant_assignments")
    .select(
      `
      id,
      tenant_user_id,
      end_date,
      apartments (
        id,
        name,
        address
      )
    `
    )
    .is("end_date", null);

  const activeMap = new Map<string, any>();
  (assignments ?? []).forEach((a) => {
    if (!activeMap.has(a.tenant_user_id)) {
      activeMap.set(a.tenant_user_id, a);
    }
  });

  return (
    <main style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto" }}>
      <AdminTopbar />

      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
        Najemcy
      </h1>
      <p style={{ margin: "0 0 24px", color: "#667085" }}>
        Lista użytkowników z rolą najemcy i ich aktywne przypisania.
      </p>

      <div
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1.5fr 1.5fr 180px",
            gap: "16px",
            padding: "16px 20px",
            borderBottom: "1px solid #E5E7EB",
            fontSize: "13px",
            color: "#667085",
            fontWeight: 600,
          }}
        >
          <div>Email</div>
          <div>Imię i nazwisko</div>
          <div>Aktywne mieszkanie</div>
          <div>Status</div>
        </div>

        {(tenants ?? []).length === 0 ? (
          <div style={{ padding: "24px 20px", color: "#667085" }}>
            Brak najemców.
          </div>
        ) : (
          tenants?.map((tenant) => {
            const assignment = activeMap.get(tenant.id);
            const apartment = assignment
              ? Array.isArray(assignment.apartments)
                ? assignment.apartments[0]
                : assignment.apartments
              : null;

            return (
              <div
                key={tenant.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1.5fr 1.5fr 180px",
                  gap: "16px",
                  padding: "16px 20px",
                  borderBottom: "1px solid #F1F5F9",
                  alignItems: "center",
                }}
              >
                <div>{tenant.email}</div>
                <div>{tenant.full_name || "—"}</div>
                <div>
                  {apartment ? `${apartment.name || "—"} — ${apartment.address || "—"}` : "Brak przypisania"}
                </div>
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      background: apartment ? "#DCFCE7" : "#F3F4F6",
                      color: apartment ? "#166534" : "#6B7280",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {apartment ? "Aktywny" : "Nieprzypisany"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}