import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/Provider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
    title: "ChatPDF",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <Providers>
                <html lang="en">
                    <head>
                        <link
                            href="https://api.fontshare.com/v2/css?f[]=satoshi@1,900,700,500,300,400&display=swap"
                            rel="stylesheet"
                        />
                    </head>
                    <body>{children}</body>
                    <Toaster />
                </html>
            </Providers>
        </ClerkProvider>
    );
}
