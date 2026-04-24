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
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-5 focus:z-50 focus:rounded-xl focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg focus:ring-2 focus:ring-ring/40"
          >
            Saltar al contenido
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
