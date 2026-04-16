import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Pobranie danych
  const { data: rents } = await supabase.from("monthly_rent").select("*");
  const { data: advances } = await supabase.from("monthly_advances").select("*");
  const { data: invoices } = await supabase.from("utility_invoices").select("*");

  const rows: string[] = [];

  // Nagłówki CSV
  rows.push("type,apartment_id,month,year,amount,status");

  // Czynsze
  (rents ?? []).forEach((r) => {
    rows.push(
      [
        "rent",
        r.apartment_id,
        r.month,
        r.year,
        Number(r.amount ?? 0).toFixed(2),
        r.status,
      ].join(",")
    );
  });

  // Zaliczki
  (advances ?? []).forEach((a) => {
    rows.push(
      [
        "advance",
        a.apartment_id,
        a.month,
        a.year,
        Number(a.amount ?? 0).toFixed(2),
        a.status,
      ].join(",")
    );
  });

  // Faktury
  (invoices ?? []).forEach((i) => {
    rows.push(
      [
        "invoice",
        i.apartment_id,
        i.month,
        i.year,
        Number(i.amount ?? 0).toFixed(2),
        i.status,
      ].join(",")
    );
  });

  const csvContent = rows.join("\n");

  return new Response(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=export.csv",
    },
  });
}