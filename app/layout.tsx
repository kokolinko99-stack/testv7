import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://thrtysix.com"),
  title: {
    default: "THRTYSIX",
    template: "%s — THRTYSIX",
  },
  description:
    "Selected video editing, motion graphics and graphic design work by Kristiyan Yordanov, also known as THRTYSIX, an independent creative from Bulgaria.",
  keywords: [
    "Kristiyan Yordanov",
    "THRTYSIX",
    "video editor Bulgaria",
    "graphic designer Bulgaria",
    "freelance video editor",
    "motion graphics designer",
    "music video editor",
    "social media video editor",
  ],
  authors: [{ name: "Kristiyan Yordanov" }],
  creator: "Kristiyan Yordanov",
  alternates: { canonical: "/" },
  openGraph: {
    title: "THRTYSIX — Video Editor & Graphic Designer",
    description: "Selected edits, motion work and graphic design by Kristiyan Yordanov.",
    url: "https://thrtysix.com",
    siteName: "THRTYSIX",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "THRTYSIX — Video Editor & Graphic Designer",
    description: "Selected edits, motion work and graphic design by Kristiyan Yordanov.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
  colorScheme: "light dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Kristiyan Yordanov",
  alternateName: "THRTYSIX",
  url: "https://thrtysix.com",
  jobTitle: "Video Editor and Graphic Designer",
  homeLocation: { "@type": "Country", name: "Bulgaria" },
  sameAs: [
    "https://www.instagram.com/_thrtysix",
    "https://www.tiktok.com/@thrtysix",
    "https://www.x.com/_thrtysix",
  ],
  knowsAbout: ["Video Editing", "Motion Graphics", "Graphic Design", "Branding", "3D Design"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
