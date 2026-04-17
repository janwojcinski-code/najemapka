import { redirect } from "next/navigation";
import { requireAuthenticatedProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin-topbar";
import RentManagement from "@/components/admin/rent-management";

async function saveRent(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const apartmentId = Number(formData.get("apartment_id"));
  const month = Number(formData.get("month"));
  const year = Number(formData.get("year"));
  const amount = Number(formData.get("amount"));

  if (!apartmentId || !month || !year || Number.isNaN(amount)) {
    redirect("/admin/czynsz?error=Uzupełnij wszystkie pola");
  }

  const { error } = await supabase.from("monthly_rent").upsert(
    {
      apartment_id: apartmentId,
      month,
      year,
      amount,
      status: "unpaid",
    },
    {
      onConflict: "apartment_id,month,year",
    }
  );

  if (error) {
    redirect(`/admin/czynsz?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/czynsz");
}

async function saveDefaultRent(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const apartmentId = Number(formData.get("apartment_id"));
  const monthlyRentDefault = Number(formData.get("monthly_rent_default"));

  if (!apartmentId || Number.isNaN(monthlyRentDefault)) {
    redirect("/admin/czynsz?error=Nie udało się zapisać stawki domyślnej");
  }

  const { error } = await supabase
    .from("apartments")
    .update({ monthly_rent_default: monthlyRentDefault })
    .eq("id", apartmentId);

  if (error) {
    redirect(`/admin/czynsz?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/czynsz");
}

async function markRentPaid(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const id = Number(formData.get("id"));

  if (!id) redirect("/admin/czynsz");

  const { error } = await supabase
    .from("monthly_rent")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/czynsz?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/czynsz");
}

export default async function AdminRentPage({
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
  const now = new Date();

  const [{ data: apartments }, { data: rentItems }] = await Promise.all([
    supabase
      .from("apartments")
      .select("id, name, address, is_active, monthly_rent_default")
      .eq("is_active", true)
      .order("id", { ascending: false }),
    supabase
      .from("monthly_rent")
      .select(
        `
        id,
        apartment_id,
        month,
        year,
        amount,
        status,
        apartments (
          id,
          name,
          address
        )
      `
      )
      .order("year", { ascending: false })
      .order("month", { ascending: false }),
  ]);

  const safeApartments = apartments ?? [];
  const safeRentItems = rentItems ?? [];

  const params = (await searchParams) || {};
  const error = params.error || null;

  return (
    <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <AdminTopbar />

      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>
        Czynsz
      </h1>
      <p style={{ margin: "0 0 24px", color: "#667085" }}>
        Ustaw domyślne stawki czynszu per mieszkanie i księguj czynsz miesięczny.
      </p>

      {error ? (
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
      ) : null}

      <RentManagement
        apartments={safeApartments}
        currentMonth={now.getMonth() + 1}
        currentYear={now.getFullYear()}
        saveRentAction={saveRent}
        saveDefaultRentAction={saveDefaultRent}
      />

      <section
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 100px 100px 140px 140px 180px",
            gap: "16px",
            padding: "16px 20px",
            borderBottom: "1px solid #E5E7EB",
            fontSize: "13px",
            color: "#667085",
            fontWeight: 700,
          }}
        >
          <div>Mieszkanie</div>
          <div>Miesiąc</div>
          <div>Rok</div>
          <div>Czynsz</div>
          <div>Status</div>
          <div>Akcja</div>
        </div>

        {safeRentItems.length === 0 ? (
          <div style={{ padding: "24px 20px", color: "#667085" }}>
            Brak zapisanych czynszów.
          </div>
        ) : (
          safeRentItems.map((rent: any) => {
            const apartment = Array.isArray(rent.apartments)
              ? rent.apartments[0]
              : rent.apartments;
            const isPaid = rent.status === "paid";

            return (
              <div
                key={rent.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 100px 100px 140px 140px 180px",
                  gap: "16px",
                  padding: "16px 20px",
                  borderBottom: "1px solid #F1F5F9",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{apartment?.name || "—"}</div>
                  <div style={{ fontSize: "13px", color: "#667085" }}>
                    {apartment?.address || "—"}
                  </div>
                </div>

                <div>{rent.month}</div>
                <div>{rent.year}</div>
                <div style={{ fontWeight: 700 }}>
                  {Number(rent.amount ?? 0).toFixed(2)} zł
                </div>

                <div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      background: isPaid ? "#DCFCE7" : "#FEF2F2",
                      color: isPaid ? "#166534" : "#B91C1C",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {isPaid ? "Opłacony" : "Nieopłacony"}
                  </span>
                </div>

                <div>
                  {!isPaid ? (
                    <form action={markRentPaid}>
                      <input type="hidden" name="id" value={rent.id} />
                      <button type="submit" style={darkButtonStyle}>
                        Oznacz jako opłacony
                      </button>
                    </form>
                  ) : (
                    <span style={{ color: "#98A2B3", fontSize: "13px" }}>
                      Brak akcji
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}

const darkButtonStyle: React.CSSProperties = {
  background: "#111827",
  color: "white",
  border: "none",
  borderRadius: "999px",
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};