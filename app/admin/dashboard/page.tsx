import Link from "next/link";
import { getAdminDashboardData, requireAuthenticatedProfile } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const profile = await requireAuthenticatedProfile("admin");
  const data = await getAdminDashboardData();

  return (
    <main
      style={{
        minHeight: "100dvh",
        padding: "32px",
        background: "#f6f8fc"
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            background: "#ffffff",
            borderRadius: 24,
            padding: 24,
            border: "1px solid #e7ecf5",
            boxShadow: "0 10px 30px rgba(20, 40, 90, 0.06)"
          }}
        >
          <div style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>
            Zalogowano jako
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 36,
              lineHeight: 1.1,
              fontWeight: 800,
              color: "#0f172a"
            }}
          >
            Panel administratora
          </h1>

          <p
            style={{
              marginTop: 12,
              color: "#475569",
              fontSize: 16,
              lineHeight: 1.6
            }}
          >
            Witaj {profile.full_name || profile.email || "Administrator"}.
          </p>

          <div
            style={{
              marginTop: 24,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16
            }}
          >
            <StatCard label="Mieszkania" value={String(data.stats.apartmentsCount)} />
            <StatCard label="Aktywne przypisania" value={String(data.stats.activeAssignmentsCount)} />
            <StatCard label="Odczyty do weryfikacji" value={String(data.stats.pendingReadingsCount)} />
            <StatCard label="Rozliczenia robocze" value={String(data.stats.draftSettlementsCount)} />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginTop: 24
          }}
        >
          <SectionCard
            title="Ostatnie mieszkania"
            actionHref="/admin/mieszkania"
            actionLabel="Zobacz wszystko"
          >
            {data.apartments.length === 0 ? (
              <EmptyState text="Brak mieszkań w bazie." />
            ) : (
              data.apartments.map((item: any) => (
                <Row
                  key={item.id}
                  title={item.name || "Mieszkanie"}
                  subtitle={[item.address, item.city].filter(Boolean).join(", ")}
                />
              ))
            )}
          </SectionCard>

          <SectionCard
            title="Ostatnie odczyty"
            actionHref="/admin/odczyty"
            actionLabel="Zobacz wszystko"
          >
            {data.readings.length === 0 ? (
              <EmptyState text="Brak odczytów w bazie." />
            ) : (
              data.readings.map((item: any) => (
                <Row
                  key={item.id}
                  title={`${labelUtility(item.utility_type)} • ${item.value}`}
                  subtitle={`${item.reading_date ?? "-"} • status: ${item.status ?? "-"}`}
                />
              ))
            )}
          </SectionCard>

          <SectionCard
            title="Ostatnie rozliczenia"
            actionHref="/admin/rozliczenia"
            actionLabel="Zobacz wszystko"
          >
            {data.settlements.length === 0 ? (
              <EmptyState text="Brak rozliczeń w bazie." />
            ) : (
              data.settlements.map((item: any) => (
                <Row
                  key={item.id}
                  title={`Okres: ${item.period_month ?? "-"}`}
                  subtitle={`${formatPln(item.total_amount)} • status: ${item.status ?? "-"}`}
                />
              ))
            )}
          </SectionCard>

          <SectionCard
            title="Cenniki mediów"
            actionHref="/admin/taryfy"
            actionLabel="Zobacz wszystko"
          >
            {data.prices.length === 0 ? (
              <EmptyState text="Brak cen mediów w bazie." />
            ) : (
              data.prices.map((item: any) => (
                <Row
                  key={item.id}
                  title={`${labelUtility(item.utility_type)} • ${formatPln(item.gross_price)}`}
                  subtitle={`od ${item.valid_from ?? "-"} do ${item.valid_to ?? "bezterminowo"}`}
                />
              ))
            )}
          </SectionCard>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#eef4ff",
        borderRadius: 18,
        padding: 20
      }}
    >
      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#1d4ed8" }}>{value}</div>
    </div>
  );
}

function SectionCard({
  title,
  actionHref,
  actionLabel,
  children
}: {
  title: string;
  actionHref: string;
  actionLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "#ffffff",
        borderRadius: 24,
        padding: 24,
        border: "1px solid #e7ecf5",
        boxShadow: "0 10px 30px rgba(20, 40, 90, 0.06)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          marginBottom: 16
        }}
      >
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{title}</h2>
        <Link href={actionHref} style={{ color: "#1d4ed8", textDecoration: "none", fontWeight: 700 }}>
          {actionLabel}
        </Link>
      </div>
      <div style={{ display: "grid", gap: 12 }}>{children}</div>
    </section>
  );
}

function Row({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      style={{
        border: "1px solid #e8edf5",
        borderRadius: 16,
        padding: 14,
        background: "#fbfcff"
      }}
    >
      <div style={{ fontWeight: 700, color: "#111827" }}>{title}</div>
      <div style={{ marginTop: 4, color: "#64748b", fontSize: 14 }}>{subtitle}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div style={{ color: "#64748b" }}>{text}</div>;
}

function formatPln(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN"
  }).format(numeric);
}

function labelUtility(value: string | null | undefined) {
  switch (value) {
    case "cold_water":
      return "Zimna woda";
    case "hot_water":
      return "Ciepła woda";
    case "electricity":
      return "Prąd";
    case "gas":
      return "Gaz";
    default:
      return "Medium";
  }
}