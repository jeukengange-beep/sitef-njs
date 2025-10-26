import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins"
});

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
    <html lang="fr" className={poppins.variable}>
      <body>{children}</body>
    </html>
  );
}
