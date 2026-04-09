import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "muted"
}: {
  children: React.ReactNode;
  variant?: "success" | "danger" | "info" | "muted";
}) {
  return <span className={cn("pill", variant)}>{children}</span>;
}
