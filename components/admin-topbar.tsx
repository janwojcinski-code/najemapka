import Link from "next/link";
import { logout } from "@/app/actions/logout";

export default function AdminTopbar() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <nav style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <NavLink href="/admin/dashboard" label="Dashboard" />
        <NavLink href="/admin/mieszkania" label="Mieszkania" />
        <NavLink href="/admin/przypisania" label="Przypisania" />
        <NavLink href="/admin/rozliczenia" label="Rozliczenia" />
        <NavLink href="/admin/taryfy" label="Taryfy" />
        <NavLink href="/admin/czynsz" label="Czynsz" />
        <NavLink href="/admin/zaliczki" label="Zaliczki" />
        <NavLink href="/admin/faktury" label="Faktury" />
        <NavLink href="/admin/najemcy" label="Najemcy" />
        <NavLink href="/admin/zaleglosci" label="Zaległości" />
        <NavLink href="/api/export" label="Export CSV" />
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
          }}
        >
          Wyloguj
        </button>
      </form>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "#111827",
        background: "white",
        border: "1px solid #E5E7EB",
        borderRadius: "999px",
        padding: "12px 18px",
        fontWeight: 700,
      }}
    >
      {label}
    </Link>
  );
}