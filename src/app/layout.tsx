// src/app/layout.tsx

import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/component/Element/Footer";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ashura",
  description: "Eccomerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-gray-200 flex flex-col min-h-screen`}>
        <main className="flex-grow">
          {children}
        </main>
        <Footer/>
      </body>
    </html>
  );
}