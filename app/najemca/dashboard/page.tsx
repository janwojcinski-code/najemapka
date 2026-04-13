import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import TenantTopbar from "@/components/tenant-topbar";

function getDisplayName(profile: any) {
  if (profile?.full_name?.trim()) return profile.full_name.trim().split(" ")[0];
  if (profile?.email) return profile.email.split("@")[0];
  return "Użytkowniku";
}

function getDueDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 10);
}

function formatDatePL(date: Date) {
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
  });
}

function getDeadlineStatus() {
  const today = new Date();
  const due = getDueDate();

  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  const diff = Math.ceil(
    (dueOnly.getTime() - todayOnly.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff < 0) {
    return {
      label: `Po terminie o ${Math.abs(diff)} dni`,
      color: "#B91C1C",
      bg: "#FEF2F2",
      border: "#FECACA",
    };
  }

  if (diff <= 3) {
    return {
      label: `Zostały ${diff} dni`,
      color: "#C2410C",
      bg: "#FFF7ED",
      border: "#FED7AA",
    };
  }

  return {
    label: "W terminie",
    color: "#166534",
    bg: "#F0FDF4",
    border: "#BBF7D0",
  };
}

function formatMoney(value: number) {
  return value.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function TenantDashboardPage() {
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

  if (!assignment) {
    return (
      <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <TenantTopbar />
        <div
          style={{
            marginTop: "24px",
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: "20px",
            padding: "24px",
          }}
        >
          <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
            Witaj, {getDisplayName(profile)}!
          </h1>
          <p style={{ color: "#667085", margin: 0 }}>
            Nie masz jeszcze przypisanego mieszkania. Skontaktuj się z administratorem.
          </p>
        </div>
      </main>
    );
  }

  const apartment = Array.isArray(assignment.apartments)
    ? assignment.apartments[0]
    : assignment.apartments;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [rentRes, advanceRes, invoicesRes, readingsRes, settlementsRes] =
    await Promise.all([
      supabase
        .from("monthly_rent")
        .select("*")
        .eq("apartment_id", assignment.apartment_id)
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .maybeSingle(),

      supabase
        .from("monthly_advances")
        .select("*")
        .eq("apartment_id", assignment.apartment_id)
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .maybeSingle(),

      supabase
        .from("utility_invoices")
        .select("*")
        .eq("apartment_id", assignment.apartment_id)
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .order("created_at", { ascending: false }),

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
    ]);

  const rent = rentRes.data;
  const advance = advanceRes.data;
  const invoices = invoicesRes.data ?? [];
  const lastReading = readingsRes.data?.[0];
  const lastSettlement = settlementsRes.data?.[0];

  const rentAmount = Number(rent?.amount ?? 0);
  const advanceAmount = Number(advance?.amount ?? 0);
  const invoicesSum = invoices.reduce(
    (sum: number, inv: any) => sum + Number(inv.amount ?? 0),
    0
  );

  const totalToPay = Math.max(rentAmount + invoicesSum - advanceAmount, 0);

  const deadline = getDeadlineStatus();
  const dueDate = getDueDate();

  const rentPaid = rent?.status === "paid";
  const advancePaid = advance?.status === "paid";

  return (
    <main style={{ padding: "2rem", maxWidth: "960px", margin: "0 auto" }}>
      <TenantTopbar />

      <div style={{ marginTop: "20px", marginBottom: "24px" }}>
        <div style={{ color: "#667085", fontSize: "14px", marginBottom: "8px" }}>
          Panel najemcy
        </div>
        <h1 style={{ fontSize: "40px", lineHeight: 1.1, fontWeight: 800, margin: 0 }}>
          Witaj, {getDisplayName(profile)}!
        </h1>
      </div>

      <section
        style={{
          background: "linear-gradient(135deg, #0B5CAD 0%, #1D4ED8 100%)",
          color: "white",
          borderRadius: "24px",
          padding: "28px",
          marginBottom: "20px",
          boxShadow: "0 12px 32px rgba(11, 92, 173, 0.18)",
        }}
      >
        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>
          Do zapłaty w tym miesiącu
        </div>

        <div style={{ fontSize: "48px", fontWeight: 800, lineHeight: 1, marginBottom: "14px" }}>
          {formatMoney(totalToPay)} zł
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 14px",
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "999px",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "18px",
          }}
        >
          <span>{deadline.label}</span>
          <span style={{ opacity: 0.8 }}>•</span>
          <span>Termin: {formatDatePL(dueDate)}</span>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link
            href="/najemca/rozliczenia"
            style={{
              textDecoration: "none",
              background: "white",
              color: "#0B5CAD",
              padding: "12px 18px",
              borderRadius: "999px",
              fontWeight: 700,
            }}
          >
            Zobacz szczegóły
          </Link>

          <Link
            href="/najemca/odczyty/nowy"
            style={{
              textDecoration: "none",
              background: "transparent",
              color: "white",
              padding: "12px 18px",
              borderRadius: "999px",
              fontWeight: 700,
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            Dodaj odczyt
          </Link>
        </div>
      </section>

      <section
        style={{
          background: deadline.bg,
          border: `1px solid ${deadline.border}`,
          borderRadius: "18px",
          padding: "16px 18px",
          marginBottom: "20px",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: "6px" }}>Termin płatności</div>
        <div style={{ color: deadline.color, fontWeight: 700, marginBottom: "4px" }}>
          {deadline.label}
        </div>
        <div style={{ color: "#667085", fontSize: "14px" }}>
          Płatność należy uregulować do {formatDatePL(dueDate)}.
        </div>
      </section>

      <section
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <div style={{ fontSize: "14px", color: "#667085", marginBottom: "8px" }}>
          Twoje mieszkanie
        </div>
        <div style={{ fontSize: "24px", fontWeight: 700, marginBottom: "6px" }}>
          {apartment?.name || "—"}
        </div>
        <div style={{ color: "#475467", marginBottom: "10px" }}>
          {apartment?.address || "—"}
        </div>
        <div style={{ color: "#667085", fontSize: "14px" }}>
          Umowa od: {assignment.start_date || "—"}
        </div>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <FinanceCard
          title="Czynsz"
          value={`${formatMoney(rentAmount)} zł`}
          subtitle={`${currentMonth}/${currentYear}`}
          statusLabel={rent ? (rentPaid ? "Opłacony" : "Nieopłacony") : "Brak danych"}
          statusColor={rent ? (rentPaid ? "#166534" : "#B91C1C") : "#667085"}
          statusBg={rent ? (rentPaid ? "#DCFCE7" : "#FEF2F2") : "#F3F4F6"}
        />

        <FinanceCard
          title="Zaliczka na media"
          value={`${formatMoney(advanceAmount)} zł`}
          subtitle={`${currentMonth}/${currentYear}`}
          statusLabel={advance ? (advancePaid ? "Wpłacona" : "Niewpłacona") : "Brak danych"}
          statusColor={advance ? (advancePaid ? "#166534" : "#B91C1C") : "#667085"}
          statusBg={advance ? (advancePaid ? "#DCFCE7" : "#FEF2F2") : "#F3F4F6"}
        />

        <FinanceCard
          title="Faktury (prąd/gaz)"
          value={`${formatMoney(invoicesSum)} zł`}
          subtitle={invoices.length > 0 ? `${invoices.length} pozycji` : "Brak faktur"}
        />

        <FinanceCard
          title="Saldo po zaliczce"
          value={`${formatMoney(totalToPay)} zł`}
          subtitle="Czynsz + faktury - zaliczka"
          highlighted
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        <section
          style={{
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: "20px",
            padding: "20px",
          }}
        >
          <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "14px" }}>
            Ostatni odczyt
          </div>

          {lastReading ? (
            <>
              <div style={{ marginBottom: "8px" }}>
                <strong>Zimna woda:</strong> {lastReading.cold_water ?? "—"} m³
              </div>
              <div style={{ marginBottom: "8px" }}>
                <strong>Ciepła woda:</strong> {lastReading.hot_water ?? "—"} m³
              </div>
              <div style={{ color: "#667085", fontSize: "14px", marginBottom: "10px" }}>
                Data odczytu: {lastReading.reading_date || "—"}
              </div>
              <div style={{ color: "#98A2B3", fontSize: "14px" }}>
                Prąd i gaz są rozliczane na podstawie faktur administratora.
              </div>
            </>
          ) : (
            <div style={{ color: "#667085" }}>Brak odczytów.</div>
          )}
        </section>

        <section
          style={{
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: "20px",
            padding: "20px",
          }}
        >
          <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "14px" }}>
            Ostatnie rozliczenie
          </div>

          {lastSettlement ? (
            <>
              <div style={{ fontSize: "28px", fontWeight: 800, marginBottom: "6px" }}>
                {formatMoney(Number(lastSettlement.total_amount ?? 0))} zł
              </div>
              <div style={{ color: "#667085", marginBottom: "8px" }}>
                Okres: {lastSettlement.month}/{lastSettlement.year}
              </div>
              <div style={{ marginBottom: "14px" }}>
                Status:{" "}
                <span style={{ fontWeight: 700 }}>
                  {lastSettlement.status === "paid" ? "Opłacone" : "Nieopłacone"}
                </span>
              </div>

              <Link
                href="/najemca/rozliczenia"
                style={{
                  textDecoration: "none",
                  color: "#0B5CAD",
                  fontWeight: 700,
                }}
              >
                Zobacz wszystkie rozliczenia
              </Link>
            </>
          ) : (
            <div style={{ color: "#667085" }}>Brak rozliczeń.</div>
          )}
        </section>
      </div>
    </main>
  );
}

function FinanceCard({
  title,
  value,
  subtitle,
  statusLabel,
  statusColor,
  statusBg,
  highlighted,
}: {
  title: string;
  value: string;
  subtitle: string;
  statusLabel?: string;
  statusColor?: string;
  statusBg?: string;
  highlighted?: boolean;
}) {
  return (
    <div
      style={{
        padding: "20px",
        border: highlighted ? "1px solid #C7D2FE" : "1px solid #E5E7EB",
        borderRadius: "20px",
        background: highlighted ? "#EEF2FF" : "white",
      }}
    >
      <div style={{ fontSize: "14px", color: "#667085", marginBottom: "10px" }}>
        {title}
      </div>
      <div style={{ fontSize: "36px", fontWeight: 800, lineHeight: 1.1, marginBottom: "10px" }}>
        {value}
      </div>
      <div style={{ color: "#667085", fontSize: "14px" }}>{subtitle}</div>

      {statusLabel ? (
        <div style={{ marginTop: "12px" }}>
          <span
            style={{
              display: "inline-block",
              padding: "6px 10px",
              borderRadius: "999px",
              background: statusBg || "#F3F4F6",
              color: statusColor || "#667085",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            {statusLabel}
          </span>
        </div>
      ) : null}
    </div>
  );
}