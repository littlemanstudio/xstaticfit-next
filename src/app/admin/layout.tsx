import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
  manifest: "/admin-app/manifest.webmanifest",
  icons: { apple: "/admin-app/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "XF Admin", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-shell min-h-screen bg-[#0a0a0a] text-white">{children}</div>;
}
