import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Don't add NODE_ENV into T3 Env, it changes the tree-shaking behavior
export const env = createEnv({
  server: {
    LOGTAIL_SOURCE_TOKEN: z.string().optional(),
//     CLERK_SECRET_KEY: z.string().min(1),
//     DATABASE_URL: z.string().min(1),
//     DATABASE_AUTH_TOKEN: z.string().optional(),
//     STRIPE_SECRET_KEY: z.string().min(1),
//     STRIPE_WEBHOOK_SECRET: z.string().min(1),
  },
  client: {
    // NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    // NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  },
//   You need to destructure all the keys manually
  runtimeEnv: {
    LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN,
    // CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    // DATABASE_URL: process.env.DATABASE_URL,
    // DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
    // STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    // STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    // NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    //   process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    // NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    //   process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
});