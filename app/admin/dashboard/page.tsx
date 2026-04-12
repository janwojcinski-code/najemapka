import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { getAdminDashboardData } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

export default async function AdminDashboardPage() {
  let profile;
  try {
    profile = await requireAuthenticatedProfile(["admin"]);
  } catch {
    redirect("/logowanie");
  }

  const data = await getAdminDashboardData();
  const supabase = await createClient();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [{ data: advances }, { data: rents }] = await Promise.all([
    supabase
      .from("monthly_advances")
      .select("amount")
      .eq("month", currentMonth)
      .eq("year", currentYear),
    supabase
      .from("monthly_rent")
      .select("amount, status")
      .eq("month", currentMonth)
      .eq("year", currentYear),
  ]);

  const advancesTotal = (advances ?? []).reduce(
    (sum: number, item: any) => sum + Number(item.amount ?? 0),
    0
  );

  const rentTotal = (rents ?? []).reduce(
    (sum: number, item: any) => sum + Number(item.amount ?? 0),
    0
  );

  const paidRentTotal = (rents ?? [])
    .filter((item: any) => item.status === "paid")
    .reduce((sum: number, item: any) => sum + Number(item.amount ?? 0), 0);

  return (
    <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <AdminTopbar />

      <h1 style={{ fontSize: "22px", fontWeight: 500, marginBottom: "8px" }}>
        Panel Admina
      </h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
        Witaj, {profile.full_name || profile.email}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "1.5rem",
        }}
      >
        <StatCard label="Aktywne mieszkania" value={data.apartmentsCount} />
        <StatCard label="Aktywne przypisania" value={data.activeAssignmentsCount} />
        <StatCard label="Braki odczytów" value={data.pendingReadingsCount} accent="danger" />
        <StatCard label="Oczekujące rozliczenia" value={data.pendingSettlementsCount} accent="warning" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
          marginBottom: "2rem",
        }}
      >
        <MoneyCard
          label={`Zaliczki ${currentMonth}/${currentYear}`}
          value={`${advancesTotal.toFixed(2)} zł`}
        />
        <MoneyCard
          label={`Czynsz razem ${currentMonth}/${currentYear}`}
          value={`${rentTotal.toFixed(2)} zł`}
        />
        <MoneyCard
          label={`Czynsz opłacony ${currentMonth}/${currentYear}`}
          value={`${paidRentTotal.toFixed(2)} zł`}
        />
      </div>

      <div style={{ marginBottom: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <a
          href="/admin/mieszkania"
          style={buttonStyle("#0B5CAD")}
        >
          Mieszkania
        </a>

        <a
          href="/admin/przypisania"
          style={buttonStyle("#111827")}
        >
          Przypisania
        </a>

        <a
          href="/admin/rozliczenia"
          style={buttonStyle("#7C3AED")}
        >
          Rozliczenia
        </a>

        <a
          href="/admin/taryfy"
          style={buttonStyle("#059669")}
        >
          Taryfy
        </a>

        <a
          href="/admin/najemcy"
          style={buttonStyle("#EA580C")}
        >
          Najemcy
        </a>

        <a
          href="/admin/odczyty"
          style={buttonStyle("#2563EB")}
        >
          Odczyty
        </a>

        <a
          href="/admin/zaliczki"
          style={buttonStyle("#0F766E")}
        >
          Zaliczki
        </a>

        <a
          href="/admin/czynsz"
          style={buttonStyle("#B45309")}
        >
          Czynsz
        </a>
      </div>

      {data.recentApartments.length > 0 && (
        <section>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 500,
              marginBottom: "12px",
            }}
          >
            Lista mieszkań
          </h2>
          <div
            style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              overflow: "hidden",
            }}
          >
            {data.recentApartments.map((apt, i) => (
              <div
                key={apt.id}
                style={{
                  padding: "12px 16px",
                  borderBottom:
                    i < data.recentApartments.length - 1
                      ? "0.5px solid var(--color-border-tertiary)"
                      : "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: "14px" }}>
                    {apt.name || apt.address}
                  </p>
                  {apt.name && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {apt.address}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "danger" | "warning";
}) {
  const textColor = accent
    ? `var(--color-text-${accent})`
    : "var(--color-text-primary)";

  return (
    <div
      style={{
        background: "var(--color-background-secondary)",
        borderRadius: "var(--border-radius-md)",
        padding: "1rem",
      }}
    >
      <p
        style={{
          fontSize: "13px",
          color: "var(--color-text-secondary)",
          margin: "0 0 4px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "24px",
          fontWeight: 500,
          color: textColor,
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function MoneyCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #E5E7EB",
        borderRadius: "16px",
        padding: "16px",
      }}
    >
      <div style={{ fontSize: "13px", color: "#667085", marginBottom: "6px" }}>
        {label}
      </div>
      <div style={{ fontSize: "24px", fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function buttonStyle(background: string) {
  return {
    display: "inline-block",
    background,
    color: "white",
    textDecoration: "none",
    padding: "12px 18px",
    borderRadius: "999px",
    fontWeight: 600,
  } as const;
}