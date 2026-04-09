import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";

export const dynamic = "force-dynamic";

function LoginPageContent() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "linear-gradient(180deg, #f5f8ff 0%, #eef3ff 100%)"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: 28,
            padding: 28,
            boxShadow: "0 20px 60px rgba(28, 54, 122, 0.10)",
            border: "1px solid #e7ecf5"
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#5b6b8a",
                marginBottom: 10,
                letterSpacing: "0.04em",
                textTransform: "uppercase"
              }}
            >
              Media pod kontrolą
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 32,
                lineHeight: 1.1,
                fontWeight: 800,
                color: "#111827"
              }}
            >
              Zaloguj się
            </h1>

            <p
              style={{
                margin: "12px 0 0",
                fontSize: 15,
                lineHeight: 1.6,
                color: "#667085"
              }}
            >
              Zarządzaj rozliczeniami mediów i odczytami liczników w swoim mieszkaniu.
            </p>
          </div>

          <LoginForm />

          <div
            style={{
              marginTop: 24,
              textAlign: "center",
              fontSize: 14,
              color: "#667085"
            }}
          >
            Nie masz konta?{" "}
            <Link
              href="/rejestracja"
              style={{
                color: "#2754d7",
                fontWeight: 700,
                textDecoration: "none"
              }}
            >
              Zarejestruj się
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}