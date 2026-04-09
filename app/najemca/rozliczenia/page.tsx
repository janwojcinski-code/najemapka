import Link from "next/link";
import { Download, ReceiptText } from "lucide-react";
import { settlements } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { MobileBottomNav } from "@/components/layout/mobile-nav";

export default function TenantSettlementsPage() {
  return (
    <div className="page-shell">
      <main className="main-content">
        <div className="page-container">
          <div className="topbar">
            <div>
              <h1 className="page-title">Moje rozliczenia</h1>
              <p className="page-subtitle">Zarządzaj swoimi wydatkami i fakturami w jednym miejscu.</p>
            </div>
            <Link href="#" className="helper-link">Filtruj</Link>
          </div>

          <div className="grid-2">
            <div className="stat-card">
              <div style={{ color: "#6e7788", fontWeight: 800, textTransform: "uppercase", fontSize: 12 }}>Do zapłaty</div>
              <div className="stat-value" style={{ color: "#c02828" }}>124,50 zł</div>
            </div>
            <div className="stat-card soft">
              <div style={{ color: "#0b5db6", fontWeight: 800, textTransform: "uppercase", fontSize: 12 }}>Suma opłacona</div>
              <div className="stat-value" style={{ color: "#0b5db6" }}>2 450 zł</div>
            </div>
          </div>

          <div className="item-list">
            {settlements.map((item) => (
              <Link href={`/najemca/rozliczenia/${item.id}`} key={item.id} className="section-card" style={{ display: "grid", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "center" }}>
                  <div className={`icon-box ${item.status === "paid" ? "green" : "red"}`}>
                    <ReceiptText size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>Faktura #{item.period_month.replace("-", "/")}</div>
                    <div style={{ color: "#667081" }}>Data wystawienia: {item.issue_date}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 900 }}>{formatCurrency(item.total_amount)}</div>
                    <Badge variant={item.status === "paid" ? "success" : "danger"}>{item.status === "paid" ? "Opłacone" : "Nieopłacone"}</Badge>
                  </div>
                </div>

                <div style={{ background: "#f3f5fd", borderRadius: 16, padding: 16, display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span>Energia elektryczna</span>
                    <strong>85,20 zł</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span>Zużycie wody</span>
                    <strong>24,30 zł</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span>Opłata abonamentowa</span>
                    <strong>15,00 zł</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {item.status === "unpaid" ? (
                    <span className="btn btn-primary" style={{ minWidth: 220 }}>Opłać teraz</span>
                  ) : (
                    <span className="helper-link" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                      <Download size={16} />
                      Pobierz PDF
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
