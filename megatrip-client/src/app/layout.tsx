"use client";

import { useEffect } from "react";
import { startLoading, stopLoading } from "../app/lib/nprogress";
import { ReactNode, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import "./globals.css";
import { usePathname } from "next/navigation";

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    startLoading();
    const timer = setTimeout(() => stopLoading(), 400); // loading ngắn khi đổi route
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <html lang="vi">
      <body>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
