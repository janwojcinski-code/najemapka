import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

async function markRentPaid(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const rentId = Number(formData.get("rent_id"));
  const tenantId = String(formData.get("tenant_id") || "");

  if (!rentId || !tenantId) {
    redirect("/admin/najemcy");
  }

  const { error } = await supabase
    .from("monthly_rent")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", rentId);

  if (error) {
    redirect(`/admin/najemcy/${tenantId}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/admin/najemcy/${tenantId}`);
}

async function markAdvancePaid(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const advanceId = Number(formData.get("advance_id"));
  const tenantId = String(formData.get("tenant_id") || "");

  if (!advanceId || !tenantId) {
    redirect("/admin/najemcy");
  }

  const { error } = await supabase
    .from("monthly_advances")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", advanceId);

  if (error) {
    redirect(`/admin/najemcy/${tenantId}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/admin/najemcy/${tenantId}`);
}

async function markInvoicePaid(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const invoiceId = Number(formData.get("invoice_id"));
  const tenantId = String(formData.get("tenant_id") || "");

  if (!invoiceId || !tenantId) {
    redirect("/admin/najemcy");
  }

  const { error } = await supabase
    .from("utility_invoices")
    .update({
      status: "paid",
    })
    .eq("id", invoiceId);

  if (error) {
    redirect(`/admin/najemcy/${tenantId}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/admin/najemcy/${tenantId}`);
}

export default async function TenantDetailsPage({
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

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

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

  const [rentRes, advanceRes, invoicesRes] = activeApartment
    ? await Promise.all([
        supabase
          .from("monthly_rent")
          .select("*")
          .eq("apartment_id", activeApartment.id)
          .eq("month", currentMonth)
          .eq("year", currentYear)
          .maybeSingle(),

        supabase
          .from("monthly_advances")
          .select("*")
          .eq("apartment_id", activeApartment.id)
          .eq("month", currentMonth)
          .eq("year", currentYear)
          .maybeSingle(),

        supabase
          .from("utility_invoices")
          .select("*")
          .eq("apartment_id", activeApartment.id)
          .order("year", { ascending: false })
          .order("month", { ascending: false })
          .order("created_at", { ascending: false }),
      ])
    : [{ data: null }, { data: null }, { data: [] }];

  const rent = rentRes.data;
  const advance = advanceRes.data;
  const invoices = invoicesRes.data ?? [];

  const paramsError = (await searchParams) || {};
  const error = paramsError.error || null;

  return (
    <main style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <AdminTopbar />

      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/admin/najemcy"
          style={{ textDecoration: "none", color: "#0B5CAD", fontWeight: 600 }}
        >
          ← Wróć do najemców
        </Link>

        <Link
          href={`/admin/najemcy/${tenant.id}/edytuj`}
          style={{
            textDecoration: "none",
            color: "white",
            background: "#0B5CAD",
            padding: "10px 14px",
            borderRadius: "999px",
            fontWeight: 600,
          }}
        >
          Edytuj najemcę
        </Link>
      </div>

      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
        {tenant.full_name || tenant.email}
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <FinanceCard
          title={`Czynsz ${currentMonth}/${currentYear}`}
          value={`${Number(rent?.amount ?? 0).toFixed(2)} zł`}
          status={rent?.status === "paid" ? "Opłacony" : rent ? "Nieopłacony" : "Brak danych"}
          statusColor={rent?.status === "paid" ? "#166534" : rent ? "#B91C1C" : "#667085"}
          statusBg={rent?.status === "paid" ? "#DCFCE7" : rent ? "#FEF2F2" : "#F3F4F6"}
          action={
            rent && rent.status !== "paid" ? (
              <form action={markRentPaid}>
                <input type="hidden" name="rent_id" value={rent.id} />
                <input type="hidden" name="tenant_id" value={tenant.id} />
                <button style={buttonStyleDark} type="submit">
                  Oznacz jako opłacony
                </button>
              </form>
            ) : null
          }
        />

        <FinanceCard
          title={`Zaliczka ${currentMonth}/${currentYear}`}
          value={`${Number(advance?.amount ?? 0).toFixed(2)} zł`}
          status={
            advance?.status === "paid" ? "Wpłacona" : advance ? "Niewpłacona" : "Brak danych"
          }
          statusColor={advance?.status === "paid" ? "#166534" : advance ? "#B91C1C" : "#667085"}
          statusBg={advance?.status === "paid" ? "#DCFCE7" : advance ? "#FEF2F2" : "#F3F4F6"}
          action={
            advance && advance.status !== "paid" ? (
              <form action={markAdvancePaid}>
                <input type="hidden" name="advance_id" value={advance.id} />
                <input type="hidden" name="tenant_id" value={tenant.id} />
                <button style={buttonStyleDark} type="submit">
                  Oznacz jako wpłaconą
                </button>
              </form>
            ) : null
          }
        />
      </div>

      <section
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>Historia płatności i faktur</h2>

        {invoices.length === 0 ? (
          <div style={{ color: "#667085" }}>Brak faktur.</div>
        ) : (
          invoices.map((invoice: any) => (
            <div
              key={invoice.id}
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
                  {invoice.utility_type} — {Number(invoice.amount ?? 0).toFixed(2)} zł
                </div>
                <div style={{ fontSize: "13px", color: "#667085" }}>
                  {invoice.month}/{invoice.year} • termin: {invoice.due_date || "—"}
                </div>
                {invoice.note ? (
                  <div style={{ fontSize: "13px", color: "#667085", marginTop: "4px" }}>
                    {invoice.note}
                  </div>
                ) : null}
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ marginBottom: "8px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      background: invoice.status === "paid" ? "#DCFCE7" : "#FEF2F2",
                      color: invoice.status === "paid" ? "#166534" : "#B91C1C",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {invoice.status === "paid" ? "Opłacona" : "Nieopłacona"}
                  </span>
                </div>

                {invoice.status !== "paid" ? (
                  <form action={markInvoicePaid}>
                    <input type="hidden" name="invoice_id" value={invoice.id} />
                    <input type="hidden" name="tenant_id" value={tenant.id} />
                    <button style={buttonStyleDark} type="submit">
                      Oznacz jako opłaconą
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          ))
        )}
      </section>

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

function FinanceCard({
  title,
  value,
  status,
  statusColor,
  statusBg,
  action,
}: {
  title: string;
  value: string;
  status: string;
  statusColor: string;
  statusBg: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #E5E7EB",
        borderRadius: "20px",
        padding: "20px",
      }}
    >
      <div style={{ fontSize: "13px", color: "#667085", marginBottom: "8px" }}>
        {title}
      </div>
      <div style={{ fontSize: "30px", fontWeight: 800, marginBottom: "12px" }}>
        {value}
      </div>
      <div style={{ marginBottom: "12px" }}>
        <span
          style={{
            display: "inline-block",
            padding: "6px 10px",
            borderRadius: "999px",
            background: statusBg,
            color: statusColor,
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          {status}
        </span>
      </div>
      {action}
    </div>
  );
}

const buttonStyleDark: React.CSSProperties = {
  background: "#111827",
  color: "white",
  border: "none",
  borderRadius: "999px",
  padding: "10px 14px",
  fontWeight: 600,
  cursor: "pointer",
};