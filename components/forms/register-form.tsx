"use client";

import Link from "next/link";
import { ArrowRight, KeyRound, Lock, Mail, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  invitationCode: z.string().min(5, "Podaj kod zaproszenia."),
  fullName: z.string().min(2, "Podaj imię i nazwisko."),
  email: z.string().email("Podaj poprawny adres email."),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków."),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła muszą być takie same.",
  path: ["confirmPassword"]
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const supabase = createClient();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (values: FormValues) => {
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          invitation_code: values.invitationCode,
          role: "tenant"
        }
      }
    });

    if (!error) {
      window.location.href = "/logowanie";
    }
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
      <div className="field">
        <label className="label">Kod zaproszenia</label>
        <Input icon={<KeyRound size={18} color="#7d8596" />} placeholder="np. ABC-123-XYZ" error={errors.invitationCode?.message} {...register("invitationCode")} />
      </div>
      <div className="field">
        <label className="label">Imię i nazwisko</label>
        <Input icon={<User size={18} color="#7d8596" />} placeholder="Jan Kowalski" error={errors.fullName?.message} {...register("fullName")} />
      </div>
      <div className="field">
        <label className="label">Email</label>
        <Input icon={<Mail size={18} color="#7d8596" />} placeholder="twoj@email.pl" error={errors.email?.message} {...register("email")} />
      </div>
      <div className="field">
        <label className="label">Hasło</label>
        <Input type="password" icon={<Lock size={18} color="#7d8596" />} placeholder="••••••••" error={errors.password?.message} {...register("password")} />
      </div>
      <div className="field">
        <label className="label">Powtórz hasło</label>
        <Input type="password" icon={<Lock size={18} color="#7d8596" />} placeholder="••••••••" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        Załóż konto <ArrowRight size={18} />
      </Button>

      <div style={{ textAlign: "center", color: "#667081" }}>
        Masz już konto? <Link href="/logowanie" className="helper-link">Zaloguj się</Link>
      </div>
    </form>
  );
}
