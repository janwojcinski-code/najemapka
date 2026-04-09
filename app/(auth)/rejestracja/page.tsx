import { Shield } from "lucide-react";
import { RegisterForm } from "@/components/forms/register-form";

export default function RegisterPage() {
  return (
    <div className="center-auth">
      <div className="auth-wrap">
        <div className="brand-lockup">
          <div className="brand-icon"><Shield size={26} /></div>
          <div className="page-title" style={{ textAlign: "center" }}>Stwórz nowe konto.</div>
          <div className="brand-subtitle">Wpisz kod zaproszenia od swojego zarządcy.</div>
        </div>

        <div className="card auth-card">
          <RegisterForm />
        </div>

        <div className="auth-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
            <div style={{ height: 1, background: "#dde4f0", flex: 1 }} />
            <span style={{ fontSize: 12, letterSpacing: "0.1em", color: "#8a93a3", fontWeight: 800 }}>BEZPIECZNE SZYFROWANIE DANYCH</span>
            <div style={{ height: 1, background: "#dde4f0", flex: 1 }} />
          </div>
          <div>© 2024 Media pod kontrolą. System zarządzania mediami.</div>
        </div>
      </div>
    </div>
  );
}
