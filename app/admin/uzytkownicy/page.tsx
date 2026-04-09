import { AppShell } from "@/components/layout/app-shell";

export default function AdminUsersPage() {
  return (
    <AppShell userName="Administrator" title="Użytkownicy" subtitle="Admin zarządza kontami administratorów i najemców.">
      <div className="section-card">
        <p style={{ margin: 0, color: "#667081" }}>Tu dodasz listę użytkowników, przypisanie do mieszkań i reset haseł.</p>
      </div>
    </AppShell>
  );
}
