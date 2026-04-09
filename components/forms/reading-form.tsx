"use client";

import { Camera, Droplets, Flame, Send, Zap } from "lucide-react";
import { useState } from "react";
import { utilityUnit } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const utilities = [
  { type: "cold_water", label: "Zimna woda", supplier: "Wodociągi miejskie", previous: 412.45, icon: <Droplets size={22} color="#2764ca" /> },
  { type: "hot_water", label: "Ciepła woda", supplier: "MPEC S.A.", previous: 285.12, icon: <Flame size={22} color="#eb6a00" /> },
  { type: "electricity", label: "Prąd", supplier: "TAURON Dystrybucja", previous: 5892.4, icon: <Zap size={22} color="#2c8c2f" /> },
  { type: "gas", label: "Gaz", supplier: "PGNiG Grupa Orlen", previous: 1204.88, icon: <Flame size={22} color="#5c6a80" /> }
] as const;

export function ReadingForm() {
  const supabase = createClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, File | null>>({});

  const handleUpload = async (type: string, file: File) => {
    const filePath = `readings/${Date.now()}-${type}-${file.name}`;
    await supabase.storage.from("meter-photos").upload(filePath, file, { upsert: true });
    setPhotos((prev) => ({ ...prev, [type]: file }));
  };

  return (
    <div className="section-card" style={{ padding: 18 }}>
      <div style={{ marginBottom: 18 }}>
        <h1 className="page-title">Dodaj odczyt liczników</h1>
        <p className="page-subtitle">Uzupełnij aktualne stany dla wszystkich mediów w Twoim mieszkaniu.</p>
      </div>

      {utilities.map((item) => {
        const current = Number(values[item.type] || 0);
        const usage = values[item.type] ? current - item.previous : null;
        return (
          <div key={item.type} className="reading-card">
            <div className="reading-grid">
              <div>
                <div style={{ display: "flex", gap: 14, alignItems: "start" }}>
                  <div className="icon-box">{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 900 }}>{item.label}</div>
                    <div style={{ color: "#6683b6", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", fontSize: 12 }}>{item.supplier}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, color: "#687284", fontWeight: 700 }}>Poprzedni odczyt</div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>{item.previous} {utilityUnit(item.type)}</div>
                  </div>
                </div>

                <div className="field" style={{ marginTop: 18 }}>
                  <label className="label">Bieżący stan licznika</label>
                  <div className="input-wrap" style={{ background: "white" }}>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={values[item.type] ?? ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, [item.type]: e.target.value }))}
                      placeholder="0.00"
                    />
                    <strong>{utilityUnit(item.type)}</strong>
                  </div>
                </div>

                <div className="photo-box">
                  <span>Zużycie: <strong>{usage === null ? "--" : usage.toFixed(2)} {utilityUnit(item.type)}</strong></span>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 800 }}>
                    <Camera size={18} />
                    Zdjęcie
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(item.type, file);
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="info-box" style={{ marginTop: 18 }}>
        <span>ⓘ</span>
        <span>Pamiętaj, że przesyłając odczyty deklarujesz ich prawdziwość. Zdjęcia liczników ułatwiają weryfikację w przypadku błędów w systemie.</span>
      </div>

      <div style={{ marginTop: 18 }}>
        <Button style={{ width: "100%" }}>
          Wyślij odczyty <Send size={18} />
        </Button>
      </div>
    </div>
  );
}
