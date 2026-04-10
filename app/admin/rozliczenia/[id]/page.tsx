import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

export default async function AdminSettlementDetailPage({
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

  const { data: settlement } = await supabase
    .from("settlements")
    .select(
      `
      id,
      apartment_id,
      month,
      year,
      total_amount,
      status,
      apartments (
        id,
        name,
        address
      )
    `
    )
    .eq("id", Number(id))
    .single();

  if (!settlement) {
    redirect("/admin/rozliczenia");
  }

  const apartment = Array.isArray(settlement.apartments)
    ? settlement.apartments[0]
    : settlement.apartments;

  const { data: readings } = await supabase
    .from("meter_readings")
    .select("reading_date, cold_water, hot_water, electricity, gas")
    .eq("apartment_id", settlement.apartment_id)
    .order("reading_date", { ascending: false })
    .limit(2);

  const latest = readings?.[0];
  const previous = readings?.[1];

  const coldDiff = Math.max((latest?.cold_water ?? 0) - (previous?.cold_water ?? 0), 0);
  const hotDiff = Math.max((latest?.hot_water ?? 0) - (previous?.hot_water ?? 0), 0);
  const electricityDiff = Math.max((latest?.electricity ?? 0) - (previous?.electricity ?? 0), 0);
  const gasDiff = Math.max((latest?.gas ?? 0) - (previous?.gas ?? 0), 0);

  const { data: prices } = await supabase
    .from("utility_prices")
    .select("utility_type, price, price_gross, effective_from")
    .lte("effective_from", `${settlement.year}-${String(settlement.month).padStart(2, "0")}-31`)
    .order("effective_from", { ascending: false });

  const getPrice = (type: string) => {
    const found = prices?.find((p: any) => p.utility_type === type);
    return Number(found?.price_gross ?? found?.price ?? 0);
  };

  const coldPrice = getPrice("cold_water");
  const hotPrice = getPrice("hot_water");
  const electricityPrice = getPrice("electricity");
  const gasPrice = getPrice("gas");

  const coldCost = coldDiff * coldPrice;
  const hotCost = hotDiff * hotPrice;
  const electricityCost = electricityDiff * electricityPrice;
  const gasCost = gasDiff * gasPrice;

  return (
    <main style={{ padding: "2rem", maxWidth: "860px", margin: "0 auto" }}>
      <AdminTopbar />

      <div style={{ marginBottom: "16px" }}>
        <Link
          href="/admin/rozliczenia"
          style={{ textDecoration: "none", color: "#0B5CAD", fontWeight: 600 }}
        >
          ← Wróć do rozliczeń
        </Link>
      </div>

      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
        Szczegóły rozliczenia
      </h1>
      <p style={{ margin: "0 0 24px", color: "#667085" }}>
        Mieszkanie: {apartment?.name || "—"} — {apartment?.address || "—"}
      </p>

      <div
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "20px",
        }}
      >
        <div style={{ marginBottom: "12px" }}>
          <strong>Okres:</strong> {settlement.month}/{settlement.year}
        </div>
        <div style={{ marginBottom: "12px" }}>
          <strong>Status:</strong>{" "}
          {settlement.status === "paid" ? "Opłacone" : "Nieopłacone"}
        </div>
        <div>
          <strong>Kwota całkowita:</strong> {settlement.total_amount?.toFixed(2)} zł
        </div>
      </div>

      <div
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          padding: "24px",
        }}
      >
        <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>Rozbicie kosztów</h2>

        <DetailRow
          label={`Zimna woda (${coldDiff.toFixed(2)} m³ × ${coldPrice.toFixed(4)})`}
          value={`${coldCost.toFixed(2)} zł`}
        />
        <DetailRow
          label={`Ciepła woda (${hotDiff.toFixed(2)} m³ × ${hotPrice.toFixed(4)})`}
          value={`${hotCost.toFixed(2)} zł`}
        />
        <DetailRow
          label={`Prąd (${electricityDiff.toFixed(2)} kWh × ${electricityPrice.toFixed(4)})`}
          value={`${electricityCost.toFixed(2)} zł`}
        />
        <DetailRow
          label={`Gaz (${gasDiff.toFixed(2)} m³ × ${gasPrice.toFixed(4)})`}
          value={`${gasCost.toFixed(2)} zł`}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "16px",
            marginTop: "12px",
            borderTop: "2px solid #E5E7EB",
            fontSize: "18px",
          }}
        >
          <strong>Suma</strong>
          <strong>{settlement.total_amount?.toFixed(2)} zł</strong>
        </div>
      </div>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "1px solid #F1F5F9",
      }}
    >
      <span style={{ color: "#667085" }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}