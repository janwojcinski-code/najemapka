import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import TenantTopbar from "@/components/tenant-topbar";

function getDisplayName(profile: any) {
  if (profile?.full_name) return profile.full_name.split(" ")[0];
  if (profile?.email) return profile.email.split("@")[0];
  return "Użytkowniku";
}

function getDueDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 10);
}

function getDeadlineStatus() {
  const today = new Date();
  const due = getDueDate();

  const diff = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff < 0) {
    return { label: `Po terminie o ${Math.abs(diff)} dni`, color: "#B91C1C" };
  }
  if (diff <= 3) {
    return { label: `Zostało ${diff} dni`, color: "#EA580C" };
  }

  return { label: "Termin: 10", color: "#059669" };
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
        <h1 style={{ fontSize: "32px", fontWeight: 700 }}>
          Witaj, {getDisplayName(profile)}!
        </h1>
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            background: "white",
          }}
        >
          Brak przypisanego mieszkania.
        </div>
      </main>
    );
  }

  const apartment = Array.isArray(assignment.apartments)
    ? assignment.apartments[0]
    : assignment.apartments;

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [rentRes, advanceRes, invoicesRes] = await Promise.all([
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
      .eq("year", currentYear),
  ]);

  const rent = rentRes.data;
  const advance = advanceRes.data;
  const invoices = invoicesRes.data || [];

  const rentAmount = Number(rent?.amount || 0);
  const advanceAmount = Number(advance?.amount || 0);

  const invoicesSum = invoices.reduce(
    (sum: number, i: any) => sum + Number(i.amount || 0),
    0
  );

  const totalToPay = rentAmount + invoicesSum - advanceAmount;

  const deadline = getDeadlineStatus();
  const displayName = getDisplayName(profile);

  return (
    <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <TenantTopbar />

      <h1 style={{ fontSize: "32px", fontWeight: 700 }}>
        Witaj, {displayName}!
      </h1>

      <div
        style={{
          marginTop: "16px",
          padding: "12px",
          borderRadius: "12px",
          background: "#F8FAFC",
          border: "1px solid #E5E7EB",
        }}
      >
        <strong>Termin płatności:</strong>{" "}
        <span style={{ color: deadline.color }}>{deadline.label}</span>
      </div>

      <div style={{ marginTop: "24px" }}>
        <h3>{apartment?.name}</h3>
        <p>{apartment?.address}</p>
        <small>Umowa od: {assignment.start_date || "—"}</small>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginTop: "24px",
        }}
      >
        <Box title="Czynsz" value={`${rentAmount.toFixed(2)} zł`} />
        <Box title="Zaliczka" value={`${advanceAmount.toFixed(2)} zł`} />
        <Box title="Faktury (prąd/gaz)" value={`${invoicesSum.toFixed(2)} zł`} />
        <Box title="Do zapłaty" value={`${totalToPay.toFixed(2)} zł`} highlight />
      </div>

      {invoices.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <h3>Faktury</h3>

          {invoices.map((inv: any) => (
            <div
              key={inv.id}
              style={{
                padding: "12px",
                borderBottom: "1px solid #eee",
                background: "white",
              }}
            >
              {inv.utility_type} — {Number(inv.amount || 0).toFixed(2)} zł —{" "}
              {inv.status}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function Box({
  title,
  value,
  highlight,
}: {
  title: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        padding: "16px",
        border: "1px solid #E5E7EB",
        borderRadius: "12px",
        background: highlight ? "#EEF2FF" : "white",
      }}
    >
      <div style={{ fontSize: "14px", color: "#667085" }}>{title}</div>
      <div style={{ fontSize: "22px", fontWeight: 700 }}>{value}</div>
    </div>
  );
}