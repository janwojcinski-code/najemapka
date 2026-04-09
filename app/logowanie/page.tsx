import LoginForm from "@/components/forms/login-form";
import Link from "next/link";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <h1
          style={{
            textAlign: "center",
            fontSize: "22px",
            fontWeight: 500,
            marginBottom: "8px",
          }}
        >
          Media pod kontrolą
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "var(--color-text-secondary)",
            marginBottom: "32px",
          }}
        >
          Zaloguj się do swojego konta
        </p>

        <LoginForm searchError={searchParams.error} />

        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "14px",
            color: "var(--color-text-secondary)",
          }}
        >
          Nie masz konta?{" "}
          <Link href="/rejestracja" style={{ color: "var(--color-text-info)" }}>
            Zarejestruj się
          </Link>
        </p>
        <p
          style={{
            textAlign: "center",
            marginTop: "8px",
            fontSize: "14px",
          }}
        >
          <Link
            href="/odzyskiwanie-hasla"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Przypomnij hasło
          </Link>
        </p>
      </div>
    </main>
  );
}
