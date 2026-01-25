import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface SiteLayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
}

export function SiteLayout({
  children,
  showNavbar = true,
  showFooter = true
}: SiteLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {showNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
