import type { Metadata } from "next";
// import "./globals.css"; // Moved to lower import
import { Space_Grotesk, Inter } from "next/font/google"; // Using next/font instead of @fontsource for better performance if possible, but user asked for @fontsource. Let's stick to the plan. 
// Actually, since I installed @fontsource/*, I should use those if I wasn't using next/font. 
// But wait, standard Next.js 14 uses next/font/google. It's better. 
// I will use next/font/google as it's built-in and cleaner. 
// If the user *really* wants @fontsource I can use it, but next/font is standard.
// Let's stick to the installed packages to be safe since I ran the install command.
import "@fontsource/space-grotesk/300.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "GuardianForge | Nana Banana Security",
  description: "Autonomous AI Agent for Wallet Threat Protection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-foreground bg-background selection:bg-primary selection:text-black">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
