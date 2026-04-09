import Link from "next/link";
import { Bell, CalendarClock, PlusCircle } from "lucide-react";
import { MobileBottomNav } from "@/components/layout/mobile-nav";
import { UsageChart } from "@/components/charts/usage-chart";
import { formatCurrency, utilityLabel, utilityUnit } from "@/lib/utils";
import { getTenantDashboardData, requireAuthenticatedProfile } from "@/lib/auth/user";

export default async function TenantDashboardPage() {
  const profile = await requireAuthenticatedProfile("tenant");
  const { apartment, latestReadings, estimatedCost, latestSettlementDate } = await getTenantDashboardData(profile);

  return (
    <div className="page-shell">
      <div className="mobile-header" style={{ display: "flex", paddingBottom: 8 }}>
        <div className="topbar-card">
          <div className="avatar">{profile.full_name?.slice(0, 1) ?? "N"}</div>
          <div>
            <div style={{ fontSize: 14, color: "#5d6677" }}>Witaj,</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#2754d7" }}>{profile.full_name || "Najemca"}</div>
          </div>
        </div>
        <Bell size={20} color="#5b667a" />
      </div>

      <main className="main-content">
        <div className="page-container">
          <div className="topbar" style={{ paddingBottom: 0 }}>
            <div>
              <h1 className="page-title">Panel najemcy</h1>
              <p className="page-subtitle">
                {apartment ? `Mieszkanie: ${apartment.name}, ${apartment.address}` : "Brak przypisanego mieszkania do Twojego profilu."}
              </p>
            </div>
          </div>

          <div className="stat-card soft" style={{ minHeight: 0 }}>
            <div style={{ color: "#5f6779", fontSize: 15 }}>Estymowany koszt (bieżący miesiąc)</div>
            <div className="stat-value" style={{ color: "#0b5db6" }}>{formatCurrency(estimatedCost || 0)}</div>
            <div className="pill success">
              {latestSettlementDate ? `Ostatnie rozliczenie: ${latestSettlementDate}` : "Brak rozliczeń do wyświetlenia"}
            </div>
          </div>

          <Link href="/najemca/odczyty" className="btn btn-primary" style={{ width: "100%", pointerEvents: apartment ? "auto" : "none", opacity: apartment ? 1 : 0.6 }}>
            <PlusCircle size={18} />
            Dodaj odczyt licznika
          </Link>

          <div className="section-card" style={{ borderColor: "#f3caca", background: "#fff8f8" }}>
            <div style={{ display: "flex", gap: 14 }}>
              <div className="icon-box red"><CalendarClock size={20} /></div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 28 }}>Nadchodzący odczyt</div>
                <div style={{ color: "#667081", lineHeight: 1.55 }}>Dodawaj odczyty co miesiąc, aby rozliczenia były poprawne i kompletne.</div>
                <div style={{ marginTop: 12, color: "#c32020", fontWeight: 800 }}>
                  {apartment ? "Sprawdź zakładkę Odczyty i uzupełnij bieżący stan liczników." : "Skontaktuj się z administratorem, aby przypisać mieszkanie do profilu."}
                </div>
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-head">
              <h2 style={{ margin: 0 }}>Ostatnie odczyty</h2>
              <Link href="/najemca/odczyty" className="helper-link">Zobacz wszystkie</Link>
            </div>
            <div className="item-list">
              {latestReadings.length === 0 ? (
                <div className="list-card">Brak odczytów dla tego mieszkania.</div>
              ) : (
                latestReadings.map((item) => (
                  <div className="list-card" key={item.id}>
                    <div className="icon-box">{item.utility_type === "cold_water" ? "💧" : item.utility_type === "hot_water" ? "♨️" : item.utility_type === "gas" ? "🔥" : "⚡"}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>{utilityLabel(item.utility_type)}: {item.value} {utilityUnit(item.utility_type)}</div>
                      <div style={{ color: "#667081" }}>Data: {item.reading_date}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: Number(item.usage ?? 0) > 0 ? "#1b6d2d" : "#667081" }}>
                      {item.usage ?? 0} {utilityUnit(item.utility_type)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="section-card">
            <h2 style={{ marginTop: 0 }}>Analiza zużycia</h2>
            <UsageChart />
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
