import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/app/app-providers";

export const metadata: Metadata = {
  title: {
    default: "Lumira — бьюти-мастера Минска",
    template: "%s · Lumira",
  },
  description:
    "Lumira — агрегатор бьюти-мастеров в Минске. Выбирайте по услуге и району и записывайтесь онлайн.",
  applicationName: "Lumira",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      process.env.PUBLIC_SITE_URL?.trim() ||
      "https://lumira.by",
  ),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "ru_BY",
    siteName: "Lumira",
    title: "Lumira — бьюти-мастера Минска",
    description:
      "Агрегатор бьюти-мастеров в Минске. Запись онлайн по услуге и району.",
  },
  twitter: {
    card: "summary",
    title: "Lumira — бьюти-мастера Минска",
    description:
      "Агрегатор бьюти-мастеров в Минске. Запись онлайн по услуге и району.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
