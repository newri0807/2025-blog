import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/theme-provider";
import {ThemeToggle} from "@/components/theme-toggle";
import {TagSidebar} from "@/components/tag-sidebar";
import Link from "next/link";
import {Providers} from "@/app/providers";
import LoginButton from "@/components/login-button";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "My Blog",
    description: "A simple blog built with Next.js",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
    return (
        <html lang="ko" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning={true}>
                <Providers>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                        <div className="min-h-screen bg-white dark:bg-dark-bg-custom transition-colors">
                            <header className="bg-white dark:bg-dark-bg-custom border-b border-gray-200 dark:border-gray-700">
                                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                                    <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
                                        My Blog
                                    </Link>
                                    <div className="flex items-center gap-4">
                                        <Link
                                            href="/tags"
                                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                        >
                                            태그
                                        </Link>
                                        <LoginButton />
                                        <ThemeToggle />
                                    </div>
                                </div>
                            </header>

                            <div className="flex bg-white dark:bg-dark-bg-custom">
                                <main className="flex-1 max-w-4xl mx-auto px-4 py-8 bg-white dark:bg-dark-bg-custom">{children}</main>
                                <aside className="hidden lg:block w-80 p-6 bg-white dark:bg-dark-bg-custom">
                                    <TagSidebar />
                                </aside>
                            </div>
                        </div>
                    </ThemeProvider>
                </Providers>
            </body>
        </html>
    );
}
