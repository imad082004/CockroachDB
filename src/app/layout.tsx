import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { IntroVideo } from "@/components/IntroVideo";
import { MaintenanceGuard } from "@/components/MaintenanceGuard";

export const metadata: Metadata = {
  title: "MOVIS - مشاهدة الأفلام والمسلسلات",
  description: "شاهد أحدث الأفلام والمسلسلات التلفزيونية والأنمي عبر الإنترنت بجودة عالية.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="bg-[#141414] text-white antialiased min-h-screen selection:bg-red-600 selection:text-white">
        <LanguageProvider>
          <AuthProvider>
            <MaintenanceGuard>
              <IntroVideo />
              {children}
            </MaintenanceGuard>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
