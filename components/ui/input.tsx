import { cn } from "@/lib/utils";
import { InputHTMLAttributes, ReactNode } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  rightSlot?: ReactNode;
  error?: string;
}

export function Input({ icon, rightSlot, error, className, ...props }: Props) {
  return (
    <div className="field">
      <div className="input-wrap">
        {icon}
        <input className={cn("input", className)} {...props} />
        {rightSlot}
      </div>
      {error ? <span className="error">{error}</span> : null}
    </div>
  );
}
