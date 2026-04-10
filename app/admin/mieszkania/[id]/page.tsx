import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

async function updateApartment(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const id = Number(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const isActive = formData.get("is_active") === "on";

  if (!id || !name || !address) {
    redirect(`/admin/mieszkania/${id}?error=missing_fields`);
  }

  const { error } = await supabase
    .from("apartments")
    .update({
      name,
      address,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/mieszkania/${id}?error=save_failed`);
  }

  redirect("/admin/mieszkania");
}

export default async function ApartmentEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  try {
    await requireAuthenticatedProfile(["admin"]);
  } catch {
    redirect("/logowanie");
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: apartment } = await supabase
    .from("apartments")
    .select("id, name, address, is_active")
    .eq("id", Number(id))
    .single();

  if (!apartment) {
    redirect("/admin/mieszkania");
  }

  const paramsError = (await searchParams) || {};
  const error =
    paramsError.error === "missing_fields"
      ? "Uzupełnij nazwę i adres."
      : paramsError.error === "save_failed"
      ? "Nie udało się zapisać zmian."
      : null;

  return (
    <main style={{ padding: "2rem", maxWidth: "760px", margin: "0 auto" }}>
      <AdminTopbar />

      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
        Edytuj mieszkanie
      </h1>
      <p style={{ margin: "0 0 24px", color: "#667085" }}>
        Zmień dane mieszkania #{apartment.id}
      </p>

      <form
        action={updateApartment}
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          padding: "24px",
        }}
      >
        <input type="hidden" name="id" value={apartment.id} />

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
          <label htmlFor="name" style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
            Nazwa mieszkania
          </label>
          <input
            id="name"
            name="name"
            defaultValue={apartment.name ?? ""}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #D0D5DD",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="address" style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
            Adres
          </label>
          <input
            id="address"
            name="address"
            defaultValue={apartment.address ?? ""}
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
          <input type="checkbox" name="is_active" defaultChecked={!!apartment.is_active} />
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
            Zapisz zmiany
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