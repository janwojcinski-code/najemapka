import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

async function updateTenant(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const tenantId = String(formData.get("tenant_id") || "");
  const fullName = String(formData.get("full_name") || "").trim();
  const apartmentIdRaw = String(formData.get("apartment_id") || "").trim();
  const startDate = String(formData.get("start_date") || "").trim();

  if (!tenantId || !fullName) {
    redirect(`/admin/najemcy/${tenantId}/edytuj?error=Uzupełnij imię i nazwisko`);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", tenantId);

  if (profileError) {
    redirect(`/admin/najemcy/${tenantId}/edytuj?error=${encodeURIComponent(profileError.message)}`);
  }

  if (apartmentIdRaw && startDate) {
    const apartmentId = Number(apartmentIdRaw);

    const { data: currentAssignment } = await supabase
      .from("tenant_assignments")
      .select("id, apartment_id, start_date, end_date")
      .eq("tenant_user_id", tenantId)
      .is("end_date", null)
      .maybeSingle();

    if (!currentAssignment || currentAssignment.apartment_id !== apartmentId) {
      if (currentAssignment) {
        const { error: closeError } = await supabase
          .from("tenant_assignments")
          .update({ end_date: startDate })
          .eq("id", currentAssignment.id);

        if (closeError) {
          redirect(`/admin/najemcy/${tenantId}/edytuj?error=${encodeURIComponent(closeError.message)}`);
        }
      }

      const { error: newAssignmentError } = await supabase
        .from("tenant_assignments")
        .insert({
          tenant_user_id: tenantId,
          apartment_id: apartmentId,
          start_date: startDate,
        });

      if (newAssignmentError) {
        redirect(`/admin/najemcy/${tenantId}/edytuj?error=${encodeURIComponent(newAssignmentError.message)}`);
      }
    }
  }

  redirect(`/admin/najemcy/${tenantId}`);
}

async function endTenantAssignment(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const tenantId = String(formData.get("tenant_id") || "");
  const assignmentId = Number(formData.get("assignment_id"));
  const endDate = String(formData.get("end_date") || "").trim();

  if (!tenantId || !assignmentId || !endDate) {
    redirect(`/admin/najemcy/${tenantId}/edytuj?error=Podaj datę zakończenia przypisania`);
  }

  const { error } = await supabase
    .from("tenant_assignments")
    .update({ end_date: endDate })
    .eq("id", assignmentId);

  if (error) {
    redirect(`/admin/najemcy/${tenantId}/edytuj?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/admin/najemcy/${tenantId}/edytuj`);
}

export default async function EditTenantPage({
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

  const [{ data: tenant }, { data: apartments }, { data: assignments }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase
      .from("apartments")
      .select("id, name, address, is_active")
      .eq("is_active", true)
      .order("id", { ascending: false }),
    supabase
      .from("tenant_assignments")
      .select(
        `
        id,
        apartment_id,
        start_date,
        end_date,
        apartments (
          id,
          name,
          address
        )
      `
      )
      .eq("tenant_user_id", id)
      .order("start_date", { ascending: false }),
  ]);

  if (!tenant) {
    redirect("/admin/najemcy");
  }

  const activeAssignment = (assignments ?? []).find((a: any) => !a.end_date);
  const paramsError = (await searchParams) || {};
  const error = paramsError.error || null;

  return (
    <main style={{ padding: "2rem", maxWidth: "950px", margin: "0 auto" }}>
      <AdminTopbar />

      <div style={{ marginBottom: "16px" }}>
        <Link
          href="/admin/najemcy"
          style={{ textDecoration: "none", color: "#0B5CAD", fontWeight: 600 }}
        >
          ← Wróć do najemców
        </Link>
      </div>

      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
        Edytuj najemcę
      </h1>
      <p style={{ margin: "0 0 24px", color: "#667085" }}>{tenant.email}</p>

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

      <form
        action={updateTenant}
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <input type="hidden" name="tenant_id" value={tenant.id} />

        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="full_name" style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
            Imię i nazwisko
          </label>
          <input
            id="full_name"
            name="full_name"
            defaultValue={tenant.full_name ?? ""}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #D0D5DD",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <div>
            <label htmlFor="apartment_id" style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
              Aktywne mieszkanie
            </label>
            <select
              id="apartment_id"
              name="apartment_id"
              defaultValue={activeAssignment?.apartment_id ?? ""}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #D0D5DD",
              }}
            >
              <option value="">Brak przypisania</option>
              {(apartments ?? []).map((apartment) => (
                <option key={apartment.id} value={apartment.id}>
                  {apartment.name || `Mieszkanie ${apartment.id}`} — {apartment.address}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="start_date" style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
              Data rozpoczęcia umowy
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              defaultValue={activeAssignment?.start_date ?? new Date().toISOString().slice(0, 10)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #D0D5DD",
              }}
            />
          </div>
        </div>

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
      </form>

      <section
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          padding: "20px",
        }}
      >
        <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>Historia przypisań</h2>

        {(assignments ?? []).length === 0 ? (
          <div style={{ color: "#667085" }}>Brak przypisań.</div>
        ) : (
          assignments?.map((a: any) => {
            const apartment = Array.isArray(a.apartments)
              ? a.apartments[0]
              : a.apartments;

            return (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid #F1F5F9",
                  gap: "16px",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {apartment?.name || "—"} — {apartment?.address || "—"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#667085" }}>
                    {a.start_date} → {a.end_date || "teraz"}
                  </div>
                </div>

                {!a.end_date && (
                  <form action={endTenantAssignment} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input type="hidden" name="tenant_id" value={tenant.id} />
                    <input type="hidden" name="assignment_id" value={a.id} />
                    <input
                      name="end_date"
                      type="date"
                      defaultValue={new Date().toISOString().slice(0, 10)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "1px solid #D0D5DD",
                      }}
                    />
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
                      Zakończ
                    </button>
                  </form>
                )}
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}