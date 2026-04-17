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

export default async function ZaleglosciPage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string; year?: string }>;
}) {
  try {
    await requireAuthenticatedProfile(["admin"]);
  } catch {
    redirect("/logowanie");
  }

  const params = (await searchParams) || {};
  const now = new Date();

  const selectedMonth = Number(params.month || now.getMonth() + 1);
  const selectedYear = Number(params.year || now.getFullYear());

  const supabase = await createClient();

  const [
    assignmentsRes,
    rentsRes,
    advancesRes,
    invoicesRes,
    profilesRes,
    apartmentsRes,
  ] = await Promise.all([
    supabase
      .from("tenant_assignments")
      .select("id, tenant_user_id, apartment_id, start_date, end_date")
      .is("end_date", null),

    supabase
      .from("monthly_rent")
      .select("*")
      .eq("month", selectedMonth)
      .eq("year", selectedYear),

    supabase
      .from("monthly_advances")
      .select("*")
      .eq("month", selectedMonth)
      .eq("year", selectedYear),

    supabase
      .from("utility_invoices")
      .select("*")
      .eq("month", selectedMonth)
      .eq("year", selectedYear),

    supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("role", "tenant"),

    supabase
      .from("apartments")
      .select("id, name, address"),
  ]);

  const assignments = assignmentsRes.data ?? [];
  const rents = rentsRes.data ?? [];
  const advances = advancesRes.data ?? [];
  const invoices = invoicesRes.data ?? [];
  const profiles = profilesRes.data ?? [];
  const apartments = apartmentsRes.data ?? [];

  const dueDate = new Date(selectedYear, selectedMonth - 1, 10);
  const today = new Date();

  const overdueDays = Math.max(
    Math.ceil(
      (new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() -
        new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime()) /
        (1000 * 60 * 60 * 24)
    ),
    0
  );

  const rows = assignments.map((assignment: any) => {
    const tenant = profiles.find((p: any) => p.id === assignment.tenant_user_id);
    const apartment = apartments.find((a: any) => a.id === assignment.apartment_id);

    const rent = rents.find((r: any) => r.apartment_id === assignment.apartment_id);
    const advance = advances.find((a: any) => a.apartment_id === assignment.apartment_id);
    const apartmentInvoices = invoices.filter(
      (i: any) => i.apartment_id === assignment.apartment_id
    );

    const rentAmount = Number(rent?.amount ?? 0);
    const rentDue = rent?.status === "paid" ? 0 : rentAmount;

    const advanceAmount = Number(advance?.amount ?? 0);
    const advanceCredit = advance?.status === "paid" ? advanceAmount : 0;

    const unpaidInvoices = apartmentInvoices.filter((i: any) => i.status !== "paid");
    const invoicesSum = unpaidInvoices.reduce(
      (sum: number, i: any) => sum + Number(i.amount ?? 0),
      0
    );

    const totalDue = Math.max(rentDue + invoicesSum - advanceCredit, 0);

    return {
      tenantId: tenant?.id || "",
      tenantName: tenant?.full_name || tenant?.email || "Nieznany najemca",
      tenantEmail: tenant?.email || "",
      apartmentId: apartment?.id || null,
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

  const overdueRows = rows
    .filter((row) => row.totalDue > 0)
    .sort((a, b) => b.totalDue - a.totalDue);

  const totalDueAll = overdueRows.reduce((sum, row) => sum + row.totalDue, 0);

  return (
    <main style={{ padding: "2rem", maxWidth: "1180px", margin: "0 auto" }}>
      <AdminTopbar />

      <div style={{ marginBottom: "24px" }}>
        <div style={{ color: "#667085", fontSize: "14px", marginBottom: "8px" }}>
          Panel administratora
        </div>
        <h1 style={{ fontSize: "40px", fontWeight: 800, margin: 0 }}>
          Zaległości
        </h1>
      </div>

      <form
        method="GET"
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "end",
          marginBottom: "24px",
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          padding: "20px",
        }}
      >
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
            defaultValue={selectedMonth}
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
            defaultValue={selectedYear}
            style={inputStyle}
          />
        </div>

        <button type="submit" style={primaryButtonStyle}>
          Filtruj
        </button>
      </form>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <StatCard
          title="Łączna zaległość"
          value={`${formatMoney(totalDueAll)} zł`}
          subtitle="Suma wszystkich bieżących zaległości"
          accent="#B91C1C"
          bg="#FEF2F2"
        />
        <StatCard
          title="Liczba zalegających najemców"
          value={`${overdueRows.length}`}
          subtitle={
            overdueDays > 0
              ? `${overdueDays} dni po terminie`
              : "Jeszcze w terminie"
          }
          accent="#0B5CAD"
          bg="#EFF6FF"
        />
      </div>

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
            gridTemplateColumns: "1.4fr 1.4fr 1fr 1fr 140px",
            gap: "16px",
            padding: "16px 20px",
            borderBottom: "1px solid #E5E7EB",
            fontSize: "13px",
            color: "#667085",
            fontWeight: 700,
          }}
        >
          <div>Najemca</div>
          <div>Mieszkanie</div>
          <div>Składniki</div>
          <div>Do zapłaty</div>
          <div>Akcja</div>
        </div>

        {overdueRows.length === 0 ? (
          <div style={{ padding: "24px 20px", color: "#166534", fontWeight: 700 }}>
            Brak zaległości ✅
          </div>
        ) : (
          overdueRows.map((row) => (
            <div
              key={`${row.tenantId}-${row.apartmentId}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 1.4fr 1fr 1fr 140px",
                gap: "16px",
                alignItems: "center",
                padding: "16px 20px",
                borderTop: "1px solid #F1F5F9",
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>{row.tenantName}</div>
                <div style={{ fontSize: "13px", color: "#667085" }}>{row.tenantEmail}</div>
              </div>

              <div>
                <div style={{ fontWeight: 600 }}>{row.apartmentName}</div>
                <div style={{ fontSize: "13px", color: "#667085" }}>
                  {row.apartmentAddress}
                </div>
              </div>

              <div style={{ fontSize: "14px", color: "#475467" }}>
                <div>Czynsz: {formatMoney(row.rentAmount)} zł</div>
                <div>Faktury: {formatMoney(row.invoicesSum)} zł</div>
                <div>Zaliczka: -{formatMoney(row.advanceAmount)} zł</div>
              </div>

              <div>
                <div style={{ fontSize: "13px", color: "#667085" }}>Saldo</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#B91C1C" }}>
                  {formatMoney(row.totalDue)} zł
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <Link
                  href={`/admin/najemcy/${row.tenantId}`}
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