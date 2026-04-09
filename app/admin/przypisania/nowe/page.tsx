import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";

async function createAssignment(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const apartmentId = Number(formData.get("apartment_id"));
  const tenantUserId = String(formData.get("tenant_user_id") || "");
  const startDate = String(formData.get("start_date") || "");

  if (!apartmentId || !tenantUserId || !startDate) {
    redirect("/admin/przypisania/nowe?error=missing_fields");
  }

  const { error } = await supabase.from("tenant_assignments").insert({
    apartment_id: apartmentId,
    tenant_user_id: tenantUserId,
    start_date: startDate,
    end_date: null,
  });

  if (error) {
    redirect("/admin/przypisania/nowe?error=save_failed");
  }

  redirect("/admin/przypisania");
}

export default async function NewAssignmentPage({
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

  const [{ data: apartments }, { data: tenants }] = await Promise.all([
    supabase
      .from("apartments")
      .select("id, name, address, is_active")
      .eq("is_active", true)
      .order("id", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("role", "tenant")
      .order("email", { ascending: true }),
  ]);

  const params = (await searchParams) || {};
  const error =
    params.error === "missing_fields"
      ? "Uzupełnij wszystkie pola."
      : params.error === "save_failed"
      ? "Nie udało się zapisać przypisania."
      : null;

  return (
    <main style={{ padding: "2rem", maxWidth: "760px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
        Nowe przypisanie
      </h1>
      <p style={{ margin: "0 0 24px", color: "#667085" }}>
        Powiąż najemcę z mieszkaniem.
      </p>

      <form
        action={createAssignment}
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
            htmlFor="apartment_id"
            style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
          >
            Mieszkanie
          </label>
          <select
            id="apartment_id"
            name="apartment_id"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #D0D5DD",
            }}
            defaultValue=""
          >
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

        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="tenant_user_id"
            style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
          >
            Najemca
          </label>
          <select
            id="tenant_user_id"
            name="tenant_user_id"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #D0D5DD",
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Wybierz najemcę
            </option>
            {(tenants ?? []).map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.full_name || tenant.email} — {tenant.email}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="start_date"
            style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
          >
            Data startu
          </label>
          <input
            id="start_date"
            name="start_date"
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
            Zapisz przypisanie
          </button>

          <a
            href="/admin/przypisania"
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