import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { AllLocales } from "@/lib/App";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { notFound } from "next/navigation";
import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/toaster"
import { App } from "@/lib/App";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: App.name,
  description: App.description,
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
};

export default function RootLayout( props: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {

    // Validate that the incoming `locale` parameter is valid
    if (!AllLocales.includes(props.params.locale)) notFound();

    // Using internationalization in Client Components
    const messages = useMessages();
    
  return (
    <html lang={props.params.locale} className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <SessionProvider>
          <NextIntlClientProvider
            locale={props.params.locale}
            messages={messages}
            >
           {props.children}
           <Toaster />
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

// Enable edge runtime
export const runtime = 'edge';