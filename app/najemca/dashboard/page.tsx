import Link from "next/link";
import { Bell, CalendarClock, PlusCircle } from "lucide-react";
import { MobileBottomNav } from "@/components/layout/mobile-nav";
import { UsageChart } from "@/components/charts/usage-chart";
import { readings } from "@/lib/mock-data";

export default function TenantDashboardPage() {
  const latestReadings = readings.slice(0, 2);

  return (
    <div className="page-shell">
      <div className="mobile-header" style={{ display: "flex", paddingBottom: 8 }}>
        <div className="topbar-card">
          <div className="avatar">J</div>
          <div>
            <div style={{ fontSize: 14, color: "#5d6677" }}>Witaj,</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#2754d7" }}>Cześć Jan!</div>
          </div>
        </div>
        <Bell size={20} color="#5b667a" />
      </div>

      <main className="main-content">
        <div className="page-container">
          <div className="stat-card soft" style={{ minHeight: 0 }}>
            <div style={{ color: "#5f6779", fontSize: 15 }}>Estymowany koszt (bieżący miesiąc)</div>
            <div className="stat-value" style={{ color: "#0b5db6" }}>245,00 PLN</div>
            <div className="pill success">↘ -12% vs poprzedni miesiąc</div>
          </div>

          <Link href="/najemca/odczyty" className="btn btn-primary" style={{ width: "100%" }}>
            <PlusCircle size={18} />
            Dodaj odczyt licznika
          </Link>

          <div className="section-card" style={{ borderColor: "#f3caca", background: "#fff8f8" }}>
            <div style={{ display: "flex", gap: 14 }}>
              <div className="icon-box red"><CalendarClock size={20} /></div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 28 }}>Nadchodzący odczyt</div>
                <div style={{ color: "#667081", lineHeight: 1.55 }}>Czas na podanie stanu liczników wody i gazu.</div>
                <div style={{ marginTop: 12, color: "#c32020", fontWeight: 800 }}>Pozostało 3 dni <span style={{ color: "#8d95a6", fontWeight: 600 }}>• Termin: 15 cze</span></div>
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-head">
              <h2 style={{ margin: 0 }}>Ostatnie odczyty</h2>
              <Link href="/najemca/odczyty" className="helper-link">Zobacz wszystkie</Link>
            </div>
            <div className="item-list">
              {latestReadings.map((item) => (
                <div className="list-card" key={item.id}>
                  <div className="icon-box">{item.utility_type === "cold_water" ? "💧" : "⚡"}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>{item.value} {item.utility_type === "electricity" ? "kWh" : "m³"}</div>
                    <div style={{ color: "#667081" }}>Data: {item.reading_date}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: item.usage && item.usage > 0 ? "#1b6d2d" : "#667081" }}>
                    {item.usage && item.usage > 0 ? `+${item.usage}` : item.usage} {item.utility_type === "electricity" ? "kWh" : "m³"}
                  </div>
                </div>
              ))}
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
