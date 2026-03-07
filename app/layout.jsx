import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://medradar.app").replace(/\/$/, "");

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MedRadar | Hospital Resource Optimizer",
    template: "%s | MedRadar",
  },
  description:
    "MedRadar helps hospitals manage beds, oxygen, and medicine stock with actionable operational dashboards.",
  applicationName: "MedRadar",
  referrer: "origin-when-cross-origin",
  keywords: [
    "hospital dashboard",
    "bed occupancy tracker",
    "oxygen stock monitoring",
    "hospital medicine inventory",
    "hospital operations software",
    "healthcare resource management",
  ],
  authors: [{ name: "MedRadar Team" }],
  alternates: {
    canonical: "/",
  },
  category: "healthcare",
  openGraph: {
    title: "MedRadar | Hospital Resource Optimizer",
    description:
      "Manage beds, oxygen, and medicine continuity in one operational command center.",
    url: siteUrl,
    siteName: "MedRadar",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "MedRadar hospital operations dashboard preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MedRadar | Hospital Resource Optimizer",
    description:
      "Operational visibility for bed occupancy, oxygen reserve, and medicine inventory.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/medradar-logo.svg", type: "image/svg+xml" }],
    shortcut: ["/medradar-logo.svg"],
    apple: [{ url: "/medradar-logo.svg" }],
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A3968",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
