import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

export default async function HistoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    await requireAuthenticatedProfile(["admin"]);
  } catch {
    redirect("/logowanie");
  }

  const { id } = await params;
  const supabase = await createClient();

  const [assignmentsRes, rentsRes, advancesRes, invoicesRes] =
    await Promise.all([
      supabase.from("tenant_assignments").select("*").eq("tenant_user_id", id),
      supabase.from("monthly_rent").select("*"),
      supabase.from("monthly_advances").select("*"),
      supabase.from("utility_invoices").select("*"),
    ]);

  const assignments = assignmentsRes.data ?? [];
  const rents = rentsRes.data ?? [];
  const advances = advancesRes.data ?? [];
  const invoices = invoicesRes.data ?? [];

  const apartmentIds = assignments.map((a) => a.apartment_id);

  const months: any = {};

  rents.forEach((r) => {
    if (!apartmentIds.includes(r.apartment_id)) return;
    const key = `${r.year}-${r.month}`;
    if (!months[key]) months[key] = { rent: 0, adv: 0, inv: 0 };

    if (r.status !== "paid") months[key].rent += Number(r.amount);
  });

  advances.forEach((a) => {
    if (!apartmentIds.includes(a.apartment_id)) return;
    const key = `${a.year}-${a.month}`;
    if (!months[key]) months[key] = { rent: 0, adv: 0, inv: 0 };

    if (a.status === "paid") months[key].adv += Number(a.amount);
  });

  invoices.forEach((i) => {
    if (!apartmentIds.includes(i.apartment_id)) return;
    const key = `${i.year}-${i.month}`;
    if (!months[key]) months[key] = { rent: 0, adv: 0, inv: 0 };

    if (i.status !== "paid") months[key].inv += Number(i.amount);
  });

  return (
    <main style={{ padding: "2rem" }}>
      <AdminTopbar />
      <h1>Historia rozliczeń</h1>

      {Object.entries(months).map(([key, val]: any) => {
        const total = val.rent + val.inv - val.adv;

        return (
          <div key={key} style={{ borderBottom: "1px solid #ddd", padding: "10px" }}>
            <b>{key}</b>
            <div>Czynsz: {val.rent}</div>
            <div>Faktury: {val.inv}</div>
            <div>Zaliczka: -{val.adv}</div>
            <div>
              <b>Saldo: {total.toFixed(2)} zł</b>
            </div>
          </div>
        );
      })}
    </main>
  );
}