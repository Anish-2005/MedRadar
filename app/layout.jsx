import { Nunito_Sans, Urbanist } from "next/font/google";
import "./globals.css";

const bodyFont = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "600", "700", "800"],
});

const displayFont = Urbanist({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800", "900"],
});

export const metadata = {
  title: "MedRadar | Hospital Resource Optimizer",
  description:
    "MedRadar helps hospitals manage beds, oxygen, and medicine stock with actionable operational dashboards.",
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
