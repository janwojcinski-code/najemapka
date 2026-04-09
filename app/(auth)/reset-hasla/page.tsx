import { Compass } from "lucide-react";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="center-auth">
      <div className="auth-wrap">
        <div className="brand-lockup">
          <div className="brand-icon"><Compass size={26} /></div>
          <div className="brand-title" style={{ textTransform: "uppercase" }}>Media pod kontrolą</div>
        </div>

        <div className="card auth-card">
          <h1 className="page-title">Resetowanie hasła</h1>
          <p className="page-subtitle">Wpisz swój adres email, a wyślemy Ci instrukcje resetowania hasła.</p>
          <ForgotPasswordForm />
        </div>

        <div className="auth-footer">
          <div>Masz problem z dostępem? <span className="helper-link">Skontaktuj się z administratorem</span></div>
        </div>
      </div>
    </div>
  );
}
