import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { AllLocales } from "@/lib/App";
import { NextIntlClientProvider as IntlClientProvider, useMessages } from "next-intl";
import { notFound } from "next/navigation";
import { Toaster } from "@/components/ui/toaster"
import { App } from "@/lib/App";
import Header from "@/components/header";

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

export default async function RootLayout( props: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const locale = await props.params.locale;
  if (!AllLocales.includes(locale)) notFound();
   
  return (
    <NextIntlClientProvider
      locale={locale}
      >
      <html lang={locale} className="dark">
        <body className={`${inter.className} bg-background text-foreground antialiased h-screen`}>
          <Header />
          {props.children}
          <Toaster />
        </body>
      </html>
    </NextIntlClientProvider>
  );
}

export const runtime = 'edge';