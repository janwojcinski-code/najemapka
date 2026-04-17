import ForgotPasswordForm from "@/components/forms/forgot-password-form";

export default function ForgotPasswordPage() {
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
          Reset hasła
        </h1>

        <p
          style={{
            margin: "0 0 24px",
            color: "#667085",
            lineHeight: 1.6,
          }}
        >
          Podaj email, a wyślemy Ci link do ustawienia nowego hasła.
        </p>

        <ForgotPasswordForm />
      </div>
    </main>
  );
}