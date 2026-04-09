import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { settlements } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatMonth } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default async function AdminSettlementDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const settlement = settlements.find((item) => item.id === id);
  if (!settlement) notFound();

  const rows = [
    { label: "Energia elektryczna", amount: 85.20 },
    { label: "Zużycie wody", amount: 24.30 },
    { label: "Opłata abonamentowa", amount: 15.00 }
  ];

  return (
    <AppShell userName="Administrator" title={`Rozliczenie ${formatMonth(settlement.period_month)}`} subtitle={`Data wystawienia: ${settlement.issue_date}`}>
      <div className="section-card">
        <div className="section-head">
          <div>
            <div style={{ fontSize: 14, color: "#667081" }}>Numer dokumentu</div>
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

        <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Button>Wygeneruj PDF</Button>
          <Button variant="secondary">Wyślij do najemcy</Button>
        </div>
      </div>
    </AppShell>
  );
}
