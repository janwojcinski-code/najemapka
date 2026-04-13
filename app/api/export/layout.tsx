import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: rents } = await supabase.from("monthly_rent").select("*");
  const { data: advances } = await supabase.from("monthly_advances").select("*");
  const { data: invoices } = await supabase.from("utility_invoices").select("*");

  const rows: string[] = [];

  rows.push("type,apartment_id,month,year,amount,status");

  (rents ?? []).forEach((r) => {
    rows.push(`rent,${r.apartment_id},${r.month},${r.year},${r.amount},${r.status}`);
  });

  (advances ?? []).forEach((a) => {
    rows.push(`advance,${a.apartment_id},${a.month},${a.year},${a.amount},${a.status}`);
  });

  (invoices ?? []).forEach((i) => {
    rows.push(`invoice,${i.apartment_id},${i.month},${i.year},${i.amount},${i.status}`);
  });

  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=export.csv",
    },
  });
}