import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { settlements } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatMonth } from "@/lib/utils";

export default function AdminSettlementsPage() {
  return (
    <AppShell userName="Administrator" title="Rozliczenia" subtitle="Lista wszystkich miesięcznych rozliczeń mieszkań.">
      <div className="section-card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Okres</th>
                <th>Kwota</th>
                <th>Status</th>
                <th>Data wystawienia</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((item) => (
                <tr key={item.id}>
                  <td>{formatMonth(item.period_month)}</td>
                  <td><strong>{formatCurrency(item.total_amount)}</strong></td>
                  <td><Badge variant={item.status === "paid" ? "success" : "danger"}>{item.status === "paid" ? "Opłacone" : item.status === "unpaid" ? "Nieopłacone" : "Szkic"}</Badge></td>
                  <td>{item.issue_date}</td>
                  <td><Link className="helper-link" href={`/admin/rozliczenia/${item.id}`}>Szczegóły</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
