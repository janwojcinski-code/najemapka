"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SetNewPasswordPage() {
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
      setMessage("Nie udało się ustawić nowego hasła.");
      return;
    }

    setStatus("success");
    setMessage("Hasło zostało zmienione. Możesz się zalogować.");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 45%, #EEF2FF 100%)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(226, 232, 240, 0.9)",
          borderRadius: "28px",
          boxShadow: "0 28px 70px rgba(15, 23, 42, 0.10)",
          padding: "34px",
        }}
      >
        <h1
          style={{
            fontSize: "30px",
            fontWeight: 900,
            color: "#0F172A",
            margin: "0 0 8px",
          }}
        >
          Ustaw nowe hasło
        </h1>

        <p
          style={{
            margin: "0 0 24px",
            color: "#667085",
            lineHeight: 1.6,
          }}
        >
          Wpisz nowe hasło do swojego konta.
        </p>

        {message ? (
          <div
            style={{
              marginBottom: "18px",
              padding: "14px 16px",
              borderRadius: "14px",
              background: status === "success" ? "#F0FDF4" : "#FEF2F2",
              color: status === "success" ? "#166534" : "#B91C1C",
              border: status === "success" ? "1px solid #BBF7D0" : "1px solid #FECACA",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {message}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "18px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Nowe hasło
            </label>

            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #0B5CAD 0%, #1D4ED8 100%)",
              color: "white",
              border: "none",
              borderRadius: "14px",
              padding: "14px 18px",
              fontWeight: 800,
              fontSize: "16px",
              cursor: "pointer",
              opacity: status === "loading" ? 0.7 : 1,
            }}
          >
            {status === "loading" ? "Zapisywanie..." : "Zapisz nowe hasło"}
          </button>
        </form>

        <div style={{ marginTop: "20px" }}>
          <Link
            href="/logowanie"
            style={{
              textDecoration: "none",
              color: "#0B5CAD",
              fontWeight: 700,
            }}
          >
            ← Wróć do logowania
          </Link>
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid #D0D5DD",
  background: "white",
  fontSize: "15px",
};