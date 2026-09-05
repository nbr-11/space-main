import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import { cn } from "@/lib/utils";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { SocketProvider } from "@/components/providers/socket-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const openSans = Open_Sans({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Space",
  description: "A realtime collaboration and Team chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            openSans.className,
            "bg-white dark:bg-[#313338]"
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={true}
            storageKey="space-theme"
          >

            <SocketProvider>

              <ModalProvider />
              <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
              <QueryProvider>
                {children}
              </QueryProvider>
            </SocketProvider>

          </ThemeProvider>

        </body>
      </html>
    </ClerkProvider>
  );
}
