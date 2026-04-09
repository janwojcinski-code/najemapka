import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/forms/login-form";

export const dynamic = "force-dynamic";

function LoginPageContent() {
  return (
    <AuthShell
      title="Zaloguj się"
      subtitle="Zarządzaj rozliczeniami mediów i odczytami liczników w swoim mieszkaniu."
      footerText="Nie masz konta?"
      footerLinkHref="/rejestracja"
      footerLinkLabel="Zarejestruj się"
    >
      <LoginForm />
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}