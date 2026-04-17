export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

async function addInvoice(formData: FormData) {
  "use server";

  try {
    await requireAuthenticatedProfile(["admin"]);
  } catch {
    redirect("/logowanie");
  }

  const supabase = await createClient();

  const apartmentId = Number(formData.get("apartment_id"));
  const utilityType = String(formData.get("utility_type") || "").trim();
  const amount = Number(formData.get("amount"));
  const month = Number(formData.get("month"));
  const year = Number(formData.get("year"));
  const note = String(formData.get("note") || "").trim();

  if (!apartmentId) {
    redirect("/admin/faktury?error=Wybierz mieszkanie");
  }

  if (!utilityType) {
    redirect("/admin/faktury?error=Wybierz typ faktury");
  }

  if (Number.isNaN(amount) || amount <= 0) {
    redirect("/admin/faktury?error=Podaj poprawną kwotę");
  }

  if (Number.isNaN(month) || month < 1 || month > 12) {
    redirect("/admin/faktury?error=Podaj poprawny miesiąc");
  }

  if (Number.isNaN(year) || year < 2020 || year > 2100) {
    redirect("/admin/faktury?error=Podaj poprawny rok");
  }

  const dueDate = new Date(year, month - 1, 10).toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("utility_invoices")
    .insert({
      apartment_id: apartmentId,
      utility_type: utilityType,
      amount,
      month,
      year,
      due_date: dueDate,
      status: "unpaid",
      note,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/admin/faktury?error=${encodeURIComponent(error.message)}`);
  }

  if (!data?.id) {
    redirect("/admin/faktury?error=Faktura nie została zapisana");
  }

  redirect("/admin/faktury?success=1");
}

async function markInvoicePaid(formData: FormData) {
  "use server";

  try {
    await requireAuthenticatedProfile(["admin"]);
  } catch {
    redirect("/logowanie");
  }

  const supabase = await createClient();
  const id = Number(formData.get("id"));

  if (!id) {
    redirect("/admin/faktury?error=Brak ID faktury");
  }

  const { error } = await supabase
    .from("utility_invoices")
    .update({ status: "paid" })
    .eq("id", id);

  if (error) {
    redirect(`/admin/faktury?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/faktury?success=paid");
}

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  try {
    await requireAuthenticatedProfile(["admin"]);
  } catch {
    redirect("/logowanie");
  }

  const supabase = await createClient();
  const now = new Date();

  const [{ data: apartments }, { data: invoices, error: invoicesError }] = await Promise.all([
    supabase
      .from("apartments")
      .select("id, name, address, is_active")
      .eq("is_active", true)
      .order("id", { ascending: false }),

    supabase
      .from("utility_invoices")
      .select(
        `
        id,
        apartment_id,
        utility_type,
        amount,
        month,
        year,
        due_date,
        status,
        note,
        apartments (
          id,
          name,
          address
        )
      `
      )
      .order("id", { ascending: false }),
  ]);

  const safeApartments = apartments ?? [];
  const safeInvoices = invoices ?? [];

  const params = (await searchParams) || {};
  const error = params.error || (invoicesError ? invoicesError.message : null);
  const success = params.success || null;

  return (
    <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <AdminTopbar />

      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>
        Faktury
      </h1>
      <p style={{ margin: "0 0 24px", color: "#667085" }}>
        Dodawaj faktury za prąd i gaz oraz oznaczaj je jako opłacone.
      </p>

      {error ? (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "12px",
            background: "#FEF2F2",
            color: "#B91C1C",
            border: "1px solid #FECACA",
            fontWeight: 600,
          }}
        >
          {decodeURIComponent(error)}
        </div>
      ) : null}

      {success ? (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "12px",
            background: "#F0FDF4",
            color: "#166534",
            border: "1px solid #BBF7D0",
            fontWeight: 600,
          }}
        >
          {success === "paid"
            ? "Faktura została oznaczona jako opłacona."
            : "Faktura została poprawnie dodana."}
        </div>
      ) : null}

      <form
        action={addInvoice}
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "grid", gap: "16px", maxWidth: "680px" }}>
          <div>
            <label htmlFor="apartment_id" style={labelStyle}>
              Mieszkanie
            </label>
            <select id="apartment_id" name="apartment_id" defaultValue="" style={inputStyle}>
              <option value="" disabled>
                Wybierz mieszkanie
              </option>
              {safeApartments.map((apartment) => (
                <option key={apartment.id} value={apartment.id}>
                  {apartment.name || `Mieszkanie ${apartment.id}`} — {apartment.address}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="utility_type" style={labelStyle}>
              Typ faktury
            </label>
            <select id="utility_type" name="utility_type" defaultValue="" style={inputStyle}>
              <option value="" disabled>
                Wybierz typ
              </option>
              <option value="electricity">Prąd</option>
              <option value="gas">Gaz</option>
              <option value="other">Inne</option>
            </select>
          </div>

          <div>
            <label htmlFor="amount" style={labelStyle}>
              Kwota
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              placeholder="np. 185.40"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
          </div>

          <div>
            <label htmlFor="note" style={labelStyle}>
              Notatka
            </label>
            <input
              id="note"
              name="note"
              type="text"
              placeholder="np. Faktura Tauron marzec"
              style={inputStyle}
            />
          </div>

          <div>
            <button type="submit" style={primaryButtonStyle}>
              Dodaj fakturę
            </button>
          </div>
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
            gridTemplateColumns: "2fr 120px 120px 140px 140px 140px 180px",
            gap: "16px",
            padding: "16px 20px",
            borderBottom: "1px solid #E5E7EB",
            fontSize: "13px",
            color: "#667085",
            fontWeight: 700,
          }}
        >
          <div>Mieszkanie / typ</div>
          <div>Miesiąc</div>
          <div>Rok</div>
          <div>Kwota</div>
          <div>Termin</div>
          <div>Status</div>
          <div>Akcja</div>
        </div>

        {safeInvoices.length === 0 ? (
          <div style={{ padding: "24px 20px", color: "#667085" }}>
            Brak faktur.
          </div>
        ) : (
          safeInvoices.map((invoice: any) => {
            const apartment = Array.isArray(invoice.apartments)
              ? invoice.apartments[0]
              : invoice.apartments;
            const isPaid = invoice.status === "paid";

            return (
              <div
                key={invoice.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 120px 120px 140px 140px 140px 180px",
                  gap: "16px",
                  padding: "16px 20px",
                  borderBottom: "1px solid #F1F5F9",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {apartment?.name || "—"} — {invoice.utility_type}
                  </div>
                  <div style={{ fontSize: "13px", color: "#667085" }}>
                    {apartment?.address || "—"}
                  </div>
                  {invoice.note ? (
                    <div style={{ fontSize: "13px", color: "#667085", marginTop: "4px" }}>
                      {invoice.note}
                    </div>
                  ) : null}
                </div>

                <div>{invoice.month}</div>
                <div>{invoice.year}</div>
                <div style={{ fontWeight: 700 }}>
                  {Number(invoice.amount ?? 0).toFixed(2)} zł
                </div>
                <div>{invoice.due_date}</div>

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
                    {isPaid ? "Opłacona" : "Nieopłacona"}
                  </span>
                </div>

                <div>
                  {!isPaid ? (
                    <form action={markInvoicePaid}>
                      <input type="hidden" name="id" value={invoice.id} />
                      <button type="submit" style={darkButtonStyle}>
                        Oznacz jako opłaconą
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