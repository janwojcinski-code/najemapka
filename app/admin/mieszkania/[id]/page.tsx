import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

export default async function ApartmentDetailsPage({
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

  const { data: apartment } = await supabase
    .from("apartments")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (!apartment) redirect("/admin/mieszkania");

  const { data: readings } = await supabase
    .from("meter_readings")
    .select("*")
    .eq("apartment_id", apartment.id)
    .order("reading_date", { ascending: false })
    .limit(5);

  const { data: settlements } = await supabase
    .from("settlements")
    .select("id, month, year, total_amount, status")
    .eq("apartment_id", apartment.id)
    .order("year", { ascending: false })
    .limit(5);

  return (
    <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <AdminTopbar />

      <Link href="/admin/mieszkania">← Wróć</Link>

      <h1>{apartment.name}</h1>
      <p>{apartment.address}</p>

      {/* Odczyty */}
      <section style={{ marginTop: "32px" }}>
        <h2>Ostatnie odczyty</h2>

        {readings?.map((r) => (
          <div key={r.id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
            {r.reading_date} | Woda: {r.cold_water} | Prąd: {r.electricity}
          </div>
        ))}
      </section>

      {/* Rozliczenia */}
      <section style={{ marginTop: "32px" }}>
        <h2>Rozliczenia</h2>

        {settlements?.map((s) => (
          <div key={s.id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
            {s.month}/{s.year} — {s.total_amount} zł — {s.status}
          </div>
        ))}
      </section>
    </main>
  );
}