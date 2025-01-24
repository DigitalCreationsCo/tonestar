import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { AllLocales } from "@/lib/App";
import { NextIntlClientProvider as IntlClientProvider, useMessages } from "next-intl";
import { notFound } from "next/navigation";
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

function NextIntlClientProvider({locale, children}: any) {
  const messages = useMessages();
  return (
    <IntlClientProvider
    locale={locale}
    messages={messages}
    >
      {children}
    </IntlClientProvider>
  )
}

export default async function AppLayout( props: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const locale = await props.params.locale;

  if (!AllLocales.includes(locale)) notFound();
    
  return (
    <html lang={locale} className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased h-screen`}>
          <NextIntlClientProvider
            locale={locale}
            >
           {props.children}
           <Toaster />
          </NextIntlClientProvider>
      </body>
    </html>
  );
}

export const runtime = 'edge';