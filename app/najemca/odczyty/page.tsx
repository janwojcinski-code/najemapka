import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";

export default async function TenantReadingsPage() {
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

  const { data: readings } = await supabase
    .from("meter_readings")
    .select("id, reading_date, cold_water, hot_water, electricity, gas")
    .eq("apartment_id", assignment.apartment_id)
    .order("reading_date", { ascending: false });

  return (
    <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: 700, margin: "0 0 8px" }}>
            Odczyty liczników
          </h1>
          <p style={{ margin: 0, color: "#667085" }}>
            Historia Twoich odczytów.
          </p>
        </div>

        <Link
          href="/najemca/odczyty/nowy"
          style={{
            background: "#0B5CAD",
            color: "white",
            textDecoration: "none",
            padding: "12px 18px",
            borderRadius: "999px",
            fontWeight: 600,
          }}
        >
          + Dodaj odczyt
        </Link>
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
            gridTemplateColumns: "140px repeat(4, 1fr)",
            gap: "16px",
            padding: "16px 20px",
            borderBottom: "1px solid #E5E7EB",
            fontSize: "13px",
            color: "#667085",
            fontWeight: 600,
          }}
        >
          <div>Data</div>
          <div>Zimna woda</div>
          <div>Ciepła woda</div>
          <div>Prąd</div>
          <div>Gaz</div>
        </div>

        {(readings ?? []).length === 0 ? (
          <div style={{ padding: "24px 20px", color: "#667085" }}>
            Brak odczytów.
          </div>
        ) : (
          readings?.map((reading) => (
            <div
              key={reading.id}
              style={{
                display: "grid",
                gridTemplateColumns: "140px repeat(4, 1fr)",
                gap: "16px",
                padding: "16px 20px",
                borderBottom: "1px solid #F1F5F9",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 600 }}>{reading.reading_date}</div>
              <div>{reading.cold_water ?? "—"} m³</div>
              <div>{reading.hot_water ?? "—"} m³</div>
              <div>{reading.electricity ?? "—"} kWh</div>
              <div>{reading.gas ?? "—"} m³</div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}