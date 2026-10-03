import { Source_Sans_3 } from "next/font/google";
import { cookies } from "next/headers";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PROJECT_TITLE } from "@/data/student";
import {
  DENSITY_COOKIE,
  THEME_COOKIE,
  parseDensity,
  parseTheme,
} from "@/lib/theme";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: PROJECT_TITLE,
  description:
    "Create phoneme-based Wordle and Word Search classroom activities for Speech Pathology teaching.",
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const theme = parseTheme(cookieStore.get(THEME_COOKIE)?.value);
  const density = parseDensity(cookieStore.get(DENSITY_COOKIE)?.value);

  return (
    <html
      lang="en"
      className={`${sourceSans.variable} h-full antialiased ${theme === "dark" ? "dark" : ""}`}
      data-theme={theme}
      data-density={density}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider initialTheme={theme} initialDensity={density}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
