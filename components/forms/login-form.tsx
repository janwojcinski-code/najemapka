"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";
import { getRedirectPathForRole } from "@/lib/auth/roles";

const schema = z.object({
  email: z.string().email("Podaj poprawny adres email."),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków.")
});

type FormValues = z.infer<typeof schema>;

type ProfileRoleResponse = {
  role: UserRole;
};

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const fallbackMessage = useMemo(() => {
    const errorCode = searchParams.get("error");

    if (errorCode === "missing_profile") {
      return "Nie znaleziono profilu użytkownika w systemie. Skontaktuj się z administratorem.";
    }

    if (errorCode === "unknown_role") {
      return "Nie udało się ustalić roli użytkownika. Skontaktuj się z administratorem.";
    }

    return "";
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = async (values: FormValues) => {
    setServerMessage("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    });

    if (signInError) {
      setServerMessage(signInError.message || "Nie udało się zalogować.");
      return;
    }

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setServerMessage(userError?.message || "Nie udało się pobrać danych użytkownika.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      setServerMessage(`Błąd profilu: ${profileError.message}`);
      return;
    }

    if (!profile) {
      await supabase.auth.signOut();
      router.replace("/logowanie?error=missing_profile");
      router.refresh();
      return;
    }

    const typedProfile = profile as ProfileRoleResponse;

    if (typedProfile.role !== "admin" && typedProfile.role !== "tenant") {
      await supabase.auth.signOut();
      router.replace("/logowanie?error=unknown_role");
      router.refresh();
      return;
    }

    router.replace(getRedirectPathForRole(typedProfile.role));
    router.refresh();
  };

  const visibleMessage = serverMessage || fallbackMessage;

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
      <div className="field">
        <label className="label">Email</label>
        <Input
          icon={<Mail size={18} color="#7d8596" />}
          placeholder="twoj@email.pl"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <div className="field">
        <div className="label-row">
          <label className="label">Hasło</label>
          <Link href="/reset-hasla" className="helper-link">
            Przypomnij hasło
          </Link>
        </div>
        <Input
          icon={<Lock size={18} color="#7d8596" />}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                border: 0,
                background: "transparent",
                display: "grid",
                placeItems: "center",
                cursor: "pointer"
              }}
            >
              <Eye size={18} color="#7d8596" />
            </button>
          }
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>

      {visibleMessage ? <div className="error">{visibleMessage}</div> : null}

      <Button type="submit" disabled={isSubmitting}>
        Zaloguj się <ArrowRight size={18} />
      </Button>
    </form>
  );
}