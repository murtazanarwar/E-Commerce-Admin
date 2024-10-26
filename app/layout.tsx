import type { Metadata } from "next";
import localFont from "next/font/local";

import { ClerkProvider } from '@clerk/nextjs'
import { ModalProvider } from "@/provider/modal-provider";
import { ToasterProvider } from "@/provider/toast-provider";

import "./globals.css";
import { ThemeProvider } from "@/provider/theme-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              <ToasterProvider /> 
              <ModalProvider />
              {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
