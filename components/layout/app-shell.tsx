import { Bell } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-nav";

export function AppShell({
  children,
  title,
  subtitle,
  userName = "Admin"
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  userName?: string;
}) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="page-shell">
        <div className="mobile-header">
          <div className="topbar-card">
            <div className="avatar">{userName.slice(0, 1)}</div>
            <div>
              <div style={{ fontSize: 14, color: "#5d6677" }}>Witaj,</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#2754d7" }}>{userName}</div>
            </div>
          </div>
          <Bell size={20} color="#5b667a" />
        </div>

        <main className="main-content">
          <div className="page-container">
            {title ? (
              <div className="topbar">
                <div>
                  <h1 className="page-title">{title}</h1>
                  {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
                </div>
                <div className="topbar-card">
                  <Bell size={20} color="#5b667a" />
                  <div className="avatar">{userName.slice(0, 1)}</div>
                </div>
              </div>
            ) : null}
            {children}
          </div>
        </main>

        <MobileBottomNav />
      </div>
    </div>
  );
}
