import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media pod kontrolą",
  description: "Aplikacja do rozliczania mediów w mieszkaniach na wynajem"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
