import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Russo_One, Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";

const russoOne = Russo_One({
  variable: "--font-russo-one",
  weight: "400",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Red Line Detailing & Auto Spa",
  description: "Red Line Detailing & Auto Spa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${russoOne.variable} ${poppins.variable}`}>
        <AuthProvider> {children}</AuthProvider>
        <Toaster
          toastOptions={{
            unstyled: true,
            classNames: {
              toast: "!bg-transparent !border-0 !shadow-none !p-0",
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
