import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { getAdminDashboardData } from "@/lib/data/admin";
import AdminTopbar from "@/components/admin-topbar";

export default async function AdminDashboardPage() {
  let profile;
  try {
    profile = await requireAuthenticatedProfile(["admin"]);
  } catch {
    redirect("/logowanie");
  }

  const data = await getAdminDashboardData();

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
          marginBottom: "2rem",
        }}
      >
        <StatCard label="Aktywne mieszkania" value={data.apartmentsCount} />
        <StatCard
          label="Aktywne przypisania"
          value={data.activeAssignmentsCount}
        />
        <StatCard
          label="Braki odczytów"
          value={data.pendingReadingsCount}
          accent="danger"
        />
        <StatCard
          label="Oczekujące rozliczenia"
          value={data.pendingSettlementsCount}
          accent="warning"
        />
      </div>

      <div style={{ marginBottom: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <a
          href="/admin/mieszkania"
          style={{
            display: "inline-block",
            background: "#0B5CAD",
            color: "white",
            textDecoration: "none",
            padding: "12px 18px",
            borderRadius: "999px",
            fontWeight: 600,
          }}
        >
          Przejdź do mieszkań
        </a>

        <a
          href="/admin/przypisania"
          style={{
            display: "inline-block",
            background: "#111827",
            color: "white",
            textDecoration: "none",
            padding: "12px 18px",
            borderRadius: "999px",
            fontWeight: 600,
          }}
        >
          Przejdź do przypisań
        </a>

        <a
          href="/admin/rozliczenia"
          style={{
            display: "inline-block",
            background: "#7C3AED",
            color: "white",
            textDecoration: "none",
            padding: "12px 18px",
            borderRadius: "999px",
            fontWeight: 600,
          }}
        >
          Przejdź do rozliczeń
        </a>

        <a
          href="/admin/taryfy"
          style={{
            display: "inline-block",
            background: "#059669",
            color: "white",
            textDecoration: "none",
            padding: "12px 18px",
            borderRadius: "999px",
            fontWeight: 600,
          }}
        >
          Przejdź do taryf
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