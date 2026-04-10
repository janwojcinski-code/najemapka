import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

async function markSettlementPaid(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const id = Number(formData.get("id"));

  if (!id) {
    redirect("/admin/rozliczenia");
  }

  const { error } = await supabase
    .from("settlements")
    .update({ status: "paid" })
    .eq("id", id);

  if (error) {
    redirect("/admin/rozliczenia?error=mark_paid_failed");
  }

  redirect("/admin/rozliczenia");
}

export default async function AdminSettlementsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  try {
    await requireAuthenticatedProfile(["admin"]);
  } catch {
    redirect("/logowanie");
  }

  const supabase = await createClient();

  const { data: settlements } = await supabase
    .from("settlements")
    .select(
      `
      id,
      apartment_id,
      month,
      year,
      total_amount,
      status,
      apartments (
        id,
        name,
        address
      )
    `
    )
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  const params = (await searchParams) || {};
  const error =
    params.error === "mark_paid_failed"
      ? "Nie udało się oznaczyć rozliczenia jako opłacone."
      : null;

  return (
    <main style={{ padding: "2rem", maxWidth: "1180px", margin: "0 auto" }}>
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
            Rozliczenia
          </h1>
          <p style={{ margin: 0, color: "#667085" }}>
            Zarządzaj rozliczeniami mieszkań.
          </p>
        </div>

        <Link
          href="/admin/rozliczenia/nowe"
          style={{
            background: "#0B5CAD",
            color: "white",
            textDecoration: "none",
            padding: "12px 18px",
            borderRadius: "999px",
            fontWeight: 600,
          }}
        >
          + Generuj rozliczenie
        </Link>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "12px",
            background: "#FEF2F2",
            color: "#B91C1C",
            border: "1px solid #FECACA",
          }}
        >
          {error}
        </div>
      )}

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
            gridTemplateColumns: "80px 1.4fr 90px 90px 140px 140px 160px 160px",
            gap: "16px",
            padding: "16px 20px",
            borderBottom: "1px solid #E5E7EB",
            fontSize: "13px",
            color: "#667085",
            fontWeight: 600,
          }}
        >
          <div>ID</div>
          <div>Mieszkanie</div>
          <div>Miesiąc</div>
          <div>Rok</div>
          <div>Status</div>
          <div>Kwota</div>
          <div>Szczegóły</div>
          <div>Akcja</div>
        </div>

        {(settlements ?? []).length === 0 ? (
          <div style={{ padding: "24px 20px", color: "#667085" }}>
            Brak rozliczeń.
          </div>
        ) : (
          settlements?.map((settlement) => {
            const apartment = Array.isArray(settlement.apartments)
              ? settlement.apartments[0]
              : settlement.apartments;

            const paid = settlement.status === "paid";

            return (
              <div
                key={settlement.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1.4fr 90px 90px 140px 140px 160px 160px",
                  gap: "16px",
                  padding: "16px 20px",
                  borderBottom: "1px solid #F1F5F9",
                  alignItems: "center",
                }}
              >
                <div style={{ fontWeight: 600 }}>{settlement.id}</div>

                <div>
                  <div style={{ fontWeight: 600 }}>{apartment?.name || "—"}</div>
                  <div style={{ fontSize: "13px", color: "#667085" }}>
                    {apartment?.address || "—"}
                  </div>
                </div>

                <div>{settlement.month}</div>
                <div>{settlement.year}</div>

                <div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      background: paid ? "#DCFCE7" : "#FEF2F2",
                      color: paid ? "#166534" : "#B91C1C",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {paid ? "Opłacone" : "Nieopłacone"}
                  </span>
                </div>

                <div style={{ fontWeight: 700 }}>
                  {settlement.total_amount?.toFixed(2)} zł
                </div>

                <div>
                  <Link
                    href={`/admin/rozliczenia/${settlement.id}`}
                    style={{
                      textDecoration: "none",
                      color: "#0B5CAD",
                      fontWeight: 600,
                    }}
                  >
                    Zobacz szczegóły
                  </Link>
                </div>

                <div>
                  {!paid ? (
                    <form action={markSettlementPaid}>
                      <input type="hidden" name="id" value={settlement.id} />
                      <button
                        type="submit"
                        style={{
                          background: "#111827",
                          color: "white",
                          border: "none",
                          borderRadius: "999px",
                          padding: "10px 14px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Oznacz opłacone
                      </button>
                    </form>
                  ) : (
                    <span style={{ color: "#98A2B3", fontSize: "13px" }}>
                      Brak akcji
                    </span>
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