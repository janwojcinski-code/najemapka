"use client";

import Link from "next/link";
import { Building2, ClipboardList, Gauge, LayoutDashboard, ReceiptText, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const adminItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/mieszkania", label: "Mieszkania", icon: Building2 },
  { href: "/admin/odczyty", label: "Odczyty", icon: Gauge },
  { href: "/admin/rozliczenia", label: "Rozliczenia", icon: ReceiptText },
  { href: "/admin/taryfy", label: "Taryfy", icon: ClipboardList },
  { href: "/admin/uzytkownicy", label: "Użytkownicy", icon: Users }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="logo-row">
        <div className="brand-icon" style={{ width: 42, height: 42 }}>▦</div>
        <span>Media pod kontrolą</span>
      </div>

      <div className="sidebar-section">
        {adminItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn("nav-item", active && "active")}>
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div style={{ marginTop: 28 }}>
        <Button style={{ width: "100%" }}>+ Dodaj nową taryfę</Button>
      </div>
    </aside>
  );
}
