import LoginForm from "@/components/forms/login-form";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = (await searchParams) || {};

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1.1fr 0.9fr",
        background: "linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 45%, #EEF2FF 100%)",
      }}
    >
      <section
        style={{
          padding: "56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          borderRight: "1px solid rgba(148, 163, 184, 0.16)",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #0B5CAD 0%, #1D4ED8 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "30px",
            fontWeight: 900,
            marginBottom: "28px",
            boxShadow: "0 18px 40px rgba(29, 78, 216, 0.18)",
          }}
        >
          MP
        </div>

        <div style={{ maxWidth: "520px" }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#0B5CAD",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            Media pod kontrolą
          </div>

          <h1
            style={{
              fontSize: "56px",
              lineHeight: 1,
              fontWeight: 900,
              color: "#0F172A",
              margin: "0 0 18px",
            }}
          >
            Zarządzaj najmem
            <br />
            prościej i czytelniej.
          </h1>

          <p
            style={{
              fontSize: "18px",
              lineHeight: 1.6,
              color: "#475467",
              margin: 0,
              maxWidth: "520px",
            }}
          >
            Kontroluj czynsz, zaliczki, faktury i zaległości w jednym panelu.
            Szybko sprawdzisz, kto zapłacił, kto zalega i jakie jest saldo.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "14px",
              marginTop: "28px",
              maxWidth: "520px",
            }}
          >
            <FeatureCard title="Czynsz i zaliczki" text="Księguj wpłaty i kontroluj statusy." />
            <FeatureCard title="Faktury i media" text="Dodawaj koszty i rozliczaj najemców." />
            <FeatureCard title="Zaległości" text="Od razu widzisz, kto nie zapłacił." />
            <FeatureCard title="Historia i eksport" text="Miesięczne zestawienia i CSV." />
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "460px",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(226, 232, 240, 0.9)",
            borderRadius: "28px",
            boxShadow: "0 28px 70px rgba(15, 23, 42, 0.10)",
            padding: "34px",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <h2
              style={{
                fontSize: "30px",
                fontWeight: 900,
                color: "#0F172A",
                margin: "0 0 8px",
              }}
            >
              Zaloguj się
            </h2>
            <p
              style={{
                margin: 0,
                color: "#667085",
                lineHeight: 1.6,
              }}
            >
              Wejdź do panelu administratora lub najemcy.
            </p>
          </div>

          <LoginForm searchError={params.error} />

          <div
            style={{
              marginTop: "22px",
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
              fontSize: "14px",
            }}
          >
            <Link
              href="/rejestracja"
              style={{
                textDecoration: "none",
                color: "#0B5CAD",
                fontWeight: 700,
              }}
            >
              Załóż konto
            </Link>

            <Link
              href="/odzyskiwanie-hasla"
              style={{
                textDecoration: "none",
                color: "#667085",
                fontWeight: 700,
              }}
            >
              Przypomnij hasło
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.72)",
        border: "1px solid rgba(226, 232, 240, 0.9)",
        borderRadius: "18px",
        padding: "16px",
      }}
    >
      <div
        style={{
          fontWeight: 800,
          color: "#0F172A",
          marginBottom: "6px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: "#667085",
          fontSize: "14px",
          lineHeight: 1.5,
        }}
      >
        {text}
      </div>
    </div>
  );
}