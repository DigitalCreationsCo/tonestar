import createMiddleware from 'next-intl/middleware';
import { AllLocales, App } from './lib/App';
import { NextRequest, NextResponse } from 'next/server';
import authConfig from "./auth.config"
import NextAuth from "next-auth"

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
    locales: AllLocales,
    localePrefix: App.localePrefix,
    defaultLocale: App.defaultLocale,
});

const publicPages = [
    '.',
    '/', 
    '/signin', 
    '/signup',
    '/home',
    '/api/*'
];

// Create the auth middleware
const { auth } = NextAuth(authConfig)

// Helper function to check if the path is public
function isPublicPath(pathname: string) {
    const publicPathnameRegex = RegExp(
        `^(/(${AllLocales.join('|')}))?(${publicPages
            .flatMap((p) => (p === '/' ? ['', '/'] : p))
            .join('|')})/?$`,
        'i'
    );
    return publicPathnameRegex.test(pathname);
}

// Compose the middlewares
export default async function middleware(request: any) {
    const pathname = request.nextUrl.pathname;

    // Handle public pages with just intl middleware
    if (isPublicPath(pathname)) {
        return intlMiddleware(request);
    }

    // For protected pages, first run auth middleware
    const authResult = await auth(request) as any;

    // If auth failed and user is not on signin page, redirect to signin
    if (!authResult?.auth && pathname !== '/auth/signin') {
        const signinUrl = new URL('/auth/signin', request.url);
        // Preserve the original URL as next-auth doesn't do this automatically
        signinUrl.searchParams.set('callbackUrl', request.url);
        return NextResponse.redirect(signinUrl);
    }

    // After auth passes, apply intl middleware
    return intlMiddleware(request);
}

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};