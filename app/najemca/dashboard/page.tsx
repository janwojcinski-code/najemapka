import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import {
  formatPolishDate,
  getTenantDeadlineState,
} from "@/lib/billing/deadlines";

export default async function TenantDashboardPage() {
  let profile;
  try {
    profile = await requireAuthenticatedProfile(["tenant"]);
  } catch {
    redirect("/logowanie");
  }

  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from("tenant_assignments")
    .select(
      `
      id,
      apartment_id,
      apartments (
        id,
        name,
        address
      )
    `
    )
    .eq("tenant_user_id", profile.id)
    .is("end_date", null)
    .single();

  const apt = assignment
    ? Array.isArray(assignment.apartments)
      ? assignment.apartments[0]
      : assignment.apartments
    : null;

  const [readingsRes, settlementsRes] = assignment
    ? await Promise.all([
        supabase
          .from("meter_readings")
          .select("*")
          .eq("apartment_id", assignment.apartment_id)
          .order("reading_date", { ascending: false })
          .limit(1),
        supabase
          .from("settlements")
          .select("*")
          .eq("apartment_id", assignment.apartment_id)
          .order("year", { ascending: false })
          .order("month", { ascending: false })
          .limit(1),
      ])
    : [{ data: [] }, { data: [] }];

  const lastReading = readingsRes.data?.[0];
  const lastSettlement = settlementsRes.data?.[0];

  const deadline = getTenantDeadlineState();

  const firstName =
    profile.full_name?.split(" ")[0] || profile.email;

  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      {/* HEADER */}
      <h1 style={{ fontSize: "22px", fontWeight: 500, marginBottom: "8px" }}>
        Witaj, {firstName}!
      </h1>

      {/* TERMIN */}
      <div
        style={{
          background: "#fff5f5",
          border: "1px solid #ffd0d0",
          borderRadius: "12px",
          padding: "14px 16px",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: "6px" }}>
          Termin płatności
        </div>

        {deadline.isBeforeDue ? (
          <>
            <span style={{ color: "#e53e3e", fontWeight: 600 }}>
              Pozostało {deadline.daysUntilDue} dni
            </span>
            <span style={{ color: "#888" }}>
              {" "}
              • Termin: {formatPolishDate(deadline.dueDate)}
            </span>
          </>
        ) : (
          <>
            <span style={{ color: "#b91c1c", fontWeight: 600 }}>
              Po terminie o {deadline.daysOverdue} dni
            </span>
            <span style={{ color: "#888" }}>
              {" "}
              • Termin: {formatPolishDate(deadline.dueDate)}
            </span>
          </>
        )}
      </div>

      {/* MIESZKANIE */}
      {apt && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            border: "1px solid #eee",
            borderRadius: "12px",
          }}
        >
          <div style={{ fontWeight: 600 }}>{apt.name}</div>
          <div style={{ color: "#666" }}>{apt.address}</div>
        </div>
      )}

      {/* OSTATNI ODCZYT */}
      {lastReading && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            border: "1px solid #eee",
            borderRadius: "12px",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "8px" }}>
            Ostatni odczyt
          </div>

          <div>Zimna woda: {lastReading.cold_water} m³</div>
          <div>Ciepła woda: {lastReading.hot_water} m³</div>

          <div style={{ marginTop: "8px", color: "#888" }}>
            Prąd i gaz rozliczane na podstawie faktur administratora
          </div>
        </div>
      )}

      {/* ROZLICZENIE */}
      {lastSettlement && (
        <div
          style={{
            padding: "1rem",
            border: "1px solid #eee",
            borderRadius: "12px",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "8px" }}>
            Ostatnie rozliczenie
          </div>

          <div style={{ fontSize: "22px", fontWeight: 700 }}>
            {lastSettlement.total_amount?.toFixed(2)} zł
          </div>

          <div style={{ color: "#666" }}>
            {lastSettlement.month}/{lastSettlement.year}
          </div>

          <div style={{ marginTop: "8px" }}>
            Status: {lastSettlement.status}
          </div>
        </div>
      )}
    </main>
  );
}