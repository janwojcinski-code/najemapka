import Link from "next/link";
import { notFound } from "next/navigation";
import { settlements } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatMonth } from "@/lib/utils";

export default async function TenantSettlementDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const settlement = settlements.find((item) => item.id === id);
  if (!settlement) notFound();

  const rows = [
    { label: "Energia elektryczna", amount: 85.20 },
    { label: "Zużycie wody", amount: 24.30 },
    { label: "Opłata abonamentowa", amount: 15.00 }
  ];

  return (
    <div className="page-shell">
      <main className="main-content">
        <div className="page-container">
          <div>
            <h1 className="page-title">Rozliczenie {formatMonth(settlement.period_month)}</h1>
            <p className="page-subtitle">Szczegóły dokumentu i podsumowanie opłat.</p>
          </div>

          <div className="section-card">
            <div className="section-head">
              <div>
                <div style={{ color: "#667081" }}>Numer dokumentu</div>
                <div style={{ fontWeight: 900, fontSize: 28 }}>#{settlement.period_month.replace("-", "/")}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 900, fontSize: 30 }}>{formatCurrency(settlement.total_amount)}</div>
                <Badge variant={settlement.status === "paid" ? "success" : "danger"}>{settlement.status === "paid" ? "Opłacone" : "Nieopłacone"}</Badge>
              </div>
            </div>

            <div className="table-wrap">
              <table className="table">
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td style={{ textAlign: "right", fontWeight: 800 }}>{formatCurrency(row.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
              {settlement.status === "unpaid" ? <Button>Opłać teraz</Button> : null}
              <Button variant="secondary">Pobierz PDF</Button>
              <Link href="/najemca/rozliczenia" className="helper-link" style={{ alignSelf: "center" }}>Wróć do listy</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
