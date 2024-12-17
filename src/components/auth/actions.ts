"use server"

import { signIn, signOut } from "@/auth"
import { env } from "@/lib/env"

export async function getEnv() {
  return env;
}

export async function handleSignIn(provider?: string) {
  await signIn(provider, {
    redirectTo: env.REDIRECT_AFTER_SIGNIN,
  })
}

export async function handleSignOut() {
  await signOut()
}
