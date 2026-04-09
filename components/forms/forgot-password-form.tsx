"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Podaj poprawny adres email.")
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const supabase = createClient();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (values: FormValues) => {
    await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/logowanie`
    });
    reset();
    alert("Instrukcja resetu została wysłana.");
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
      <div className="field">
        <label className="label">Adres email</label>
        <Input icon={<Mail size={18} color="#7d8596" />} placeholder="twoj@email.pl" error={errors.email?.message} {...register("email")} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        Wyślij instrukcję <ArrowRight size={18} />
      </Button>

      <div style={{ textAlign: "center" }}>
        <Link href="/logowanie" className="helper-link" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <ArrowLeft size={16} />
          Wróć do logowania
        </Link>
      </div>
    </form>
  );
}
