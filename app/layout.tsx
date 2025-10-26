import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ton aperçu de site",
  description: "Raconte ton projet et vois à quoi peut ressembler ton futur site."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
