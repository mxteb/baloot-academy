import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWARegister from "./pwa-register";

export const metadata: Metadata = {
  metadataBase: new URL("https://baloot-academy.slmdnk.chatgpt.site"),
  title: "مدرسة البلوت | Baloot Academy",
  description: "تعلم الفرق بين الصن والحكم باللعب والتدريب التفاعلي.",
  applicationName: "مدرسة البلوت",
  manifest: "/site.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "مدرسة البلوت" },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/pwa-192.png", sizes: "192x192", type: "image/png" }, { url: "/pwa-512.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: { title: "مدرسة البلوت", description: "تعلم البلوت باللعب، مو بالحفظ.", locale: "ar_SA", type: "website", images: [{ url: "/og.png", width: 1731, height: 909, alt: "مدرسة البلوت" }] },
  twitter: { card: "summary_large_image", title: "مدرسة البلوت", description: "تعلم البلوت باللعب، مو بالحفظ.", images: ["/og.png"] },
};

export const viewport: Viewport = {
  themeColor: "#071712",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}<PWARegister /></body></html>;
}
