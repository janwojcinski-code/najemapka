"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordForm() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email) {
      setStatus("error");
      setMessage("Podaj adres email.");
      return;
    }

    setStatus("loading");
    setMessage("");

    const redirectTo = `${window.location.origin}/ustaw-nowe-haslo`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      setStatus("error");
      setMessage("Nie udało się wysłać linku resetującego.");
      return;
    }

    setStatus("success");
    setMessage("Jeśli konto istnieje, wysłaliśmy link do zmiany hasła.");
  }

  return (
    <form onSubmit={handleSubmit}>
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

      <div style={{ marginBottom: "18px" }}>
        <label
          htmlFor="email"
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: 700,
            color: "#111827",
          }}
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="twoj@email.pl"
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
        {status === "loading" ? "Wysyłanie..." : "Wyślij link resetujący"}
      </button>
    </form>
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