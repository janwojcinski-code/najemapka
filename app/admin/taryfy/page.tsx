import { AppShell } from "@/components/layout/app-shell";
import { prices } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminPricesPage() {
  return (
    <AppShell userName="Administrator" title="Taryfy i ceny" subtitle="Zarządzaj aktualnymi stawkami za media oraz planuj przyszłe zmiany cen.">
      <div className="grid-3">
        {prices.map((price, index) => (
          <div key={price.id} className={`stat-card ${index === 1 ? "primary" : "soft"}`}>
            <div style={{ fontWeight: 800, fontSize: 24 }}>
              {price.utility_type === "electricity" ? "Prąd" : price.utility_type === "cold_water" ? "Zimna woda" : price.utility_type === "hot_water" ? "Ciepła woda" : "Gaz"}
            </div>
            <div className="stat-value">{String(price.unit_gross).replace(".", ",")} <span style={{ fontSize: 24, fontWeight: 700 }}>{price.unit_label}</span></div>
            <div>Obowiązuje od: {price.valid_from}</div>
            <div style={{ marginTop: 18 }}>
              <Badge variant={price.is_active ? "success" : "muted"}>{price.is_active ? "Aktualna" : "Archiwalna"}</Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="section-card">
        <div className="section-head">
          <h2 style={{ margin: 0 }}>Historia zmian i wersjonowanie</h2>
          <Button variant="secondary">Dodaj nową stawkę</Button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Medium</th>
                <th>Stawka netto</th>
                <th>VAT</th>
                <th>Brutto</th>
                <th>Obowiązuje od</th>
                <th>Obowiązuje do</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((price) => (
                <tr key={price.id}>
                  <td>{price.utility_type}</td>
                  <td>{price.unit_net} {price.unit_label}</td>
                  <td>{price.vat_rate}%</td>
                  <td><strong>{price.unit_gross} {price.unit_label}</strong></td>
                  <td>{price.valid_from}</td>
                  <td>{price.valid_to ?? "bezterminowo"}</td>
                  <td><Badge variant={price.is_active ? "success" : "muted"}>{price.is_active ? "Aktualna" : "Archiwalna"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
