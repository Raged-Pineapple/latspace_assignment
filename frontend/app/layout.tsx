import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plant Onboarding Wizard",
  description: "Configure and onboard your plant in a guided multi-step wizard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
