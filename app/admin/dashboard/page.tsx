import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

function formatMoney(value: number) {
  return value.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function AdminDashboardPage() {
  try {
    await requireAuthenticatedProfile(["admin"]);
  } catch {
    redirect("/logowanie");
  }

  const supabase = await createClient();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const dueDate = new Date(year, month - 1, 10);
  const today = new Date();
  const overdueDays = Math.max(
    Math.ceil(
      (today.setHours(0, 0, 0, 0) - dueDate.setHours(0, 0, 0, 0)) /
        (1000 * 60 * 60 * 24)
    ),
    0
  );

  const [
    assignmentsRes,
    rentsRes,
    advancesRes,
    invoicesRes,
    apartmentsRes,
    profilesRes,
  ] = await Promise.all([
    supabase
      .from("tenant_assignments")
      .select("id, tenant_user_id, apartment_id, start_date, end_date")
      .is("end_date", null),

    supabase
      .from("monthly_rent")
      .select("*")
      .eq("month", month)
      .eq("year", year),

    supabase
      .from("monthly_advances")
      .select("*")
      .eq("month", month)
      .eq("year", year),

    supabase
      .from("utility_invoices")
      .select("*")
      .eq("month", month)
      .eq("year", year),

    supabase.from("apartments").select("id, name, address"),
    supabase.from("profiles").select("id, full_name, email, role"),
  ]);

  const assignments = assignmentsRes.data ?? [];
  const rents = rentsRes.data ?? [];
  const advances = advancesRes.data ?? [];
  const invoices = invoicesRes.data ?? [];
  const apartments = apartmentsRes.data ?? [];
  const profiles = profilesRes.data ?? [];

  const dashboardItems = assignments.map((assignment: any) => {
    const tenant = profiles.find((p: any) => p.id === assignment.tenant_user_id);
    const apartment = apartments.find((a: any) => a.id === assignment.apartment_id);

    const rent = rents.find((r: any) => r.apartment_id === assignment.apartment_id);
    const advance = advances.find((a: any) => a.apartment_id === assignment.apartment_id);
    const apartmentInvoices = invoices.filter(
      (i: any) => i.apartment_id === assignment.apartment_id
    );

    const rentAmount = Number(rent?.amount ?? 0);
    const advanceAmount = Number(advance?.amount ?? 0);

    const unpaidInvoices = apartmentInvoices.filter((i: any) => i.status !== "paid");
    const invoicesSum = unpaidInvoices.reduce(
      (sum: number, i: any) => sum + Number(i.amount ?? 0),
      0
    );

    const rentDue = rent?.status === "paid" ? 0 : rentAmount;
    const advanceCredit = advance?.status === "paid" ? advanceAmount : 0;

    const totalDue = Math.max(rentDue + invoicesSum - advanceCredit, 0);

    return {
      tenantId: tenant?.id,
      tenantName: tenant?.full_name || tenant?.email || "Nieznany najemca",
      tenantEmail: tenant?.email || "",
      apartmentId: apartment?.id,
      apartmentName: apartment?.name || `Mieszkanie ${assignment.apartment_id}`,
      apartmentAddress: apartment?.address || "—",
      rentAmount,
      rentStatus: rent?.status || "brak",
      advanceAmount,
      advanceStatus: advance?.status || "brak",
      invoicesSum,
      invoicesCount: unpaidInvoices.length,
      totalDue,
    };
  });

  const overdueItems = dashboardItems.filter((item) => item.totalDue > 0);

  const totalDueAll = overdueItems.reduce((sum, item) => sum + item.totalDue, 0);
  const totalPaidRent = rents
    .filter((r: any) => r.status === "paid")
    .reduce((sum: number, r: any) => sum + Number(r.amount ?? 0), 0);

  const totalPaidAdvances = advances
    .filter((a: any) => a.status === "paid")
    .reduce((sum: number, a: any) => sum + Number(a.amount ?? 0), 0);

  return (
    <main style={{ padding: "2rem", maxWidth: "1180px", margin: "0 auto" }}>
      <AdminTopbar />

      <div style={{ marginBottom: "24px" }}>
        <div style={{ color: "#667085", fontSize: "14px", marginBottom: "8px" }}>
          Panel administratora
        </div>
        <h1 style={{ fontSize: "40px", fontWeight: 800, margin: 0 }}>
          Zaległości i płatności
        </h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <StatCard
          title="Łączna zaległość"
          value={`${formatMoney(totalDueAll)} zł`}
          subtitle="Suma bieżących należności"
          accent="#B91C1C"
          bg="#FEF2F2"
        />
        <StatCard
          title={`Wpłacony czynsz ${month}/${year}`}
          value={`${formatMoney(totalPaidRent)} zł`}
          subtitle="Tylko pozycje oznaczone jako opłacone"
          accent="#166534"
          bg="#F0FDF4"
        />
        <StatCard
          title={`Wpłacone zaliczki ${month}/${year}`}
          value={`${formatMoney(totalPaidAdvances)} zł`}
          subtitle="Zaliczone wpłaty na media"
          accent="#0F766E"
          bg="#F0FDFA"
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <QuickLink href="/admin/faktury" label="Dodaj fakturę" />
        <QuickLink href="/admin/czynsz" label="Księguj czynsz" />
        <QuickLink href="/admin/zaliczki" label="Księguj zaliczki" />
        <QuickLink href="/admin/najemcy" label="Najemcy" />
      </div>

      <section
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "20px 20px 12px" }}>
          <h2 style={{ fontSize: "22px", margin: 0 }}>Kto nie zapłacił</h2>
          <p style={{ margin: "8px 0 0", color: "#667085" }}>
            Termin płatności do 10. dnia miesiąca.
            {overdueDays > 0 ? ` Dziś: ${overdueDays} dni po terminie.` : " Dziś: jeszcze w terminie."}
          </p>
        </div>

        {overdueItems.length === 0 ? (
          <div style={{ padding: "20px", color: "#166534", fontWeight: 700 }}>
            Wszystko opłacone ✅
          </div>
        ) : (
          overdueItems.map((item) => (
            <div
              key={`${item.tenantId}-${item.apartmentId}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 140px",
                gap: "16px",
                alignItems: "center",
                padding: "16px 20px",
                borderTop: "1px solid #F1F5F9",
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>{item.tenantName}</div>
                <div style={{ fontSize: "13px", color: "#667085" }}>{item.tenantEmail}</div>
              </div>

              <div>
                <div style={{ fontWeight: 600 }}>{item.apartmentName}</div>
                <div style={{ fontSize: "13px", color: "#667085" }}>
                  {item.apartmentAddress}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "13px", color: "#667085" }}>Do zapłaty</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#B91C1C" }}>
                  {formatMoney(item.totalDue)} zł
                </div>
              </div>

              <div>
                <div style={{ fontSize: "13px", color: "#667085" }}>Składniki</div>
                <div style={{ fontSize: "14px" }}>
                  Czynsz: {formatMoney(item.rentAmount)} zł
                </div>
                <div style={{ fontSize: "14px" }}>
                  Faktury: {formatMoney(item.invoicesSum)} zł
                </div>
                <div style={{ fontSize: "14px" }}>
                  Zaliczka: -{formatMoney(item.advanceAmount)} zł
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <Link
                  href={`/admin/najemcy/${item.tenantId}`}
                  style={{
                    textDecoration: "none",
                    display: "inline-block",
                    background: "#0B5CAD",
                    color: "white",
                    padding: "10px 14px",
                    borderRadius: "999px",
                    fontWeight: 700,
                  }}
                >
                  Szczegóły
                </Link>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  accent,
  bg,
}: {
  title: string;
  value: string;
  subtitle: string;
  accent: string;
  bg: string;
}) {
  return (
    <div
      style={{
        background: bg,
        border: "1px solid #E5E7EB",
        borderRadius: "20px",
        padding: "20px",
      }}
    >
      <div style={{ fontSize: "14px", color: "#667085", marginBottom: "8px" }}>
        {title}
      </div>
      <div style={{ fontSize: "32px", fontWeight: 800, color: accent, marginBottom: "8px" }}>
        {value}
      </div>
      <div style={{ fontSize: "14px", color: "#667085" }}>{subtitle}</div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        display: "inline-block",
        background: "white",
        color: "#111827",
        padding: "12px 16px",
        borderRadius: "999px",
        border: "1px solid #E5E7EB",
        fontWeight: 700,
      }}
    >
      {label}
    </Link>
  );
}