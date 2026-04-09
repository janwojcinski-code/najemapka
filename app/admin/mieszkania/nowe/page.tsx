import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

async function createApartment(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const name = String(formData.get("name") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const isActive = formData.get("is_active") === "on";

  if (!name || !address) {
    redirect("/admin/mieszkania/nowe?error=missing_fields");
  }

  const { error } = await supabase.from("apartments").insert({
    name,
    address,
    is_active: isActive,
  });

  if (error) {
    redirect("/admin/mieszkania/nowe?error=save_failed");
  }

  redirect("/admin/mieszkania");
}

export default async function NewApartmentPage({
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
      ? "Uzupełnij nazwę i adres."
      : params.error === "save_failed"
      ? "Nie udało się zapisać mieszkania."
      : null;

  return (
    <main style={{ padding: "2rem", maxWidth: "760px", margin: "0 auto" }}>
      <AdminTopbar />

      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
        Dodaj mieszkanie
      </h1>
      <p style={{ margin: "0 0 24px", color: "#667085" }}>
        Utwórz nowy lokal w systemie.
      </p>

      <form
        action={createApartment}
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
            htmlFor="name"
            style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
          >
            Nazwa mieszkania
          </label>
          <input
            id="name"
            name="name"
            placeholder="np. 12A"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #D0D5DD",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="address"
            style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
          >
            Adres
          </label>
          <input
            id="address"
            name="address"
            placeholder="np. ul. Słoneczna 15, Warszawa"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #D0D5DD",
            }}
          />
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "24px",
          }}
        >
          <input type="checkbox" name="is_active" defaultChecked />
          <span>Aktywne mieszkanie</span>
        </label>

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
            Zapisz mieszkanie
          </button>

          <a
            href="/admin/mieszkania"
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