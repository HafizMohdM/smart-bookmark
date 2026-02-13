import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import clsx from "clsx";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Smart Bookmark App",
    description: "Secure, real-time bookmark manager",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={clsx(inter.className, "bg-gray-50 text-gray-900 antialiased h-full")}>
                {children}
            </body>
        </html>
    );
}
