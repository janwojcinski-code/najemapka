import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import TenantTopbar from "@/components/tenant-topbar";

export default async function TenantSettlementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let profile;
  try {
    profile = await requireAuthenticatedProfile(["tenant"]);
  } catch {
    redirect("/logowanie");
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from("tenant_assignments")
    .select("apartment_id")
    .eq("tenant_user_id", profile.id)
    .is("end_date", null)
    .single();

  if (!assignment) {
    redirect("/najemca/dashboard");
  }

  const { data: settlement } = await supabase
    .from("settlements")
    .select("id, apartment_id, month, year, total_amount, status")
    .eq("id", Number(id))
    .eq("apartment_id", assignment.apartment_id)
    .single();

  if (!settlement) {
    redirect("/najemca/rozliczenia");
  }

  const { data: readings } = await supabase
    .from("meter_readings")
    .select("reading_date, cold_water, hot_water, electricity, gas")
    .eq("apartment_id", assignment.apartment_id)
    .order("reading_date", { ascending: false })
    .limit(2);

  const latest = readings?.[0];
  const previous = readings?.[1];

  const coldDiff = Math.max((latest?.cold_water ?? 0) - (previous?.cold_water ?? 0), 0);
  const hotDiff = Math.max((latest?.hot_water ?? 0) - (previous?.hot_water ?? 0), 0);
  const electricityDiff = Math.max((latest?.electricity ?? 0) - (previous?.electricity ?? 0), 0);
  const gasDiff = Math.max((latest?.gas ?? 0) - (previous?.gas ?? 0), 0);

  return (
    <main style={{ padding: "2rem", maxWidth: "760px", margin: "0 auto" }}>
      <TenantTopbar />

      <div style={{ marginBottom: "16px" }}>
        <Link
          href="/najemca/rozliczenia"
          style={{ textDecoration: "none", color: "#0B5CAD", fontWeight: 600 }}
        >
          ← Wróć do rozliczeń
        </Link>
      </div>

      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
        Szczegóły rozliczenia
      </h1>
      <p style={{ margin: "0 0 24px", color: "#667085" }}>
        Okres: {settlement.month}/{settlement.year}
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
        <div style={{ marginBottom: "16px" }}>
          <strong>Status:</strong>{" "}
          {settlement.status === "paid" ? "Opłacone" : "Nieopłacone"}
        </div>

        <div style={{ marginBottom: "16px" }}>
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
        <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>Zużycie mediów</h2>

        <DetailRow label="Zimna woda" value={`${coldDiff.toFixed(2)} m³`} />
        <DetailRow label="Ciepła woda" value={`${hotDiff.toFixed(2)} m³`} />
        <DetailRow label="Prąd" value={`${electricityDiff.toFixed(2)} kWh`} />
        <DetailRow label="Gaz" value={`${gasDiff.toFixed(2)} m³`} />
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