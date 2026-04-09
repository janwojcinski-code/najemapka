import Link from "next/link";
import { AlertTriangle, BarChart3, Building2, PlusCircle, Receipt, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { apartments } from "@/lib/mock-data";
import { UsageChart } from "@/components/charts/usage-chart";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  return (
    <AppShell userName="Administrator" title="Panel administratora" subtitle="Kontroluj koszty, odczyty i rozliczenia mieszkań.">
      <div className="grid-3">
        <StatCard
          variant="primary"
          title="Całkowity koszt (bieżący miesiąc)"
          value="42 850,20 zł"
          note="-12% względem zeszłego miesiąca"
          icon={<Zap size={20} />}
        />
        <StatCard title="Aktywne mieszkania" value="128" note="+4 w tym tygodniu" icon={<Building2 size={20} />} />
        <StatCard
          variant="alert"
          title="Braki odczytów"
          value="12"
          note="Część lokatorów nie wysłała danych za ten miesiąc"
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
                <div style={{ color: "#667081" }}>Masowe zestawienia PDF</div>
              </div>
            </Link>
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
          <h2 style={{ margin: 0 }}>Lista mieszkań</h2>
          <Link href="/admin/mieszkania" className="helper-link">Zobacz wszystkie</Link>
        </div>
        <div className="item-list">
          {apartments.map((apartment) => (
            <Link href={`/admin/mieszkania/${apartment.id}`} key={apartment.id} className="list-card">
              <div className="icon-box">{apartment.code}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{apartment.name}</div>
                <div style={{ color: "#667081" }}>Najemca: {apartment.tenant_name}</div>
              </div>
              <BarChart3 size={18} color="#7f8898" />
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
