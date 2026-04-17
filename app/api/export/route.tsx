import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const url = new URL(request.url);
  const monthParam = url.searchParams.get("month");
  const yearParam = url.searchParams.get("year");

  const month = monthParam ? Number(monthParam) : null;
  const year = yearParam ? Number(yearParam) : null;

  let rentsQuery = supabase.from("monthly_rent").select("*");
  let advancesQuery = supabase.from("monthly_advances").select("*");
  let invoicesQuery = supabase.from("utility_invoices").select("*");

  if (month) {
    rentsQuery = rentsQuery.eq("month", month);
    advancesQuery = advancesQuery.eq("month", month);
    invoicesQuery = invoicesQuery.eq("month", month);
  }

  if (year) {
    rentsQuery = rentsQuery.eq("year", year);
    advancesQuery = advancesQuery.eq("year", year);
    invoicesQuery = invoicesQuery.eq("year", year);
  }

  const [{ data: rents }, { data: advances }, { data: invoices }] = await Promise.all([
    rentsQuery,
    advancesQuery,
    invoicesQuery,
  ]);

  const rows: string[] = [];
  rows.push("type,apartment_id,month,year,amount,status");

  (rents ?? []).forEach((r: any) => {
    rows.push(
      [
        "rent",
        r.apartment_id,
        r.month,
        r.year,
        Number(r.amount ?? 0).toFixed(2),
        r.status ?? "",
      ].join(",")
    );
  });

  (advances ?? []).forEach((a: any) => {
    rows.push(
      [
        "advance",
        a.apartment_id,
        a.month,
        a.year,
        Number(a.amount ?? 0).toFixed(2),
        a.status ?? "",
      ].join(",")
    );
  });

  (invoices ?? []).forEach((i: any) => {
    rows.push(
      [
        "invoice",
        i.apartment_id,
        i.month,
        i.year,
        Number(i.amount ?? 0).toFixed(2),
        i.status ?? "",
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