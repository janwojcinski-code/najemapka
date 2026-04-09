import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

export default async function AdminTariffsPage() {
  try {
    await requireAuthenticatedProfile(["admin"]);
  } catch {
    redirect("/logowanie");
  }

  const supabase = await createClient();

  const { data: tariffs } = await supabase
    .from("utility_prices")
    .select("*")
    .order("effective_from", { ascending: false });

  return (
    <main style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto" }}>
      <AdminTopbar />

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
            Taryfy i ceny
          </h1>
          <p style={{ margin: 0, color: "#667085" }}>
            Zarządzaj stawkami dla mediów.
          </p>
        </div>

        <Link
          href="/admin/taryfy/nowe"
          style={{
            background: "#0B5CAD",
            color: "white",
            textDecoration: "none",
            padding: "12px 18px",
            borderRadius: "999px",
            fontWeight: 600,
          }}
        >
          + Dodaj nową stawkę
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
            gridTemplateColumns: "180px 180px 180px 1fr",
            gap: "16px",
            padding: "16px 20px",
            borderBottom: "1px solid #E5E7EB",
            fontSize: "13px",
            color: "#667085",
            fontWeight: 600,
          }}
        >
          <div>Medium</div>
          <div>Stawka</div>
          <div>Obowiązuje od</div>
          <div>Status</div>
        </div>

        {(tariffs ?? []).length === 0 ? (
          <div style={{ padding: "24px 20px", color: "#667085" }}>
            Brak taryf.
          </div>
        ) : (
          tariffs?.map((tariff: any) => (
            <div
              key={tariff.id}
              style={{
                display: "grid",
                gridTemplateColumns: "180px 180px 180px 1fr",
                gap: "16px",
                padding: "16px 20px",
                borderBottom: "1px solid #F1F5F9",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 600 }}>{tariff.utility_type || "—"}</div>
              <div>{tariff.price_gross ?? tariff.price ?? "—"}</div>
              <div>{tariff.effective_from || "—"}</div>
              <div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 10px",
                    borderRadius: "999px",
                    background: "#DBEAFE",
                    color: "#1D4ED8",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  Aktywna / archiwalna wg dat
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}