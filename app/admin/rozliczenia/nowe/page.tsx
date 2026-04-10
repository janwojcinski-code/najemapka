import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

async function createSettlement(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const apartmentId = Number(formData.get("apartment_id"));
  const month = Number(formData.get("month"));
  const year = Number(formData.get("year"));

  if (!apartmentId || !month || !year) {
    redirect("/admin/rozliczenia/nowe?error=missing_fields");
  }

  const { data: existingSettlement } = await supabase
    .from("settlements")
    .select("id")
    .eq("apartment_id", apartmentId)
    .eq("month", month)
    .eq("year", year)
    .maybeSingle();

  if (existingSettlement) {
    redirect("/admin/rozliczenia/nowe?error=duplicate_settlement");
  }

  const { data: readings } = await supabase
    .from("meter_readings")
    .select("reading_date, cold_water, hot_water, electricity, gas")
    .eq("apartment_id", apartmentId)
    .order("reading_date", { ascending: false })
    .limit(2);

  if (!readings || readings.length < 2) {
    redirect("/admin/rozliczenia/nowe?error=not_enough_readings");
  }

  const latest = readings[0];
  const previous = readings[1];

  const coldDiff = Math.max((latest.cold_water ?? 0) - (previous.cold_water ?? 0), 0);
  const hotDiff = Math.max((latest.hot_water ?? 0) - (previous.hot_water ?? 0), 0);
  const electricityDiff = Math.max((latest.electricity ?? 0) - (previous.electricity ?? 0), 0);
  const gasDiff = Math.max((latest.gas ?? 0) - (previous.gas ?? 0), 0);

  const { data: prices } = await supabase
    .from("utility_prices")
    .select("utility_type, price, price_gross, effective_from")
    .lte("effective_from", `${year}-${String(month).padStart(2, "0")}-31`)
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

  const total =
    coldCost +
    hotCost +
    electricityCost +
    gasCost;

  const { error } = await supabase.from("settlements").insert({
    apartment_id: apartmentId,
    month,
    year,
    total_amount: Number(total.toFixed(2)),
    status: "pending",
  });

  if (error) {
    redirect("/admin/rozliczenia/nowe?error=save_failed");
  }

  redirect("/admin/rozliczenia");
}

export default async function NewSettlementPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  try {
    await requireAuthenticatedProfile(["admin"]);
  } catch {
    redirect("/logowanie");
  }

  const supabase = await createClient();

  const { data: apartments } = await supabase
    .from("apartments")
    .select("id, name, address, is_active")
    .eq("is_active", true)
    .order("id", { ascending: false });

  const params = (await searchParams) || {};
  const error =
    params.error === "missing_fields"
      ? "Uzupełnij wszystkie pola."
      : params.error === "duplicate_settlement"
      ? "Rozliczenie dla tego mieszkania i miesiąca już istnieje."
      : params.error === "not_enough_readings"
      ? "Potrzebne są co najmniej 2 odczyty dla tego mieszkania."
      : params.error === "save_failed"
      ? "Nie udało się zapisać rozliczenia."
      : null;

  const now = new Date();

  return (
    <main style={{ padding: "2rem", maxWidth: "760px", margin: "0 auto" }}>
      <AdminTopbar />

      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
        Generuj rozliczenie
      </h1>
      <p style={{ margin: "0 0 24px", color: "#667085" }}>
        System policzy zużycie na podstawie 2 ostatnich odczytów i aktualnych taryf.
      </p>

      <form
        action={createSettlement}
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          padding: "24px",
        }}
      >
        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 14px",
              borderRadius: "12px",
              background: "#FEF2F2",
              color: "#B91C1C",
              border: "1px solid #FECACA",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="apartment_id"
            style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
          >
            Mieszkanie
          </label>
          <select
            id="apartment_id"
            name="apartment_id"
            defaultValue=""
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #D0D5DD",
            }}
          >
            <option value="" disabled>
              Wybierz mieszkanie
            </option>
            {(apartments ?? []).map((apartment) => (
              <option key={apartment.id} value={apartment.id}>
                {apartment.name || `Mieszkanie ${apartment.id}`} — {apartment.address}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div>
            <label
              htmlFor="month"
              style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
            >
              Miesiąc
            </label>
            <input
              id="month"
              name="month"
              type="number"
              min="1"
              max="12"
              defaultValue={now.getMonth() + 1}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #D0D5DD",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="year"
              style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
            >
              Rok
            </label>
            <input
              id="year"
              name="year"
              type="number"
              defaultValue={now.getFullYear()}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #D0D5DD",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="submit"
            style={{
              background: "#0B5CAD",
              color: "white",
              border: "none",
              borderRadius: "999px",
              padding: "12px 18px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Wygeneruj rozliczenie
          </button>

          <a
            href="/admin/rozliczenia"
            style={{
              textDecoration: "none",
              border: "1px solid #D0D5DD",
              borderRadius: "999px",
              padding: "12px 18px",
              color: "#344054",
              fontWeight: 600,
            }}
          >
            Anuluj
          </a>
        </div>
      </form>
    </main>
  );
}