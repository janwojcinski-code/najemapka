import { AppShell } from "@/components/layout/app-shell";
import { readings } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { utilityLabel, utilityUnit } from "@/lib/utils";

export default function AdminReadingsPage() {
  return (
    <AppShell userName="Administrator" title="Odczyty liczników" subtitle="Wszystkie odczyty z możliwością weryfikacji i filtrowania.">
      <div className="section-card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Medium</th>
                <th>Data</th>
                <th>Stan</th>
                <th>Zużycie</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((item) => (
                <tr key={item.id}>
                  <td>{utilityLabel(item.utility_type)}</td>
                  <td>{item.reading_date}</td>
                  <td>{item.value} {utilityUnit(item.utility_type)}</td>
                  <td>{item.usage} {utilityUnit(item.utility_type)}</td>
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
