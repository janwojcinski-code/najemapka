import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

async function saveAdvance(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const apartmentId = Number(formData.get("apartment_id"));
  const month = Number(formData.get("month"));
  const year = Number(formData.get("year"));
  const amount = Number(formData.get("amount"));

  if (!apartmentId || !month || !year || Number.isNaN(amount)) {
    redirect("/admin/zaliczki?error=Uzupełnij wszystkie pola");
  }

  const { error } = await supabase.from("monthly_advances").upsert(
    {
      apartment_id: apartmentId,
      month,
      year,
      amount,
      status: "unpaid",
    },
    {
      onConflict: "apartment_id,month,year",
    }
  );

  if (error) {
    redirect(`/admin/zaliczki?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/zaliczki");
}

async function markAdvancePaid(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const id = Number(formData.get("id"));

  if (!id) redirect("/admin/zaliczki");

  const { error } = await supabase
    .from("monthly_advances")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/zaliczki?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/zaliczki");
}

export default async function AdminAdvancesPage({
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
  const now = new Date();

  const [{ data: apartments }, { data: advances }] = await Promise.all([
    supabase
      .from("apartments")
      .select("id, name, address, is_active")
      .eq("is_active", true)
      .order("id", { ascending: false }),
    supabase
      .from("monthly_advances")
      .select(
        `
        id,
        apartment_id,
        month,
        year,
        amount,
        status,
        apartments (
          id,
          name,
          address
        )
      `
      )
      .order("year", { ascending: false })
      .order("month", { ascending: false }),
  ]);

  const params = (await searchParams) || {};
  const error = params.error || null;

  return (
    <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <AdminTopbar />

      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>
        Zaliczki na media
      </h1>
      <p style={{ margin: "0 0 24px", color: "#667085" }}>
        Ustaw miesięczną zaliczkę i oznaczaj wpłaty.
      </p>

      <form
        action={saveAdvance}
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
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
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "16px",
            alignItems: "end",
          }}
        >
          <div>
            <label htmlFor="apartment_id" style={labelStyle}>
              Mieszkanie
            </label>
            <select id="apartment_id" name="apartment_id" defaultValue="" style={inputStyle}>
              <option value="" disabled>
                Wybierz mieszkanie
              </option>
              {(apartments ?? []).map((apartment) => (
                <option key={apartment.id} value={apartment.id}>
                  {apartment.name || `Mieszkanie ${apartment.id}`} — {apartment.address}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="month" style={labelStyle}>
              Miesiąc
            </label>
            <input
              id="month"
              name="month"
              type="number"
              min="1"
              max="12"
              defaultValue={now.getMonth() + 1}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="year" style={labelStyle}>
              Rok
            </label>
            <input
              id="year"
              name="year"
              type="number"
              defaultValue={now.getFullYear()}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="amount" style={labelStyle}>
              Kwota zaliczki
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              placeholder="np. 300.00"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <button type="submit" style={primaryButtonStyle}>
            Zapisz zaliczkę
          </button>
        </div>
      </form>

      <section
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
            gridTemplateColumns: "2fr 100px 100px 140px 140px 180px",
            gap: "16px",
            padding: "16px 20px",
            borderBottom: "1px solid #E5E7EB",
            fontSize: "13px",
            color: "#667085",
            fontWeight: 700,
          }}
        >
          <div>Mieszkanie</div>
          <div>Miesiąc</div>
          <div>Rok</div>
          <div>Zaliczka</div>
          <div>Status</div>
          <div>Akcja</div>
        </div>

        {(advances ?? []).length === 0 ? (
          <div style={{ padding: "24px 20px", color: "#667085" }}>
            Brak zaliczek.
          </div>
        ) : (
          advances.map((advance: any) => {
            const apartment = Array.isArray(advance.apartments)
              ? advance.apartments[0]
              : advance.apartments;
            const isPaid = advance.status === "paid";

            return (
              <div
                key={advance.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 100px 100px 140px 140px 180px",
                  gap: "16px",
                  padding: "16px 20px",
                  borderBottom: "1px solid #F1F5F9",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{apartment?.name || "—"}</div>
                  <div style={{ fontSize: "13px", color: "#667085" }}>
                    {apartment?.address || "—"}
                  </div>
                </div>

                <div>{advance.month}</div>
                <div>{advance.year}</div>
                <div style={{ fontWeight: 700 }}>
                  {Number(advance.amount ?? 0).toFixed(2)} zł
                </div>

                <div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      background: isPaid ? "#DCFCE7" : "#FEF2F2",
                      color: isPaid ? "#166534" : "#B91C1C",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {isPaid ? "Wpłacona" : "Niewpłacona"}
                  </span>
                </div>

                <div>
                  {!isPaid ? (
                    <form action={markAdvancePaid}>
                      <input type="hidden" name="id" value={advance.id} />
                      <button type="submit" style={darkButtonStyle}>
                        Oznacz jako wpłaconą
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
      </section>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "6px",
  fontWeight: 700,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #D0D5DD",
};

const primaryButtonStyle: React.CSSProperties = {
  background: "#0B5CAD",
  color: "white",
  border: "none",
  borderRadius: "999px",
  padding: "12px 18px",
  fontWeight: 700,
  cursor: "pointer",
};

const darkButtonStyle: React.CSSProperties = {
  background: "#111827",
  color: "white",
  border: "none",
  borderRadius: "999px",
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};