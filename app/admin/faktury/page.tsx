import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function addInvoice(formData: FormData) {
  "use server";

  const supabase = await createClient();

  await supabase.from("utility_invoices").insert({
    apartment_id: Number(formData.get("apartment_id")),
    utility_type: formData.get("type"),
    amount: Number(formData.get("amount")),
    month: Number(formData.get("month")),
    year: Number(formData.get("year")),
    due_date: new Date().toISOString(),
  });

  redirect("/admin/faktury");
}

export default async function Page() {
  const supabase = await createClient();

  const { data: apartments } = await supabase.from("apartments").select("id, name");

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Dodaj fakturę</h1>

      <form action={addInvoice}>
        <select name="apartment_id">
          {apartments?.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select name="type">
          <option value="electricity">Prąd</option>
          <option value="gas">Gaz</option>
        </select>

        <input name="amount" placeholder="Kwota" />
        <input name="month" placeholder="Miesiąc" />
        <input name="year" placeholder="Rok" />

        <button type="submit">Dodaj</button>
      </form>
    </main>
  );
}