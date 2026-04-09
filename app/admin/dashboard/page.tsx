import Link from "next/link";
import { AlertTriangle, BarChart3, Building2, PlusCircle, Receipt, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { UsageChart } from "@/components/charts/usage-chart";
import { Button } from "@/components/ui/button";
import { formatCurrency, utilityLabel } from "@/lib/utils";
import { getAdminDashboardData, requireAuthenticatedProfile } from "@/lib/auth/user";

export default async function AdminDashboardPage() {
  const profile = await requireAuthenticatedProfile("admin");
  const { apartments, latestReadings, stats } = await getAdminDashboardData();

  return (
    <AppShell userName={profile.full_name || "Administrator"} title="Panel administratora" subtitle="Kontroluj koszty, odczyty i rozliczenia mieszkań.">
      <div className="grid-3">
        <StatCard
          variant="primary"
          title="Całkowity koszt (bieżący miesiąc)"
          value={formatCurrency(stats.totalCurrentMonthCost)}
          note="Suma na podstawie rozliczeń z bieżącego miesiąca"
          icon={<Zap size={20} />}
        />
        <StatCard title="Aktywne mieszkania" value={String(stats.apartmentsCount)} note="Liczba lokali dostępnych w systemie" icon={<Building2 size={20} />} />
        <StatCard
          variant="alert"
          title="Braki odczytów"
          value={String(stats.missingReadingsCount)}
          note="Odczyty oznaczone jako wymagające weryfikacji"
          icon={<AlertTriangle size={20} />}
          footer={<Button variant="danger" style={{ width: "100%" }}>Wyślij przypomnienia</Button>}
        />
      </div>

      <div className="grid-2">
        <div className="section-card">
          <div className="section-head">
            <h2 style={{ margin: 0 }}>Szybkie działania</h2>
          </div>
          <div className="item-list">
            <Link href="/admin/odczyty" className="list-card">
              <div className="icon-box"><PlusCircle size={20} /></div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 22 }}>Dodaj odczyt</div>
                <div style={{ color: "#667081" }}>Ręczne wprowadzenie danych</div>
              </div>
            </Link>
            <Link href="/admin/rozliczenia" className="list-card">
              <div className="icon-box green"><Receipt size={20} /></div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 22 }}>Generuj rozliczenie</div>
                <div style={{ color: "#667081" }}>Przygotuj miesięczne zestawienia</div>
              </div>
            </Link>
            <div className="list-card">
              <div className="icon-box"><Receipt size={20} /></div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 22 }}>Oczekujące rozliczenia</div>
                <div style={{ color: "#667081" }}>{stats.pendingSettlementsCount} pozycji w wersji roboczej</div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-head">
            <h2 style={{ margin: 0 }}>Efektywność odczytów</h2>
          </div>
          <UsageChart />
        </div>
      </div>

      <div className="section-card">
        <div className="section-head">
          <h2 style={{ margin: 0 }}>Najnowsze odczyty</h2>
          <Link href="/admin/odczyty" className="helper-link">Zobacz wszystkie</Link>
        </div>
        <div className="item-list">
          {latestReadings.length === 0 ? (
            <div className="list-card">Brak odczytów w bazie.</div>
          ) : (
            latestReadings.map((reading) => (
              <div key={reading.id} className="list-card">
                <div className="icon-box">{reading.apartments?.code ?? "--"}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{reading.apartments?.name ?? "Mieszkanie"}</div>
                  <div style={{ color: "#667081" }}>
                    {utilityLabel(reading.utility_type)} • {reading.reading_date} • status: {reading.status}
                  </div>
                </div>
                <div style={{ fontWeight: 800 }}>{reading.value}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="section-card">
        <div className="section-head">
          <h2 style={{ margin: 0 }}>Lista mieszkań</h2>
          <Link href="/admin/mieszkania" className="helper-link">Zobacz wszystkie</Link>
        </div>
        <div className="item-list">
          {apartments.length === 0 ? (
            <div className="list-card">Brak mieszkań w systemie.</div>
          ) : (
            apartments.map((apartment) => (
              <Link href={`/admin/mieszkania/${apartment.id}`} key={apartment.id} className="list-card">
                <div className="icon-box">{apartment.code}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{apartment.name}</div>
                  <div style={{ color: "#667081" }}>{apartment.address}, {apartment.city}</div>
                </div>
                <BarChart3 size={18} color="#7f8898" />
              </Link>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
