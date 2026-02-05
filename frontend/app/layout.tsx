import type { Metadata } from "next";
import { Reem_Kufi } from "next/font/google";
import "./globals.css";
import ToasterComponent from "./components/Toaster";

const reemKufi = Reem_Kufi({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin", "arabic"],
  variable: "--font-reem-kufi",
});

export const metadata: Metadata = {
  title: "Care Equity",
  description: "Addressing inequities in maternal healthcare by empowering patients with data-driven insights. Report experiences, find safer hospitals, and help create equitable healthcare.",
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={reemKufi.variable}>
      <body
        className={`${reemKufi.className} antialiased`}
        style={{ fontFamily: reemKufi.style.fontFamily }}
      >
        {children}
        <ToasterComponent />
      </body>
    </html>
  );
}
