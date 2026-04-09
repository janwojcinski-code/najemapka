import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { apartments } from "@/lib/mock-data";

export default function AdminApartmentsPage() {
  return (
    <AppShell userName="Administrator" title="Mieszkania" subtitle="Wszystkie lokale z przypisanymi najemcami i statusem odczytów.">
      <div className="section-card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Kod</th>
                <th>Mieszkanie</th>
                <th>Miasto</th>
                <th>Najemca</th>
                <th>Powierzchnia</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {apartments.map((apartment) => (
                <tr key={apartment.id}>
                  <td><strong>{apartment.code}</strong></td>
                  <td>{apartment.address}</td>
                  <td>{apartment.city}</td>
                  <td>{apartment.tenant_name}</td>
                  <td>{apartment.area_m2} m²</td>
                  <td><Link className="helper-link" href={`/admin/mieszkania/${apartment.id}`}>Szczegóły</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
