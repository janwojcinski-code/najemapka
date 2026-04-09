import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="center-auth">
      <div className="auth-wrap">
        <div className="brand-lockup">
          <div className="brand-icon"><LayoutGrid size={28} /></div>
          <div className="brand-title">Media pod kontrolą</div>
          <div className="brand-subtitle">Zaloguj się do swojego konta</div>
        </div>

        <div className="card auth-card">
          <LoginForm />
        </div>

        <div className="auth-footer">
          <div>Nie masz konta? <Link href="/rejestracja" className="helper-link">Zarejestruj się</Link></div>
          <div className="auth-footer-links">
            <Link href="#">Polityka prywatności</Link>
            <span>•</span>
            <Link href="#">Pomoc techniczna</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
