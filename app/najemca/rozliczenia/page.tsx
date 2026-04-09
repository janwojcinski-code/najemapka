import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import TenantTopbar from "@/components/tenant-topbar";

export default async function TenantSettlementsPage() {
  let profile;
  try {
    profile = await requireAuthenticatedProfile(["tenant"]);
  } catch {
    redirect("/logowanie");
  }

  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from("tenant_assignments")
    .select("apartment_id")
    .eq("tenant_user_id", profile.id)
    .is("end_date", null)
    .single();

  if (!assignment) {
    redirect("/najemca/dashboard");
  }

  const { data: settlements } = await supabase
    .from("settlements")
    .select("id, month, year, total_amount, status")
    .eq("apartment_id", assignment.apartment_id)
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  const unpaidSum = (settlements ?? [])
    .filter((s) => s.status !== "paid")
    .reduce((sum, s) => sum + (s.total_amount ?? 0), 0);

  const paidSum = (settlements ?? [])
    .filter((s) => s.status === "paid")
    .reduce((sum, s) => sum + (s.total_amount ?? 0), 0);

  return (
    <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <TenantTopbar />

      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
        Moje rozliczenia
      </h1>
      <p style={{ margin: "0 0 24px", color: "#667085" }}>
        Zarządzaj wydatkami i historią rozliczeń.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: "18px",
            padding: "20px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#991B1B", marginBottom: "8px" }}>
            DO ZAPŁATY
          </div>
          <div style={{ fontSize: "36px", fontWeight: 700, color: "#B91C1C" }}>
            {unpaidSum.toFixed(2)} zł
          </div>
        </div>

        <div
          style={{
            background: "#EFF6FF",
            border: "1px solid #BFDBFE",
            borderRadius: "18px",
            padding: "20px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#1D4ED8", marginBottom: "8px" }}>
            SUMA OPŁACONA
          </div>
          <div style={{ fontSize: "36px", fontWeight: 700, color: "#1D4ED8" }}>
            {paidSum.toFixed(2)} zł
          </div>
        </div>
      </div>

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
            gridTemplateColumns: "120px 120px 1fr 140px",
            gap: "16px",
            padding: "16px 20px",
            borderBottom: "1px solid #E5E7EB",
            fontSize: "13px",
            color: "#667085",
            fontWeight: 600,
          }}
        >
          <div>Miesiąc</div>
          <div>Rok</div>
          <div>Status</div>
          <div>Kwota</div>
        </div>

        {(settlements ?? []).length === 0 ? (
          <div style={{ padding: "24px 20px", color: "#667085" }}>
            Brak rozliczeń.
          </div>
        ) : (
          settlements?.map((settlement) => (
            <div
              key={settlement.id}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 120px 1fr 140px",
                gap: "16px",
                padding: "16px 20px",
                borderBottom: "1px solid #F1F5F9",
                alignItems: "center",
              }}
            >
              <div>{settlement.month}</div>
              <div>{settlement.year}</div>
              <div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 10px",
                    borderRadius: "999px",
                    background:
                      settlement.status === "paid" ? "#DCFCE7" : "#FEF2F2",
                    color:
                      settlement.status === "paid" ? "#166534" : "#B91C1C",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  {settlement.status === "paid" ? "Opłacone" : "Nieopłacone"}
                </span>
              </div>
              <div style={{ fontWeight: 700 }}>
                {settlement.total_amount?.toFixed(2)} zł
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}