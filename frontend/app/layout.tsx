import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KudiScore",
  description:
    "KudiScore helps traders, lenders, and business operators turn real payment activity into credit, jobs, and income opportunities."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
