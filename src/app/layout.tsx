import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/layout/theme-provider"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Family Finance",
    template: "%s | Family Finance",
  },
  description:
    "Kelola keuangan keluarga dengan mudah. Catat pemasukan, pengeluaran, budget, dan tabungan bersama.",
  keywords: ["keuangan keluarga", "manajemen keuangan", "budget keluarga", "tabungan"],
  authors: [{ name: "Family Finance" }],
  creator: "Family Finance",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: "Family Finance",
    description: "Kelola keuangan keluarga dengan mudah.",
    siteName: "Family Finance",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: { borderRadius: "12px" },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
