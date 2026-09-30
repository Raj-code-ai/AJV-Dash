import type { Metadata } from "next";
import { Libre_Baskerville, Source_Sans_3 } from "next/font/google";
import { Toaster } from "react-hot-toast";
import ThemeProvider from "@/components/providers/ThemeProvider";
import "./globals.css";

const display = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Department CMS",
    template: "%s | Department CMS",
  },
  description:
    "University Department Content Management System — faculty, notices, achievements, gallery, and resources.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className:
                "!bg-white !text-academic-navy dark:!bg-academic-ink dark:!text-white !shadow-soft",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
