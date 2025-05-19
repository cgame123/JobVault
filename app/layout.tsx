import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { BottomBanner } from "@/components/bottom-banner"
import { AuthProvider } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "JobVault",
  description: "Every charge. Every property. Accounted for.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-black`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            <div className="flex min-h-screen flex-col bg-gradient-to-b from-black to-zinc-900">
              {/* MainNav will be conditionally rendered in each page */}
              <main className="flex-1">{children}</main>
              <BottomBanner />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
