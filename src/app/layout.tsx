import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import Providers from "./provider";
import ConditionalNavbar from "@/src/shared/components/Navbar/ConditionalNavbar";
import ThemeInitializer from "@/src/shared/components/ThemeInitiator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Onechat — your people, your place",
  description: "A lighter way to stay close to your people. Find friends by username and start a conversation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable}`}
      lang="en"
      data-theme="dark"
      data-palette="default"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=document.documentElement;var m=localStorage.getItem("theme-mode")||localStorage.getItem("theme")||"dark";var p=localStorage.getItem("theme-palette")||"default";r.setAttribute("data-theme",m==="light"?"light":"dark");r.setAttribute("data-palette",p);var c=localStorage.getItem("theme-custom");if(c){var o=JSON.parse(c);if(o.background&&o.foreground&&o.primary){r.setAttribute("data-custom-theme","true");var imp="important";r.style.setProperty("--background",o.background,imp);r.style.setProperty("--foreground",o.foreground,imp);r.style.setProperty("--primary",o.primary,imp);r.style.setProperty("--color-background",o.background,imp);r.style.setProperty("--color-foreground",o.foreground,imp);r.style.setProperty("--color-primary",o.primary,imp);var bg=o.background.replace("#","");if(bg.length===3)bg=bg[0]+bg[0]+bg[1]+bg[1]+bg[2]+bg[2];var n=parseInt(bg,16);var lum=((n>>16&255)*0.299+(n>>8&255)*0.587+(n&255)*0.114)/255;r.style.colorScheme=lum<0.5?"dark":"light";}}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeInitializer />
        <Providers>
          <ConditionalNavbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
