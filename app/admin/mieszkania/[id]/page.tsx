import { AppShell } from "@/components/layout/app-shell";
import { apartments, readings, settlements } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { formatCurrency, utilityLabel, utilityUnit } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function AdminApartmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apartment = apartments.find((item) => item.id === id);
  if (!apartment) notFound();

  const apartmentReadings = readings.filter((item) => item.apartment_id === id);
  const apartmentSettlements = settlements.filter((item) => item.apartment_id === id);

  return (
    <AppShell userName="Administrator" title={apartment.name} subtitle={`${apartment.address}, ${apartment.city}`}>
      <div className="grid-2">
        <div className="section-card">
          <h2 style={{ marginTop: 0 }}>Dane mieszkania</h2>
          <div className="item-list">
            <div><strong>Kod:</strong> {apartment.code}</div>
            <div><strong>Najemca:</strong> {apartment.tenant_name}</div>
            <div><strong>Powierzchnia:</strong> {apartment.area_m2} m²</div>
          </div>
        </div>

        <div className="section-card">
          <h2 style={{ marginTop: 0 }}>Ostatnie rozliczenia</h2>
          <div className="item-list">
            {apartmentSettlements.map((item) => (
              <div key={item.id} className="list-card">
                <div className="icon-box green">PDF</div>
                <div>
                  <div style={{ fontWeight: 800 }}>{item.period_month}</div>
                  <div style={{ color: "#667081" }}>Data wystawienia: {item.issue_date}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 900 }}>{formatCurrency(item.total_amount)}</div>
                  <Badge variant={item.status === "paid" ? "success" : "danger"}>{item.status === "paid" ? "Opłacone" : "Nieopłacone"}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-card">
        <h2 style={{ marginTop: 0 }}>Ostatnie odczyty</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Medium</th>
                <th>Data</th>
                <th>Stan licznika</th>
                <th>Zużycie</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {apartmentReadings.map((item) => (
                <tr key={item.id}>
                  <td>{utilityLabel(item.utility_type)}</td>
                  <td>{item.reading_date}</td>
                  <td>{item.value} {utilityUnit(item.utility_type)}</td>
                  <td>{item.usage ?? 0} {utilityUnit(item.utility_type)}</td>
                  <td><Badge variant={item.status === "approved" ? "success" : "info"}>{item.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
