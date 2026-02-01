import type { Metadata } from "next";
import "./globals.css";
import { Providers } from './providers'

export const metadata: Metadata = {
  title: "AI Architect Accelerator",
  description: "Build 7 AI Products in 12 Weeks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
