import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

export default async function AdminReadingsPage() {
  try {
    await requireAuthenticatedProfile(["admin"]);
  } catch {
    redirect("/logowanie");
  }

  const supabase = await createClient();

  const { data: readings } = await supabase
    .from("meter_readings")
    .select(
      `
      id,
      apartment_id,
      reading_date,
      cold_water,
      hot_water,
      electricity,
      gas,
      photo_url,
      apartments (
        id,
        name,
        address
      )
    `
    )
    .order("reading_date", { ascending: false });

  return (
    <main style={{ padding: "2rem", maxWidth: "1250px", margin: "0 auto" }}>
      <AdminTopbar />

      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
        Odczyty mieszkań
      </h1>
      <p style={{ margin: "0 0 24px", color: "#667085" }}>
        Podgląd wszystkich zapisanych odczytów liczników.
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
            gridTemplateColumns: "1.5fr 140px 1fr 1fr 1fr 1fr 120px",
            gap: "16px",
            padding: "16px 20px",
            borderBottom: "1px solid #E5E7EB",
            fontSize: "13px",
            color: "#667085",
            fontWeight: 600,
          }}
        >
          <div>Mieszkanie</div>
          <div>Data</div>
          <div>Zimna woda</div>
          <div>Ciepła woda</div>
          <div>Prąd</div>
          <div>Gaz</div>
          <div>Zdjęcie</div>
        </div>

        {(readings ?? []).length === 0 ? (
          <div style={{ padding: "24px 20px", color: "#667085" }}>
            Brak odczytów.
          </div>
        ) : (
          readings?.map((reading) => {
            const apartment = Array.isArray(reading.apartments)
              ? reading.apartments[0]
              : reading.apartments;

            return (
              <div
                key={reading.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 140px 1fr 1fr 1fr 1fr 120px",
                  gap: "16px",
                  padding: "16px 20px",
                  borderBottom: "1px solid #F1F5F9",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{apartment?.name || "—"}</div>
                  <div style={{ fontSize: "13px", color: "#667085" }}>
                    {apartment?.address || "—"}
                  </div>
                </div>
                <div>{reading.reading_date}</div>
                <div>{reading.cold_water ?? "—"} m³</div>
                <div>{reading.hot_water ?? "—"} m³</div>
                <div>{reading.electricity ?? "—"} kWh</div>
                <div>{reading.gas ?? "—"} m³</div>
                <div>
                  {reading.photo_url ? (
                    <a
                      href={reading.photo_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "#0B5CAD",
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      📷 Zobacz
                    </a>
                  ) : (
                    <span style={{ color: "#98A2B3" }}>Brak</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}