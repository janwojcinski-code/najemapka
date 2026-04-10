import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import TenantTopbar from "@/components/tenant-topbar";

async function saveReading(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const apartmentId = Number(formData.get("apartment_id"));
  const readingDate = String(formData.get("reading_date") || "");
  const coldWaterRaw = String(formData.get("cold_water") || "").trim();
  const hotWaterRaw = String(formData.get("hot_water") || "").trim();
  const electricityRaw = String(formData.get("electricity") || "").trim();
  const gasRaw = String(formData.get("gas") || "").trim();

  if (!apartmentId || !readingDate) {
    redirect("/najemca/odczyty/nowy?error=missing_fields");
  }

  const cold_water = coldWaterRaw ? Number(coldWaterRaw) : null;
  const hot_water = hotWaterRaw ? Number(hotWaterRaw) : null;
  const electricity = electricityRaw ? Number(electricityRaw) : null;
  const gas = gasRaw ? Number(gasRaw) : null;

  const { data: lastReading } = await supabase
    .from("meter_readings")
    .select("cold_water, hot_water, electricity, gas")
    .eq("apartment_id", apartmentId)
    .order("reading_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const invalid =
    (cold_water !== null &&
      lastReading?.cold_water !== null &&
      lastReading?.cold_water !== undefined &&
      cold_water < lastReading.cold_water) ||
    (hot_water !== null &&
      lastReading?.hot_water !== null &&
      lastReading?.hot_water !== undefined &&
      hot_water < lastReading.hot_water) ||
    (electricity !== null &&
      lastReading?.electricity !== null &&
      lastReading?.electricity !== undefined &&
      electricity < lastReading.electricity) ||
    (gas !== null &&
      lastReading?.gas !== null &&
      lastReading?.gas !== undefined &&
      gas < lastReading.gas);

  if (invalid) {
    redirect("/najemca/odczyty/nowy?error=lower_than_previous");
  }

  const { error } = await supabase.from("meter_readings").insert({
    apartment_id: apartmentId,
    reading_date: readingDate,
    cold_water,
    hot_water,
    electricity,
    gas,
  });

  if (error) {
    redirect("/najemca/odczyty/nowy?error=save_failed");
  }

  redirect("/najemca/odczyty");
}

export default async function NewReadingPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  let profile;
  try {
    profile = await requireAuthenticatedProfile(["tenant"]);
  } catch {
    redirect("/logowanie");
  }

  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from("tenant_assignments")
    .select(
      `
      id,
      apartment_id,
      apartments (
        id,
        name,
        address
      )
    `
    )
    .eq("tenant_user_id", profile.id)
    .is("end_date", null)
    .single();

  if (!assignment) {
    redirect("/najemca/dashboard");
  }

  const apartment = Array.isArray(assignment.apartments)
    ? assignment.apartments[0]
    : assignment.apartments;

  const { data: lastReading } = await supabase
    .from("meter_readings")
    .select("cold_water, hot_water, electricity, gas, reading_date")
    .eq("apartment_id", assignment.apartment_id)
    .order("reading_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const params = (await searchParams) || {};
  const error =
    params.error === "missing_fields"
      ? "Uzupełnij wymagane pola."
      : params.error === "lower_than_previous"
      ? "Nowy odczyt nie może być mniejszy od poprzedniego."
      : params.error === "save_failed"
      ? "Nie udało się zapisać odczytu."
      : null;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main style={{ padding: "2rem", maxWidth: "760px", margin: "0 auto" }}>
      <TenantTopbar />

      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
        Dodaj odczyt liczników
      </h1>
      <p style={{ margin: "0 0 24px", color: "#667085" }}>
        Mieszkanie: {apartment?.name || "—"} — {apartment?.address || "—"}
      </p>

      <form
        action={saveReading}
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          padding: "24px",
        }}
      >
        <input type="hidden" name="apartment_id" value={assignment.apartment_id} />
<input type="file" name="photo" accept="image/*" />
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

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="reading_date"
            style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
          >
            Data odczytu
          </label>
          <input
            id="reading_date"
            name="reading_date"
            type="date"
            defaultValue={today}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #D0D5DD",
            }}
          />
        </div>

        <ReadingField
          name="cold_water"
          label="Zimna woda (m³)"
          previousValue={lastReading?.cold_water}
        />

        <ReadingField
          name="hot_water"
          label="Ciepła woda (m³)"
          previousValue={lastReading?.hot_water}
        />

        <ReadingField
          name="electricity"
          label="Prąd (kWh)"
          previousValue={lastReading?.electricity}
        />

        <ReadingField
          name="gas"
          label="Gaz (m³)"
          previousValue={lastReading?.gas}
        />

        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
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
            Zapisz odczyt
          </button>

          <a
            href="/najemca/odczyty"
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

function ReadingField({
  name,
  label,
  previousValue,
}: {
  name: string;
  label: string;
  previousValue: number | null | undefined;
}) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label
        htmlFor={name}
        style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
      >
        {label}
      </label>
      {previousValue !== null && previousValue !== undefined && (
        <div
          style={{
            marginBottom: "6px",
            fontSize: "13px",
            color: "#667085",
          }}
        >
          Poprzedni odczyt: {previousValue}
        </div>
      )}
      <input
        id={name}
        name={name}
        type="number"
        step="0.01"
        placeholder="Wpisz aktualny stan"
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: "12px",
          border: "1px solid #D0D5DD",
        }}
      />
    </div>
  );
}