import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

export default async function AdminDashboardPage() {
  try {
    await requireAuthenticatedProfile(["admin"]);
  } catch {
    redirect("/logowanie");
  }

  const supabase = await createClient();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const today = new Date();
  const dueDate = new Date(year, month - 1, 10);

  const [tenantsRes, rentsRes, advancesRes, invoicesRes] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name, email").eq("role", "tenant"),

      supabase.from("monthly_rent").select("*").eq("month", month).eq("year", year),

      supabase.from("monthly_advances").select("*").eq("month", month).eq("year", year),

      supabase.from("utility_invoices").select("*").eq("month", month).eq("year", year),
    ]);

  const tenants = tenantsRes.data || [];
  const rents = rentsRes.data || [];
  const advances = advancesRes.data || [];
  const invoices = invoicesRes.data || [];

  const list = tenants.map((t) => {
    const rent = rents.find((r) => r.apartment_id === t.id);
    const advance = advances.find((a) => a.apartment_id === t.id);
    const inv = invoices.filter((i) => i.apartment_id === t.id);

    const rentAmount = Number(rent?.amount || 0);
    const advanceAmount = Number(advance?.amount || 0);
    const invoicesSum = inv.reduce((s, i) => s + Number(i.amount), 0);

    const total = rentAmount + invoicesSum - advanceAmount;

    const diff = Math.ceil(
      (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      ...t,
      total,
      overdueDays: diff > 0 ? diff : 0,
    };
  });

  const overdue = list.filter((l) => l.total > 0);

  return (
    <main style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <AdminTopbar />

      <h1 style={{ fontSize: "32px", fontWeight: 700 }}>Zaległości</h1>

      {overdue.length === 0 ? (
        <div style={{ marginTop: "20px", color: "#166534" }}>
          Wszystko opłacone ✅
        </div>
      ) : (
        <div style={{ marginTop: "20px" }}>
          {overdue.map((o) => (
            <div
              key={o.id}
              style={{
                padding: "16px",
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <strong>{o.full_name || o.email}</strong>
                <div style={{ fontSize: "14px", color: "#B91C1C" }}>
                  {o.overdueDays} dni po terminie
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "20px", fontWeight: 700 }}>
                  {o.total.toFixed(2)} zł
                </div>

                <Link href={`/admin/najemcy/${o.id}`}>
                  Szczegóły
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}