import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PWAProvider } from "@/context/PWAContext";
import { AuthProvider } from "@/components/providers/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Kinetics — High-Velocity Habit Matrix",
  description: "Minimalist, telemetry-driven protocol and habit tracker.",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen bg-[#09090b] text-zinc-100 antialiased font-sans selection:bg-emerald-500/20 selection:text-emerald-300`}
      >
        <AuthProvider>
          <PWAProvider>
            {children}
          </PWAProvider>
        </AuthProvider>
      </body>
    </html>
  );
}