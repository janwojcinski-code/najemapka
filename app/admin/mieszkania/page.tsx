import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";

export default async function AdminApartmentsPage() {
  try {
    await requireAuthenticatedProfile(["admin"]);
  } catch {
    redirect("/logowanie");
  }

  const supabase = await createClient();

  const { data: apartments } = await supabase
    .from("apartments")
    .select("id, name, address, is_active, created_at")
    .order("id", { ascending: false });

  return (
    <main style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto" }}>
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
            Mieszkania
          </h1>
          <p style={{ margin: 0, color: "#667085" }}>
            Zarządzaj lokalami i ich podstawowymi danymi.
          </p>
        </div>

        <Link
          href="/admin/mieszkania/nowe"
          style={{
            background: "#0B5CAD",
            color: "white",
            textDecoration: "none",
            padding: "12px 18px",
            borderRadius: "999px",
            fontWeight: 600,
          }}
        >
          + Dodaj mieszkanie
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
            gridTemplateColumns: "100px 1.2fr 2fr 140px",
            gap: "16px",
            padding: "16px 20px",
            borderBottom: "1px solid #E5E7EB",
            fontSize: "13px",
            color: "#667085",
            fontWeight: 600,
          }}
        >
          <div>ID</div>
          <div>Nazwa</div>
          <div>Adres</div>
          <div>Status</div>
        </div>

        {(apartments ?? []).length === 0 ? (
          <div style={{ padding: "24px 20px", color: "#667085" }}>
            Brak mieszkań. Dodaj pierwsze mieszkanie.
          </div>
        ) : (
          apartments?.map((apartment) => (
            <div
              key={apartment.id}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1.2fr 2fr 140px",
                gap: "16px",
                padding: "16px 20px",
                borderBottom: "1px solid #F1F5F9",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 600 }}>{apartment.id}</div>
              <div>{apartment.name || "—"}</div>
              <div>{apartment.address || "—"}</div>
              <div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 10px",
                    borderRadius: "999px",
                    background: apartment.is_active ? "#DCFCE7" : "#F3F4F6",
                    color: apartment.is_active ? "#166534" : "#6B7280",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  {apartment.is_active ? "Aktywne" : "Nieaktywne"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}