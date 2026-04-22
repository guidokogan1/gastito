import type { Metadata } from "next";

import { assertPublicAppEnv } from "@/lib/env";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

assertPublicAppEnv();

export const metadata: Metadata = {
  title: "Hogar Finanzas",
  description: "Finanzas familiares simples, compartibles y en ARS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
