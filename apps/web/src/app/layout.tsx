import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/app/app-providers";
import {
  getGoogleSiteVerification,
  getYandexSiteVerification,
} from "@/shared/lib/analytics";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-text",
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-display",
});

const googleVerification = getGoogleSiteVerification();
const yandexVerification = getYandexSiteVerification();

export const metadata: Metadata = {
  title: {
    default: "Lumira — бьюти-мастера Минска и Беларуси",
    template: "%s · Lumira",
  },
  description:
    "Lumira — агрегатор бьюти-мастеров в Минске и по Беларуси. Выбирайте по услуге и району и записывайтесь онлайн.",
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
    title: "Lumira — бьюти-мастера Минска и Беларуси",
    description:
      "Агрегатор бьюти-мастеров в Минске и по Беларуси. Запись онлайн по услуге и району.",
  },
  twitter: {
    card: "summary",
    title: "Lumira — бьюти-мастера Минска и Беларуси",
    description:
      "Агрегатор бьюти-мастеров в Минске и по Беларуси. Запись онлайн по услуге и району.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(yandexVerification ? { yandex: yandexVerification } : {}),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru-BY"
      className={`${manrope.variable} ${playfair.variable}`}
    >
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
