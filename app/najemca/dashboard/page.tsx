import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { getTenantDashboardData } from "@/lib/data/tenant";

export default async function TenantDashboardPage() {
  let profile;
  try {
    profile = await requireAuthenticatedProfile(["tenant"]);
  } catch {
    redirect("/logowanie");
  }

  const data = await getTenantDashboardData(profile.id);

  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 500, marginBottom: "8px" }}>
        Witaj, {profile.full_name || profile.email}!
      </h1>

      {!data.assignment ? (
        <div
          style={{
            background: "var(--color-background-warning)",
            color: "var(--color-text-warning)",
            border: "0.5px solid var(--color-border-warning)",
            borderRadius: "var(--border-radius-md)",
            padding: "16px",
            marginTop: "1rem",
          }}
        >
          Nie masz jeszcze przypisanego mieszkania. Skontaktuj się z
          administratorem.
        </div>
      ) : (
        <>
          <section style={{ marginBottom: "2rem" }}>
            <div
              style={{
                background: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-lg)",
                padding: "1rem 1.25rem",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--color-text-secondary)",
                  margin: "0 0 4px",
                }}
              >
                Twoje mieszkanie
              </p>
              <p
                style={{ fontSize: "16px", fontWeight: 500, margin: "0 0 4px" }}
              >
                {data.assignment.apartment_name}
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--color-text-secondary)",
                  margin: 0,
                }}
              >
                {data.assignment.apartment_address}
              </p>
            </div>
          </section>

          {data.recentReadings.length > 0 && (
            <section style={{ marginBottom: "2rem" }}>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  marginBottom: "12px",
                }}
              >
                Ostatnie odczyty
              </h2>
              <div
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-lg)",
                  overflow: "hidden",
                }}
              >
                {data.recentReadings.map((r, i) => (
                  <div
                    key={r.id}
                    style={{
                      padding: "12px 16px",
                      borderBottom:
                        i < data.recentReadings.length - 1
                          ? "0.5px solid var(--color-border-tertiary)"
                          : "none",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>{r.type}</span>
                    <span style={{ fontSize: "14px", fontWeight: 500 }}>
                      {r.value} {r.unit}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.recentSettlements.length > 0 && (
            <section>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  marginBottom: "12px",
                }}
              >
                Ostatnie rozliczenia
              </h2>
              <div
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-lg)",
                  overflow: "hidden",
                }}
              >
                {data.recentSettlements.map((s, i) => (
                  <div
                    key={s.id}
                    style={{
                      padding: "12px 16px",
                      borderBottom:
                        i < data.recentSettlements.length - 1
                          ? "0.5px solid var(--color-border-tertiary)"
                          : "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {s.period_start} – {s.period_end}
                    </span>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "14px", fontWeight: 500 }}>
                        {s.amount?.toFixed(2)} zł
                      </span>
                      <span
                        style={{
                          marginLeft: "8px",
                          fontSize: "12px",
                          padding: "2px 8px",
                          borderRadius: "var(--border-radius-md)",
                          background:
                            s.status === "paid"
                              ? "var(--color-background-success)"
                              : "var(--color-background-danger)",
                          color:
                            s.status === "paid"
                              ? "var(--color-text-success)"
                              : "var(--color-text-danger)",
                        }}
                      >
                        {s.status === "paid" ? "Opłacone" : "Nieopłacone"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
