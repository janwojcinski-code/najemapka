import { requireAuthenticatedProfile } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const profile = await requireAuthenticatedProfile("admin");

  return (
    <main
      style={{
        minHeight: "100dvh",
        padding: "32px",
        background: "#f6f8fc"
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto"
        }}
      >
        <div
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
              fontSize: 14,
              color: "#64748b",
              marginBottom: 8
            }}
          >
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
            <div
              style={{
                background: "#eef4ff",
                borderRadius: 18,
                padding: 20
              }}
            >
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                Rola
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#1d4ed8" }}>
                admin
              </div>
            </div>

            <div
              style={{
                background: "#f8fafc",
                borderRadius: 18,
                padding: 20
              }}
            >
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                Email
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                {profile.email || "brak"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}