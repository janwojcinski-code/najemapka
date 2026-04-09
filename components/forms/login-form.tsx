"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Podaj poprawny adres email."),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków.")
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "twoj@email.pl", password: "password123" }
  });

  const onSubmit = async (values: FormValues) => {
    setServerMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    });

    if (error) {
      setServerMessage("Nie udało się zalogować. Sprawdź dane lub konfigurację Supabase.");
      return;
    }

    window.location.href = "/najemca/dashboard";
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
      <div className="field">
        <label className="label">Email</label>
        <Input icon={<Mail size={18} color="#7d8596" />} placeholder="twoj@email.pl" error={errors.email?.message} {...register("email")} />
      </div>

      <div className="field">
        <div className="label-row">
          <label className="label">Hasło</label>
          <Link href="/reset-hasla" className="helper-link">Przypomnij hasło</Link>
        </div>
        <Input
          icon={<Lock size={18} color="#7d8596" />}
          rightSlot={<button type="button" onClick={() => setShowPassword((v) => !v)} style={{ border: 0, background: "transparent", display: "grid", placeItems: "center", cursor: "pointer" }}><Eye size={18} color="#7d8596" /></button>}
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>

      {serverMessage ? <div className="error">{serverMessage}</div> : null}

      <Button type="submit" disabled={isSubmitting}>
        Zaloguj się <ArrowRight size={18} />
      </Button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
        <div style={{ height: 1, background: "#dde4f0", flex: 1 }} />
        <span style={{ fontSize: 12, letterSpacing: "0.1em", color: "#8a93a3", fontWeight: 800 }}>WERYFIKACJA</span>
        <div style={{ height: 1, background: "#dde4f0", flex: 1 }} />
      </div>

      <div className="info-box">
        <span>ⓘ</span>
        <span>Masz problem z dostępem? Twój administrator może zresetować uprawnienia w panelu zarządzania nieruchomością.</span>
      </div>
    </form>
  );
}
