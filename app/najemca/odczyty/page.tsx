import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { getTenantDashboardData } from "@/lib/data/tenant";
import Link from "next/link";
import TenantTopbar from "@/components/tenant-topbar";

export default async function TenantDashboardPage() {
  let profile;
  try {
    profile = await requireAuthenticatedProfile(["tenant"]);
  } catch {
    redirect("/logowanie");
  }

  const data = await getTenantDashboardData(profile.id);

  const mediaLabels: { key: string; label: string; unit: string; icon: string }[] = [
    { key: "cold_water", label: "Zimna woda", unit: "m³", icon: "💧" },
    { key: "hot_water", label: "Ciepła woda", unit: "m³", icon: "🔥" },
    { key: "electricity", label: "Prąd", unit: "kWh", icon: "⚡" },
    { key: "gas", label: "Gaz", unit: "m³", icon: "🔵" },
  ];

  return (
    <main style={{ padding: "1.5rem", maxWidth: "480px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <TenantTopbar />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#1a3a6b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            {profile.full_name?.[0] ?? "N"}
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#888" }}>Witaj,</div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#1a3a6b" }}>
              {profile.full_name ?? profile.email}!
            </div>
          </div>
        </div>
        <div style={{ fontSize: "20px", cursor: "pointer" }}>🔔</div>
      </div>

      {!data.assignment ? (
        <div
          style={{
            background: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "12px",
            padding: "16px",
            color: "#856404",
          }}
        >
          Nie masz jeszcze przypisanego mieszkania. Skontaktuj się z administratorem.
        </div>
      ) : (
        <>
          <div
            style={{
              background: "#f8f9ff",
              border: "1px solid #e8ecff",
              borderRadius: "16px",
              padding: "1.25rem 1.5rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ fontSize: "13px", color: "#888", marginBottom: "4px" }}>
              Estymowany koszt (Bieżący miesiąc)
            </div>
            <div style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
              {data.recentSettlements[0]?.total_amount?.toLocaleString("pl-PL", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) ?? "—"}{" "}
              PLN
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                background: "#e8f5e9",
                color: "#2e7d32",
                fontSize: "12px",
                padding: "4px 10px",
                borderRadius: "20px",
              }}
            >
              📉 -12% vs poprzedni miesiąc
            </div>
          </div>

          <Link href="/najemca/odczyty/nowy" style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "#1a3a6b",
                color: "white",
                borderRadius: "12px",
                padding: "14px 20px",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ➕ DODAJ ODCZYT LICZNIKA
            </div>
          </Link>

          <div
            style={{
              background: "#fff5f5",
              border: "1px solid #ffd0d0",
              borderRadius: "12px",
              padding: "14px 16px",
              marginBottom: "1.5rem",
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: "24px" }}>📅</span>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>Nadchodzący odczyt</div>
              <div style={{ fontSize: "13px", color: "#555", marginBottom: "6px" }}>
                Czas na podanie stanu liczników wody i gazu.
              </div>
              <span style={{ color: "#e53e3e", fontWeight: 600, fontSize: "13px" }}>Pozostało 3 dni</span>
              <span style={{ color: "#888", fontSize: "13px" }}> • Termin: 15 Cze</span>
            </div>
          </div>

          {data.recentReadings.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ fontSize: "15px", fontWeight: 600 }}>Ostatnie odczyty</div>
                <Link href="/najemca/odczyty" style={{ fontSize: "13px", color: "#1a3a6b", textDecoration: "none" }}>
                  Zobacz wszystkie
                </Link>
              </div>
              {mediaLabels.map(({ key, label, unit, icon }) => {
                const latest = data.recentReadings[0];
                const prev = data.recentReadings[1];
                const val = latest?.[key as keyof typeof latest] as number | null;
                const prevVal = prev?.[key as keyof typeof prev] as number | null;
                if (val == null) return null;
                const diff = prevVal != null ? val - prevVal : null;
                return (
                  <div
                    key={key}
                    style={{
                      background: "white",
                      border: "1px solid #eee",
                      borderRadius: "12px",
                      padding: "14px 16px",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "20px" }}>{icon}</span>
                        <span style={{ fontSize: "13px", color: "#888", textTransform: "uppercase", fontWeight: 500 }}>
                          {label}
                        </span>
                      </div>
                      <span style={{ fontSize: "12px", color: "#aaa" }}>{unit.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: "24px", fontWeight: 700, margin: "6px 0 4px" }}>
                      {val.toLocaleString("pl-PL")} {unit}
                    </div>
                    <div style={{ fontSize: "12px", color: "#888" }}>Data: {latest.reading_date}</div>
                    {diff != null && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "13px" }}>
                        <span style={{ color: "#888" }}>Zużycie mies.</span>
                        <span style={{ color: diff > 0 ? "#e53e3e" : "#22a06b", fontWeight: 500 }}>
                          {diff > 0 ? "+" : ""}
                          {diff.toFixed(1)} {unit}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {data.recentSettlements.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px" }}>Ostatnie rozliczenia</div>
              {data.recentSettlements.map((s) => (
                <div
                  key={s.id}
                  style={{
                    background: "white",
                    border: "1px solid #eee",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    marginBottom: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#888" }}>
                    {s.month}/{s.year}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>{s.total_amount?.toFixed(2)} zł</span>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: s.status === "paid" ? "#e8f5e9" : "#fff3e0",
                        color: s.status === "paid" ? "#2e7d32" : "#e65100",
                        fontWeight: 500,
                      }}
                    >
                      {s.status === "paid" ? "Opłacone" : "Nieopłacone"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div style={{ height: "20px" }} />
    </main>
  );
}