import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "../context/WalletContext";

export const metadata: Metadata = {
  title: "Aether3D // WDK Next.js Wallet Template",
  description: "A premium, Tether WDK SDK powered multi-chain wallet template with Apple Vision Pro spatial glassmorphism, Next.js, and Three.js.",
  keywords: ["Next.js", "TypeScript", "Three.js", "WebGL", "Tether WDK", "WDK SDK", "Crypto Wallet", "Glassmorphism", "Apple Vision Pro"],
  authors: [{ name: "Antigravity Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* FontAwesome Icons CDN */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          precedence="default"
        />
      </head>
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
