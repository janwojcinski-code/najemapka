"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ERROR_MESSAGES: Record<string, string> = {
  missing_profile:
    "Twój profil nie został jeszcze skonfigurowany. Skontaktuj się z administratorem.",
  invalid_credentials: "Nieprawidłowy email lub hasło.",
  no_role:
    "Twoje konto nie ma przypisanej roli. Skontaktuj się z administratorem.",
  default: "Wystąpił błąd logowania. Spróbuj ponownie.",
};

export default function LoginForm({
  searchError,
}: {
  searchError?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchError ? (ERROR_MESSAGES[searchError] ?? ERROR_MESSAGES.default) : null
  );

  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(ERROR_MESSAGES.invalid_credentials);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError(ERROR_MESSAGES.default);
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      setError(ERROR_MESSAGES.missing_profile);
      setLoading(false);
      return;
    }

    if (!profile.role) {
      setError(ERROR_MESSAGES.no_role);
      setLoading(false);
      return;
    }

    if (profile.role === "admin") {
      router.push("/admin/dashboard");
    } else if (profile.role === "tenant") {
      router.push("/najemca/dashboard");
    } else {
      setError(ERROR_MESSAGES.no_role);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      {error && (
        <div
          style={{
            background: "var(--color-background-danger)",
            color: "var(--color-text-danger)",
            border: "0.5px solid var(--color-border-danger)",
            borderRadius: "var(--border-radius-md)",
            padding: "12px 16px",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="email"
          style={{
            display: "block",
            fontSize: "14px",
            marginBottom: "6px",
            color: "var(--color-text-secondary)",
          }}
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="twoj@email.pl"
          required
          disabled={loading}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: "24px" }}>
        <label
          htmlFor="password"
          style={{
            display: "block",
            fontSize: "14px",
            marginBottom: "6px",
            color: "var(--color-text-secondary)",
          }}
        >
          Hasło
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={loading}
          style={{ width: "100%" }}
        />
      </div>

      <button type="submit" disabled={loading} style={{ width: "100%" }}>
        {loading ? "Logowanie..." : "Zaloguj się →"}
      </button>
    </form>
  );
}
