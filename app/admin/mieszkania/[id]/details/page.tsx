import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";

export default async function ApartmentDetailsPage({
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
  const apartmentId = Number(id);
  const supabase = await createClient();

  const { data: apartment } = await supabase
    .from("apartments")
    .select("*")
    .eq("id", apartmentId)
    .single();

  if (!apartment) redirect("/admin/mieszkania");

  const [{ data: readings }, { data: settlements }, { data: assignments }, { data: tariffs }] =
    await Promise.all([
      supabase
        .from("meter_readings")
        .select("*")
        .eq("apartment_id", apartment.id)
        .order("reading_date", { ascending: false })
        .limit(5),

      supabase
        .from("settlements")
        .select("id, month, year, total_amount, status")
        .eq("apartment_id", apartment.id)
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .limit(5),

      supabase
        .from("tenant_assignments")
        .select(
          `
          id,
          start_date,
          end_date,
          tenant_user_id,
          profiles (
            id,
            email,
            full_name
          )
        `
        )
        .eq("apartment_id", apartment.id)
        .is("end_date", null),

      supabase
        .from("utility_prices")
        .select("*")
        .or(`apartment_id.is.null,apartment_id.eq.${apartment.id}`)
        .order("effective_from", { ascending: false }),
    ]);

  const activeAssignment = assignments?.[0];
  const tenant = activeAssignment
    ? Array.isArray(activeAssignment.profiles)
      ? activeAssignment.profiles[0]
      : activeAssignment.profiles
    : null;

  return (
    <main style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <AdminTopbar />

      <div style={{ marginBottom: "16px" }}>
        <Link
          href="/admin/mieszkania"
          style={{ textDecoration: "none", color: "#0B5CAD", fontWeight: 600 }}
        >
          ← Wróć do mieszkań
        </Link>
      </div>

      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
        {apartment.name || `Mieszkanie ${apartment.id}`}
      </h1>
      <p style={{ margin: "0 0 24px", color: "#667085" }}>{apartment.address}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <InfoCard
          title="Status"
          value={apartment.is_active ? "Aktywne" : "Nieaktywne"}
        />
        <InfoCard
          title="Aktywny najemca"
          value={tenant ? `${tenant.full_name || tenant.email}` : "Brak"}
          link={tenant ? `/admin/najemcy/${tenant.id}` : undefined}
        />
      </div>

      <Section title="Aktywne taryfy">
        {(tariffs ?? []).length === 0 ? (
          <EmptyText text="Brak taryf globalnych i przypisanych do mieszkania." />
        ) : (
          tariffs.map((tariff: any) => {
            const scope =
              tariff.apartment_id === apartment.id ? "Per mieszkanie" : "Globalna";

            return (
              <Row
                key={tariff.id}
                left={
                  <div>
                    <div style={{ fontWeight: 600 }}>{tariff.utility_type}</div>
                    <div style={{ fontSize: "13px", color: "#667085" }}>
                      {scope} • od {tariff.effective_from}
                    </div>
                  </div>
                }
                right={
                  <Link
                    href={`/admin/taryfy/${tariff.id}`}
                    style={{ color: "#0B5CAD", textDecoration: "none", fontWeight: 600 }}
                  >
                    {Number(tariff.price_gross ?? tariff.price ?? 0).toFixed(4)}
                  </Link>
                }
              />
            );
          })
        )}
      </Section>

      <Section title="Ostatnie odczyty">
        {(readings ?? []).length === 0 ? (
          <EmptyText text="Brak odczytów." />
        ) : (
          readings.map((r: any) => (
            <Row
              key={r.id}
              left={
                <div>
                  <div style={{ fontWeight: 600 }}>{r.reading_date}</div>
                  <div style={{ fontSize: "13px", color: "#667085" }}>
                    ZW: {r.cold_water ?? "—"} • CW: {r.hot_water ?? "—"} • Prąd:{" "}
                    {r.electricity ?? "—"} • Gaz: {r.gas ?? "—"}
                  </div>
                </div>
              }
              right={<span style={{ color: "#667085" }}>Odczyt</span>}
            />
          ))
        )}
      </Section>

      <Section title="Ostatnie rozliczenia">
        {(settlements ?? []).length === 0 ? (
          <EmptyText text="Brak rozliczeń." />
        ) : (
          settlements.map((s: any) => (
            <Row
              key={s.id}
              left={
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {s.month}/{s.year}
                  </div>
                  <div style={{ fontSize: "13px", color: "#667085" }}>
                    {s.status === "paid" ? "Opłacone" : "Nieopłacone"}
                  </div>
                </div>
              }
              right={
                <Link
                  href={`/admin/rozliczenia/${s.id}`}
                  style={{ color: "#0B5CAD", textDecoration: "none", fontWeight: 600 }}
                >
                  {Number(s.total_amount ?? 0).toFixed(2)} zł
                </Link>
              }
            />
          ))
        )}
      </Section>
    </main>
  );
}

function InfoCard({
  title,
  value,
  link,
}: {
  title: string;
  value: string;
  link?: string;
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #E5E7EB",
        borderRadius: "18px",
        padding: "20px",
      }}
    >
      <div style={{ fontSize: "12px", color: "#667085", marginBottom: "8px" }}>
        {title}
      </div>
      {link ? (
        <Link href={link} style={{ textDecoration: "none", color: "#0B5CAD", fontWeight: 700 }}>
          {value}
        </Link>
      ) : (
        <div style={{ fontWeight: 700 }}>{value}</div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "white",
        border: "1px solid #E5E7EB",
        borderRadius: "20px",
        padding: "20px",
        marginBottom: "20px",
      }}
    >
      <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>{title}</h2>
      {children}
    </section>
  );
}

function Row({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid #F1F5F9",
        gap: "16px",
      }}
    >
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

function EmptyText({ text }: { text: string }) {
  return <div style={{ color: "#667085" }}>{text}</div>;
}