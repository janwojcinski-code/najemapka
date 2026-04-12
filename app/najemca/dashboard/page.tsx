import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import {
  formatPolishDate,
  getTenantDeadlineState,
} from "@/lib/billing/deadlines";
import TenantTopbar from "@/components/tenant-topbar";

export default async function TenantDashboardPage() {
  let profile;
  try {
    profile = await requireAuthenticatedProfile(["tenant"]);
  } catch {
    redirect("/logowanie");
  }

  const supabase = await createClient();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const { data: assignment } = await supabase
    .from("tenant_assignments")
    .select(
      `
      id,
      apartment_id,
      start_date,
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

  const apt = assignment
    ? Array.isArray(assignment.apartments)
      ? assignment.apartments[0]
      : assignment.apartments
    : null;

  const [readingsRes, settlementsRes, advanceRes, rentRes] = assignment
    ? await Promise.all([
        supabase
          .from("meter_readings")
          .select("*")
          .eq("apartment_id", assignment.apartment_id)
          .order("reading_date", { ascending: false })
          .limit(1),

        supabase
          .from("settlements")
          .select("*")
          .eq("apartment_id", assignment.apartment_id)
          .order("year", { ascending: false })
          .order("month", { ascending: false })
          .limit(1),

        supabase
          .from("monthly_advances")
          .select("*")
          .eq("apartment_id", assignment.apartment_id)
          .eq("month", currentMonth)
          .eq("year", currentYear)
          .maybeSingle(),

        supabase
          .from("monthly_rent")
          .select("*")
          .eq("apartment_id", assignment.apartment_id)
          .eq("month", currentMonth)
          .eq("year", currentYear)
          .maybeSingle(),
      ])
    : [{ data: [] }, { data: [] }, { data: null }, { data: null }];

  const lastReading = readingsRes.data?.[0];
  const lastSettlement = settlementsRes.data?.[0];
  const currentAdvance = advanceRes.data;
  const currentRent = rentRes.data;

  const deadline = getTenantDeadlineState();

  const firstName =
    profile.full_name?.trim()?.split(" ")[0] ||
    profile.email?.split("@")[0] ||
    "Użytkowniku";

  const advanceAmount = Number(currentAdvance?.amount ?? 0);
  const settlementAmount = Number(lastSettlement?.total_amount ?? 0);
  const mediaBalance = Math.max(settlementAmount - advanceAmount, 0);

  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <TenantTopbar />

      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
        Witaj, {firstName}!
      </h1>

      <div
        style={{
          background: "#fff5f5",
          border: "1px solid #ffd0d0",
          borderRadius: "12px",
          padding: "14px 16px",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: "6px" }}>
          Termin płatności
        </div>

        {deadline.isBeforeDue ? (
          <>
            <span style={{ color: "#e53e3e", fontWeight: 600 }}>
              Pozostało {deadline.daysUntilDue} dni
            </span>
            <span style={{ color: "#888" }}>
              {" "}
              • Termin: {formatPolishDate(deadline.dueDate)}
            </span>
          </>
        ) : (
          <>
            <span style={{ color: "#b91c1c", fontWeight: 600 }}>
              Po terminie o {deadline.daysOverdue} dni
            </span>
            <span style={{ color: "#888" }}>
              {" "}
              • Termin: {formatPolishDate(deadline.dueDate)}
            </span>
          </>
        )}
      </div>

      {apt && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            border: "1px solid #eee",
            borderRadius: "12px",
            background: "white",
          }}
        >
          <div style={{ fontWeight: 600 }}>{apt.name}</div>
          <div style={{ color: "#666" }}>{apt.address}</div>
          {assignment?.start_date && (
            <div style={{ marginTop: "8px", color: "#888", fontSize: "14px" }}>
              Data rozpoczęcia umowy: {assignment.start_date}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "1.5rem",
        }}
      >
        <Box
          title="Zaliczka na media"
          value={`${advanceAmount.toFixed(2)} zł`}
          subtitle={`${currentMonth}/${currentYear}`}
        />
        <Box
          title="Saldo mediów po zaliczce"
          value={`${mediaBalance.toFixed(2)} zł`}
          subtitle="Ostatnie rozliczenie minus bieżąca zaliczka"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "1.5rem",
        }}
      >
        <Box
          title="Czynsz"
          value={`${Number(currentRent?.amount ?? 0).toFixed(2)} zł`}
          subtitle={`${currentMonth}/${currentYear}`}
        />
        <Box
          title="Status czynszu"
          value={currentRent?.status === "paid" ? "Opłacony" : "Nieopłacony"}
          subtitle="Ustalane przez administratora"
        />
      </div>

      {lastReading && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            border: "1px solid #eee",
            borderRadius: "12px",
            background: "white",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "8px" }}>
            Ostatni odczyt
          </div>

          <div>Zimna woda: {lastReading.cold_water} m³</div>
          <div>Ciepła woda: {lastReading.hot_water} m³</div>

          <div style={{ marginTop: "8px", color: "#888" }}>
            Prąd i gaz rozliczane na podstawie faktur administratora
          </div>
        </div>
      )}

      {lastSettlement && (
        <div
          style={{
            padding: "1rem",
            border: "1px solid #eee",
            borderRadius: "12px",
            background: "white",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "8px" }}>
            Ostatnie rozliczenie
          </div>

          <div style={{ fontSize: "22px", fontWeight: 700 }}>
            {settlementAmount.toFixed(2)} zł
          </div>

          <div style={{ color: "#666" }}>
            {lastSettlement.month}/{lastSettlement.year}
          </div>

          <div style={{ marginTop: "8px" }}>
            Status: {lastSettlement.status}
          </div>
        </div>
      )}
    </main>
  );
}

function Box({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div
      style={{
        padding: "1rem",
        border: "1px solid #eee",
        borderRadius: "12px",
        background: "white",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: "8px" }}>{title}</div>
      <div style={{ fontSize: "22px", fontWeight: 700 }}>{value}</div>
      <div style={{ marginTop: "8px", color: "#666", fontSize: "14px" }}>
        {subtitle}
      </div>
    </div>
  );
}