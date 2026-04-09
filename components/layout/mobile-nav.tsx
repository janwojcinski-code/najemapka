"use client";

import Link from "next/link";
import { Building2, Gauge, LayoutDashboard, MoreHorizontal, ReceiptText } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/najemca/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/najemca/mieszkania", label: "Mieszkania", icon: Building2 },
  { href: "/najemca/odczyty", label: "Odczyty", icon: Gauge },
  { href: "/najemca/rozliczenia", label: "Rozliczenia", icon: ReceiptText },
  { href: "#", label: "Więcej", icon: MoreHorizontal }
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.label} href={item.href} className={cn(pathname.startsWith(item.href) && item.href !== "#" && "active")}>
            <Icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
