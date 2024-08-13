import createMiddleware from 'next-intl/middleware';
import { AllLocales, App } from './lib/App';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
    locales: AllLocales,
    localePrefix: App.localePrefix,
    defaultLocale: App.defaultLocale,
});


export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
  

export default async function middleware(req: NextRequest) {
    return intlMiddleware(req);
}