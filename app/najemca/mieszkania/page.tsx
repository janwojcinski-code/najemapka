import Link from "next/link";
import { Building2 } from "lucide-react";

export default function TenantApartmentsPage() {
  return (
    <div className="page-shell">
      <main className="main-content">
        <div className="page-container">
          <div className="topbar">
            <div>
              <h1 className="page-title">Moje mieszkanie</h1>
              <p className="page-subtitle">Najemca widzi tylko przypisane mieszkanie i jego historię mediów.</p>
            </div>
          </div>

          <Link href="/najemca/mieszkania/a1" className="list-card">
            <div className="icon-box"><Building2 size={20} /></div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>ul. Słoneczna 15/12A</div>
              <div style={{ color: "#667081" }}>Warszawa • 42 m²</div>
            </div>
            <div className="helper-link">Szczegóły</div>
          </Link>
        </div>
      </main>
    </div>
  );
}
