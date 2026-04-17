import Link from "next/link";
import { logout } from "@/app/actions/logout";

export default function AdminTopbar() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px",
        flexWrap: "wrap",
        marginBottom: "28px",
        paddingBottom: "20px",
        borderBottom: "1px solid #E5E7EB",
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
        <NavLink href="/admin/dashboard" label="Dashboard" />
        <NavLink href="/admin/zaleglosci" label="Zaległości" />

        <Dropdown label="Najemcy">
          <DropdownLink href="/admin/najemcy" label="Lista najemców" />
          <DropdownLink href="/admin/przypisania" label="Przypisania" />
        </Dropdown>

        <Dropdown label="Finanse">
          <DropdownLink href="/admin/czynsz" label="Czynsz" />
          <DropdownLink href="/admin/zaliczki" label="Zaliczki" />
          <DropdownLink href="/admin/faktury" label="Faktury" />
          <DropdownLink href="/admin/rozliczenia" label="Rozliczenia" />
          <DropdownLink href="/api/export" label="Export CSV" />
        </Dropdown>

        <Dropdown label="Ustawienia">
          <DropdownLink href="/admin/mieszkania" label="Mieszkania" />
          <DropdownLink href="/admin/taryfy" label="Taryfy" />
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
        display: "inline-block",
      }}
    >
      {label}
    </Link>
  );
}

function Dropdown({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <details
      style={{
        position: "relative",
      }}
    >
      <summary
        style={{
          listStyle: "none",
          cursor: "pointer",
          color: "#111827",
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "999px",
          padding: "12px 18px",
          fontWeight: 700,
          userSelect: "none",
        }}
      >
        {label} ▾
      </summary>

      <div
        style={{
          position: "absolute",
          top: "52px",
          left: 0,
          minWidth: "220px",
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
          padding: "10px",
          zIndex: 50,
        }}
      >
        {children}
      </div>
    </details>
  );
}

function DropdownLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
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