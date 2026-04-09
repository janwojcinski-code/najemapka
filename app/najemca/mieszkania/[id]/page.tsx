import { notFound } from "next/navigation";
import { apartments } from "@/lib/mock-data";
import { readings, settlements } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function TenantApartmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apartment = apartments.find((item) => item.id === id);
  if (!apartment) notFound();

  return (
    <div className="page-shell">
      <main className="main-content">
        <div className="page-container">
          <div>
            <h1 className="page-title">{apartment.name}</h1>
            <p className="page-subtitle">{apartment.address}, {apartment.city}</p>
          </div>

          <div className="grid-2">
            <div className="section-card">
              <h2 style={{ marginTop: 0 }}>Dane lokalu</h2>
              <div className="item-list">
                <div><strong>Kod mieszkania:</strong> {apartment.code}</div>
                <div><strong>Powierzchnia:</strong> {apartment.area_m2} m²</div>
              </div>
            </div>

            <div className="section-card">
              <h2 style={{ marginTop: 0 }}>Ostatnie rozliczenie</h2>
              <div style={{ fontSize: 36, fontWeight: 900 }}>{formatCurrency(settlements[0].total_amount)}</div>
              <div style={{ marginTop: 10 }}><Badge variant="danger">Do zapłaty</Badge></div>
            </div>
          </div>

          <div className="section-card">
            <h2 style={{ marginTop: 0 }}>Ostatnie odczyty</h2>
            <div className="item-list">
              {readings.map((item) => (
                <div key={item.id} className="list-card">
                  <div className="icon-box">{item.utility_type === "electricity" ? "⚡" : "💧"}</div>
                  <div>
                    <div style={{ fontWeight: 800 }}>{item.utility_type}</div>
                    <div style={{ color: "#667081" }}>{item.reading_date}</div>
                  </div>
                  <div style={{ fontWeight: 800 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
