import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  note,
  icon,
  variant = "soft",
  footer
}: {
  title: string;
  value: string;
  note?: string;
  icon?: ReactNode;
  variant?: "primary" | "soft" | "alert";
  footer?: ReactNode;
}) {
  return (
    <div className={cn("stat-card", variant)}>
      {icon ? <div className="icon-box">{icon}</div> : null}
      <div style={{ marginTop: icon ? 16 : 0, color: variant === "primary" ? "rgba(255,255,255,.78)" : "#677082" }}>{title}</div>
      <div className="stat-value">{value}</div>
      {note ? <div style={{ color: variant === "primary" ? "#d8e8ff" : "#566173" }}>{note}</div> : null}
      {footer ? <div style={{ marginTop: 16 }}>{footer}</div> : null}
    </div>
  );
}
