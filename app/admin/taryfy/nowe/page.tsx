import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

async function createTariff(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const utilityType = String(formData.get("utility_type") || "").trim();
  const priceRaw = String(formData.get("price") || "").trim();
  const effectiveFrom = String(formData.get("effective_from") || "").trim();

  if (!utilityType || !priceRaw || !effectiveFrom) {
    redirect("/admin/taryfy/nowe?error=missing_fields");
  }

  const price = Number(priceRaw);

  const { error } = await supabase.from("utility_prices").insert({
    utility_type: utilityType,
    price,
    price_gross: price,
    effective_from: effectiveFrom,
  });

  if (error) {
    redirect("/admin/taryfy/nowe?error=save_failed");
  }

  redirect("/admin/taryfy");
}

export default async function NewTariffPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  try {
    await requireAuthenticatedProfile(["admin"]);
  } catch {
    redirect("/logowanie");
  }

  const params = (await searchParams) || {};
  const error =
    params.error === "missing_fields"
      ? "Uzupełnij wszystkie pola."
      : params.error === "save_failed"
      ? "Nie udało się zapisać taryfy."
      : null;

  return (
    <main style={{ padding: "2rem", maxWidth: "760px", margin: "0 auto" }}>
      <AdminTopbar />

      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
        Dodaj taryfę
      </h1>
      <p style={{ margin: "0 0 24px", color: "#667085" }}>
        Dodaj nową stawkę dla wybranego medium.
      </p>

      <form
        action={createTariff}
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          padding: "24px",
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

        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="utility_type"
            style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
          >
            Medium
          </label>
          <select
            id="utility_type"
            name="utility_type"
            defaultValue=""
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #D0D5DD",
            }}
          >
            <option value="" disabled>
              Wybierz medium
            </option>
            <option value="cold_water">Zimna woda</option>
            <option value="hot_water">Ciepła woda</option>
            <option value="electricity">Prąd</option>
            <option value="gas">Gaz</option>
          </select>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="price"
            style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
          >
            Stawka
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.0001"
            placeholder="np. 0.84"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #D0D5DD",
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="effective_from"
            style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
          >
            Obowiązuje od
          </label>
          <input
            id="effective_from"
            name="effective_from"
            type="date"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #D0D5DD",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="submit"
            style={{
              background: "#0B5CAD",
              color: "white",
              border: "none",
              borderRadius: "999px",
              padding: "12px 18px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Zapisz taryfę
          </button>

          <a
            href="/admin/taryfy"
            style={{
              textDecoration: "none",
              border: "1px solid #D0D5DD",
              borderRadius: "999px",
              padding: "12px 18px",
              color: "#344054",
              fontWeight: 600,
            }}
          >
            Anuluj
          </a>
        </div>
      </form>
    </main>
  );
}