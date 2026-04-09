import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";

async function endAssignment(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const id = Number(formData.get("id"));
  if (!id) {
    redirect("/admin/przypisania");
  }

  const today = new Date().toISOString().slice(0, 10);

  const { error } = await supabase
    .from("tenant_assignments")
    .update({ end_date: today })
    .eq("id", id)
    .is("end_date", null);

  if (error) {
    redirect("/admin/przypisania?error=end_failed");
  }

  redirect("/admin/przypisania");
}

export default async function AdminAssignmentsPage({
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

  const { data: assignments } = await supabase
    .from("tenant_assignments")
    .select(
      `
      id,
      start_date,
      end_date,
      apartment_id,
      tenant_user_id,
      apartments (
        id,
        name,
        address
      ),
      profiles (
        id,
        email,
        full_name
      )
    `
    )
    .order("id", { ascending: false });

  const params = (await searchParams) || {};
  const error =
    params.error === "end_failed"
      ? "Nie udało się zakończyć przypisania."
      : null;

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
            Przypisania najemców
          </h1>
          <p style={{ margin: 0, color: "#667085" }}>
            Powiąż użytkowników z mieszkaniami.
          </p>
        </div>

        <Link
          href="/admin/przypisania/nowe"
          style={{
            background: "#0B5CAD",
            color: "white",
            textDecoration: "none",
            padding: "12px 18px",
            borderRadius: "999px",
            fontWeight: 600,
          }}
        >
          + Nowe przypisanie
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
            gridTemplateColumns: "80px 1.4fr 1.4fr 120px 120px 180px",
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
          <div>Najemca</div>
          <div>Start</div>
          <div>Status</div>
          <div>Akcja</div>
        </div>

        {(assignments ?? []).length === 0 ? (
          <div style={{ padding: "24px 20px", color: "#667085" }}>
            Brak przypisań.
          </div>
        ) : (
          assignments?.map((assignment) => {
            const apartment = Array.isArray(assignment.apartments)
              ? assignment.apartments[0]
              : assignment.apartments;

            const tenant = Array.isArray(assignment.profiles)
              ? assignment.profiles[0]
              : assignment.profiles;

            const active = !assignment.end_date;

            return (
              <div
                key={assignment.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1.4fr 1.4fr 120px 120px 180px",
                  gap: "16px",
                  padding: "16px 20px",
                  borderBottom: "1px solid #F1F5F9",
                  alignItems: "center",
                }}
              >
                <div style={{ fontWeight: 600 }}>{assignment.id}</div>

                <div>
                  <div style={{ fontWeight: 600 }}>{apartment?.name || "—"}</div>
                  <div style={{ fontSize: "13px", color: "#667085" }}>
                    {apartment?.address || "—"}
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 600 }}>
                    {tenant?.full_name || tenant?.email || "—"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#667085" }}>
                    {tenant?.email || "—"}
                  </div>
                </div>

                <div>{assignment.start_date}</div>

                <div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      background: active ? "#DCFCE7" : "#F3F4F6",
                      color: active ? "#166534" : "#6B7280",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {active ? "Aktywne" : "Zakończone"}
                  </span>
                </div>

                <div>
                  {active ? (
                    <form action={endAssignment}>
                      <input type="hidden" name="id" value={assignment.id} />
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
                        Zakończ przypisanie
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