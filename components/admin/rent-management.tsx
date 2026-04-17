"use client";

import { useMemo, useState } from "react";

type Apartment = {
  id: number;
  name: string | null;
  address: string | null;
  monthly_rent_default?: number | null;
};

export default function RentManagement({
  apartments,
  currentMonth,
  currentYear,
  saveRentAction,
  saveDefaultRentAction,
}: {
  apartments: Apartment[];
  currentMonth: number;
  currentYear: number;
  saveRentAction: (formData: FormData) => void;
  saveDefaultRentAction: (formData: FormData) => void;
}) {
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>("");
  const selectedApartment = useMemo(
    () => apartments.find((a) => String(a.id) === selectedApartmentId),
    [apartments, selectedApartmentId]
  );

  return (
    <>
      <section
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: 800, marginTop: 0, marginBottom: "16px" }}>
          Domyślne stawki czynszu per mieszkanie
        </h2>

        <div style={{ display: "grid", gap: "12px" }}>
          {apartments.map((apartment) => (
            <form
              key={apartment.id}
              action={saveDefaultRentAction}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 180px 160px",
                gap: "12px",
                alignItems: "center",
                padding: "14px",
                border: "1px solid #E5E7EB",
                borderRadius: "14px",
              }}
            >
              <input type="hidden" name="apartment_id" value={apartment.id} />

              <div>
                <div style={{ fontWeight: 700 }}>
                  {apartment.name || `Mieszkanie ${apartment.id}`}
                </div>
                <div style={{ fontSize: "13px", color: "#667085" }}>
                  {apartment.address || "—"}
                </div>
              </div>

              <input
                name="monthly_rent_default"
                type="number"
                step="0.01"
                defaultValue={Number(apartment.monthly_rent_default ?? 0)}
                style={inputStyle}
              />

              <button type="submit" style={darkButtonStyle}>
                Zapisz stawkę
              </button>
            </form>
          ))}
        </div>
      </section>

      <section
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: 800, marginTop: 0, marginBottom: "16px" }}>
          Księguj czynsz miesięczny
        </h2>

        <form action={saveRentAction}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: "16px",
              alignItems: "end",
            }}
          >
            <div>
              <label htmlFor="apartment_id" style={labelStyle}>
                Mieszkanie
              </label>
              <select
                id="apartment_id"
                name="apartment_id"
                value={selectedApartmentId}
                onChange={(e) => setSelectedApartmentId(e.target.value)}
                style={inputStyle}
              >
                <option value="">Wybierz mieszkanie</option>
                {apartments.map((apartment) => (
                  <option key={apartment.id} value={apartment.id}>
                    {apartment.name || `Mieszkanie ${apartment.id}`} — {apartment.address}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="month" style={labelStyle}>
                Miesiąc
              </label>
              <input
                id="month"
                name="month"
                type="number"
                min="1"
                max="12"
                defaultValue={currentMonth}
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="year" style={labelStyle}>
                Rok
              </label>
              <input
                id="year"
                name="year"
                type="number"
                defaultValue={currentYear}
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="amount" style={labelStyle}>
                Kwota czynszu
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                defaultValue={Number(selectedApartment?.monthly_rent_default ?? 0)}
                key={selectedApartmentId || "default-rent"}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <button type="submit" style={primaryButtonStyle}>
              Zapisz czynsz
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "6px",
  fontWeight: 700,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #D0D5DD",
};

const primaryButtonStyle: React.CSSProperties = {
  background: "#0B5CAD",
  color: "white",
  border: "none",
  borderRadius: "999px",
  padding: "12px 18px",
  fontWeight: 700,
  cursor: "pointer",
};

const darkButtonStyle: React.CSSProperties = {
  background: "#111827",
  color: "white",
  border: "none",
  borderRadius: "999px",
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};