import Link from "next/link";
import { logout } from "@/lib/actions/logout";
export default function AdminTopbar() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 0 24px",
        borderBottom: "1px solid #E5E7EB",
        marginBottom: "24px",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <Link href="/admin/dashboard" style={linkStyle}>
          Dashboard
        </Link>
        <Link href="/admin/mieszkania" style={linkStyle}>
          Mieszkania
        </Link>
        <Link href="/admin/przypisania" style={linkStyle}>
          Przypisania
        </Link>
        <Link href="/admin/rozliczenia" style={linkStyle}>
          Rozliczenia
        </Link>
        <Link href="/admin/taryfy" style={linkStyle}>
          Taryfy
        </Link>
      </div>

      <form action={logout}>
        <button type="submit" style={buttonStyle}>
          Wyloguj
        </button>
      </form>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "#111827",
  padding: "10px 14px",
  borderRadius: "999px",
  background: "#F3F4F6",
  fontWeight: 600,
  fontSize: "14px",
};

const buttonStyle: React.CSSProperties = {
  background: "#111827",
  color: "white",
  border: "none",
  borderRadius: "999px",
  padding: "10px 14px",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "14px",
};