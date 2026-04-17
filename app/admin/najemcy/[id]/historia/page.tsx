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

export default async function HistoriaPage({
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

  const [tenantRes, assignmentsRes, rentsRes, advancesRes, invoicesRes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).single(),
      supabase.from("tenant_assignments").select("*").eq("tenant_user_id", id),
      supabase.from("monthly_rent").select("*"),
      supabase.from("monthly_advances").select("*"),
      supabase.from("utility_invoices").select("*"),
    ]);

  const tenant = tenantRes.data;
  const assignments = assignmentsRes.data ?? [];
  const rents = rentsRes.data ?? [];
  const advances = advancesRes.data ?? [];
  const invoices = invoicesRes.data ?? [];

  if (!tenant) {
    redirect("/admin/najemcy");
  }

  const apartmentIds = assignments.map((a: any) => a.apartment_id);

  const monthsMap: Record<
    string,
    {
      rent: number;
      advance: number;
      invoices: number;
      rentStatus: string[];
      advanceStatus: string[];
      invoiceStatuses: string[];
    }
  > = {};

  rents.forEach((r: any) => {
    if (!apartmentIds.includes(r.apartment_id)) return;

    const key = `${r.year}-${String(r.month).padStart(2, "0")}`;
    if (!monthsMap[key]) {
      monthsMap[key] = {
        rent: 0,
        advance: 0,
        invoices: 0,
        rentStatus: [],
        advanceStatus: [],
        invoiceStatuses: [],
      };
    }

    monthsMap[key].rent += Number(r.amount ?? 0);
    monthsMap[key].rentStatus.push(r.status || "unpaid");
  });

  advances.forEach((a: any) => {
    if (!apartmentIds.includes(a.apartment_id)) return;

    const key = `${a.year}-${String(a.month).padStart(2, "0")}`;
    if (!monthsMap[key]) {
      monthsMap[key] = {
        rent: 0,
        advance: 0,
        invoices: 0,
        rentStatus: [],
        advanceStatus: [],
        invoiceStatuses: [],
      };
    }

    monthsMap[key].advance += Number(a.amount ?? 0);
    monthsMap[key].advanceStatus.push(a.status || "unpaid");
  });

  invoices.forEach((i: any) => {
    if (!apartmentIds.includes(i.apartment_id)) return;

    const key = `${i.year}-${String(i.month).padStart(2, "0")}`;
    if (!monthsMap[key]) {
      monthsMap[key] = {
        rent: 0,
        advance: 0,
        invoices: 0,
        rentStatus: [],
        advanceStatus: [],
        invoiceStatuses: [],
      };
    }

    monthsMap[key].invoices += Number(i.amount ?? 0);
    monthsMap[key].invoiceStatuses.push(i.status || "unpaid");
  });

  const rows = Object.entries(monthsMap)
    .map(([key, value]) => {
      const total = Math.max(value.rent + value.invoices - value.advance, 0);

      return {
        key,
        rent: value.rent,
        advance: value.advance,
        invoices: value.invoices,
        total,
        rentPaid: value.rentStatus.every((s) => s === "paid"),
        advancePaid: value.advanceStatus.length > 0 && value.advanceStatus.every((s) => s === "paid"),
        invoicesPaid:
          value.invoiceStatuses.length === 0 ||
          value.invoiceStatuses.every((s) => s === "paid"),
      };
    })
    .sort((a, b) => (a.key < b.key ? 1 : -1));

  return (
    <main style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto" }}>
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
          href={`/admin/najemcy/${tenant.id}`}
          style={{ textDecoration: "none", color: "#0B5CAD", fontWeight: 700 }}
        >
          ← Wróć do szczegółów najemcy
        </Link>
      </div>

      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>
        Historia miesięczna
      </h1>
      <p style={{ margin: "0 0 24px", color: "#667085" }}>
        {tenant.full_name || tenant.email}
      </p>

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
            gridTemplateColumns: "160px 150px 150px 150px 150px 1fr",
            gap: "16px",
            padding: "16px 20px",
            borderBottom: "1px solid #E5E7EB",
            fontSize: "13px",
            color: "#667085",
            fontWeight: 700,
          }}
        >
          <div>Miesiąc</div>
          <div>Czynsz</div>
          <div>Zaliczka</div>
          <div>Faktury</div>
          <div>Saldo</div>
          <div>Statusy</div>
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: "24px 20px", color: "#667085" }}>
            Brak historii.
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row.key}
              style={{
                display: "grid",
                gridTemplateColumns: "160px 150px 150px 150px 150px 1fr",
                gap: "16px",
                padding: "16px 20px",
                borderTop: "1px solid #F1F5F9",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 700 }}>{row.key}</div>
              <div>{formatMoney(row.rent)} zł</div>
              <div>-{formatMoney(row.advance)} zł</div>
              <div>{formatMoney(row.invoices)} zł</div>
              <div style={{ fontWeight: 800 }}>{formatMoney(row.total)} zł</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <StatusChip
                  label={row.rentPaid ? "Czynsz OK" : "Czynsz unpaid"}
                  ok={row.rentPaid}
                />
                <StatusChip
                  label={row.advancePaid ? "Zaliczka OK" : "Zaliczka unpaid"}
                  ok={row.advancePaid}
                />
                <StatusChip
                  label={row.invoicesPaid ? "Faktury OK" : "Faktury unpaid"}
                  ok={row.invoicesPaid}
                />
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

function StatusChip({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: "999px",
        background: ok ? "#DCFCE7" : "#FEF2F2",
        color: ok ? "#166534" : "#B91C1C",
        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}