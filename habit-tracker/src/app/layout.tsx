import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Habit Studio",
  description: "A calm, Apple-inspired habit tracker for building lasting routines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
