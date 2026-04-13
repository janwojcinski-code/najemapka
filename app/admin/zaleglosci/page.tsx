import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

export default async function ZaleglosciPage() {
  try {
    await requireAuthenticatedProfile(["admin"]);
  } catch {
    redirect("/logowanie");
  }

  const supabase = await createClient();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [
    assignmentsRes,
    rentsRes,
    advancesRes,
    invoicesRes,
    profilesRes,
    apartmentsRes,
  ] = await Promise.all([
    supabase.from("tenant_assignments").select("*").is("end_date", null),
    supabase.from("monthly_rent").select("*").eq("month", month).eq("year", year),
    supabase.from("monthly_advances").select("*").eq("month", month).eq("year", year),
    supabase.from("utility_invoices").select("*").eq("month", month).eq("year", year),
    supabase.from("profiles").select("*"),
    supabase.from("apartments").select("*"),
  ]);

  const assignments = assignmentsRes.data ?? [];
  const rents = rentsRes.data ?? [];
  const advances = advancesRes.data ?? [];
  const invoices = invoicesRes.data ?? [];
  const profiles = profilesRes.data ?? [];
  const apartments = apartmentsRes.data ?? [];

  const rows = assignments.map((a: any) => {
    const tenant = profiles.find((p) => p.id === a.tenant_user_id);
    const apartment = apartments.find((ap) => ap.id === a.apartment_id);

    const rent = rents.find((r) => r.apartment_id === a.apartment_id);
    const advance = advances.find((ad) => ad.apartment_id === a.apartment_id);
    const inv = invoices.filter((i) => i.apartment_id === a.apartment_id);

    const rentDue = rent?.status === "paid" ? 0 : Number(rent?.amount ?? 0);
    const invoicesSum = inv
      .filter((i) => i.status !== "paid")
      .reduce((s, i) => s + Number(i.amount ?? 0), 0);
    const advancePaid = advance?.status === "paid" ? Number(advance.amount) : 0;

    const total = Math.max(rentDue + invoicesSum - advancePaid, 0);

    return {
      tenant: tenant?.full_name || tenant?.email,
      tenantId: tenant?.id,
      apartment: apartment?.name,
      total,
    };
  });

  const filtered = rows.filter((r) => r.total > 0);
  const sum = filtered.reduce((s, r) => s + r.total, 0);

  return (
    <main style={{ padding: "2rem" }}>
      <AdminTopbar />
      <h1>Zaległości</h1>

      <h2 style={{ color: "red" }}>Łącznie: {sum.toFixed(2)} zł</h2>

      {filtered.length === 0 ? (
        <div>Brak zaległości ✅</div>
      ) : (
        filtered.map((r, i) => (
          <div key={i} style={{ borderBottom: "1px solid #eee", padding: "10px" }}>
            <b>{r.tenant}</b> – {r.apartment} – {r.total.toFixed(2)} zł
            <div>
              <Link href={`/admin/najemcy/${r.tenantId}`}>Szczegóły</Link>
            </div>
          </div>
        ))
      )}
    </main>
  );
}