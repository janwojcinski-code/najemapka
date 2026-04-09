import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";

async function createSettlement(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const apartmentId = Number(formData.get("apartment_id"));
  const month = Number(formData.get("month"));
  const year = Number(formData.get("year"));

  const { data: readings } = await supabase
    .from("meter_readings")
    .select("*")
    .eq("apartment_id", apartmentId)
    .order("reading_date", { ascending: false })
    .limit(2);

  if (!readings || readings.length < 2) {
    redirect("/admin/rozliczenia/nowe");
  }

  const latest = readings[0];
  const prev = readings[1];

  const diff =
    (latest.cold_water ?? 0) - (prev.cold_water ?? 0) +
    (latest.hot_water ?? 0) - (prev.hot_water ?? 0) +
    (latest.electricity ?? 0) - (prev.electricity ?? 0) +
    (latest.gas ?? 0) - (prev.gas ?? 0);

  await supabase.from("settlements").insert({
    apartment_id: apartmentId,
    month,
    year,
    total_amount: diff,
    status: "pending",
  });

  redirect("/admin/rozliczenia");
}

export default async function Page() {
  await requireAuthenticatedProfile(["admin"]);

  const supabase = await createClient();

  const { data: apartments } = await supabase
    .from("apartments")
    .select("id, name");

  return (
    <form action={createSettlement} style={{ padding: "2rem" }}>
      <h1>Nowe rozliczenie</h1>

      <select name="apartment_id">
        {apartments?.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>

      <input name="month" type="number" placeholder="Miesiąc" />
      <input name="year" type="number" placeholder="Rok" />

      <button type="submit">Generuj</button>
    </form>
  );
}