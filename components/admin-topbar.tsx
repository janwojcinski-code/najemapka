"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/actions/logout";

type MenuKey = "tenants" | "finance" | "settings" | null;

export default function AdminTopbar() {
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleMenu(menu: Exclude<MenuKey, null>) {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  }

  function closeMenus() {
    setOpenMenu(null);
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px",
        flexWrap: "wrap",
        marginBottom: "28px",
        paddingBottom: "20px",
        borderBottom: "1px solid #E5E7EB",
        position: "relative",
        zIndex: 30,
      }}
    >
      <nav
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <NavLink href="/admin/dashboard" label="Dashboard" onClick={closeMenus} />
        <NavLink href="/admin/zaleglosci" label="Zaległości" onClick={closeMenus} />

        <Dropdown
          label="Najemcy"
          isOpen={openMenu === "tenants"}
          onToggle={() => toggleMenu("tenants")}
        >
          <DropdownLink href="/admin/najemcy" label="Lista najemców" onClick={closeMenus} />
          <DropdownLink href="/admin/przypisania" label="Przypisania" onClick={closeMenus} />
        </Dropdown>

        <Dropdown
          label="Finanse"
          isOpen={openMenu === "finance"}
          onToggle={() => toggleMenu("finance")}
        >
          <DropdownLink href="/admin/czynsz" label="Czynsz" onClick={closeMenus} />
          <DropdownLink href="/admin/zaliczki" label="Zaliczki" onClick={closeMenus} />
          <DropdownLink href="/admin/faktury" label="Faktury" onClick={closeMenus} />
          <DropdownLink href="/admin/rozliczenia" label="Rozliczenia" onClick={closeMenus} />
          <DropdownLink href="/api/export" label="Export CSV" onClick={closeMenus} />
        </Dropdown>

        <Dropdown
          label="Ustawienia"
          isOpen={openMenu === "settings"}
          onToggle={() => toggleMenu("settings")}
        >
          <DropdownLink href="/admin/mieszkania" label="Mieszkania" onClick={closeMenus} />
          <DropdownLink href="/admin/taryfy" label="Taryfy" onClick={closeMenus} />
        </Dropdown>
      </nav>

      <form action={logout}>
        <button
          type="submit"
          style={{
            background: "#0F172A",
            color: "white",
            border: "none",
            borderRadius: "999px",
            padding: "12px 18px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 6px 18px rgba(15, 23, 42, 0.18)",
          }}
        >
          Wyloguj
        </button>
      </form>
    </div>
  );
}

function NavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        textDecoration: "none",
        color: "#111827",
        background: "white",
        border: "1px solid #E5E7EB",
        borderRadius: "999px",
        padding: "12px 18px",
        fontWeight: 700,
        display: "inline-block",
      }}
    >
      {label}
    </Link>
  );
}

function Dropdown({
  label,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          color: "#111827",
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "999px",
          padding: "12px 18px",
          fontWeight: 700,
          userSelect: "none",
          cursor: "pointer",
        }}
      >
        {label} ▾
      </button>

      {isOpen ? (
        <div
          style={{
            position: "absolute",
            top: "52px",
            left: 0,
            minWidth: "230px",
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: "16px",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
            padding: "10px",
            zIndex: 60,
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function DropdownLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "block",
        textDecoration: "none",
        color: "#111827",
        padding: "12px 14px",
        borderRadius: "12px",
        fontWeight: 600,
      }}
    >
      {label}
    </Link>
  );
}