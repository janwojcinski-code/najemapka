import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

export default async function TenantDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    await requireAuthenticatedProfile(["admin"]);
  } catch {
    redirect("/logowanie");
  }

  const { id } = await params;
  const supabase = await createClient();

  const [{ data: tenant }, { data: assignments }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
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
  const activeApartment = activeAssignment
    ? Array.isArray(activeAssignment.apartments)
      ? activeAssignment.apartments[0]
      : activeAssignment.apartments
    : null;

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
        {tenant.full_name || tenant.email}
      </h1>
      <p style={{ margin: "0 0 24px", color: "#667085" }}>{tenant.email}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <InfoCard title="Rola" value={tenant.role || "tenant"} />
        <InfoCard
          title="Aktywne mieszkanie"
          value={
            activeApartment
              ? `${activeApartment.name || "—"} — ${activeApartment.address || "—"}`
              : "Brak przypisania"
          }
          link={activeApartment ? `/admin/mieszkania/${activeApartment.id}/details` : undefined}
        />
      </div>

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
                <div>
                  {apartment?.id ? (
                    <Link
                      href={`/admin/mieszkania/${apartment.id}/details`}
                      style={{ textDecoration: "none", color: "#0B5CAD", fontWeight: 600 }}
                    >
                      Zobacz mieszkanie
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}

function InfoCard({
  title,
  value,
  link,
}: {
  title: string;
  value: string;
  link?: string;
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #E5E7EB",
        borderRadius: "18px",
        padding: "20px",
      }}
    >
      <div style={{ fontSize: "12px", color: "#667085", marginBottom: "8px" }}>
        {title}
      </div>
      {link ? (
        <Link href={link} style={{ textDecoration: "none", color: "#0B5CAD", fontWeight: 700 }}>
          {value}
        </Link>
      ) : (
        <div style={{ fontWeight: 700 }}>{value}</div>
      )}
    </div>
  );
}